import { NextRequest, NextResponse } from 'next/server';
import { generateHealthResponse, isGeminiConfigured } from '@/lib/gemini';
import { authRateLimit } from '@/lib/rate-limit';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{
          role: 'user',
          content: `You are ZyntraCare AI Health Assistant. Provide accurate medical information. Keep it brief. Response: ${prompt}`
        }],
        stream: false
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.message?.content || null;
  } catch {
    return null;
  }
}

function getMockResponse(query: string): string {
  const lower = query.toLowerCase();
  
  if (lower.includes('emergency') || lower.includes('ambulance')) {
    return '🚨 For emergencies: Call 102 or 108 immediately!';
  }
  if (lower.includes('heart') || lower.includes('chest pain')) {
    return '❤️ Chest pain could be serious. Please call 108 or visit nearest hospital immediately!';
  }
  if (lower.includes('diabetes') || lower.includes('sugar')) {
    return '💉 Diabetes symptoms: Frequent urination, thirst, fatigue. Consult a doctor for proper diagnosis.';
  }
  if (lower.includes('fever')) {
    return '🌡️ Fever: Rest, drink fluids, take paracetamol. If persists >3 days, see a doctor.';
  }
  if (lower.includes('headache')) {
    return '🤕 Headache: Rest, drink water, avoid screen. If severe or persistent, consult doctor.';
  }
  if (lower.includes('cough') || lower.includes('cold')) {
    return '😷 Cough/Cold: Steam inhalation, warm fluids, rest. Consult doctor if >1 week.';
  }
  if (lower.includes('doctor') || lower.includes('specialist')) {
    return '👨‍⚕️ Find specialists on the Specialists page. Book appointment online!';
  }
  if (lower.includes('hospital')) {
    return '🏥 Find hospitals on Hospitals page with real-time bed availability!';
  }
  if (lower.includes('appointment') || lower.includes('book')) {
    return '📅 Book appointments on Specialists page - choose doctor, date & time!';
  }
  
  return '🤖 I\'m here to help with health questions! Ask about symptoms, medicines, doctors, hospitals, or emergency services.';
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req, 30, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const { query, language } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Priority 1: Try Gemini (cloud AI)
    let response = await generateHealthResponse(`Health question: ${query}`);
    let source = 'gemini';

    // Priority 2: Try Ollama (local, free)
    if (!response) {
      response = await callOllama(query);
      source = 'ollama';
    }

    // Priority 3: Fallback to smart mock
    if (!response) {
      response = getMockResponse(query);
      source = 'mock';
    }

    return NextResponse.json({
      success: true,
      response,
      source,
      suggestions: ['Consult a doctor', 'Call 108 for emergencies'],
      isEmergency: query.toLowerCase().includes('emergency')
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      response: getMockResponse('error'),
      source: 'mock'
    });
  }
}

export async function GET() {
  const ollamaStatus = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { method: 'GET' }).then(r => r.ok).catch(() => false);
  
  return NextResponse.json({
    status: 'ok',
    ai: {
      gemini: isGeminiConfigured() ? 'configured' : 'not configured',
      ollama: ollamaStatus ? 'connected' : 'not running',
      mock: 'always available'
    }
  });
}
