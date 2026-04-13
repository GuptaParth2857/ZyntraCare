import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { symptoms } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback heuristic
    const lower = symptoms.toLowerCase();
    if (lower.includes('chest') || lower.includes('bleeding') || lower.includes('breath')) {
      return NextResponse.json({ priority: 'high' });
    } else if (lower.includes('pain') || lower.includes('fever')) {
      return NextResponse.json({ priority: 'medium' });
    } else {
      return NextResponse.json({ priority: 'low' });
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const prompt = `Based on the following symptoms, classify the emergency priority as "high", "medium", or "low". Only return one word.\nSymptoms: ${symptoms}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let priority = response.text().trim().toLowerCase();
  if (!['high', 'medium', 'low'].includes(priority)) priority = 'medium';
  return NextResponse.json({ priority });
}