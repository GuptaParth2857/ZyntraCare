import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { processAIRequest } from '@/lib/aiEngine';

function buildPatientContext(latestWearable: any, latestMetric: any): string {
  const parts: string[] = [];
  const hr = latestWearable?.heartRate ?? latestMetric?.heartRate ?? null;
  const spo2 = latestWearable?.oxygenLevel ?? latestMetric?.oxygenLevel ?? null;
  const bpRaw = latestWearable?.bloodPressure || (latestMetric?.bloodPressure ? String(latestMetric.bloodPressure) : '');
  const weight = latestMetric?.weight ?? null;
  const height = latestMetric?.height ?? null;
  const sleep = latestWearable?.sleepHours ?? null;
  const steps = latestWearable?.steps ?? null;
  const sugar = latestMetric?.bloodSugar ?? null;

  if (hr != null) parts.push(`heart rate ${hr} bpm`);
  if (spo2 != null) parts.push(`SpO2 ${spo2}%`);
  if (bpRaw) parts.push(`blood pressure ${bpRaw}`);
  if (sugar != null) parts.push(`blood sugar ${sugar} mg/dL`);
  if (sleep != null) parts.push(`sleep ${sleep} hours last night`);
  if (steps != null) parts.push(`daily steps ${steps}`);
  if (weight != null && height != null) {
    const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
    if (Number.isFinite(bmi)) parts.push(`BMI ${bmi}`);
  }
  return parts.join(', ');
}

