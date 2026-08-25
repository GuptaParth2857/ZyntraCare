import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const reminders = await prisma.medicineReminder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Medicine reminders GET error:', error);
    return NextResponse.json({ reminders: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reminder = await prisma.medicineReminder.create({
      data: {
        userId: body.userId,
        medicine: body.medicine,
        dosage: body.dosage,
        frequency: body.frequency || 'daily',
        times: JSON.stringify(body.times || []),
        startDate: body.startDate,
        endDate: body.endDate || null,
        notes: body.notes || '',
      },
    });
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Medicine reminders POST error:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
