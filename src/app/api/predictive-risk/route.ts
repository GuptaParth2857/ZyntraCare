import { NextRequest, NextResponse } from 'next/server';
import { geminiGenerate } from '@/lib/gemini';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const profileSchema = z.object({
  age: z.number().int().min(1).max(120).default(35),
  bmi: z.number().min(10).max(60).default(22),
  smoking: z.enum(['yes', 'no', 'occasional']).default('no'),
  alcohol: z.enum(['yes', 'no', 'occasional']).default('no'),
  stress: z.enum(['low', 'medium', 'high']).default('low'),
  sleep: z.number().min(0).max(24).default(7),
  familyHistory: z.enum(['yes', 'no', 'partial']).default('no'),
  exercise: z.enum(['never', 'rarely', 'regular', 'weekly', 'daily']).default('regular'),
});

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function getTrend(metrics: any[]): any[] {
  return metrics.map(m => ({
    date: m.date,
    bloodSugar: m.bloodSugar,
    heartRate: m.heartRate,
    systolicBP: m.bloodPressure ? parseFloat(m.bloodPressure.split('/')[0]) || null : null,
  }));
}

function computeTrajectory(trending: any[]): 'improving' | 'stable' | 'declining' {
  const sugar = trending.map(t => t.bloodSugar).filter((v: any) => v != null);
  const sys = trending.map(t => t.systolicBP).filter((v: any) => v != null);

  const dirs: string[] = [];
  if (sugar.length >= 2) dirs.push(sugar[sugar.length - 1] > sugar[0] ? 'worse' : sugar[sugar.length - 1] < sugar[0] ? 'better' : 'same');
  if (sys.length >= 2) dirs.push(sys[sys.length - 1] > sys[0] ? 'worse' : sys[sys.length - 1] < sys[0] ? 'better' : 'same');

  if (dirs.length === 0) return 'stable';
  const worse = dirs.filter(d => d === 'worse').length;
  const better = dirs.filter(d => d === 'better').length;
  if (worse > better) return 'declining';
  if (better > worse) return 'improving';
  return 'stable';
}

function localRisk(profile: any, trending: any[]) {
  const age = profile.age || 35;
  const bmi = profile.bmi || 22;
  const ageScore = age > 50 ? 30 : age > 40 ? 20 : 10;
  const bmiScore = bmi >= 30 ? 30 : bmi >= 25 ? 18 : 8;
  const lifestyleScore =
    (profile.smoking === 'yes' ? 15 : profile.smoking === 'occasional' ? 8 : 0) +
    (profile.familyHistory === 'yes' ? 15 : profile.familyHistory === 'partial' ? 8 : 0) +
    (profile.alcohol === 'yes' ? 8 : profile.alcohol === 'occasional' ? 4 : 0) +
    (profile.stress === 'high' ? 8 : 0) +
    ((profile.sleep || 7) < 6 ? 8 : 0) +
    (profile.exercise === 'never' ? 6 : profile.exercise === 'rarely' ? 3 : 0);

  const predictiveScore = Math.min(100, ageScore + bmiScore + lifestyleScore);
  const riskLevel = predictiveScore >= 60 ? 'high' : predictiveScore >= 35 ? 'medium' : 'low';

  const trendDir = computeTrajectory(trending);

  const diseaseRisks: { name: string; probability: number; reason: string }[] = [];
  if (bmi >= 25) {
    let p = Math.min(80, 30 + bmiScore);
    if (trendDir === 'declining') p = Math.min(85, p + 5);
    diseaseRisks.push({ name: 'Type 2 Diabetes', probability: p, reason: bmi >= 30 ? 'Obese BMI' : 'Overweight BMI' });
  } else {
    diseaseRisks.push({ name: 'Type 2 Diabetes', probability: 15, reason: 'BMI within healthy range' });
  }
  {
    let p = Math.min(75, 25 + ageScore * 0.5);
    if (trendDir === 'declining') p = Math.min(80, p + 5);
    diseaseRisks.push({ name: 'Hypertension', probability: p, reason: 'Age and lifestyle factors' });
  }
  if (profile.smoking === 'yes') {
    diseaseRisks.push({ name: 'COPD', probability: 40, reason: 'Active smoker' });
  }

  const sugar = trending.map(t => t.bloodSugar).filter((v: any) => v != null);
  const sys = trending.map(t => t.systolicBP).filter((v: any) => v != null);

  const insights: string[] = [];
  if (sugar.length >= 2) {
    insights.push(`Blood sugar ${sugar[sugar.length - 1] >= sugar[0] ? 'has trended up' : 'has trended down'} from ${sugar[0]} to ${sugar[sugar.length - 1]} mg/dL across ${sugar.length} readings.`);
  }
  if (sys.length >= 2) {
    insights.push(`Systolic blood pressure ${sys[sys.length - 1] >= sys[0] ? 'has trended up' : 'has trended down'} from ${sys[0]} to ${sys[sys.length - 1]} mmHg across ${sys.length} readings.`);
  }
  if (trending.length === 0) {
    insights.push('No vitals readings on record — this forecast is based on your profile only.');
  } else {
    insights.push(`Forecast combines your profile with ${trending.length} logged vitals reading${trending.length === 1 ? '' : 's'}.`);
  }
  if (trendDir === 'declining') insights.push('Your vitals trend is moving in a riskier direction — schedule a doctor visit.');

  const recommendations: string[] = [];
  if (bmi >= 25) recommendations.push('Aim to reduce BMI toward 18.5-24.9 through diet and activity');
  if (profile.smoking !== 'no') recommendations.push('Consider a structured smoking cessation program');
  if (profile.stress === 'high') recommendations.push('Practice stress management — 10 min of breathing exercises daily');
  if ((profile.sleep || 7) < 6) recommendations.push('Prioritize 7-8 hours of sleep for recovery');
  if (sugar.length >= 2 && sugar[sugar.length - 1] >= sugar[0]) recommendations.push('Your blood sugar is trending up — limit refined sugar and exercise regularly');
  if (sys.length >= 2 && sys[sys.length - 1] >= sys[0]) recommendations.push('Your blood pressure is trending up — reduce sodium and monitor weekly');
  if (trending.length === 0) recommendations.push('Log vitals regularly in Health Tracker to enable trend signals');
  recommendations.push('Schedule an annual preventive health checkup');

  return {
    predictiveScore,
    riskLevel,
    trajectory: trendDir,
    diseaseRisks,
    insights: insights.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    mode: 'local',
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json().catch(() => ({}));
    const requested = String(body.userId || '');
    const userId = resolveUserId(token, requested === 'demo-user' ? 'demo-user' : null);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const parsed = profileSchema.safeParse(body.profile || {});
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid profile', details: parsed.error.issues }, { status: 400 });
    }

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 30,
    });
    const trending = getTrend(metrics);

    let usedAI = false;
    if (GEMINI_API_KEY) {
      try {
        const prompt = `Analyze future health risk based on the profile and longitudinal vitals trend. Return JSON only.
Profile: ${JSON.stringify(parsed.data)}
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
        const text = await geminiGenerate({ prompt, json: true });
        if (text) {
          const parsedJson = JSON.parse(text);
          return NextResponse.json({ success: true, result: { ...parsedJson, mode: 'ai' } });
        }
      } catch (err) {
        console.error('Gemini predictive risk failed, using local model:', err);
      }
    }

    const result = localRisk(parsed.data, trending);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Predictive risk error:', error);
    return NextResponse.json({ success: false, error: 'Failed to assess risk' }, { status: 500 });
  }
}