function parseSystolic(bp: string | null | undefined): number | null {
  if (!bp) return null;
  const n = parseFloat(String(bp).split('/')[0]);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const { searchParams } = new URL(req.url);
    const requested = searchParams.get('userId') || '';
    const userId = token?.sub || (requested === 'demo-user' ? 'demo-user' : '');

    if (!userId) {
      return NextResponse.json({ metrics: [], error: 'Authentication required' }, { status: 401 });
    }

    const [latestMetric, latestWearable] = await Promise.all([
      prisma.healthMetric.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.wearableData.findFirst({ where: { userId }, orderBy: { recordedAt: 'desc' } }),
    ]);

    const metrics: any[] = [];

    const parseHrStatus = (hr: number | null): 'normal' | 'warning' | 'critical' => {
      if (hr == null) return 'warning';
      if (hr < 45 || hr > 130) return 'critical';
      if (hr < 60 || hr > 100) return 'warning';
      return 'normal';
    };

    const parseOxygenStatus = (spo2: number | null): 'normal' | 'warning' | 'critical' => {
      if (spo2 == null) return 'warning';
      if (spo2 < 90) return 'critical';
      if (spo2 < 95) return 'warning';
      return 'normal';
    };

    const parseBpStatus = (bp: string | null | undefined): 'normal' | 'warning' | 'critical' => {
      const sys = parseSystolic(bp);
      if (sys == null) return 'warning';
      if (sys >= 180 || sys <= 80) return 'critical';
      if (sys >= 130 || sys <= 90) return 'warning';
      return 'normal';
    };

    const parseSugarStatus = (sugar: number | null): 'normal' | 'warning' | 'critical' => {
      if (sugar == null) return 'warning';
      if (sugar >= 200 || sugar <= 60) return 'critical';
      if (sugar >= 140 || sugar <= 70) return 'warning';
      return 'normal';
    };

    const parseBmiStatus = (bmi: number | null): 'normal' | 'warning' | 'critical' => {
      if (bmi == null) return 'warning';
      if (bmi < 16 || bmi >= 30) return 'critical';
      if (bmi < 18.5 || bmi >= 25) return 'warning';
      return 'normal';
    };

    const hr = latestWearable?.heartRate ?? latestMetric?.heartRate ?? null;
    const spo2 = latestWearable?.oxygenLevel ?? latestMetric?.oxygenLevel ?? null;
    const bpRaw = latestWearable?.bloodPressure || (latestMetric?.bloodPressure ? String(latestMetric.bloodPressure) : null);
    const steps = latestWearable?.steps ?? null;
    const sleep = latestWearable?.sleepHours ?? null;
    const temp = latestWearable?.temperature ?? null;
    const sugar = latestMetric?.bloodSugar ?? null;
    const weight = latestMetric?.weight ?? null;
    const height = latestMetric?.height ?? null;
    const bmi = weight && height ? Number((weight / Math.pow(height / 100, 2)).toFixed(1)) : null;

    if (hr != null) {
      metrics.push({
        label: 'Heart Rate',
        value: `${hr} bpm`,
        status: parseHrStatus(hr),
        icon: '❤️',
        hint: hr < 60 || hr > 100 ? 'Outside normal resting range (60–100)' : 'Normal resting range',
      });
    }

    if (spo2 != null) {
      metrics.push({
        label: 'SpO₂',
        value: `${spo2}%`,
        status: parseOxygenStatus(spo2),
        icon: '🫁',
        hint: spo2 < 95 ? 'Below 95% — needs attention' : 'Normal (≥95%)',
      });
    }

    if (bpRaw) {
      metrics.push({
        label: 'Blood Pressure',
        value: String(bpRaw).replace('/', '/'),
        status: parseBpStatus(bpRaw),
        icon: '🩺',
        hint: 'ACC/AHA: normal < 120 mmHg',
      });
    }

    if (steps != null) {
      metrics.push({
        label: 'Steps',
        value: String(steps),
        status: steps > 0 ? 'normal' : 'warning',
        icon: '👟',
        hint: 'Goal: 6,000+ daily',
      });
    }

    if (sleep != null) {
      metrics.push({
        label: 'Sleep',
        value: `${sleep} hrs`,
        status: (sleep >= 7 ? 'normal' : sleep >= 5 ? 'warning' : 'critical') as any,
        icon: '😴',
        hint: 'Recommended: 7–8 hrs',
      });
    }

    if (temp != null) {
      metrics.push({
        label: 'Temp',
        value: `${temp}°C`,
        status: temp >= 37.5 ? ('warning' as any) : ('normal' as any),
        icon: '🌡️',
        hint: 'Normal: ~36.5–37.2°C',
      });
    }

    if (sugar != null) {
      metrics.push({
        label: 'Blood Sugar',
        value: `${sugar} mg/dL`,
        status: parseSugarStatus(sugar),
        icon: '🍬',
        hint: 'Fasting target: 70–140',
      });
    }

    if (weight != null) {
      metrics.push({
        label: 'Weight',
        value: `${weight} kg`,
        status: 'normal',
        icon: '⚖️',
        hint: 'Logged in Health Tracker',
      });
    }

    if (bmi != null) {
      metrics.push({
        label: 'BMI',
        value: `${bmi}`,
        status: parseBmiStatus(bmi),
        icon: '📐',
        hint: 'Healthy: 18.5–24.9',
      });
    }

    let score = 100;
    metrics.forEach((m) => {
      if (m.status === 'warning') score -= 10;
      if (m.status === 'critical') score -= 25;
    });
    score = Math.max(0, Math.min(100, score));

    metrics.unshift({
      label: 'Health Score',
      value: String(score),
      status: score >= 80 ? 'normal' : score >= 60 ? 'warning' : 'critical',
      icon: '💚',
      hint: 'Rule-based estimate from your latest readings',
    });

    return NextResponse.json({
      metrics,
      userId,
      lastUpdated: latestWearable?.recordedAt || latestMetric?.date || null,
    });
  } catch (error) {
    console.error('AI health coach metrics error:', error);
    return NextResponse.json({ metrics: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const body = await req.json().catch(() => null);
    const query = String(body?.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const userId = token?.sub || (body?.userId === 'demo-user' ? 'demo-user' : '');

    let patientContext = '';
    if (userId) {
      const [latestWearable, latestMetric] = await Promise.all([
        prisma.wearableData.findFirst({ where: { userId }, orderBy: { recordedAt: 'desc' } }).catch(() => null),
        prisma.healthMetric.findFirst({ where: { userId }, orderBy: { date: 'desc' } }).catch(() => null),
      ]);
      patientContext = buildPatientContext(latestWearable, latestMetric);
    }

    const result = await processAIRequest({
      query,
      patientContext: patientContext || undefined,
    });

    return NextResponse.json({
      success: result.success,
      response: result.response,
      sources: (result.sources || []).map(s => s.title),
      suggestions: result.suggestions || [],
      isEmergency: result.isEmergency,
      mode: result.mode,
    });
  } catch (error) {
    console.error('AI health coach POST error:', error);
    return NextResponse.json(
      { success: false, response: "I'm having trouble processing that right now. Please try again." },
      { status: 500 },
    );
  }
}