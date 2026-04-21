'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShield, FiFileText, FiLock, FiEye, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';


export default function LegalPage() {
  const { t, lang } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('privacy');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'privacy',
      icon: FiShield,
      title: lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy',
      content: lang === 'hi' 
        ? 'हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं। हमारी गोपनीयता नीति बताती है कि हम आपके डेटा को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।'
        : 'We are committed to protecting your personal information. Our Privacy Policy explains how we collect, use, and safeguard your data.',
      link: '/legal/privacy',
    },
    {
      id: 'terms',
      icon: FiFileText,
      title: lang === 'hi' ? 'सेवा की शर्तें' : 'Terms & Conditions',
      content: lang === 'hi'
        ? 'हमारी सेवा की शर्तें प्लेटफॉर्म का उपयोग करने के नियम और शर्तें निर्धारित करती हैं।'
        : 'Our Terms of Service outline the rules and conditions for using our platform.',
      link: '/legal/terms',
    },
    {
      id: 'hipaa',
      icon: FiLock,
      title: lang === 'hi' ? 'HIPAA अनुपालन' : 'HIPAA Compliance',
      content: lang === 'hi'
        ? 'हम HIPAA (Health Insurance Portability and Accountability Act) दिशानिर्देशों का पालन करते हैं।'
        : 'We comply with HIPAA (Health Insurance Portability and Accountability Act) guidelines.',
      link: '/legal/privacy',
    },
    {
      id: 'data',
      icon: FiEye,
      title: lang === 'hi' ? 'डेटा सुरक्षा' : 'Data Protection',
      content: lang === 'hi'
        ? 'आपका स्वास्थ्य डेटा एन्क्रिप्ट किया गया है और सुरक्षित सर्वर पर संग्रहीत है।'
        : 'Your health data is encrypted and stored on secure servers.',
      link: '/legal/privacy',
    },
    {
      id: 'disclaimer',
      icon: FiAlertTriangle,
      title: lang === 'hi' ? 'अस्वीकरण' : 'Disclaimer',
      content: lang === 'hi'
        ? 'यह प्लेटफॉर्म चिकित्सा सलाह के लिए नहीं है। कृपया किसी भी चिकित्सा निर्णय के लिए योग्य चिकित्सक से परामर्श लें।'
        : 'This platform is not a substitute for medical advice. Please consult a qualified healthcare professional for any medical decisions.',
      link: '/legal/terms',
    },
  ];

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {lang === 'hi' ? 'कानूनी एवं अनुपालन' : 'Legal & Compliance'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {lang === 'hi'
                ? 'आपकी गोपनीयता और डेटा सुरक्षा हमारी प्राथमिकता है।'
                : 'Your privacy and data security is our priority.'}
            </p>
          </motion.div>

          {/* Certification Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {[
              { name: 'HIPAA', color: 'bg-green-500' },
              { name: 'ISO 27001', color: 'bg-blue-500' },
              { name: 'SOC 2', color: 'bg-purple-500' },
              { name: 'GDPR', color: 'bg-orange-500' },
            ].map((cert) => (
              <div
                key={cert.name}
                className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full"
              >
                <FiCheckCircle className="text-green-400" />
                <span className="text-white font-semibold">{cert.name}</span>
              </div>
            ))}
          </motion.div>

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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                      <section.icon className="text-white" size={20} />
                    </div>
                    <span className="text-white font-semibold text-lg">{section.title}</span>
                  </div>
                  {expandedSection === section.id ? (
                    <FiChevronUp className="text-gray-400" />
                  ) : (
                    <FiChevronDown className="text-gray-400" />
                  )}
                </button>
                
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-gray-400 leading-relaxed ml-14">
                      {section.content}
                    </p>
                    
                    <div className="mt-4 ml-14 flex flex-wrap gap-2">
                      <Link href={section.link} className="text-sm text-sky-400 hover:text-sky-300 transition flex items-center gap-1">
                        {lang === 'hi' ? 'पूर्ण दस्तावेज़ पढ़ें' : 'Read Full Document'}
                        <FiExternalLink size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-8 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {lang === 'hi' ? 'कानूनी प्रश्नों के लिए' : 'For Legal Inquiries'}
            </h3>
            <p className="text-gray-400 mb-4">
              {lang === 'hi'
                ? 'कोई भी कानूनी प्रश्न या चिंता के लिए हमसे संपर्क करें।'
                : 'Contact us for any legal questions or concerns.'}
            </p>
            <a
              href="mailto:legal@zyntracare.com"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              <FiFileText size={18} />
              {lang === 'hi' ? 'legal@zyntracare.com से संपर्क करें' : 'Contact legal@zyntracare.com'}
            </a>
          </motion.div>

          {/* Last Updated */}
          <p className="text-center text-gray-500 mt-8 text-sm">
            {lang === 'hi'
              ? 'अंतिम बार अपडेट किया गया: अप्रैल 2026'
              : 'Last updated: April 2026'}
          </p>
      </div>
    </main>
  );
}