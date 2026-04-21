// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

          {/* Brand - Compact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare Logo" width={40} height={40} className="object-cover" />
              </div>
              <span className="font-black text-xl text-white">Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">Care</span></span>
            </Link>
            <p className="text-gray-400 text-sm mb-3">India ka healthcare platform.</p>
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, idx) => (
                <Icon key={idx} size={18} className="text-gray-400 hover:text-sky-400 cursor-pointer" />
              ))}
            </div>
          </motion.div>

          {/* Explore - Column 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h4 className="font-bold text-sm mb-3 text-sky-400">Explore</h4>
            <ul className="space-y-1.5">
              {[
                { href: '/hospitals', label: '🏥 Hospitals' },
                { href: '/specialists', label: '👨‍⚕️ Specialists' },
                { href: '/pharmacies', label: '💊 Pharmacies' },
                { href: '/labs', label: '🧪 Labs' },
                { href: '/beds', label: '🛏️ Live Beds' },
                { href: '/blood-donors', label: '🩸 Blood Donors' },
                { href: '/emergency', label: '🚑 Emergency' },
                { href: '/telehealth', label: '📹 Telehealth' },
                { href: '/camps', label: '🏕️ Health Camps' },
                { href: '/first-aid', label: '🚑 First Aid' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-sky-400 transition text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* AI & Advanced - Column 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h4 className="font-bold text-sm mb-3 text-emerald-400">AI & Tech</h4>
            <ul className="space-y-1.5">
              {[
                { href: '/clinical-ai', label: '🤖 Clinical AI' },
                { href: '/ai-health-coach', label: '🧘 AI Coach' },
                { href: '/health-tracker', label: '📈 Tracker' },
                { href: '/health-wallet', label: '💳 Smart Wallet' },
                { href: '/wearables', label: '⌚ Wearables' },
                { href: '/medicine-verify', label: '🔒 Med Verify' },
                { href: '/blockchain-records', label: '⛓️ Records' },
                { href: '/ai-vision', label: '👁️ AI Vision' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 transition text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* New Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
            <h4 className="font-bold text-sm mb-3 text-cyan-400">New Features</h4>
            <ul className="space-y-1.5">
              {[
                { href: '/accessibility-mode', label: '👁️ Eye Access' },
                { href: '/epidemic-radar', label: '🌐 Epidemic Radar' },
                { href: '/organ-matching', label: '🔗 Organ Chain' },
                { href: '/drone-network', label: '🚁 Drone Network' },
                { href: '/dementia-voice', label: '🧠 Elder Voice' },
                { href: '/digital-twin', label: '🧬 Digital Twin' },
                { href: '/outbreak-radar', label: '🎯 Outbreak Radar' },
                { href: '/data-marketplace', label: '🛒 Data Market' },
                { href: '/micro-insurance', label: '💰 Micro Insurance' },
                { href: '/offline-mesh', label: '📡 Offline Mesh' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-cyan-400 transition text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* More */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}>
            <h4 className="font-bold text-sm mb-3 text-purple-400">More</h4>
            <ul className="space-y-1.5">
              {[
                { href: '/rewards', label: '🏆 Rewards' },
                { href: '/family-care', label: '👨‍👩‍👧 Family Care' },
                { href: '/womens-health', label: '🌸 Women Health' },
                { href: '/communities', label: '👥 Communities' },
                { href: '/pill-scanner', label: '📷 Pill Scanner' },
                { href: '/pets', label: '🐾 Pet Care' },
                { href: '/symptoms', label: '🤒 Symptoms' },
                { href: '/wellness', label: '🌿 Wellness' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-purple-400 transition text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact - Simplified */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h4 className="font-bold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <FiPhone className="text-sky-400 shrink-0 text-sm" />
                <span>1800-ZYN-TRA</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiMail className="text-sky-400 shrink-0 text-sm" />
                <a href="mailto:contact@zyntracare.com" className="hover:text-sky-400 text-xs">Email Us</a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <FiMapPin className="text-sky-400 shrink-0 text-sm mt-0.5" />
                <span className="text-xs">New Delhi, India</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2">For Business</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/hospital-dashboard" className="text-xs text-gray-400 hover:text-sky-400">Hospital</Link>
                <Link href="/doctors/register" className="text-xs text-gray-400 hover:text-sky-400">Doctor</Link>
                <Link href="/corporate-wellness" className="text-xs text-gray-400 hover:text-sky-400">Corporate</Link>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap gap-3">
              <Link href="/legal" className="text-xs text-gray-500 hover:text-white">Privacy</Link>
              <Link href="/legal/terms" className="text-xs text-gray-500 hover:text-white">Terms</Link>
              <Link href="/contact" className="text-xs text-gray-500 hover:text-white">Contact</Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom - Compact */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-400 text-xs">© 2026 ZyntraCare. Made with ❤️ in India.</p>
        </motion.div>
      </div>
    </footer>
  );
}
