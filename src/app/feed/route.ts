import prisma from '@/lib/prisma';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://zyntracare.com';
  let blogs: any[] = [];
  try {
    blogs = await prisma.blog.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 50 });
  } catch {}

  const items = blogs
    .map(
      (b) => `
    <item>
      <title><![CDATA[${b.title}]]></title>
      <link>${BASE}/blogs/${b.slug}</link>
      <guid isPermaLink="true">${BASE}/blogs/${b.slug}</guid>
      <description><![CDATA[${b.excerpt || ''}]]></description>
      <author>${b.author}</author>
      <category>${b.category}</category>
      <pubDate>${new Date(b.createdAt).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>ZyntraCare Health Blog</title>
    <link>${BASE}/blogs</link>
    <description>Latest health articles, tips, and guides from ZyntraCare — India's healthcare platform</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE}/images/publiczyntracare-logo.png</url>
      <title>ZyntraCare Health Blog</title>
      <link>${BASE}/blogs</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
