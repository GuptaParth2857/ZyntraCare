'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiLoader, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function ChatPage() {
  const librechatBase = process.env.NEXT_PUBLIC_LIBRECHAT_BASE_URL || '/librechat';
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-blue-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6">
            <FiMessageSquare size={32} className="text-teal-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
              AI Health
            </span>
            {' '}Assistant
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powered by LibreChat - advanced AI chat for your health questions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative w-full h-[75vh] bg-slate-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-lg"
        >
          {!loaded && !error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/80">
              <FiLoader className="animate-spin text-teal-400" size={32} />
              <p className="text-gray-400 text-sm">Loading chat assistant...</p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/80 p-6 text-center">
              <FiAlertCircle className="text-red-400" size={40} />
              <p className="text-gray-300 font-bold">Could not load the AI assistant</p>
              <p className="text-gray-400 text-sm max-w-md">
                The chat service (LibreChat) could not be reached. Set{' '}
                <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_LIBRECHAT_BASE_URL</code>{' '}
                to point to your running LibreChat instance.
              </p>
              <button
                onClick={() => { setError(false); setLoaded(false); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-bold text-white hover:opacity-90 transition"
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          ) : (
            <iframe
              title="LibreChat Interface"
              width="100%"
              height="100%"
              src={`${librechatBase}/`}
              frameBorder="0"
              allow="microphone; camera; clipboard-read; clipboard-write"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className="w-full h-full"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-sm text-gray-500 flex flex-wrap items-center gap-4 justify-between"
        >
          <Link href="/" className="text-teal-400 hover:underline font-medium">
            ← Back to Home
          </Link>
          <p>
            Set <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_LIBRECHAT_BASE_URL</code> to
            change the chat service base path.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
