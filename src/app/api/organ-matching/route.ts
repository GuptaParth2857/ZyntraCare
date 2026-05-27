import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

const COMPATIBLE_BLOOD: Record<string, string[]> = {
  'A+': ['A+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'AB+': ['AB+'],
  'AB-': ['AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

function calculateMatchScore(donor: any, recipient: any): number {
  let score = 0;

  if (COMPATIBLE_BLOOD[donor.bloodType]?.includes(recipient.bloodType)) {
    score += 40;
  }

  if (donor.tissueType === recipient.tissueType) {
    score += 30;
  }

  if (donor.city === recipient.city) {
    score += 15;
  }

  if (donor.state === recipient.state) {
    score += 5;
  }

  const urgencyWeights: Record<string, number> = { LOW: 0, MEDIUM: 5, HIGH: 10, CRITICAL: 15 };
  score += urgencyWeights[recipient.urgency] || 0;

  const donorOrgans: string[] = JSON.parse(donor.organs || '[]');
  if (donorOrgans.includes(recipient.organNeeded)) {
    score += 20;
  }

  const ageDiff = Math.abs((donor.age || 0) - (recipient.age || 0));
  if (ageDiff <= 10) score += 5;
  else if (ageDiff <= 20) score += 2;

  return score;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organ = searchParams.get('organ');

  try {
    const donors = await prisma.organDonor.findMany({
      where: { isActive: true, ...(organ ? { organs: { contains: organ } } : {}) },
      include: { user: { select: { name: true, bloodGroup: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const recipients = await prisma.organRecipient.findMany({
      where: { isActive: true, ...(organ ? { organNeeded: organ } : {}) },
      include: { user: { select: { name: true, bloodGroup: true, city: true } } },
      orderBy: { urgency: 'asc' },
    });

    const matches = recipients.map(recipient => {
      const scored = donors
        .map(donor => ({
          donor,
          score: calculateMatchScore(
            { ...donor, bloodType: donor.bloodType || donor.user.bloodGroup },
            { ...recipient, bloodType: recipient.bloodType || recipient.user.bloodGroup }
          ),
        }))
        .filter(m => m.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return {
        recipient: {
          id: recipient.id,
          name: recipient.user.name,
          organNeeded: recipient.organNeeded,
          bloodType: recipient.bloodType || recipient.user.bloodGroup,
          urgency: recipient.urgency,
          city: recipient.city || recipient.user.city,
        },
        matches: scored.map(m => ({
          donorId: m.donor.id,
          donorName: m.donor.user.name,
          bloodType: m.donor.bloodType || m.donor.user.bloodGroup,
          organ: JSON.parse(m.donor.organs || '[]'),
          city: m.donor.city || m.donor.user.city,
          matchScore: m.score,
          isCompatible: m.score >= 60,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      donors: donors.map(d => ({
        id: d.id,
        name: d.user.name,
        bloodType: d.bloodType || d.user.bloodGroup,
        organs: JSON.parse(d.organs || '[]'),
        city: d.city || d.user.city,
        isActive: d.isActive,
      })),
      recipients: recipients.map(r => ({
        id: r.id,
        name: r.user.name,
        organNeeded: r.organNeeded,
        bloodType: r.bloodType || r.user.bloodGroup,
        urgency: r.urgency,
        city: r.city || r.user.city,
      })),
      matches,
      totalDonors: donors.length,
      totalRecipients: recipients.length,
    });
  } catch (error) {
    console.error('Organ matching error:', error);
    return NextResponse.json({ error: 'Failed to fetch organ data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    if (body.type === 'donor') {
      const donor = await prisma.organDonor.upsert({
        where: { userId: token.id as string },
        update: { organs: JSON.stringify(body.organs), bloodType: body.bloodType, tissueType: body.tissueType, age: body.age, city: body.city, state: body.state, isActive: true },
        create: { userId: token.id as string, organs: JSON.stringify(body.organs), bloodType: body.bloodType, tissueType: body.tissueType, age: body.age, city: body.city, state: body.state },
      });
      return NextResponse.json({ success: true, donor });
    }

    if (body.type === 'recipient') {
      const recipient = await prisma.organRecipient.upsert({
        where: { userId: token.id as string },
        update: { organNeeded: body.organNeeded, bloodType: body.bloodType, tissueType: body.tissueType, urgency: body.urgency || 'MEDIUM', age: body.age, city: body.city, state: body.state, isActive: true },
        create: { userId: token.id as string, organNeeded: body.organNeeded, bloodType: body.bloodType, tissueType: body.tissueType, urgency: body.urgency || 'MEDIUM', age: body.age, city: body.city, state: body.state },
      });
      return NextResponse.json({ success: true, recipient });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Organ matching POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
