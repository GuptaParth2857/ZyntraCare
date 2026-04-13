// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiCalendar, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { camps } from '@/data/mockData';

export default function Footer() {
  const { t } = useLanguage();
  
  const upcomingCamps = camps.slice(0, 3);
  
  return (
    <footer className="bg-gray-900 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Image 
                  src="/images/publiczyntracare-logo.png" 
                  alt="ZyntraCare Logo" 
                  width={48} 
                  height={48}
                  className="object-cover"
                />
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
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-primary-400 transition"
                >
                  <social.icon size={20} aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/hospitals', label: t('findHospitals') },
                { href: '/specialists', label: 'Find Doctors' },
                { href: '/camps', label: t('healthCamps') },
                { href: '/emergency', label: t('emergency') },
                { href: '/dashboard', label: t('myHealth') },
                { href: '/hospital-dashboard', label: 'Staff Portal' },
                { href: '/feedback', label: 'Feedback' },
                { href: '/sponsor', label: 'Partner With Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary-400 transition hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Health Camps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiCalendar className="text-teal-400" />
              Upcoming Health Camps
            </h4>
            <div className="space-y-3">
              {upcomingCamps.map((camp) => (
                <Link 
                  key={camp.id} 
                  href="/camps" 
                  className="block bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition"
                >
                  <p className="text-white text-sm font-medium">{camp.name}</p>
                  <p className="text-gray-400 text-xs">{camp.date} • {camp.city}</p>
                </Link>
              ))}
            </div>
            <Link href="/camps" className="inline-block mt-3 text-teal-400 text-sm hover:underline">
              View All Camps →
            </Link>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-primary-400" />
                <span>1800-ZYN TRA (24/7)</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiMail className="text-primary-400" />
                <span>support@zyntracare.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <FiMapPin className="text-primary-400 mt-1" />
                <span>123 Healthcare Avenue<br />New Delhi, 110001</span>
              </li>
              <li className="pt-2 space-y-2">
                <Link href="/legal" className="block text-gray-400 hover:text-primary-400 transition">Privacy Policy</Link>
                <Link href="/legal/terms" className="block text-gray-400 hover:text-primary-400 transition">Terms of Service</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-primary-400 transition">Contact Us</Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            © 2026 ZyntraCare. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
