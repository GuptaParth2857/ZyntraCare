'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle, FiAlertTriangle, FiUsers, FiCreditCard, FiShield } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';


export default function TermsPage() {
  const { t, lang } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('acceptance');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'acceptance',
      icon: FiCheckCircle,
      title: lang === 'hi' ? 'स्वीकृति' : 'Acceptance',
      content: lang === 'hi' 
        ? 'हमारी सेवाओं का उपयोग करके, आप इन शर्तों से सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।'
        : 'By using our services, you agree to these terms. If you do not agree, please do not use our services.',
    },
    {
      id: 'services',
      icon: FiUsers,
      title: lang === 'hi' ? 'सेवाएं' : 'Services',
      content: lang === 'hi'
        ? 'ZyntraCare अस्पताल खोज, डॉक्टर बुकिंग, ऑनलाइन परामर्श, और स्वास्थ्य सेवाएं प्रदान करता है।'
        : 'ZyntraCare provides hospital search, doctor booking, online consultation, and health services.',
    },
    {
      id: 'account',
      icon: FiShield,
      title: lang === 'hi' ? 'खाता दायित्व' : 'Account Responsibility',
      content: lang === 'hi'
        ? 'आप अपने खाते की सुरक्षा के लिए जिम्मेदार हैं। बुकिंग के लिए सटीक जानकारी प्रदान करें।'
        : 'You are responsible for your account security. Provide accurate information for bookings.',
    },
    {
      id: 'bookings',
      icon: FiCreditCard,
      title: lang === 'hi' ? 'बुकिंग और भुगतान' : 'Bookings & Payments',
      content: lang === 'hi'
        ? 'बुकिंग निर्धारित नीतियों के अनुसार रद्द या प्रतिपूर्ति योग्य है। भुगतान सुरक्षित गेटवे के माध्यम से है।'
        : 'Bookings are cancelable/refundable per policy. Payments are via secure gateways.',
    },
    {
      id: 'medical',
      icon: FiAlertTriangle,
      title: lang === 'hi' ? 'चिकित्सा अस्वीकरण' : 'Medical Disclaimer',
      content: lang === 'hi'
        ? 'हमारी सेवाएं चिकित्सा सलाह नहीं हैं। गंभीर स्थिति के लिए तुरंत चिकित्सक से संपर्क करें।'
        : 'Our services are not medical advice. Contact a healthcare professional for serious conditions.',
    },
    {
      id: 'limitation',
      icon: FiFileText,
      title: lang === 'hi' ? 'उत्तरदायित्व सीमा' : 'Limitation of Liability',
      content: lang === 'hi'
        ? 'हम तृतीय पक्ष सेवाओं या सूचना की सटीकता के लिए उत्तरदायी नहीं हैं।'
        : 'We are not liable for third-party services or information accuracy.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {lang === 'hi' ? 'सेवा की शर्तें' : 'Terms & Conditions'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {lang === 'hi'
                ? 'हमारी सेवाओं का उपयोग करने से पहले इन शर्तों को पढ़ें।'
                : 'Read these terms before using our services.'}
            </p>
          </motion.div>

          {/* Last Updated */}
          <p className="text-center text-gray-500 mb-8">
            {lang === 'hi' ? 'अंतिम बार अपडेट: अप्रैल 2026' : 'Last updated: April 2026'}
          </p>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <section.icon className="text-white" size={20} />
                    </div>
                    <span className="text-white font-semibold text-lg">{section.title}</span>
                  </div>
                  {expandedSection === section.id ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-gray-400 leading-relaxed ml-14">
                      {section.content}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-8 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {lang === 'hi' ? 'प्रश्न?' : 'Questions?'}
            </h3>
            <p className="text-gray-400 mb-4">
              {lang === 'hi' ? 'शर्तों के बारे में प्रश्नों के लिए संपर्क करें।' : 'Contact us for terms questions.'}
            </p>
            <a
              href="mailto:legal@zyntracare.com"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              <FiFileText size={18} />
              legal@zyntracare.com
            </a>
          </motion.div>
        </div>
    </main>
  );
}