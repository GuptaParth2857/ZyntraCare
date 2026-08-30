import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const plans = await prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, name, weekStart, days, totalCalories, totalProtein,
      totalCarbs, totalFat, dietType,
    } = body;

    if (!userId || !name || !weekStart || !days) {
      return NextResponse.json({ error: 'userId, name, weekStart, and days are required' }, { status: 400 });
    }

    const plan = await prisma.mealPlan.create({
      data: {
        userId,
        name,
        weekStart,
        days: typeof days === 'string' ? days : JSON.stringify(days),
        totalCalories: totalCalories || 0,
        totalProtein: totalProtein || 0,
        totalCarbs: totalCarbs || 0,
        totalFat: totalFat || 0,
        dietType: dietType || 'balanced',
      },
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
  }
}
