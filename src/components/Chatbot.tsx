'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Chatbot() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-[30px] right-6 z-[8000]"
    >
      <Link
        href="/chat"
        className="group relative flex items-center gap-3 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl border border-white/10 transition-all hover:scale-105 hover:-translate-y-1"
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
          boxShadow: '0 10px 40px rgba(29, 78, 216, 0.4), 0 0 0 0 rgba(59, 130, 246, 0.5)',
        }}
      >
        <span className="relative flex h-8 w-8">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-8 w-8 bg-white/20 items-center justify-center text-lg">🤖</span>
        </span>
        <span>Chat with AI</span>
        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">NEW</span>
      </Link>
    </motion.div>
  );
}