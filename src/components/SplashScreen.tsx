'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  'Initializing secure connection...',
  'Loading health data...',
  'Connecting to hospitals...',
  'Preparing AI models...',
  'Almost ready...',
];

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const newProgress = prev + Math.random() * 25 + 10;
        return Math.min(newProgress, 100);
      });
    }, 200);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= LOADING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 800);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    const forceHide = setTimeout(() => {
      setShowSplash(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(forceHide);
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ 
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)', 
            backgroundSize: '60px 60px' 
          }} />
          
          {/* Pulsing gradient blobs */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-600/25 rounded-full blur-[120px]" 
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-teal-600/20 rounded-full blur-[100px]" 
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px]" 
          />
        </div>

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100vh', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ y: '-100vh', opacity: [0, 0.6, 0] }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear',
              }}
              className="absolute w-1 h-1 bg-sky-400/40 rounded-full"
            />
          ))}
        </div>

        {/* Logo Section with Epic Animation */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Outer expanding rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5 + i * 0.15, 1.5 + i * 0.15], 
                opacity: [0.4 - i * 0.1, 0, 0] 
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
              className="absolute rounded-full border border-sky-400/20"
              style={{ width: 180 + i * 40, height: 180 + i * 40 }}
            />
          ))}

          {/* Rotating outer glow */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute w-52 h-52"
          >
            <div className="w-full h-full rounded-full border-2 border-dashed border-sky-400/20" />
          </motion.div>

          {/* Main Logo Container */}
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(14,165,233,0.3)',
                '0 0 60px rgba(14,165,233,0.5)',
                '0 0 30px rgba(14,165,233,0.3)'
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-sky-400/60 bg-slate-900"
          >
            {/* Inner pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-sky-400/40"
            />
            
            {/* Logo Image */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full relative"
            >
              <Image 
                src="/images/publiczyntracare-logo.png" 
                alt="ZyntraCare" 
                fill 
                className="object-cover" 
                priority 
              />
            </motion.div>

            {/* Scan line effect */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"
            />
          </motion.div>

          {/* Center glow dot */}
          <motion.div
            animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute w-4 h-4 bg-sky-400 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.8)]"
          />

          {/* App Name with gradient animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-black text-white"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(56,189,248,0.3)',
                  '0 0 40px rgba(56,189,248,0.5)',
                  '0 0 20px rgba(56,189,248,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-teal-400">Care</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-slate-400 text-lg mt-3 flex items-center justify-center gap-3"
            >
              <motion.span 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
              />
              Your Health, Our Priority
            </motion.p>
          </motion.div>
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 280 }}
          transition={{ delay: 0.4 }}
          className="mt-16 relative z-10"
        >
          {/* Progress bar background */}
          <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-teal-500 rounded-full relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3"
              />
            </motion.div>
          </div>

          {/* Loading step text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex items-center justify-between"
          >
            <p className="text-slate-500 text-sm font-mono">
              {LOADING_STEPS[stepIndex]}
            </p>
            <p className="text-sky-400 text-sm font-bold">
              {Math.round(Math.min(progress, 100))}%
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-12 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-full"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2.5 h-2.5 bg-emerald-500 rounded-full"
          />
          <span className="text-slate-300 text-sm font-medium">Powered by Advanced AI</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
          />
        </motion.div>

        {/* Version */}
        <div className="absolute bottom-6 text-slate-600 text-xs font-medium">
          v1.0.0 • Made with ❤️ in India
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-sky-400/20 rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-sky-400/20 rounded-tr-xl" />
        <div className="absolute bottom-20 left-8 w-20 h-20 border-l-2 border-b-2 border-teal-400/20 rounded-bl-xl" />
        <div className="absolute bottom-20 right-8 w-20 h-20 border-r-2 border-b-2 border-teal-400/20 rounded-br-xl" />
      </motion.div>
    </AnimatePresence>
  );
}