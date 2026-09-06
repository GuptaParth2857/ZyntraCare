import { NextRequest, NextResponse } from 'next/server';
import { generateHealthResponse, isGeminiConfigured } from '@/lib/gemini';
import { authRateLimit } from '@/lib/rate-limit';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const KEYWORDS = {
  high: ['chest pain', 'bleeding', 'breath', 'heart attack', 'stroke', 'unconscious', 'seizure', 'severe', 'poison'],
  medium: ['pain', 'fever', 'vomit', 'headache', 'dizziness', 'cough'],
  low: ['checkup', 'routine', 'mild']
};

function heuristicPriority(symptoms: string): string {
  const lower = symptoms.toLowerCase();
  for (const k of KEYWORDS.high) if (lower.includes(k)) return 'high';
  for (const k of KEYWORDS.medium) if (lower.includes(k)) return 'medium';
  return 'low';
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req, 20, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const { symptoms } = await req.json();
    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms required' }, { status: 400 });
    }

    let priority: string | null = null;

    // Priority 1: Gemini
    const aiResponse = await generateHealthResponse(`Emergency priority high/medium/low for "${symptoms}". One word only.`);
    if (aiResponse) {
      const text = aiResponse.trim().toLowerCase();
      if (['high', 'medium', 'low'].includes(text)) {
        priority = text;
      }
    }

    // Priority 2: Ollama
    if (!priority) {
      try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [{ role: 'user', content: `Classify as high/medium/low: "${symptoms}". Just one word.` }],
            stream: false
          })
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.message?.content?.trim()?.toLowerCase();
          if (text && ['high', 'medium', 'low'].includes(text)) priority = text;
        }
      } catch {}
    }

    // Priority 3: Heuristic
    if (!priority) priority = heuristicPriority(symptoms);

    return NextResponse.json({ priority, source: priority === heuristicPriority(symptoms) ? 'heuristic' : 'ai' });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ priority: 'medium' });
  }
}
