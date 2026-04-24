// src/app/download-windows/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiDownload, FiMonitor, FiArrowLeft, FiCheck, FiShield, FiHeart, FiZap, FiUsers, FiSmartphone, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DownloadPage() {
  const [osType, setOsType] = useState<'windows' | 'mac' | 'linux' | 'android' | 'ios'>('windows');
  const [activeTab, setActiveTab] = useState<'pc' | 'mobile'>('pc');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      setOsType('ios');
    } else if (userAgent.includes('android')) {
      setOsType('android');
    } else if (userAgent.includes('mac')) {
      setOsType('mac');
    } else if (userAgent.includes('linux')) {
      setOsType('linux');
    } else {
      setOsType('windows');
    }
  }, []);

  const handleDirectDownload = () => {
    window.open('/zyntracare/ZyntraCare-Setup.exe', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400/50">
              <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-black text-xl">ZyntraCare</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-16 px-6 max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FiZap /> Free Download
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Download <span className="text-sky-400">ZyntraCare</span> App
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Download and install ZyntraCare on your device. Works like Netflix, Free Fire, Discord - just download and play!
          </p>
        </motion.div>

        {/* Platform Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'pc' 
                ? 'bg-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <FiMonitor size={20} /> PC / Laptop
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'mobile' 
                ? 'bg-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <FiSmartphone size={20} /> Mobile / Tablet
          </button>
        </div>

        {/* PC Download Instructions */}
        {activeTab === 'pc' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Main Download Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-700 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center">
                  <FiMonitor size={32} className="text-sky-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Windows PC / Laptop</h2>
                  <p className="text-slate-400">Size: ~180 MB • Windows 10/11 (64-bit)</p>
                </div>
              </div>

              {/* Step by Step Instructions */}
              <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 text-sm">📋</span>
                  Step by Step Instructions (Jaise Free Fire download karte ho):
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-semibold">Niche diye gye "Download .exe" button par click karo</p>
                      <p className="text-slate-400 text-sm">Click the green download button below</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-semibold">File download hone taki wait karo</p>
                      <p className="text-slate-400 text-sm">Wait for the file to download (~180 MB, 2-5 minutes)</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-semibold">Downloaded file "ZyntraCare.exe" ko double-click karo</p>
                      <p className="text-slate-400 text-sm">Double-click the downloaded "ZyntraCare.exe" file</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="font-semibold">App automatically open ho jayega!</p>
                      <p className="text-slate-400 text-sm">The app will open automatically - no installation needed!</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Direct Download Button */}
              <a 
                href="/download/ZyntraCare.apk"
                download="ZyntraCare.apk"
                className="flex items-center justify-center gap-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)]"
              >
                <FiDownload size={28} />
                <span>Download .apk File Now</span>
              </a>
              <p className="text-slate-500 text-sm mt-4 text-center">
                Click button → File download hogi → Double-click karke app install karo!
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FiShield, title: 'Secure', desc: '100% Safe' },
                { icon: FiZap, title: 'Fast', desc: '2 sec open' },
                { icon: FiHeart, title: 'AI Health', desc: '24/7 chat' },
                { icon: FiUsers, title: 'Free', desc: 'No charges' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <item.icon size={24} className="text-sky-400 mx-auto mb-2" />
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mobile Download Instructions */}
        {activeTab === 'mobile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Android */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-800 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Android Phone</h2>
                  <p className="text-slate-400">Samsung, Xiaomi, OnePlus, Realme, etc.</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">📱 Step by Step (Jaise Free Fire install karte ho):</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-semibold">Is website ko Chrome browser mein open karo</p>
                      <p className="text-slate-400 text-sm">Open this website in Chrome browser</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-semibold">Top right mein 3 dots (⋮) menu dabayo</p>
                      <p className="text-slate-400 text-sm">Tap the 3 dots (⋮) menu in top right corner</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-semibold">"Add to Home Screen" par click karo</p>
                      <p className="text-slate-400 text-sm">Tap "Add to Home Screen" option</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="font-semibold">"Add" button dabayo - App home screen par ajayega!</p>
                      <p className="text-slate-400 text-sm">Tap "Add" - App icon appears on home screen!</p>
                    </div>
                  </li>
                </ol>
              </div>

              <Link 
                href="/install"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all"
              >
                <FiSmartphone size={24} />
                <span>See Full Android Instructions</span>
                <FiExternalLink size={20} />
              </Link>
            </div>

            {/* iOS */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-800 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🍎</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">iPhone / iPad</h2>
                  <p className="text-slate-400">iOS Safari browser zaroori hai</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">📱 Step by Step (Safari mein karna hai):</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-semibold">Is website ko SAFARI browser mein open karo SIRF</p>
                      <p className="text-slate-400 text-sm">IMPORTANT: Open this in SAFARI browser ONLY</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-semibold">Niche Share button (⬆) dabayo</p>
                      <p className="text-slate-400 text-sm">Tap the Share button (⬆) at bottom</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-semibold">Scroll karo aur "Add to Home Screen" dhundho</p>
                      <p className="text-slate-400 text-sm">Scroll down and find "Add to Home Screen"</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="font-semibold">"Add" dabayo - iPhone home screen par icon ajayega!</p>
                      <p className="text-slate-400 text-sm">Tap "Add" - App icon appears on iPhone home screen!</p>
                    </div>
                  </li>
                </ol>
              </div>

              <Link 
                href="/install"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all"
              >
                <FiSmartphone size={24} />
                <span>See Full iOS Instructions</span>
                <FiExternalLink size={20} />
              </Link>
            </div>

            {/* App Store / Play Store Note */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🏪</span>
                Play Store / App Store Mein Publish
              </h3>
              <p className="text-slate-400 mb-4">
                Agar aapko Play Store (Android) ya App Store (iOS) mein publish karna hai, toh yeh steps hain:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-bold text-green-400 mb-2">Google Play Store (Android)</h4>
                  <p className="text-slate-400 text-sm mb-2">1. $25 one-time fee (Google Play Developer)</p>
                  <p className="text-slate-400 text-sm mb-2">2. APK/AAB file banana hoga</p>
                  <p className="text-slate-400 text-sm">3. Play Console par submit karo</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-400 mb-2">Apple App Store (iOS)</h4>
                  <p className="text-slate-400 text-sm mb-2">1. $99/year (Apple Developer)</p>
                  <p className="text-slate-400 text-sm mb-2">2. Xcode mein IPA banana hoga</p>
                  <p className="text-slate-400 text-sm">3. App Store Connect par submit karo</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Requirements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">💻 PC System Requirements</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">OS</p>
              <p className="text-white">Windows 10/11 (64-bit)</p>
            </div>
            <div>
              <p className="text-slate-500">RAM</p>
              <p className="text-white">4 GB minimum</p>
            </div>
            <div>
              <p className="text-slate-500">Storage</p>
              <p className="text-white">500 MB free</p>
            </div>
            <div>
              <p className="text-slate-500">Internet</p>
              <p className="text-white">Required</p>
            </div>
            <div>
              <p className="text-slate-500">Size</p>
              <p className="text-white">~180 MB</p>
            </div>
            <div>
              <p className="text-slate-500">Display</p>
              <p className="text-white">1280x720+</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">© 2026 ZyntraCare. Your Health, Our Priority.</p>
        </div>
      </footer>
    </div>
  );
}