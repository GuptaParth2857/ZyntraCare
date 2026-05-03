/**
 * /api/predict-flow — Hospital footfall prediction.
 *
 * Returns deterministic mock predictions based on time-of-day patterns.
 * For AI-powered predictions, connect Ollama.
 */
import { NextResponse } from 'next/server';

let cache: { data: number[]; expiresAt: number } | null = null;

function generateMockPredictions(): number[] {
  const pattern = [
    3, 2, 2, 2, 3, 5,
    8, 15, 28, 45, 48, 44,
    38, 32, 30, 28, 27, 35,
    42, 40, 32, 22, 14, 7,
  ];
  return pattern.map(v => v + Math.floor(v * 0.1));
}

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', 'X-Cache-TTL': String(Math.round((cache.expiresAt - Date.now()) / 1000)) },
    });
  }

  const data = generateMockPredictions();
  cache = { data, expiresAt: Date.now() + 30 * 60 * 1000 };
  return NextResponse.json(data, { headers: { 'X-Cache': 'MOCK' } });
}