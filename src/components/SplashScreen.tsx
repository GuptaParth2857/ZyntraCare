'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + Math.random() * 35));
    }, 180);

    // Force hide after 5s to prevent infinite loading
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    // Fallback to ensure splash always hides
    const forceHide = setTimeout(() => {
      setShowSplash(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(forceHide);
      clearInterval(interval);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[100px]" />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-600/15 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Outer Ring */}
          <motion.div
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            className="absolute w-36 h-36 rounded-full border border-sky-400/30" />
          
          {/* Middle Ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0.25, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute w-32 h-32 rounded-full border border-sky-400/40" />

          {/* Logo */}
          <motion.div
            animate={{ boxShadow: ['0 0 25px rgba(14,165,233,0.3)', '0 0 50px rgba(14,165,233,0.5)', '0 0 25px rgba(14,165,233,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-sky-400/50 bg-slate-900"
          >
            <Image src="/images/publiczyntracare-logo.png" alt="ZyntraCare" fill className="object-cover" priority />
          </motion.div>

          {/* Center Dot */}
          <motion.div
            animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute w-3 h-3 bg-sky-400 rounded-full" />
        </div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">Care</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 text-base mt-2 flex items-center justify-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Your Health, Our Priority
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 180 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full" />
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-500 text-xs mt-3 font-mono"
        >
          {progress < 30 ? 'Loading...' : progress < 70 ? 'Connecting...' : 'Almost ready...'}
        </motion.p>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-10 flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-400 text-xs">Powered by AI</span>
        </motion.div>

        {/* Version */}
        <div className="absolute bottom-4 text-slate-600 text-[10px]">
          v1.0.0 • Made with ❤️ in India
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
