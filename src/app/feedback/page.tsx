'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiStar, FiMessageSquare, FiMail, FiUser, FiCheck, FiArrowLeft, FiThumbsUp } from 'react-icons/fi';
import { MdHealthAndSafety } from 'react-icons/md';
import { useNotifications } from '@/components/Notifications';

const CATEGORIES = ['Overall Experience', 'UI/UX Design', 'AI Diagnosis Tool', 'Hospital Booking', 'Emergency Response', 'Doctor Quality', 'Ambulance Service'];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('Overall Experience');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !message.trim()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
    // Trigger notification
    try {
      const { addNotification } = useNotifications();
      addNotification({
        type: 'success',
        title: 'Feedback Submitted',
        message: `Thank you for your ${category} feedback!`,
      });
    } catch {}
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/3 w-[650px] h-[650px] bg-cyan-600/22 rounded-full blur-[190px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.15, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/4 right-0 w-[480px] h-[480px] bg-teal-600/18 rounded-full blur-[140px]"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-12 max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30"
          >
            <FiCheck size={36} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-3">Thank You! 🙏</h2>
          <p className="text-gray-400 mb-8">Your feedback helps us improve healthcare for millions. We truly appreciate your time.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition">
              Back to Home
            </Link>
            <button onClick={() => { setSubmitted(false); setRating(0); setMessage(''); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition border border-white/10">
              Submit More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white py-12 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-cyan-600/18 rounded-full blur-[175px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-teal-600/14 rounded-full blur-[130px]"
        />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to ZyntraCare
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MdHealthAndSafety size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Share Your Feedback</h1>
          <p className="text-gray-400 text-lg">Help us build the best healthcare platform in India</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
        >
          {/* Category */}
          <div>
            <label className="text-gray-300 font-semibold text-sm block mb-3">What are you rating?</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition ${
                    category === cat
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-gray-300 font-semibold text-sm block mb-3">Your Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition"
                >
                  <FiStar
                    className={`transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                    fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  />
                </motion.button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-gray-400 text-sm self-center">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-gray-300 font-semibold text-sm mb-2 flex items-center gap-2">
              <FiMessageSquare size={14} /> Your Feedback *
            </label>
            <textarea
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us what you think — what's working great, what could be better, what features you'd love to see..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition resize-none"
            />
          </div>

          {/* Optional name/email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiUser size={12} /> Name (optional)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiMail size={12} /> Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || !rating || !message.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <><FiThumbsUp /> Submit Feedback</>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
