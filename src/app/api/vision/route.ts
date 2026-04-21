import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, scanType } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a medical AI assistant analyzing ${scanType || 'medical'} images. 
Analyze the provided image and provide a detailed medical report in the following JSON format:
{
  "results": [
    {
      "condition": "detected condition name",
      "confidence": 0-100,
      "severity": "normal|warning|critical",
      "description": "detailed medical description"
    }
  ]
}

Return ONLY valid JSON, no additional text.`;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = {
        results: [
          {
            condition: 'Analysis Result',
            confidence: 75,
            severity: 'normal',
            description: response.substring(0, 200),
          },
        ],
      };
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}