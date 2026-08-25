import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { slug, published: true },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Get related blogs (same category, excluding current)
    const related = await prisma.blog.findMany({
      where: { published: true, category: blog.category, slug: { not: slug } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    return NextResponse.json({
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.category,
        author: blog.author,
        date: blog.createdAt.toISOString(),
        readTime: blog.readTime,
        image: blog.image,
        tags: JSON.parse(blog.tags || '[]'),
        featured: blog.featured,
      },
      related: related.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        category: b.category,
        image: b.image,
        readTime: b.readTime,
        date: b.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
