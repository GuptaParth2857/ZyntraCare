import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CATEGORY_TAG: Record<string, string> = {
  'Cardiology': 'Must Read',
  'Nutrition': 'Trending',
  'Mental Health': 'Awareness',
  'Wellness': 'In-Depth',
  'Fitness': 'Trending',
  'Eye Care': 'Awareness',
  'Public Health': 'Awareness',
};

const CATEGORY_COLOR: Record<string, string> = {
  'Cardiology': 'rose',
  'Nutrition': 'emerald',
  'Mental Health': 'purple',
  'Wellness': 'blue',
  'Fitness': 'indigo',
  'Eye Care': 'amber',
  'Public Health': 'teal',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const featured = searchParams.get('featured') === 'true';

  try {
    const where: any = { published: true };
    if (category) where.category = category;
    if (featured) where.featured = true;

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      blogs: blogs.map(b => ({
        id: b.id,
        title: b.title,
        excerpt: b.excerpt,
        category: b.category,
        author: b.author,
        date: b.createdAt.toISOString(),
        readTime: b.readTime,
        image: b.image,
        featured: b.featured,
        slug: b.slug,
        tag: b.featured ? 'Must Read' : (CATEGORY_TAG[b.category] || 'Awareness'),
        color: CATEGORY_COLOR[b.category] || 'emerald',
      })),
      videos: [],
      stats: {
        totalArticles: blogs.length,
        totalVideos: 0,
      },
    });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json({ blogs: [], videos: [], stats: { totalArticles: 0, totalVideos: 0 } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content: body.content || '',
        excerpt: body.excerpt || '',
        author: body.author || 'ZyntraCare',
        image: body.image || '',
        category: body.category || 'General',
        tags: JSON.stringify(body.tags || []),
        readTime: body.readTime || 5,
        published: body.published ?? true,
        featured: body.featured ?? false,
      },
    });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('Content POST error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
