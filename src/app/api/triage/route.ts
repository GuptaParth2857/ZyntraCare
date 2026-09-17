import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { generateHealthResponse } from '@/lib/gemini';
import { authRateLimit } from '@/lib/rate-limit';
import { MedicalAgent } from '@/lib/medicalAgent';
import { saveTriageToHistory } from '@/lib/patientHistory';

export const runtime = 'nodejs';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const URGENCY_TO_PRIORITY: Record<string, 'high' | 'medium' | 'low'> = {
  critical: 'high',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

function toSymptomList(symptoms: unknown): string[] {
  if (Array.isArray(symptoms)) return symptoms.map(String);
  if (typeof symptoms === 'string') {
    return symptoms
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req, 20, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const symptomsInput = body?.symptoms;
    const symptomList = toSymptomList(symptomsInput);
    if (symptomList.length === 0 && typeof symptomsInput !== 'string') {
      return NextResponse.json({ error: 'Symptoms required' }, { status: 400 });
    }
    const symptomsText = symptomList.join(', ') || String(symptomsInput);

    let priority: 'high' | 'medium' | 'low' | null = null;
    let source = 'heuristic';

    // Priority 1: Gemini
    const aiResponse = await generateHealthResponse(
      `Emergency priority high/medium/low for "${symptomsText}". One word only.`
    );
    if (aiResponse) {
      const text = aiResponse.trim().toLowerCase();
      if (['high', 'medium', 'low'].includes(text)) {
        priority = text as 'high' | 'medium' | 'low';
        source = 'ai';
      }
    }

    // Priority 2: Ollama (local model)
    if (!priority) {
      try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [{ role: 'user', content: `Classify as high/medium/low: "${symptomsText}". Just one word.` }],
            stream: false,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.message?.content?.trim()?.toLowerCase();
          if (text && ['high', 'medium', 'low'].includes(text)) {
            priority = text as 'high' | 'medium' | 'low';
            source = 'ai';
          }
        }
      } catch {}
    }

    // Priority 3: MedicalAgent rule engine (structured triage assessment)
    const agent = new MedicalAgent();
    const assessment = await agent.assessSymptoms(symptomList.length > 0 ? symptomList : [symptomsText]);
    if (!priority) {
      priority = URGENCY_TO_PRIORITY[assessment.urgency] ?? 'medium';
      source = 'agent';
    }

    // Persist to the patient's health history (real DB record)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const requestedUserId = String(body?.userId || '');
    const userId = token?.sub || (requestedUserId === 'demo-user' ? 'demo-user' : '');
    let saved = false;
    if (userId) {
      saved = await saveTriageToHistory({
        userId,
        title: `Emergency triage: ${priority.toUpperCase()} priority`,
        category: priority === 'high' ? 'emergency' : 'diagnosis',
        summary: `Symptoms: ${symptomsText}. ${assessment.recommendedAction}`,
        symptoms: symptomList,
        priority,
        urgencyLevel: assessment.urgency,
        recommendedAction: assessment.recommendedAction,
        possibleConditions: assessment.possibleConditions,
        source,
      });
    }

    return NextResponse.json({
      priority,
      source,
      saved,
      assessment: {
        urgency: assessment.urgency,
        triageLevel: assessment.triageLevel,
        possibleConditions: assessment.possibleConditions,
        recommendedAction: assessment.recommendedAction,
        requiresAmbulance: assessment.requiresAmbulance,
        requiresICU: assessment.requiresICU,
      },
    });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ priority: 'medium' });
  }
}
