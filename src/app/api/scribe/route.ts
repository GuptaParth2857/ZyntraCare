import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, speaker } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 });
    }

    const prompt = `Generate clinical SOAP note from this conversation. Return JSON with chiefComplaint, historyOfPresentIllness, physicalExamination, diagnosis (array), prescriptions (array with medicine, dosage, frequency, duration), advice (array), followUp, detectedEntities (symptoms, medications, vitals arrays).`;

    // Try Ollama
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [{ role: 'user', content: `${prompt}\n\nTranscript: ${transcript}` }],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            return NextResponse.json(parsed);
          } catch { /* continue */ }
        }
      }
    } catch { /* continue */ }

    // Try Gemini
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt + '\n\n' + transcript);
        const text = (await result.response).text();
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json(parsed);
        }
      } catch { /* continue */ }
    }

    // Fallback
    return NextResponse.json({
      chiefComplaint: transcript.substring(0, 50),
      historyOfPresentIllness: transcript,
      physicalExamination: 'Not documented',
      diagnosis: ['Under evaluation'],
      prescriptions: [],
      advice: ['Follow up as advised'],
      followUp: '1 week',
      detectedEntities: { symptoms: [], medications: [], vitals: [] }
    });
  } catch (error) {
    console.error('Scribe error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}