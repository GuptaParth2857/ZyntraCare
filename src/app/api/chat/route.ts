import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MOCK_CHAT_RESPONSES: Record<string, Record<string, string>> = {
  hi: {
    emergency: '🚨 आपातकालीन: 102 या 108 पर कॉल करें!',
    hospital: '🏥 Hospitals पेज पर जाएं',
    doctor: '👨‍⚕️ Specialists पेज पर जाएं',
    appointment: '📅 Book करने के लिए Specialists पेज',
    bed: '🛏️ Hospitals पेज पर Bed Availability',
    medicine: '💊 Pharmacy पेज पर जाएं',
    hello: '🙏 Namaste! Main ZyntraCare हूं'
  },
  en: {
    emergency: '🚨 Call 102 or 108!',
    hospital: '🏥 Go to Hospitals page',
    doctor: '👨‍⚕️ Go to Specialists page',
    appointment: '📅 Book on Specialists page',
    bed: '🛏️ Check Hospitals page',
    medicine: '💊 Go to Pharmacy page',
    hello: '🙏Namaste! I\'m ZyntraCare'
  }
};

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch { return null; }
}

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.message?.content || null;
  } catch { return null; }
}

function getMockChat(message: string, lang: string): string {
  const lower = message.toLowerCase();
  const responses = lang === 'hi' ? MOCK_CHAT_RESPONSES.hi : MOCK_CHAT_RESPONSES.en;
  
  if (lower.includes('emergency')) return responses.emergency;
  if (lower.includes('hospital')) return responses.hospital;
  if (lower.includes('doctor')) return responses.doctor;
  if (lower.includes('appointment')) return responses.appointment;
  if (lower.includes('bed')) return responses.bed;
  if (lower.includes('medicine')) return responses.medicine;
  if (lower.includes('hello') || lower.includes('namaste')) return responses.hello;
  
  return responses.hello + ' Ask me about hospitals, doctors, appointments, emergencies!';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Try Ollama first
    let reply = await callOllama(`Health chat: ${message}`);
    let source = 'ollama';

    // Try Gemini if Ollama fails
    if (!reply && GEMINI_API_KEY) {
      reply = await callGemini(`Health assistant response: ${message}`);
      source = 'gemini';
    }

    // Fallback to mock
    if (!reply) {
      reply = getMockChat(message, language);
      source = 'mock';
    }

    return NextResponse.json({ reply, source });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      reply: 'I\'m here to help! Ask about health, hospitals, doctors.',
      source: 'mock' 
    });
  }
}