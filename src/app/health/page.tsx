import Link from 'next/link';
import { HEALTH_TOPICS } from '@/data/health-topics';

export const metadata = {
  title: 'Health Guides and Wellness Tips | ZyntraCare',
  description: 'Comprehensive health guides on water intake, fever, diabetes, blood pressure, nutrition, mental health, and more. Expert-written wellness content for India.',
  keywords: 'health guides, wellness tips, healthcare information, health blog India, medical information',
};

export default function HealthIndexPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white">Health</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          Health &amp; Wellness Guides
        </h1>
        <p className="text-slate-300 text-lg mb-10 max-w-2xl">
          Expert-written health information to help you stay informed, make better decisions, and live healthier.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/health/${topic.slug}`}
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 transition-all group"
            >
              <h2 className="font-semibold text-white group-hover:text-orange-300 transition-colors mb-2">
                {topic.title}
              </h2>
              <p className="text-sm text-slate-400 line-clamp-2">{topic.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topic.keywords.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-[10px] bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
