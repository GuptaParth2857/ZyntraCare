import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HEALTH_TOPICS } from '@/data/health-topics';

export async function generateStaticParams() {
  return HEALTH_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = HEALTH_TOPICS.find((t) => t.slug === slug);
  if (!topic) return { title: 'Not Found | ZyntraCare' };

  return {
    title: `${topic.title} | ZyntraCare`,
    description: topic.description,
    keywords: topic.keywords.join(', '),
    openGraph: {
      title: topic.title,
      description: topic.description,
      images: [{ url: topic.image }],
    },
  };
}

export default async function HealthTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = HEALTH_TOPICS.find((t) => t.slug === slug);
  if (!topic) notFound();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: topic.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/health" className="hover:text-orange-400 transition-colors">Health</Link>
          <span>/</span>
          <span className="text-white">{topic.title}</span>
        </nav>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          {topic.title}
        </h1>
        <p className="text-slate-300 text-lg mb-8">{topic.description}</p>

        {/* Sections */}
        <div className="space-y-8">
          {topic.sections.map((section, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-3 text-orange-300">{section.heading}</h2>
              <p className="text-slate-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-orange-300">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {topic.faq.map((f, i) => (
              <details key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group">
                <summary className="p-4 cursor-pointer font-medium text-white hover:text-orange-300 transition-colors flex items-center gap-2">
                  <span className="text-orange-400 shrink-0">Q:</span>
                  <span>{f.question}</span>
                </summary>
                <div className="px-4 pb-4 text-slate-300 leading-relaxed pl-8">
                  <span className="text-orange-400 font-medium">A:</span> {f.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Related topics */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold mb-4">Related Health Topics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HEALTH_TOPICS.filter((t) => t.slug !== slug).slice(0, 6).map((t) => (
              <Link
                key={t.slug}
                href={`/health/${t.slug}`}
                className="bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-xl px-4 py-3 text-sm text-slate-300 hover:text-orange-300 transition-all"
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Need a Doctor?</h3>
          <p className="text-slate-300 mb-4">Book appointment with top specialists near you</p>
          <Link
            href="/booking"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white hover:opacity-90 transition"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
