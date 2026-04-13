'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiX, FiAlertTriangle, FiMapPin, FiCheck, FiHeart } from 'react-icons/fi';
import { FaAmbulance } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { hospitals } from '@/data/mockData';
import { usePathname } from 'next/navigation';

type Stage = 'hidden' | 'asking' | 'ai-talking' | 'connecting' | 'connected';

/**
 * EmergencyScrollMonitor — triggers after 60 continuous seconds of scrolling.
 * Resets if user stops scrolling for > 5 seconds.
 */
export default function EmergencyScrollMonitor() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [stage, setStage] = useState<Stage>('hidden');
  const [dismissed, setDismissed] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [userResponse, setUserResponse] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nearestHospital, setNearestHospital] = useState<any>(null);

  const scrollStartRef = useRef<number | null>(null);
  const lastScrollRef = useRef<number>(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredRef = useRef(false);
  const dismissedRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isEligibleRoute =
    pathname === '/hospitals' ||
    pathname === '/specialists' ||
    pathname === '/booking' ||
    pathname === '/dashboard';

  useEffect(() => { dismissedRef.current = dismissed; }, [dismissed]);

  useEffect(() => {
    // Persist dismiss across pages/sessions so popup doesn't feel random.
    try {
      const v = window.localStorage.getItem('hh_emergency_dismissed_v1');
      if (v === '1') {
        setDismissed(true);
        dismissedRef.current = true;
      }
    } catch {
      // ignore
    }
  }, []);

  const findNearestHospital = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setNearestHospital(hospitals[0]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        let minDist = Infinity;
        let closest = hospitals[0];
        hospitals.forEach(h => {
          const d = Math.hypot(h.location.lat - latitude, h.location.lng - longitude);
          if (d < minDist) { minDist = d; closest = h; }
        });
        setNearestHospital(closest);
      },
      () => setNearestHospital(hospitals[0])
    );
  }, []);

  useEffect(() => {
    if (!isEligibleRoute) return;
    if (dismissed || hasTriggeredRef.current) return;

    // Avoid accidental emergency popups: require longer continuous activity.
    const SCROLL_THRESHOLD_MS = 180_000; // 3 minutes of active scrolling
    const PAUSE_RESET_MS = 5_000;       // reset if idle > 5s

    const handleScroll = () => {
      if (dismissedRef.current || hasTriggeredRef.current) return;

      const now = Date.now();
      lastScrollRef.current = now;

      if (scrollStartRef.current === null) scrollStartRef.current = now;

      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        scrollStartRef.current = null;
      }, PAUSE_RESET_MS);

      const elapsed = now - (scrollStartRef.current ?? now);
      if (elapsed >= SCROLL_THRESHOLD_MS) {
        hasTriggeredRef.current = true;
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        setStage('asking');
        findNearestHospital();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [dismissed, findNearestHospital, isEligibleRoute]);

  const handleYesEmergency = useCallback(() => {
    setStage('ai-talking');
    setAiMessages([]);
    const msgs = [
      'I understand you need help. Let me assist you right away. 🚨',
      'Can you briefly describe your situation? (Type below or just wait)',
      'I\'m locating the nearest hospital with available beds…',
    ];
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    msgs.forEach((msg, i) => {
      timeoutsRef.current.push(setTimeout(() => setAiMessages(prev => [...prev, msg]), (i + 1) * 1600));
    });
    timeoutsRef.current.push(setTimeout(() => setStage('connecting'), 5500));
    timeoutsRef.current.push(setTimeout(() => setStage('connected'), 8000));
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dismissedRef.current = true;
    try { window.localStorage.setItem('hh_emergency_dismissed_v1', '1'); } catch { /* ignore */ }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setStage('hidden');
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  if (stage === 'hidden') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Emergency assistance dialog"
        aria-live="assertive"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(239, 68, 68, 0.3), 0 30px 80px rgba(0,0,0,0.5)' }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-slate-950 z-0" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 to-slate-950 z-0" aria-hidden="true" />

          {/* Animated border */}
          <div
            className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
            style={{
              background: stage === 'connected'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 60%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0) 60%)',
              opacity: 0.8,
            }}
            aria-hidden="true"
          />

          {/* Scanline */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div
              className={`p-5 flex items-center justify-between border-b border-white/10 ${
                stage === 'connected'
                  ? 'bg-emerald-950/50'
                  : 'bg-red-950/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stage === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                  aria-hidden="true"
                >
                  {stage === 'connected' ? <FiCheck size={20} /> : <FiAlertTriangle size={20} />}
                </motion.div>
                <div>
                  <h2 className="font-black text-white text-base">{t('emergencyCallTitle')}</h2>
                  <p className="text-xs text-gray-400">
                    {stage === 'connected' ? '✅ Hospital Found!' : stage === 'ai-talking' ? t('aiSpeaking') : '🤖 ZyntraCare AI'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                aria-label="Dismiss emergency dialog"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* ASKING */}
              {stage === 'asking' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="w-20 h-20 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    aria-hidden="true"
                  >
                    <FaAmbulance className="text-red-400" size={36} />
                  </motion.div>
                  <h3 className="text-white font-black text-xl mb-2">{t('emergencyCallDesc')}</h3>
                  <p className="text-gray-400 text-sm mb-6">You've been browsing for a while. Do you need emergency assistance?</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleYesEmergency}
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3.5 rounded-2xl font-black text-base transition shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      aria-label="Yes, I need emergency help"
                    >
                      🚨 {t('yesEmergency')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDismiss}
                      className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3.5 rounded-2xl font-bold text-base hover:bg-white/10 transition"
                      aria-label="No, I don't need emergency help"
                    >
                      {t('noEmergency')}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* AI TALKING */}
              {stage === 'ai-talking' && (
                <div className="space-y-3">
                  {aiMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1" aria-hidden="true">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3">
                        <p className="text-gray-200 text-sm">{msg}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <label htmlFor="emergency-input" className="sr-only">Describe your emergency (optional)</label>
                    <input
                      id="emergency-input"
                      type="text"
                      value={userResponse}
                      onChange={e => setUserResponse(e.target.value)}
                      placeholder="Describe your emergency (optional)…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition text-sm"
                    />
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                    className="h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full mt-3"
                    aria-hidden="true"
                  />
                  <p className="text-gray-600 text-xs text-center">Connecting to emergency services…</p>
                </div>
              )}

              {/* CONNECTING */}
              {stage === 'connecting' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <div className="relative mx-auto mb-5 w-16 h-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full"
                      aria-label="Connecting…"
                    />
                    <FiHeart className="absolute inset-0 m-auto text-red-400" size={22} aria-hidden="true" />
                  </div>
                  <p className="text-lg font-black text-white">{t('connectingHospital')}</p>
                  <p className="text-gray-500 text-sm mt-2">Finding nearest hospital with available beds…</p>
                </motion.div>
              )}

              {/* CONNECTED */}
              {stage === 'connected' && nearestHospital && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="text-emerald-400" size={18} aria-hidden="true" />
                      <span className="font-black text-emerald-400 text-sm">Nearest Hospital Found!</span>
                    </div>
                    <h3 className="font-black text-xl text-white">{nearestHospital.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <FiMapPin size={13} aria-hidden="true" />
                      {nearestHospital.address}, {nearestHospital.city}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">Beds Free</p>
                        <p className="font-black text-emerald-400 text-lg">{nearestHospital.beds.available}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">ICU Free</p>
                        <p className="font-black text-blue-400 text-lg">{nearestHospital.beds.icuAvailable}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="font-black text-amber-400 text-lg">⭐ {nearestHospital.rating}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      href={`tel:${nearestHospital.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-2xl font-black hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition"
                      aria-label={`Call ${nearestHospital.name}`}
                    >
                      <FiPhone aria-hidden="true" /> Call Hospital
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      href="tel:102"
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-2xl font-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition"
                      aria-label="Call ambulance 102"
                    >
                      <FaAmbulance aria-hidden="true" /> Ambulance
                    </motion.a>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-full mt-3 text-gray-600 hover:text-gray-400 py-2 transition text-sm"
                    aria-label="Close emergency dialog"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
