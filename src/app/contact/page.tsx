'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    priority: 'normal',
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-white" size={48} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'hi' ? 'संदेश भेजा गया!' : 'Message Sent!'}
            </h2>
            <p className="text-gray-400 mb-6">
              {lang === 'hi'
                ? 'हम 24 घंटों में आपसे संपर्क करेंगे।'
                : 'We will get back to you within 24 hours.'}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              {lang === 'hi' ? 'और संदेश भेजें' : 'Send Another Message'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {lang === 'hi' ? 'संपर्क और सहायता' : 'Contact & Support'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {lang === 'hi'
                ? 'कोई भी प्रश्न, बग रिपोर्ट, या सहायता के लिए हमसे संपर्क करें।'
                : 'Contact us for any questions, bug reports, or support.'}
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: FiMail, title: 'Email', value: 'support@zyntracare.com', color: 'from-sky-500 to-cyan-500' },
              { icon: FiPhone, title: lang === 'hi' ? 'फोन' : 'Phone', value: '1800-XXX-XXXX', color: 'from-green-500 to-emerald-500' },
              { icon: FiMapPin, title: lang === 'hi' ? 'पता' : 'Address', value: 'New Delhi, India', color: 'from-purple-500 to-pink-500' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className="text-white" size={20} />
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {lang === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {lang === 'hi' ? 'ईमेल *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {lang === 'hi' ? 'फोन' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {lang === 'hi' ? 'विषय' : 'Subject'}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.subject === 'bug' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <FiAlertCircle />
                    <span className="font-semibold">{lang === 'hi' ? 'बग रिपोर्ट के लिए सुझाव' : 'Bug Report Tips'}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {lang === 'hi'
                      ? 'कृपया स्क्रीनशॉट, ब्राउज़र विवरण, और reproduce करने के चरण शामिल करें।'
                      : 'Please include screenshots, browser details, and steps to reproduce.'}
                  </p>
                </motion.div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {lang === 'hi' ? 'संदेश *' : 'Message *'}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none resize-none"
                  placeholder={lang === 'hi' ? 'अपना संदेश लिखें...' : 'Write your message...'}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="animate-pulse">{lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...'}</span>
                ) : (
                  <>
                    <FiSend size={20} />
                    {lang === 'hi' ? 'संदेश भेजें' : 'Send Message'}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Emergency Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"
          >
            <p className="text-red-400 font-semibold mb-2">
              {lang === 'hi' ? 'आपातकालीन सहायता के लिए' : 'For Emergency Support'}
            </p>
            <p className="text-gray-400 text-sm mb-3">
              {lang === 'hi'
                ? 'चिकित्सा आपातकाल के लिए, कृपया तुरंत 102 या 108 पर कॉल करें।'
                : 'For medical emergencies, please call 102 or 108 immediately.'}
            </p>
            <a
              href="/emergency"
              className="inline-block bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              {lang === 'hi' ? 'आपातकालीन सेवाएं' : 'Emergency Services'}
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}