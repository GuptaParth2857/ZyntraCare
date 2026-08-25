import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

async function callAI(symptoms: string): Promise<string | null> {
  // Priority 1: Ollama
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
      if (text && ['high','medium','low'].includes(text)) return text;
    }
  } catch (e) {
    console.error('Ollama triage error:', e);
  }

  // Priority 2: Gemini
  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(`Emergency priority high/medium/low for "${symptoms}". One word only.`);
      const text = (await result.response).text()?.trim()?.toLowerCase();
      if (text && ['high','medium','low'].includes(text)) return text;
    } catch (e) {
      console.error('Gemini triage error:', e);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { symptoms } = await req.json();
    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms required' }, { status: 400 });
    }

    // Try AI first
    const aiPriority = await callAI(symptoms);
    const priority = aiPriority || heuristicPriority(symptoms);

    return NextResponse.json({ priority });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ priority: 'medium' });
  }
}