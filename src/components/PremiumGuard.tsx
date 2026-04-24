'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiStar, FiZap } from 'react-icons/fi';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const router = useRouter();

  // Guest mode - show premium upgrade for subscription features
  const isPremium = false;

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-8 md:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNmY2VjU0SDU0VjMwbS0wIDBiLTZiLTZiNi02aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-10" />
      
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />

      <div className="relative z-10 text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full mb-6 border border-amber-500/30">
          <FiStar className="text-amber-400 text-3xl" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
          Premium Feature
        </h2>
        
        <p className="text-slate-400 mb-6 leading-relaxed">
          This feature is exclusively available for ZyntraCare Premium members. 
          Upgrade now to unlock advanced AI-powered health insights and exclusive benefits.
        </p>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 mb-8">
          <p className="text-sky-400 font-bold mb-3 flex items-center justify-center gap-2">
            <FiZap size={16} /> Premium Benefits Include:
          </p>
          <ul className="text-left text-slate-300 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Advanced AI Symptom Analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Priority Hospital Booking
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Unlimited Teleconsultations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Family Health Monitoring
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Ad-free Experience
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/subscription')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]"
          >
            <FiStar size={18} /> Upgrade to Premium
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-8 py-4 rounded-2xl font-semibold transition"
          >
            Explore Free Features
          </Link>
        </div>
      </div>
    </div>
  );
}