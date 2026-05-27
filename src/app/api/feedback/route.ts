import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, category, message, name, email } = body;

    if (!rating || !message) {
      return NextResponse.json({ error: 'Rating and message are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating: parseInt(rating, 10),
        category: category || 'Overall Experience',
        message,
        name: name || 'Anonymous',
        email: email || null,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id, message: 'Thank you for your feedback!' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
