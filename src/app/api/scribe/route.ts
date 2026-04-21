import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, speaker } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a medical AI assistant helping generate a clinical SOAP note from a doctor-patient conversation.

Transcript:
${transcript}

Generate a structured medical report in this JSON format:
{
  "chiefComplaint": "Main complaint in brief",
  "historyOfPresentIllness": "Detailed HPI",
  "physicalExamination": "Physical exam findings if mentioned",
  "diagnosis": ["Primary diagnosis", "Secondary diagnosis"],
  "prescriptions": [
    {
      "medicine": "Medicine name",
      "dosage": "Dosage",
      "frequency": "How often",
      "duration": "For how long"
    }
  ],
  "advice": ["Advice point 1", "Advice point 2"],
  "followUp": "Follow up timing",
  "detectedEntities": {
    "symptoms": ["symptom1", "symptom2"],
    "medications": ["med1", "med2"],
    "vitals": ["BP", "Pulse", "Temp"]
  }
}

Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = {
        chiefComplaint: transcript.substring(0, 50),
        historyOfPresentIllness: transcript,
        physicalExamination: 'Not documented',
        diagnosis: ['Under evaluation'],
        prescriptions: [],
        advice: ['Follow up as advised'],
        followUp: 'As needed',
        detectedEntities: { symptoms: [], medications: [], vitals: [] }
      };
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Scribe API error:', error);
    return NextResponse.json(
      { error: error.message || 'Report generation failed' },
      { status: 500 }
    );
  }
}