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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="font-black text-2xl text-white">Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">Care</span></span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your complete healthcare platform connecting patients with the best medical services across India.
            </p>
            <div className="flex gap-4">
              {[
                { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
                { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map((social, idx) => (
                <motion.a key={idx} href={social.href} target="_blank" rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`} whileHover={{ scale: 1.2, y: -3 }} whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-sky-400 transition">
                  <social.icon size={20} aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/hospitals', label: t('findHospitals') },
                { href: '/specialists', label: 'Find Doctors' },
                { href: '/pharmacies', label: '💊 Pharmacies' },
                { href: '/labs', label: '🧪 Diagnostic Labs' },
                { href: '/camps', label: t('healthCamps') },
                { href: '/booking', label: 'Book Appointment' },
                { href: '/emergency', label: t('emergency') },
                { href: '/dashboard', label: t('myHealth') },
                { href: '/admin', label: '⚙️ Admin Login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-sky-400 transition hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Health Camps — List Your Camp */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              🏕️ Health Camps
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Organizing a free health camp? List it on ZyntraCare and reach thousands of patients near you.
            </p>
            <Link href="/camps"
              className="flex items-center gap-2 w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-4 py-3 rounded-xl transition text-sm shadow-lg shadow-teal-500/20 mb-3">
              <FiPlus size={16} /> List Your Health Camp
            </Link>
            <Link href="/camps" className="inline-block text-teal-400 text-sm hover:underline">
              View Upcoming Camps →
            </Link>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-sky-400 shrink-0" />
                <span>1800-ZYN-TRA (24/7)</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiMail className="text-sky-400 shrink-0" />
                <a href="mailto:contact.zenvyx@gmail.com" className="hover:text-sky-400 transition">
                  contact.zenvyx@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <FiMapPin className="text-sky-400 mt-1 shrink-0" />
                <span>ZyntraCare HQ<br />New Delhi, India 110001</span>
              </li>
              <li className="pt-2 space-y-2">
                <Link href="/legal" className="block text-gray-400 hover:text-sky-400 transition">Privacy Policy</Link>
                <Link href="/legal/terms" className="block text-gray-400 hover:text-sky-400 transition">Terms of Service</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-sky-400 transition">Contact & Support</Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 ZyntraCare. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/legal" className="hover:text-gray-300 transition">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gray-300 transition">Terms</Link>
            <Link href="/contact" className="hover:text-gray-300 transition">Contact</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
