import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const communityId = searchParams.get('communityId') || '';

  try {
    const where: any = {};
    if (communityId) where.communityId = communityId;

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Community posts GET error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post = await prisma.communityPost.create({
      data: {
        communityId: body.communityId,
        userId: body.userId || null,
        authorName: body.authorName || 'Anonymous',
        content: body.content,
      },
    });
    if (body.communityId) {
      await prisma.community.update({
        where: { id: body.communityId },
        data: { memberCount: { increment: 1 } },
      });
    }
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Community posts POST error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
