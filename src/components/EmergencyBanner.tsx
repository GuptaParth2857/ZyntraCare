// src/components/EmergencyBanner.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiPhone, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { emergencyNumbers } from '@/data/mockData';

export default function EmergencyBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);

  const ambulanceNumbers = emergencyNumbers.filter(n => n.type === 'ambulance');

  useEffect(() => {
    setMounted(true);
    try {
      const dismissed = window.localStorage.getItem('hh_emergency_banner_dismissed');
      if (dismissed !== '1') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentNumber(prev => (prev + 1) % ambulanceNumbers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, ambulanceNumbers.length]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem('hh_emergency_banner_dismissed', '1');
    } catch {
      // ignore
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
          aria-live="polite"
          aria-label="Emergency contact information"
          className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white py-2 px-4"
          style={{ boxShadow: '0 2px 20px rgba(220,38,38,0.4)' }}
        >
          {/* Animated scan line */}
          <motion.div
            animate={{ x: ['-100%', '100vw'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10">
            <div className="flex items-center gap-2 shrink-0">
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <FiPhone size={15} />
              </motion.div>
              <span className="font-bold text-sm">🚨 Emergency:</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-red-200 text-sm hidden sm:inline">Ambulance:</span>
              <AnimatePresence mode="wait">
                <motion.a
                  key={currentNumber}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  href={`tel:${ambulanceNumbers[currentNumber]?.number}`}
                  aria-label={`Call ambulance: ${ambulanceNumbers[currentNumber]?.number}`}
                  className="bg-white text-red-700 px-4 py-0.5 rounded-full font-black text-base hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                >
                  {ambulanceNumbers[currentNumber]?.number}
                </motion.a>
              </AnimatePresence>
              <span className="text-xs text-red-200 hidden md:inline">
                {ambulanceNumbers[currentNumber]?.description}
              </span>
            </div>

            <span className="text-red-200/80 text-xs hidden lg:inline font-medium">
              · 112 for all emergencies · Available 24/7
            </span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss emergency banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white"
          >
            <FiX size={14} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}