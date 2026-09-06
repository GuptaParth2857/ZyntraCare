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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Missing reminder id' }, { status: 400 });
    }
    const reminder = await prisma.medicineReminder.update({
      where: { id: body.id },
      data: {
        medicine: body.medicine ?? undefined,
        dosage: body.dosage ?? undefined,
        frequency: body.frequency ?? undefined,
        times: body.times ? JSON.stringify(body.times) : undefined,
        startDate: body.startDate ?? undefined,
        endDate: body.endDate ?? undefined,
        notes: body.notes ?? undefined,
        isActive: body.isActive ?? undefined,
      },
    });
    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Medicine reminders PUT error:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing reminder id' }, { status: 400 });
    }
    await prisma.medicineReminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medicine reminders DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
