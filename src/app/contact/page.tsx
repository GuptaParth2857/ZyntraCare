'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: 'general', message: '', priority: 'normal',
  });

  const subjects = [
    { value: 'general', label: lang === 'hi' ? 'सामान्य प्रश्न' : 'General Inquiry' },
    { value: 'support', label: lang === 'hi' ? 'तकनीकी सहायता' : 'Technical Support' },
    { value: 'bug', label: lang === 'hi' ? 'बग रिपोर्ट' : 'Bug Report' },
    { value: 'billing', label: lang === 'hi' ? 'बिलिंग प्रश्न' : 'Billing Question' },
    { value: 'partnership', label: lang === 'hi' ? 'साझेदारी' : 'Partnership' },
    { value: 'feedback', label: lang === 'hi' ? 'प्रतिक्रिया' : 'Feedback' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16 relative overflow-hidden">
      {/* 3D animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity }} className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-sky-600/15 rounded-full blur-[180px]" />
        <motion.div animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, delay: 2 }} className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-teal-600/12 rounded-full blur-[140px]" />
        <motion.div animate={{ opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, delay: 4 }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-sky-500/30">
            <FiMessageSquare className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {lang === 'hi' ? 'संपर्क और सहायता' : 'Contact & Support'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {lang === 'hi' ? 'कोई भी प्रश्न, बग रिपोर्ट, या सहायता के लिए हमसे संपर्क करें।' : 'Contact us for any questions, bug reports, or support.'}
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: FiMail, title: 'Email', value: 'contact.zenvyx@gmail.com', href: 'mailto:contact.zenvyx@gmail.com', color: 'from-sky-500 to-cyan-500' },
            { icon: FiPhone, title: lang === 'hi' ? 'फोन' : 'Phone', value: '1800-ZYN-TRA (24/7)', href: 'tel:108', color: 'from-green-500 to-emerald-500' },
            { icon: FiMapPin, title: lang === 'hi' ? 'पता' : 'Address', value: 'New Delhi, India', href: '#', color: 'from-purple-500 to-pink-500' },
          ].map((item, i) => (
            <motion.a key={item.title} href={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:border-sky-500/40 transition group block">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                <item.icon className="text-white" size={20} />
              </div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.value}</p>
            </motion.a>
          ))}
        </div>

        {/* Contact Form */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                <FiCheck className="text-white" size={36} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {lang === 'hi' ? 'संदेश भेजा गया!' : 'Message Sent!'}
              </h2>
              <p className="text-gray-400 mb-6">
                {lang === 'hi' ? 'हम 24 घंटों में आपसे संपर्क करेंगे।' : 'We will get back to you within 24 hours.'}
              </p>
              <button onClick={() => setSubmitted(false)}
                className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 rounded-full font-semibold transition">
                {lang === 'hi' ? 'और संदेश भेजें' : 'Send Another Message'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{lang === 'hi' ? 'आपका नाम *' : 'Your Name *'}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{lang === 'hi' ? 'ईमेल *' : 'Email *'}</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{lang === 'hi' ? 'फोन' : 'Phone'}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{lang === 'hi' ? 'विषय' : 'Subject'}</label>
                    <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:outline-none transition">
                      {subjects.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {formData.subject === 'bug' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <FiAlertCircle />
                      <span className="font-semibold">{lang === 'hi' ? 'बग रिपोर्ट के लिए सुझाव' : 'Bug Report Tips'}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {lang === 'hi' ? 'कृपया स्क्रीनशॉट, ब्राउज़र विवरण, और reproduce करने के चरण शामिल करें।' : 'Please include screenshots, browser details, and steps to reproduce.'}
                    </p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">{lang === 'hi' ? 'संदेश *' : 'Message *'}</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} required
                    placeholder={lang === 'hi' ? 'अपना संदेश लिखें...' : 'Write your message...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition resize-none" />
                </div>

                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-500/25">
                  {submitting ? (
                    <span className="animate-pulse">{lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...'}</span>
                  ) : (
                    <><FiSend size={20} />{lang === 'hi' ? 'संदेश भेजें' : 'Send Message'}</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Notice */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">
            {lang === 'hi' ? 'आपातकालीन सहायता के लिए' : 'For Emergency Support'}
          </p>
          <p className="text-gray-400 text-sm mb-3">
            {lang === 'hi' ? 'चिकित्सा आपातकाल के लिए, कृपया तुरंत 102 या 108 पर कॉल करें।' : 'For medical emergencies, please call 102 or 108 immediately.'}
          </p>
          <a href="/emergency" className="inline-block bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-full font-semibold transition">
            {lang === 'hi' ? 'आपातकालीन सेवाएं' : 'Emergency Services'}
          </a>
        </motion.div>
      </div>
    </main>
  );
}