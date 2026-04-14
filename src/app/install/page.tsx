// src/app/install/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiDownload, FiSmartphone, FiMonitor, FiArrowRight, FiCheck, FiStar, FiShield, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function InstallPage() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (/android/.test(userAgent)) {
      setOs('android');
    } else if (/win|mac|linux/.test(userAgent)) {
      setOs('desktop');
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400/50">
              <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-black text-xl">ZyntraCare</span>
          </Link>
          <Link href="/" className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-2">
            Go Home <FiArrowRight />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-500/25 text-sky-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FiDownload /> Install ZyntraCare App
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Your Health, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">In Your Pocket</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Download ZyntraCare for instant access to hospitals, doctors, emergency services, and AI-powered health guidance — all in one tap.
          </p>
        </motion.div>

        {/* Install Button */}
        {isInstallable && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
            <button onClick={handleInstall} className="group flex items-center gap-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:shadow-[0_0_60px_rgba(14,165,233,0.6)] mx-auto">
              <FiDownload size={24} />
              Install App Now
            </button>
            <p className="text-slate-500 text-sm mt-3">Click to install ZyntraCare on your device</p>
          </motion.div>
        )}

        {/* OS-specific Instructions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Android */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/70 border border-white/10 rounded-2xl p-6">
            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 text-green-400">
              <FiSmartphone size={28} />
            </div>
            <h3 className="font-bold text-xl mb-3">Android</h3>
            <ol className="text-slate-400 text-sm space-y-2">
              <li className="flex gap-2"><span className="text-sky-400">1.</span> Open this page in Chrome</li>
              <li className="flex gap-2"><span className="text-sky-400">2.</span> Tap the menu (⋮) button</li>
              <li className="flex gap-2"><span className="text-sky-400">3.</span> Select &quot;Add to Home Screen&quot;</li>
              <li className="flex gap-2"><span className="text-sky-400">4.</span> Tap &quot;Install&quot; confirmation</li>
            </ol>
          </motion.div>

          {/* iOS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/70 border border-white/10 rounded-2xl p-6">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
              <FiSmartphone size={28} />
            </div>
            <h3 className="font-bold text-xl mb-3">iPhone / iPad</h3>
            <ol className="text-slate-400 text-sm space-y-2">
              <li className="flex gap-2"><span className="text-sky-400">1.</span> Open this page in Safari</li>
              <li className="flex gap-2"><span className="text-sky-400">2.</span> Tap the Share button (⬆)</li>
              <li className="flex gap-2"><span className="text-sky-400">3.</span> Scroll and tap &quot;Add to Home&quot;</li>
              <li className="flex gap-2"><span className="text-sky-400">4.</span> Tap &quot;Add&quot; in top right</li>
            </ol>
          </motion.div>

          {/* Desktop */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/70 border border-white/10 rounded-2xl p-6">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
              <FiMonitor size={28} />
            </div>
            <h3 className="font-bold text-xl mb-3">Desktop</h3>
            <ol className="text-slate-400 text-sm space-y-2">
              <li className="flex gap-2"><span className="text-sky-400">1.</span> Open this page in Chrome</li>
              <li className="flex gap-2"><span className="text-sky-400">2.</span> Look for install icon</li>
              <li className="flex gap-2"><span className="text-sky-400">3.</span> Click &quot;Install ZyntraCare&quot;</li>
              <li className="flex gap-2"><span className="text-sky-400">4.</span> App will open in new window</li>
            </ol>
          </motion.div>
        </div>

        {/* PWA Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-slate-900/80 to-slate-950 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8">Why Install ZyntraCare?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiShield, title: 'Offline Access', desc: 'Access hospitals even without internet' },
              { icon: FiHeart, title: 'Faster Loading', desc: 'Opens instantly like a native app' },
              { icon: FiStar, title: 'Full Screen', desc: 'Immersive experience without browser UI' },
              { icon: FiSmartphone, title: 'Push Notifications', desc: 'Get alerts for appointments & emergencies' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-sky-400">
                  <feature.icon size={24} />
                </div>
                <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Direct APK/IPA Download Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 text-center">
          <p className="text-slate-500 mb-4">Need a direct download link? Contact us for custom builds.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold">
            Contact Support <FiArrowRight />
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 ZyntraCare. Your Health, Our Priority.</p>
        </div>
      </footer>
    </div>
  );
}
