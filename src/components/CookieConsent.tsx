'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiX, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

export default function CookieConsent() {
  const { lang } = useLanguage();
  const [showConsent, setShowConsent] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'accepted') {
      setCookiesAccepted(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
    setCookiesAccepted(true);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAward className="text-white" size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                {lang === 'hi' ? 'कुकी सहमति' : 'Cookie Consent'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {lang === 'hi'
                  ? 'हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं। GDPR के अनुसार, हमें आपकी सहमति की आवश्यकता है।'
                  : 'We use cookies to improve your experience. Under GDPR, we need your consent.'}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={acceptCookies}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-full font-semibold text-sm transition"
                >
                  <FiCheck size={16} />
                  {lang === 'hi' ? 'सभी कुकीज़ स्वीकार करें' : 'Accept All Cookies'}
                </button>
                <button
                  onClick={declineCookies}
                  className="text-gray-400 hover:text-white px-4 py-2 text-sm transition"
                >
                  {lang === 'hi' ? 'आवश्यक कुकीज़ ही' : 'Essential Only'}
                </button>
                <a
                  href="/legal/privacy"
                  className="text-sky-400 hover:text-sky-300 px-4 py-2 text-sm transition"
                >
                  {lang === 'hi' ? 'गोपनीयता नीति पढ़ें' : 'Read Privacy Policy'}
                </a>
              </div>
            </div>
            
            <button
              onClick={declineCookies}
              className="text-gray-400 hover:text-white transition"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}