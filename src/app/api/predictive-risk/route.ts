import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'demo-user';
    const profile = body.profile || {};

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 30,
    });

    const trending = metrics.map(m => ({
      date: m.date,
      bloodSugar: m.bloodSugar,
      heartRate: m.heartRate,
      systolicBP: m.bloodPressure ? parseFloat(m.bloodPressure.split('/')[0]) || null : null,
    }));

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ success: true, result: localRisk(profile, trending) });
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze future health risk based on the profile and longitudinal vitals trend. Return JSON only.
Profile: ${JSON.stringify(profile)}
Vitals trend: ${JSON.stringify(trending)}
Return JSON:
{
 "predictiveScore": 0-100,
 "riskLevel": "low|medium|high|very_high",
 "diseaseRisks": [{"name": string, "probability": 0-100, "reason": string}],
 "trajectory": "improving|stable|declining",
 "insights": ["up to 4 plain-language insights"],
 "recommendations": ["up to 4 preventive actions"]
}`;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              predictiveScore: { type: SchemaType.NUMBER },
              riskLevel: { type: SchemaType.STRING },
              diseaseRisks: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { name: { type: SchemaType.STRING }, probability: { type: SchemaType.NUMBER }, reason: { type: SchemaType.STRING } } } },
              trajectory: { type: SchemaType.STRING },
              insights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
          },
        },
      });
      const text = (await result.response).text();
      if (text) {
        return NextResponse.json({ success: true, result: JSON.parse(text) });
      }
    } catch (err) {
      console.error('Gemini predictive risk failed:', err);
    }

    return NextResponse.json({ success: true, result: localRisk(profile, trending) });
  } catch (error) {
    console.error('Predictive risk error:', error);
    return NextResponse.json({ success: false, error: 'Failed to assess risk' }, { status: 500 });
  }
}

function localRisk(profile: any, trending: any[]) {
  const ageScore = (profile.age || 35) > 50 ? 30 : (profile.age || 35) > 40 ? 20 : 10;
  const bmiScore = (profile.bmi || 22) >= 30 ? 30 : (profile.bmi || 22) >= 25 ? 18 : 8;
  const lifestyleScore =
    (profile.smoking === 'yes' ? 15 : 0) + (profile.familyHistory === 'yes' ? 15 : 0) +
    (profile.stress === 'high' ? 8 : 0) + ((profile.sleep || 7) < 6 ? 8 : 0);

  const predictiveScore = Math.min(100, ageScore + bmiScore + lifestyleScore);
  const riskLevel = predictiveScore >= 60 ? 'high' : predictiveScore >= 35 ? 'medium' : 'low';

  return {
    predictiveScore,
    riskLevel,
    trajectory: 'stable',
    diseaseRisks: [
      { name: 'Type 2 Diabetes', probability: Math.min(80, 30 + bmiScore), reason: profile.bmi >= 25 ? 'Elevated BMI' : 'Within normal BMI' },
      { name: 'Hypertension', probability: Math.min(75, 25 + ageScore * 0.5), reason: 'Age and lifestyle factors' },
    ],
    insights: ['Your current vitals trend is being monitored for preventive planning.'],
    recommendations: ['Maintain a balanced diet', 'Exercise 30 minutes daily', 'Schedule regular checkups', 'Manage stress levels'],
  };
}
