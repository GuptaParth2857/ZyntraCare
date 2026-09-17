import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const [profile, metric, wearable] = await Promise.all([
      prisma.patientRecord.findUnique({ where: { userId } }),
      prisma.healthMetric.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.wearableData.findFirst({ where: { userId }, orderBy: { recordedAt: 'desc' } }),
    ]);

    const prefill: Record<string, number | string> = {};
    const sources: Record<string, string> = {};

    if (profile?.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      if (!isNaN(dob.getTime())) {
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
        if (age > 0 && age <= 120) {
          prefill.age = age;
          sources.age = 'profile';
        }
      }
    }
    if (profile?.gender) {
      prefill.gender = profile.gender.toLowerCase() === 'female' ? 'female' : 'male';
      sources.gender = 'profile';
    }

    const bp = (metric?.bloodPressure || wearable?.bloodPressure || '').match(/(\d+)/);
    if (bp) {
      const sys = parseInt(bp[1], 10);
      if (sys >= 60 && sys <= 250) {
        prefill.bloodPressure = sys;
        sources.bloodPressure = 'latest reading';
      }
    }

    const sugar = metric?.bloodSugar ?? wearable?.bloodSugar;
    if (sugar != null && sugar >= 40 && sugar <= 400) {
      prefill.bloodSugar = Math.round(sugar);
      sources.bloodSugar = 'latest reading';
    }

    if (metric?.weight && metric?.height && metric.height > 0) {
      const bmi = metric.weight / Math.pow(metric.height / 100, 2);
      if (bmi >= 10 && bmi <= 60) {
        prefill.bmi = Math.round(bmi * 10) / 10;
        sources.bmi = 'latest reading';
      }
    }

    if (wearable?.sleepHours != null && wearable.sleepHours >= 3 && wearable.sleepHours <= 12) {
      prefill.sleep = Math.round(wearable.sleepHours);
      sources.sleep = 'latest reading';
    }

    const hasData = Object.keys(prefill).length > 0;
    return NextResponse.json({ success: true, hasData, prefill, sources });
  } catch (error) {
    console.error('Health risk prefill error:', error);
    return NextResponse.json({ error: 'Failed to load profile data' }, { status: 500 });
  }
}