import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export async function generateStaticParams() {
  try {
    const blogs = await prisma.blog.findMany({ where: { published: true }, select: { slug: true } });
    return blogs.map((b) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  let blog;
  try {
    const { slug } = await params;
    blog = await prisma.blog.findUnique({ where: { slug } });
  } catch {
    // DB unavailable
  }
  if (!blog) return { title: 'Blog Not Found | ZyntraCare' };

  return {
    title: `${blog.title} | ZyntraCare`,
    description: blog.excerpt || `Read about ${blog.title} on ZyntraCare - India's healthcare platform`,
    keywords: [blog.category, ...JSON.parse(blog.tags || '[]')].join(', '),
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      authors: [blog.author],
      images: blog.image ? [{ url: blog.image }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let blog;
  try {
    blog = await prisma.blog.findUnique({ where: { slug, published: true } });
  } catch {
    // DB unavailable
  }
  if (!blog) notFound();

  const tags: string[] = JSON.parse(blog.tags || '[]');

  let related: any[] = [];
  try {
    related = await prisma.blog.findMany({
      where: { published: true, category: blog.category, slug: { not: slug } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  } catch {
    // DB unavailable
  }

  const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://zyntracare.com';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28">
        {/* Article Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: blog.title,
              description: blog.excerpt,
              image: blog.image || undefined,
              datePublished: blog.createdAt.toISOString(),
              dateModified: blog.updatedAt?.toISOString() || blog.createdAt.toISOString(),
              author: {
                "@type": "Person",
                name: blog.author,
              },
              publisher: {
                "@type": "Organization",
                name: "ZyntraCare",
                logo: {
                  "@type": "ImageObject",
                  url: `${BASE}/images/publiczyntracare-logo.png`,
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${BASE}/blogs/${blog.slug}`,
              },
            }),
          }}
        />

        {/* BreadcrumbList JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: BASE },
                { "@type": "ListItem", position: 2, name: "Blogs", item: `${BASE}/blogs` },
                { "@type": "ListItem", position: 3, name: blog.title, item: `${BASE}/blogs/${blog.slug}` },
              ],
            }),
          }}
        />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blogs" className="hover:text-orange-400 transition-colors">Blogs</Link>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{blog.title}</span>
        </nav>

        {/* Category + Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
            {blog.category}
          </span>
          {tags.map((t) => (
            <span key={t} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
          <span>By <strong className="text-slate-300">{blog.author}</strong></span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>•</span>
          <span>{blog.readTime} min read</span>
        </div>

        {/* Featured image */}
        {blog.image && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-white/10">
            <img src={blog.image} alt={blog.title} className="w-full h-64 md:h-96 object-cover" />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-orange-300 prose-a:text-orange-400 prose-strong:text-white prose-code:text-orange-300 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-img:rounded-xl mb-12">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Share */}
        <div className="flex items-center gap-3 py-6 border-t border-white/10 mb-12">
          <span className="text-sm text-slate-400">Share:</span>
          {['Twitter', 'Facebook', 'WhatsApp'].map((s) => (
            <a
              key={s}
              href={`https://${
                s === 'Twitter' ? 'twitter.com/intent/tweet?text=' + encodeURIComponent(blog.title) + '&url=' + encodeURIComponent(`https://zyntracare.com/blogs/${blog.slug}`) :
                s === 'Facebook' ? 'facebook.com/sharer/sharer.php?u=' + encodeURIComponent(`https://zyntracare.com/blogs/${blog.slug}`) :
                'wa.me/?text=' + encodeURIComponent(blog.title + ' ' + `https://zyntracare.com/blogs/${blog.slug}`)
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1.5 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-lg text-slate-300 hover:text-orange-300 transition-all"
            >
              {s}
            </a>
          ))}
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="border-t border-white/10 pt-8">
            <h2 className="text-xl font-bold mb-6 text-orange-300">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blogs/${r.slug}`}
                  className="bg-white/5 border border-white/10 hover:border-orange-500/30 rounded-xl p-4 transition-all group"
                >
                  <span className="text-[10px] uppercase tracking-wide text-orange-400">{r.category}</span>
                  <h3 className="text-sm font-semibold text-white group-hover:text-orange-300 transition-colors mt-1 mb-2 line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{r.excerpt}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{r.readTime} min read</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Need Healthcare Help?</h3>
          <p className="text-slate-300 mb-4">Book doctor appointment or find hospitals near you</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/booking" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white hover:opacity-90 transition text-sm">
              Book Appointment
            </Link>
            <Link href="/hospitals" className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition text-sm">
              Find Hospitals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
