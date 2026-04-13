// src/app/emergency/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { FiPhone, FiMapPin, FiAlertCircle, FiShield, FiActivity, FiInfo, FiChevronRight } from 'react-icons/fi';
import { FaAmbulance, FaFire, FaHeartbeat } from 'react-icons/fa';
import { MdLocalHospital } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { emergencyNumbers, states } from '@/data/mockData';
import { useLanguage } from '@/context/LanguageContext';

const typeIcons: Record<string, React.ReactNode> = {
  ambulance: <FaAmbulance />,
  police: <FiShield />,
  fire: <FaFire />,
  disaster: <FiAlertCircle />,
  medical: <FiActivity />,
};

const typeColors: Record<string, { bg: string; glow: string; text: string; border: string }> = {
  ambulance: { bg: 'bg-red-500/15', glow: 'shadow-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  police:    { bg: 'bg-blue-500/15', glow: 'shadow-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  fire:      { bg: 'bg-orange-500/15', glow: 'shadow-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  disaster:  { bg: 'bg-purple-500/15', glow: 'shadow-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  medical:   { bg: 'bg-emerald-500/15', glow: 'shadow-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const QUICK_DIALS = [
  { number: '112', label: 'National Emergency', icon: <FiAlertCircle size={36} />, color: 'from-red-600 to-rose-700', shadow: 'shadow-red-500/30', desc: 'Single emergency number' },
  { number: '102', label: 'Ambulance', icon: <FaAmbulance size={32} />, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/30', desc: 'Medical emergency' },
  { number: '100', label: 'Police', icon: <FiShield size={32} />, color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/30', desc: 'Law & order' },
  { number: '101', label: 'Fire Brigade', icon: <FaFire size={32} />, color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/30', desc: 'Fire rescue' },
  { number: '108', label: 'Emergency Ambulance', icon: <MdLocalHospital size={32} />, color: 'from-teal-600 to-emerald-700', shadow: 'shadow-teal-500/30', desc: 'Govt ambulance' },
  { number: '1098', label: "Child Helpline", icon: <FaHeartbeat size={32} />, color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/30', desc: 'Child in distress' },
];

const FIRST_AID_TIPS = [
  { icon: '🫀', title: 'Cardiac Arrest', steps: ['Call 112 immediately', 'Start CPR (30 compressions + 2 breaths)', 'Use AED if available', 'Continue until ambulance arrives'] },
  { icon: '🩸', title: 'Severe Bleeding', steps: ['Apply firm direct pressure', 'Use clean cloth or bandage', 'Elevate the wound above heart', 'Call 102 if uncontrolled'] },
  { icon: '🌡️', title: 'High Fever (>104°F)', steps: ['Remove excess clothing', 'Apply cool wet towels', 'Give paracetamol if conscious', 'Seek medical help immediately'] },
  { icon: '🧠', title: 'Stroke (F.A.S.T.)', steps: ['Face drooping? Arm weak?', 'Speech difficulty?', 'Time to call 112 NOW', 'Do not give food/water'] },
];

export default function EmergencyPage() {
  const { t } = useLanguage();
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeTip, setActiveTip] = useState<number | null>(null);

  const filteredNumbers = useMemo(() => {
    return emergencyNumbers.filter(num => {
      if (selectedState && num.state !== selectedState && num.state !== 'All India') return false;
      if (selectedType && num.type !== selectedType) return false;
      return true;
    });
  }, [selectedState, selectedType]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Pulsing ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-red-600/25 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-red-800/20 rounded-full blur-[120px]"
        />
        {/* Scan line effect */}
        <motion.div
          animate={{ y: ['-100%', '200vh'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 pt-24 pb-10"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Animated icon */}
          <div className="relative inline-flex mb-6">
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 bg-red-500/40 rounded-full"
              aria-hidden="true"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              className="absolute inset-0 bg-red-500/30 rounded-full"
              aria-hidden="true"
            />
            <div className="relative p-5 bg-red-500/15 border border-red-500/40 rounded-full backdrop-blur-sm">
              <FiAlertCircle size={38} className="text-red-400" aria-hidden="true" />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-none"
          >
            Emergency{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-orange-400">
              Response
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-red-200/60 max-w-xl mx-auto mb-4"
          >
            Instant access to India&apos;s nationwide emergency numbers and responders.
            <strong className="text-red-300"> In life-threatening situations, always call 112 first.</strong>
          </motion.p>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
            All numbers are active and verified — Updated April 2026
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Dial Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-bold uppercase tracking-widest text-red-400/70 mb-4 text-center"
        >
          Tap to Call — Quick Dial
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="list">
          {QUICK_DIALS.map((item, idx) => (
            <motion.a
              key={item.number}
              href={`tel:${item.number}`}
              role="listitem"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ scale: 1.06, y: -6 }}
              whileTap={{ scale: 0.94 }}
              aria-label={`Call ${item.label}: ${item.number}`}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl text-white bg-gradient-to-br ${item.color} shadow-2xl ${item.shadow} border border-white/20 overflow-hidden group`}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
                className="absolute inset-0 rounded-3xl border-2 border-white/30"
                aria-hidden="true"
              />
              <div className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{item.icon}</div>
              <div className="relative z-10 text-center">
                <span className="block text-3xl font-black drop-shadow-md">{item.number}</span>
                <span className="block text-xs font-bold uppercase tracking-wide text-white/80 mt-1">{item.label}</span>
                <span className="block text-[10px] text-white/50 mt-0.5">{item.desc}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* First Aid Tips */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <FaHeartbeat className="text-red-400" aria-hidden="true" />
            First Aid Quick Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FIRST_AID_TIPS.map((tip, idx) => (
              <motion.button
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                onClick={() => setActiveTip(activeTip === idx ? null : idx)}
                aria-expanded={activeTip === idx}
                aria-controls={`tip-${idx}`}
                className="text-left bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-red-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.1)] group"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{tip.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                  {tip.title}
                  <FiChevronRight
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${activeTip === idx ? 'rotate-90 text-red-400' : ''}`}
                    aria-hidden="true"
                  />
                </h3>
                <AnimatePresence>
                  {activeTip === idx && (
                    <motion.ol
                      id={`tip-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-2 space-y-1.5 list-decimal list-inside"
                    >
                      {tip.steps.map((step, i) => (
                        <li key={i} className="text-gray-400 text-xs leading-relaxed">{step}</li>
                      ))}
                    </motion.ol>
                  )}
                </AnimatePresence>
                {activeTip !== idx && (
                  <p className="text-gray-600 text-xs">Click to expand</p>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-wrap gap-4 items-center"
        >
          <div className="flex items-center gap-2 text-red-400">
            <FiMapPin size={15} aria-hidden="true" />
            <span className="font-bold uppercase tracking-wider text-xs">{t('filters')}:</span>
          </div>

          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            aria-label="Filter by state"
            className="flex-1 min-w-[180px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">{t('allStates')}</option>
            {states.filter(s => s !== 'All India').map(state => (
              <option key={state} value={state} className="bg-slate-900">{state}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            aria-label="Filter by emergency type"
            className="flex-1 min-w-[180px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">All Emergency Types</option>
            <option value="ambulance" className="bg-slate-900">{t('ambulance')}</option>
            <option value="police" className="bg-slate-900">{t('police')}</option>
            <option value="fire" className="bg-slate-900">{t('fire')}</option>
            <option value="disaster" className="bg-slate-900">Disaster Response</option>
            <option value="medical" className="bg-slate-900">Medical Helpline</option>
          </select>

          {(selectedState || selectedType) && (
            <button
              onClick={() => { setSelectedState(''); setSelectedType(''); }}
              className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 border border-red-500/20 px-3 py-2 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </motion.div>
      </div>

      {/* Emergency Numbers List */}
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
          All Emergency Numbers — {filteredNumbers.length} found
        </h2>
        <div className="space-y-3" role="list">
          <AnimatePresence>
            {filteredNumbers.map((num, idx) => {
              const colors = typeColors[num.type] ?? typeColors.medical;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  key={num.id}
                  role="listitem"
                  className={`bg-slate-900/60 backdrop-blur-xl border ${colors.border} rounded-2xl shadow-xl hover:shadow-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-5 hover:bg-slate-800/60 transition-all duration-300 group`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg text-xl shrink-0 transition-transform group-hover:scale-110 ${colors.bg} ${colors.border} ${colors.text}`}>
                    {typeIcons[num.type]}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-white text-base">{num.state}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{num.description}</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {num.type}
                    </span>
                  </div>

                  <motion.a
                    href={`tel:${num.number}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label={`Call ${num.description}: ${num.number}`}
                    className="flex items-center justify-center gap-3 bg-red-600/20 hover:bg-red-600 text-red-100 hover:text-white px-8 py-4 rounded-xl font-black text-2xl border border-red-500/30 hover:border-red-500 transition-all duration-200 shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] w-full md:w-auto"
                  >
                    <FiPhone className="animate-pulse" aria-hidden="true" />
                    {num.number}
                  </motion.a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredNumbers.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
            <FiAlertCircle size={48} className="mx-auto text-gray-600 mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
          </motion.div>
        )}
      </div>

      {/* Important Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-5xl mx-auto px-4 mt-10"
      >
        <div className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
          <h3 className="font-black text-amber-400 mb-2 flex items-center gap-2">
            <FiInfo aria-hidden="true" /> Important Notice
          </h3>
          <p className="text-amber-200/70 text-sm leading-relaxed">
            These are general emergency numbers for India. For specific hospital emergencies,
            contact the hospital directly via the <strong>Hospitals page</strong>. In a severe medical emergency,
            always call <strong className="text-amber-400">112 or 102 (Ambulance)</strong> immediately!
            Do not drive someone having a heart attack or stroke — call an ambulance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}