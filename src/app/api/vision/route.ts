import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, scanType } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Try Ollama first (with image support via llava)
    try {
      const isMultimodal = OLLAMA_MODEL?.includes('llava') || OLLAMA_MODEL?.includes('bakllava') || true;
      const ollamaBody: any = {
        model: OLLAMA_MODEL,
        stream: false,
      };

      if (isMultimodal) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        ollamaBody.prompt = `Analyze this medical ${scanType || 'image'}. Return JSON with results array containing condition, confidence (0-100), severity (normal/warning/critical), description.`;
        ollamaBody.images = [base64Data];
      } else {
        ollamaBody.prompt = `Analyze this medical ${scanType || 'image'}. Return JSON with results array containing condition, confidence (0-100), severity (normal/warning/critical), description.`;
      }

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaBody),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.response;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            return NextResponse.json(parsed);
          } catch { /* continue to next */ }
        }
      }
    } catch { /* continue */ }

    // Try Gemini
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        
        const result = await model.generateContent({
          contents: [{
            parts: [{
              inlineData: { data: base64Data, mimeType: 'image/jpeg' }
            }]
          }] as any,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                results: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      condition: { type: SchemaType.STRING },
                      confidence: { type: SchemaType.NUMBER },
                      severity: { type: SchemaType.STRING },
                      description: { type: SchemaType.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        const response = await result.response;
        const text = response.text();
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json(parsed);
        }
      } catch { /* continue */ }
    }

    // Fallback
    return NextResponse.json({
      results: [{
        condition: 'Analysis',
        confidence: 0,
        severity: 'normal',
        description: 'AI analysis unavailable. Please consult a doctor.'
      }]
    });
  } catch (error) {
    console.error('Vision error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      results: [{
        condition: 'Error',
        confidence: 0,
        severity: 'normal',
        description: 'Please try again or consult a doctor.'
      }]
    }, { status: 500 });
  }
}