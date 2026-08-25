import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const inquiries = await prisma.sponsorInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Sponsor GET error:', error);
    return NextResponse.json({ inquiries: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inquiry = await prisma.sponsorInquiry.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || null,
        partnershipType: body.partnershipType,
        budget: body.budget || null,
        message: body.message || '',
        userId: body.userId || null,
      },
    });
    return NextResponse.json({ inquiry, message: 'Thank you for your interest! We will contact you within 48 hours.' }, { status: 201 });
  } catch (error) {
    console.error('Sponsor POST error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
