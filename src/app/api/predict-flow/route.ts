/**
 * /api/predict-flow — AI-powered hospital footfall prediction.
 *
 * Uses Gemini if GEMINI_API_KEY is set, otherwise returns deterministic
 * mock predictions based on time-of-day patterns. Results are cached for
 * 30 minutes to avoid hammering the AI endpoint.
 */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 30-minute cache: store { data, expiresAt }
let cache: { data: number[]; expiresAt: number } | null = null;

/* -------------------------------------------------------------------------- */
/*  Deterministic mock (no randomness so it's stable across requests)          */
/* -------------------------------------------------------------------------- */
function generateMockPredictions(): number[] {
  // Pattern: low at night, peaking 9-11am and 5-8pm
  const pattern = [
    3, 2, 2, 2, 3, 5,   // 0-5 (midnight → early morning)
    8, 15, 28, 45, 48, 44, // 6-11 (morning ramp)
    38, 32, 30, 28, 27, 35, // 12-17 (afternoon)
    42, 40, 32, 22, 14, 7,  // 18-23 (evening peak then drop)
  ];
  return pattern.map(v => v + Math.floor(v * 0.1)); // tiny consistent offset
}

/* -------------------------------------------------------------------------- */
/*  Route handler                                                              */
/* -------------------------------------------------------------------------- */
export async function GET() {
  // Return cached result if still valid
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', 'X-Cache-TTL': String(Math.round((cache.expiresAt - Date.now()) / 1000)) },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Fast-path: no API key, use mock
  if (!apiKey) {
    const data = generateMockPredictions();
    cache = { data, expiresAt: Date.now() + 30 * 60 * 1000 };
    return NextResponse.json(data, { headers: { 'X-Cache': 'MOCK' } });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try models in order of preference
    const modelNames = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let predictions: number[] | null = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt =
          `Generate a JSON array of exactly 24 integers (index 0 = midnight, index 23 = 11pm) ` +
          `representing expected patient inflow for an Indian hospital. ` +
          `Morning peak: 45-50 patients (9-11am), evening peak: 35-42 (5-8pm), ` +
          `night: 2-8 (10pm-5am), afternoon: 25-35. Return ONLY the JSON array, no explanation.`;

        const result   = await model.generateContent(prompt);
        const text     = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*?\]/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length === 24 && parsed.every((v: unknown) => typeof v === 'number')) {
            predictions = parsed;
            break;
          }
        }
      } catch {
        // try next model
      }
    }

    const data = predictions ?? generateMockPredictions();
    cache = { data, expiresAt: Date.now() + 30 * 60 * 1000 };
    return NextResponse.json(data, { headers: { 'X-Cache': predictions ? 'AI' : 'MOCK-FALLBACK' } });

  } catch (error) {
    console.error('[predict-flow] Error:', error);
    const data = generateMockPredictions();
    cache = { data, expiresAt: Date.now() + 10 * 60 * 1000 }; // shorter cache on error
    return NextResponse.json(data, { headers: { 'X-Cache': 'ERROR-FALLBACK' } });
  }
}