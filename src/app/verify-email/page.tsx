'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiAlertCircle, FiSend } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VerifyEmailPage() {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send verification email');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-md mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-white" size={36} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'hi' ? 'ईमेल भेजा गया!' : 'Email Sent!'}
            </h2>
            <p className="text-gray-400 mb-6">
              {lang === 'hi'
                ? 'हमने आपके ईमेल पर सत्यापन लिंक भेजा है।'
                : 'We have sent a verification link to your email.'}
            </p>
            <p className="text-gray-500 text-sm">
              {lang === 'hi'
                ? 'जांचें और अपने ईमेल की पुष्टि करें।'
                : 'Check your inbox and verify your email.'}
            </p>
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
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMail className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {lang === 'hi' ? 'ईमेल सत्यापन' : 'Verify Email'}
              </h1>
              <p className="text-gray-400">
                {lang === 'hi'
                  ? 'अपना ईमेल सत्यापित करने के लिए ईमेल दर्ज करें।'
                  : 'Enter your email to verify your account.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400">
                <FiAlertCircle />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {lang === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">
                    {lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    <FiSend size={18} />
                    {lang === 'hi' ? 'सत्यापन ईमेल भेजें' : 'Send Verification Email'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}