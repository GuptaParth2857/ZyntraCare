// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiHeart, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { href: '/hospitals', label: '🏥 Hospitals' },
        { href: '/specialists', label: '👨‍⚕️ Specialists' },
        { href: '/pharmacies', label: '💊 Pharmacies' },
        { href: '/labs', label: '🧪 Labs' },
        { href: '/emergency', label: '🚑 Emergency' },
        { href: '/telehealth', label: '📹 Telehealth' },
        { href: '/blood-donors', label: '🩸 Blood Donors' },
        { href: '/beds', label: '🛏️ Live Beds' },
      ]
    },
    {
      title: 'AI & Tech',
      links: [
        { href: '/clinical-ai', label: '🤖 Clinical AI' },
        { href: '/ai-health-coach', label: '🧘 AI Coach' },
        { href: '/health-tracker', label: '📈 Health Tracker' },
        { href: '/health-wallet', label: '💳 Smart Wallet' },
        { href: '/wearables', label: '⌚ Wearables' },
        { href: '/medicine-verify', label: '🔒 Medicine Verify' },
        { href: '/blockchain-records', label: '⛓️ Records' },
        { href: '/ai-vision', label: '👁️ AI Vision' },
      ]
    },
    {
      title: 'My Health',
      links: [
        { href: '/dashboard', label: '👤 My Dashboard' },
        { href: '/subscription', label: '⭐ Go Premium', isPremium: true },
        { href: '/booking', label: '📅 My Bookings' },
        { href: '/medical-id', label: '🆔 Medical ID' },
        { href: '/family-care', label: '👨‍👩‍👧 Family Care' },
        { href: '/rewards', label: '🏆 Rewards' },
        { href: '/medicine-reminder', label: '💊 Reminders' },
        { href: '/health-records', label: '📋 Records' },
      ]
    },
    {
      title: 'More',
      links: [
        { href: '/wellness', label: '🌿 Wellness' },
        { href: '/womens-health', label: '🌸 Women Health' },
        { href: '/symptoms', label: '🤒 Symptoms' },
        { href: '/first-aid', label: '🚑 First Aid' },
        { href: '/communities', label: '👥 Communities' },
        { href: '/pets', label: '🐾 Pet Care' },
        { href: '/pill-scanner', label: '📷 Pill Scanner' },
        { href: '/camps', label: '🏕️ Health Camps' },
      ]
    },
  ];

  return (
    <footer className="bg-slate-950 text-white relative z-20 border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="font-black text-2xl text-white font-outfit">Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400">Care</span></span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">India's most trusted healthcare platform. Your health, our priority.</p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiPhone className="text-teal-400 shrink-0" size={14} />
                <span>1800-ZYN-TRA</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiMail className="text-teal-400 shrink-0" size={14} />
                <a href="mailto:contact@zyntracare.com" className="hover:text-teal-400">contact@zyntracare.com</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiMapPin className="text-teal-400 shrink-0" size={14} />
                <span>New Delhi, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-teal-500/20 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {footerSections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
            >
              <h4 className="font-bold text-sm mb-4 text-teal-400 flex items-center gap-2">
                {section.title === 'My Health' && <FiStar className="text-amber-400" size={14} />}
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`text-sm transition ${
                        link.isPremium 
                          ? 'text-amber-400 hover:text-amber-300 hover:underline' 
                          : 'text-gray-400 hover:text-teal-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Emergency Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="mt-10 p-4 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-2xl border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <FiPhone className="text-red-400" size={20} />
            </div>
            <div>
              <p className="font-bold text-white">Emergency Helpline</p>
              <p className="text-red-300 text-sm">24/7 Available - Call for immediate assistance</p>
            </div>
          </div>
          <a 
            href="tel:112" 
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-500/30"
          >
            <FiPhone size={18} />
            Call 112
          </a>
        </motion.div>

        {/* Business Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/hospital-partner" className="text-gray-400 hover:text-teal-400 transition">🏥 Partner with Hospitals</Link>
            <Link href="/doctors/register" className="text-gray-400 hover:text-teal-400 transition">👨‍⚕️ Join as Doctor</Link>
            <Link href="/corporate-wellness" className="text-gray-400 hover:text-teal-400 transition">🏢 Corporate Wellness</Link>
            <Link href="/pharmacy-partner" className="text-gray-400 hover:text-teal-400 transition">💊 Pharmacy Partner</Link>
          </div>
          <div className="flex gap-3 text-xs">
            <Link href="/legal" className="text-gray-500 hover:text-white transition">Privacy Policy</Link>
            <Link href="/legal/terms" className="text-gray-500 hover:text-white transition">Terms of Service</Link>
            <Link href="/contact" className="text-gray-500 hover:text-white transition">Contact Us</Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm flex items-center gap-1">
            © 2026 ZyntraCare. Made with <FiHeart className="text-red-500" size={14} /> in India.
          </p>
          <p className="text-gray-600 text-xs">
            Version 2.0 | Building the future of healthcare 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}