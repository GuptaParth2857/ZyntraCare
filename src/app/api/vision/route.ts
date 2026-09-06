import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const OLLAMA_VISION_RE = /llava|bakllava|vision|gemma3/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, scanType } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const scanTypeLabel = scanType === 'retinal' ? 'retinal fundus' : scanType || 'medical';
    const prompt = `You are a medical imaging assistant. Analyze this ${scanTypeLabel} image.
For a ${scanTypeLabel} image, evaluate the visible structure for abnormalities appropriate to that imaging type
(${scanType === 'retinal' ? 'diabetic retinopathy (microaneurysms, hemorrhages, exudates), glaucoma indicators (cup-to-disc ratio of the optic disc), retinal detachment, overall retinal health' : 'tissue/lesion characterization, inflammation, structural abnormalities'}).
Respond ONLY in JSON matching this exact shape:
{"results": [{"condition": "...", "confidence": 0-100, "severity": "normal|warning|critical", "description": "..."}]}
If the image is not a valid ${scanTypeLabel} image or cannot be analyzed, respond with:
{"results": [{"condition": "Unclear", "confidence": 0, "severity": "normal", "description": "Image could not be analyzed. Please upload a clear ${scanTypeLabel} image."}]}
This is informational only, never a definitive diagnosis.`;

    // Try Ollama first, only when the configured model supports vision
    try {
      if (OLLAMA_VISION_RE.test(OLLAMA_MODEL || '')) {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            stream: false,
            prompt,
            images: [base64Data],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.response;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.results) return NextResponse.json(parsed);
            } catch { /* fall through */ }
          }
        }
      }
    } catch (error) {
      console.error('[Vision] Ollama error:', error);
    }

    // Try Gemini (proven text+image pattern)
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: image.includes('image/png') ? 'image/png' : 'image/jpeg' } },
            ],
          }],
        });
        const text = result.response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.results) return NextResponse.json(parsed);
          } catch (error) {
            console.error('[Vision] Gemini JSON parse error:', error, text.slice(0, 200));
          }
        }
      } catch (error) {
        console.error('[Vision] Gemini error:', error);
      }
    }

    return NextResponse.json({
      results: [{
        condition: 'Analysis',
        confidence: 0,
        severity: 'normal',
        description: 'AI analysis unavailable. Please consult a doctor.',
      }],
    });
  } catch (error) {
    console.error('Vision error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      results: [{
        condition: 'Error',
        confidence: 0,
        severity: 'normal',
        description: 'Please try again or consult a doctor.',
      }],
    }, { status: 500 });
  }
}