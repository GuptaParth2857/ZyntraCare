'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiPhone, FiHeart, FiStar, FiGlobe, FiAlertCircle, FiBell, FiUser, FiPlus } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, availableLanguages } from '@/context/LanguageContext';
import { NotificationBell } from '@/components/Notifications';

export default function Navbar() {
  // Guest mode - no login required
  const session = null;
  const status = 'authenticated';
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (!showLangMenu) return;
    const close = () => setShowLangMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showLangMenu]);

  const importantLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/pharmacies', label: 'Pharmacy', icon: '💊' },
    { href: '/labs', label: 'Lab', icon: '🧪' },
    { href: '/emergency', label: t('emergency'), isEmergency: true, icon: '🚑' },
    { href: '/hospitals', label: t('hospitals'), icon: '🏥' },
    { href: '/specialists', label: t('specialists'), icon: '👨‍⚕️' },
  ];

const moreMenuLinks = [
    { header: '🩺 Quick Access', links: [
      { href: '/telehealth', label: 'Video Consultation', icon: '📹' },
      { href: '/booking', label: 'Book Appointment', icon: '📅' },
      { href: '/map', label: 'Nearby Hospitals', icon: '🗺️' },
      { href: '/pharmacies', label: 'Pharmacies', icon: '💊' },
    ]},
    { header: '💪 My Health', links: [
      { href: '/dashboard', label: t('myHealth'), icon: '📊' },
      { href: '/health-tracker', label: 'Health Tracker', icon: '❤️' },
      { href: '/subscription', label: t('premium'), isPremium: true, icon: '⭐' },
    ]},
    { header: '🔍 Find Care', links: [
      { href: '/specialists', label: 'Find Specialists', icon: '👨‍⚕️' },
      { href: '/hospitals', label: 'Hospitals', icon: '🏥' },
      { href: '/blood-donors', label: 'Blood Donors', icon: '🩸' },
      { href: '/labs', label: 'Diagnostic Labs', icon: '🔬' },
      { href: '/camps', label: t('healthCamps'), icon: '🎪' },
      { href: '/symptoms', label: 'Symptom Checker', icon: '🤒' },
    ]},
    { header: '🤖 AI & Tech', links: [
      { href: '/clinical-ai', label: 'Clinical AI', icon: '🧠' },
      { href: '/ai-health-coach', label: 'AI Health Coach', icon: '🎯' },
      { href: '/wearables', label: 'Wearables', icon: '⌚' },
      { href: '/health-wallet', label: 'Health Wallet', icon: '💳' },
      { href: '/medicine-verify', label: 'Verify Medicine', icon: '✅' },
      { href: '/blockchain-records', label: 'Blockchain Records', icon: '🔗' },
    ]},
    { header: '✨ More Services', links: [
      { href: '/rewards', label: 'Rewards', icon: '🏆' },
      { href: '/family-care', label: 'Family Care', icon: '👨‍👩‍👧' },
      { href: '/womens-health', label: "Women's Health", icon: '🌸' },
      { href: '/communities', label: 'Communities', icon: '👥' },
      { href: '/pill-scanner', label: 'Pill Scanner', icon: '📷' },
      { href: '/pets', label: 'Pet Care', icon: '🐾' },
      { href: '/wellness', label: 'Wellness', icon: '🧘' },
      { href: '/first-aid', label: 'First Aid Guide', icon: '🚑' },
    ]},
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/20 py-2 border-b border-white/5'
            : 'bg-slate-950/70 backdrop-blur-md py-3 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="ZyntraCare — Go to homepage"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                aria-hidden="true"
              >
                <Image 
                  src="/images/publiczyntracare-logo.png" 
                  alt="ZyntraCare Logo" 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </motion.div>
              <span className="font-black text-xl text-white font-outfit">
                Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-gold-400">Care</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {importantLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    pathname === link.href
                      ? 'text-white bg-white/10'
                      : link.isEmergency
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/8'
                  }`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.isEmergency && (
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1 mb-0.5" aria-hidden="true" />
                  )}
                  {link.icon && <span className="mr-1">{link.icon}</span>}
                  {link.label}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 transition-all duration-300 ${
                      pathname === link.href ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              ))}
              
              {/* More Dropdown */}
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105">
                  ✨ More
                </button>
                <div className="absolute top-full left-0 mt-2 w-[480px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="text-xs font-bold text-gray-500 mb-2 px-1">EXPLORE ZYNNTRA CARE</div>
                  <div className="grid grid-cols-4 gap-2">
                    {moreMenuLinks.flatMap(section => section.links).map((link: any, idx: number) => (
                      <Link key={idx} href={link.href} className={`group flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                        link.isPremium 
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                          : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'
                      }`}>
                        <span className="text-2xl filter group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
                        <span className={`text-[10px] text-center font-medium ${
                          link.isPremium ? 'text-amber-400' : 'text-gray-300'
                        }`}>{link.label}</span>
                        {link.isPremium && <span className="text-[8px] text-amber-500/70">★</span>}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between px-1">
                    <span className="text-[10px] text-gray-500">🎉 24/7 Emergency</span>
                    <span className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer">View All →</span>
                  </div>
                </div>
              </div>
            </nav>

            {/* Right side controls */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setShowLangMenu(v => !v); }}
                  aria-label="Change language"
                  aria-expanded={showLangMenu}
                  aria-haspopup="listbox"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white transition px-2.5 py-2 rounded-xl hover:bg-white/8 border border-white/0 hover:border-white/10"
                >
                  <FiGlobe size={15} aria-hidden="true" />
                  <span className="text-sm">{availableLanguages.find(l => l.code === lang)?.flag}</span>
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      role="listbox"
                      aria-label="Select language"
                      className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 py-2 min-w-[160px] z-50 overflow-hidden"
                    >
                      {availableLanguages.map(l => (
                        <button
                          key={l.code}
                          role="option"
                          aria-selected={lang === l.code}
                          onClick={e => { e.stopPropagation(); setLang(l.code); setShowLangMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5 ${
                            lang === l.code
                              ? 'bg-blue-500/15 text-blue-300 font-semibold'
                              : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span aria-hidden="true">{l.flag}</span>
                          {l.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Emergency Helpline */}
              <a
                href="tel:112"
                aria-label="Call emergency helpline 112"
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition text-sm px-2.5 py-2 rounded-xl hover:bg-red-500/10 border border-white/0 hover:border-red-500/20"
              >
                <FiPhone size={14} aria-hidden="true" />
                <span className="font-semibold hidden xl:inline">{t('helpline')}</span>
              </a>

              {/* Auth */}
              {status === 'authenticated' ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl transition text-sm font-semibold shadow-[0_0_15px_rgba(14,165,233,0.25)]"
                    aria-label="Open dashboard"
                  >
                    <FiUser size={14} aria-hidden="true" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/subscription"
                  className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 px-3.5 py-2 rounded-xl transition text-sm font-semibold"
                  aria-label="Upgrade to premium"
                >
                  <FiStar size={14} aria-hidden="true" />
                  <span className="hidden xl:inline">Go Premium</span>
                </Link>
              )}
              <NotificationBell />
            </div>

              {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(v => !v)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-white/5 overflow-hidden bg-slate-950/95 backdrop-blur-xl"
            >
              <nav className="flex flex-col p-4 gap-1" role="navigation" aria-label="Mobile navigation">
                {/* Mobile language selector */}
                <div
                  className="flex gap-1.5 overflow-x-auto pb-3 mb-2 border-b border-white/5"
                  role="group"
                  aria-label="Language select"
                >
                  {availableLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      aria-pressed={lang === l.code}
                      className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                        lang === l.code
                          ? 'bg-blue-600/80 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>

                {importantLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={pathname === link.href ? 'page' : undefined}
                      className={`py-3 px-4 rounded-xl font-medium flex items-center gap-2 transition ${
                        pathname === link.href
                          ? 'bg-blue-500/15 text-blue-300'
                          : link.isEmergency
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {link.isEmergency && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                      )}
                      {link.icon && <span>{link.icon}</span>}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* More section in mobile */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <h4 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">More</h4>
                  {moreMenuLinks.flatMap(s => s.links).map((link: any, idx) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.02 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`py-2.5 px-4 rounded-xl font-medium flex items-center gap-2 transition text-gray-400 hover:text-white hover:bg-white/5`}
                      >
                        {link.label}
                        {link.isPremium && <FiStar className="text-amber-400 ml-auto" size={13} />}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                      <Link
                        href="/subscription"
                        className="flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl font-semibold transition hover:bg-amber-500/30"
                      >
                        <FiStar aria-hidden="true" />
                        <span>Go Premium</span>
                      </Link>
                    </div>
                    <a
                      href="tel:112"
                    className="flex items-center justify-center gap-2 bg-red-600/15 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-semibold text-sm transition hover:bg-red-600/25"
                    aria-label="Call emergency 112"
                  >
                    <FiAlertCircle size={16} aria-hidden="true" />
                    Emergency: 112
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}