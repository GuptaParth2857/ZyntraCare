'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiEye, FiLock, FiUsers, FiDatabase, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('collection');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'collection',
      icon: FiDatabase,
      title: lang === 'hi' ? 'डेटा संग्रह' : 'Data Collection',
      content: lang === 'hi' 
        ? 'हम निम्नलिखित डेटा एकत्र करते हैं: व्यक्तिगत जानकारी (नाम, ईमेल, फोन), स्वास्थ्य डेटा (रिपोर्ट, निदान), बुकिंग इतिहास, और उपयोग डेटा।'
        : 'We collect: Personal information (name, email, phone), Health data (reports, diagnoses), Booking history, and Usage data.',
    },
    {
      id: 'usage',
      icon: FiUsers,
      title: lang === 'hi' ? 'डेटा का उपयोग' : 'Data Usage',
      content: lang === 'hi'
        ? 'आपका डेटा सेवाएं प्रदान करने, बुकिंग प्रबंधित करने, ग्राहक सहायता, और सुधार के लिए उपयोग किया जाता है।'
        : 'Your data is used to provide services, manage bookings, customer support, and improvements.',
    },
    {
      id: 'protection',
      icon: FiLock,
      title: lang === 'hi' ? 'डेटा सुरक्षा' : 'Data Protection',
      content: lang === 'hi'
        ? 'हम एन्क्रिप्शन, सुरक्षित सर्वर, और एक्सेस नियंत्रण का उपयोग करते हैं। आपका डेटा HIPAA और GDPR अनुपालन के तहत सुरक्षित है।'
        : 'We use encryption, secure servers, and access controls. Your data is protected under HIPAA and GDPR compliance.',
    },
    {
      id: 'sharing',
      icon: FiMail,
      title: lang === 'hi' ? 'डेटा साझाकरण' : 'Data Sharing',
      content: lang === 'hi'
        ? 'हम आपका डेटा केवल आपकी सहमति से साझा करते हैं। हम इसे तीसरी पक्षों को नहीं बेचते।'
        : 'We only share your data with your consent. We do not sell it to third parties.',
    },
    {
      id: 'rights',
      icon: FiEye,
      title: lang === 'hi' ? 'आपके अधिकार' : 'Your Rights',
      content: lang === 'hi'
        ? 'आप अपने डेटा तक पहुंच सकते हैं, उसे सही कर सकते हैं, या हटा सकते हैं। GDPR के तहत आपके अधिकार सुरक्षित हैं।'
        : 'You can access, correct, or delete your data. Your rights are protected under GDPR.',
    },
    {
      id: 'cookies',
      icon: FiAlertCircle,
      title: lang === 'hi' ? 'कुकीज़' : 'Cookies',
      content: lang === 'hi'
        ? 'हम उपयोगकर्ता अनुभव सुधारने के लिए कुकीज़ का उपयोग करते हैं। आप ब्राउज़र सेटिंग्स में कुकीज़ को अस्वीकार कर सकते हैं।'
        : 'We use cookies to improve user experience. You can reject cookies in your browser settings.',
    },
  ];

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {lang === 'hi' ? 'आपकी व्यक्तिगत जानकारी की सुरक्षा हमारी प्राथमिकता है।' : 'Your personal information protection is our priority.'}
          </p>
        </motion.div>

        <p className="text-center text-gray-500 mb-8">{lang === 'hi' ? 'अंतिम बार अपडेट: अप्रैल 2026' : 'Last updated: April 2026'}</p>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                    <section.icon className="text-white" size={20} />
                  </div>
                  <span className="text-white font-semibold text-lg">{section.title}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedSection === section.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              {expandedSection === section.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5">
                  <p className="text-gray-400 leading-relaxed ml-14">{section.content}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">{lang === 'hi' ? 'गोपनीयता संबंधी प्रश्न' : 'Privacy Questions'}</h3>
          <p className="text-gray-400 mb-4">{lang === 'hi' ? 'कोई भी प्रश्न के लिए हमसे संपर्क करें।' : 'Contact us for any questions.'}</p>
          <a href="mailto:privacy@zyntracare.com" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-full font-semibold transition">
            <FiMail size={18} /> privacy@zyntracare.com
          </a>
        </motion.div>
      </div>
    </main>
  );
}