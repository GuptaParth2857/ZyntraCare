import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, excerpt, author, image, category, tags, readTime, published, featured } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await prisma.blog.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || '',
        author: author || 'ZyntraCare',
        image: image || '',
        category: category || 'General',
        tags: JSON.stringify(tags || []),
        readTime: readTime || 5,
        published: published !== false,
        featured: featured || false,
      },
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
