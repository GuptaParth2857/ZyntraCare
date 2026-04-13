// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
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
                { href: '/specialists', label: t('findSpecialists') },
                { href: '/camps', label: t('healthCamps') },
                { href: '/emergency', label: t('emergency') },
                { href: '/dashboard', label: t('myHealth') },
                { href: '/hospital-dashboard', label: 'Staff Portal' },
                { href: '/feedback', label: 'Feedback' },
                { href: '/sponsor', label: 'Partner With Us' },
                { href: '/build-pipeline', label: 'SaaS Builder' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary-400 transition hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/booking" className="text-gray-400 hover:text-primary-400 transition">Online Consultation</Link></li>
              <li><Link href="/booking" className="text-gray-400 hover:text-primary-400 transition">Book Appointments</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-primary-400 transition">Medical Records</Link></li>
              <li><Link href="/subscription" className="text-gray-400 hover:text-primary-400 transition">Health Packages</Link></li>
              <li><Link href="/emergency" className="text-gray-400 hover:text-primary-400 transition">Emergency Services</Link></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-bold text-lg mb-4">Legal & Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-primary-400" />
                <span>1800-XXX-XXXX (Toll Free)</span>
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
          <div className="flex gap-6 text-sm">
            <Link href="/legal" className="text-gray-400 hover:text-primary-400 transition">Privacy Policy</Link>
            <Link href="/legal/terms" className="text-gray-400 hover:text-primary-400 transition">Terms of Service</Link>
            <Link href="/contact" className="text-gray-400 hover:text-primary-400 transition">Contact</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
