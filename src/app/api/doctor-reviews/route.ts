import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required' }, { status: 400 });
    }

    const reviews = await prisma.doctorReview.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await prisma.doctorReview.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorId, userId, userName, rating, title, comment, visitType, wouldRecommend } = body;

    if (!doctorId || !rating || !comment) {
      return NextResponse.json({ error: 'doctorId, rating, and comment are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const review = await prisma.doctorReview.create({
      data: {
        doctorId,
        userId: userId || null,
        userName: userName || 'Anonymous',
        rating: parseInt(rating, 10),
        title: title || '',
        comment,
        visitType: visitType || 'in_person',
        wouldRecommend: wouldRecommend !== false,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
