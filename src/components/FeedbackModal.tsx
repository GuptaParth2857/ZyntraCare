'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiCheckCircle } from 'react-icons/fi';

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setTimeout(() => { setIsOpen(false); setStatus('idle'); setFormData({name:'', email:'', message:''}); }, 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[110px] right-6 z-[9000] p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-blue-500/50 transition-all"
        style={{ backdropFilter: 'blur(10px)' }}
        aria-label="Give Feedback"
      >
        <FiMessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[180px] right-6 w-[340px] z-[9999] rounded-3xl overflow-hidden border border-white/10"
            style={{ 
              background: 'rgba(15, 23, 42, 0.85)', 
              backdropFilter: 'blur(32px)', 
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)' 
            }}
          >
            <div className="bg-gradient-to-r from-blue-600/50 to-indigo-600/50 p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FiMessageSquare aria-hidden="true" /> Support & Feedback
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition" aria-label="Close feedback form"><FiX aria-hidden="true" /></button>
            </div>

            <div className="p-5">
              {status === 'success' ? (
                <motion.div initial={{scale: 0.5}} animate={{scale: 1}} className="text-center py-6">
                  <FiCheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <p className="text-white font-bold">Feedback Sent!</p>
                  <p className="text-white/50 text-xs mt-1">Our team will check it shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label htmlFor="feedback-name" className="sr-only">Your Name</label>
                  <input 
                    id="feedback-name"
                    type="text" placeholder="Your Name" required
                    className="w-full bg-white/5 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <label htmlFor="feedback-email" className="sr-only">Email Address</label>
                  <input 
                    id="feedback-email"
                    type="email" placeholder="Email Address" required
                    className="w-full bg-white/5 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <label htmlFor="feedback-message" className="sr-only">Your Message</label>
                  <textarea 
                    id="feedback-message"
                    placeholder="Your Message, Problem or Idea..." required rows={4}
                    className="w-full bg-white/5 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {status === 'loading' ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"/> : <><FiSend /> Send Message</>}
                  </button>
                  {status === 'error' && <p className="text-red-400 text-xs text-center mt-2">Error sending. Try again.</p>}
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
