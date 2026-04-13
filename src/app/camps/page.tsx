// src/app/camps/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiFilter, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { camps, states } from '@/data/mockData';
import { Camp } from '@/types';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function CampsPage() {
  const { t } = useLanguage();
  const [selectedState, setSelectedState] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const filteredCamps = useMemo(() => {
    return camps.filter(camp => {
      if (selectedState && camp.state !== selectedState) return false;
      if (selectedService && !camp.services.some(s => s.toLowerCase().includes(selectedService.toLowerCase()))) return false;
      return true;
    });
  }, [selectedState, selectedService]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-emerald-600/18 rounded-full blur-[170px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-teal-600/14 rounded-full blur-[125px]"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-20 pb-12"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <FiActivity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Health Camps</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('campsFree')} Discover free medical checkups and specialized health camps organized in your community.
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-wrap gap-6 items-center"
        >
          <div className="flex items-center gap-2 text-gray-300">
            <FiFilter className="text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-sm">{t('filters')}</span>
          </div>
          
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-white"
          >
            <option value="" className="bg-slate-900 text-white">{t('allStates')}</option>
            {states.filter(s => s !== 'All India').map(state => (
              <option key={state} value={state} className="bg-slate-900 text-white">{state}</option>
            ))}
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-white"
          >
            <option value="" className="bg-slate-900">{t('allSpecialties')}</option>
            <option value="cardiac" className="bg-slate-900">Cardiac</option>
            <option value="diabetes" className="bg-slate-900">Diabetes</option>
            <option value="women" className="bg-slate-900">Women Health</option>
            <option value="child" className="bg-slate-900">Child Health</option>
            <option value="senior" className="bg-slate-900">Senior Citizen</option>
          </select>
        </motion.div>
      </div>

      {/* Camps Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <p className="text-gray-400 mb-8 font-medium">Found <span className="text-emerald-400 font-bold">{filteredCamps.length}</span> upcoming events.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCamps.map((camp, idx) => (
              <CampCard key={camp.id} camp={camp} delay={idx * 0.1} />
            ))}
          </AnimatePresence>
        </div>

        {filteredCamps.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
            <FiActivity size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CampCard({ camp, delay }: { camp: Camp, delay: number }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition hover:border-emerald-500/50 group"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition" />
        <div className="flex justify-between items-start relative z-10">
          <h3 className="font-bold text-xl text-white mr-2">{camp.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            camp.registration === 'Free' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}
          >
            {camp.registration}
          </span>
        </div>
        <p className="text-gray-300 text-sm mt-2 font-medium relative z-10">{camp.hospital}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiCalendar className="text-emerald-400" />
            <span className="font-medium">{formatDate(camp.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiClock className="text-emerald-400" />
            <span className="font-medium">{camp.time}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
          <FiMapPin className="text-emerald-400 shrink-0" />
          <span className="truncate">{camp.location}, {camp.city}</span>
        </div>

        {/* Services */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Covered Services</p>
          <div className="flex flex-wrap gap-2">
            {camp.services.map(service => (
              <span key={service} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full transition group-hover:bg-white/10">
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Register Button */}
        <button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2">
          {t('registerNow')} &rarr;
        </button>
      </div>
    </motion.div>
  );
}
