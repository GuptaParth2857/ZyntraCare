// src/components/HospitalCard.tsx
'use client';

import { Hospital } from '@/types';
import { FiMapPin, FiPhone, FiClock, FiStar, FiHeart, FiShield, FiActivity, FiTrendingUp, FiUsers } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Animated counter component
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

interface HospitalCardProps {
  hospital: Hospital;
  variant?: 'light' | 'dark';
}

export default function HospitalCard({ hospital, variant = 'dark' }: HospitalCardProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const occupancyPercentage = Math.round((hospital.beds.occupied / hospital.beds.total) * 100);
  const isLight = variant === 'light';

  const occupancyColor =
    occupancyPercentage > 80
      ? 'from-red-500 to-rose-600'
      : occupancyPercentage > 50
      ? 'from-amber-500 to-orange-500'
      : 'from-emerald-500 to-teal-500';

  const occupancyTextColor =
    occupancyPercentage > 80 ? (isLight ? 'text-red-600' : 'text-red-400') : occupancyPercentage > 50 ? (isLight ? 'text-amber-600' : 'text-amber-400') : (isLight ? 'text-emerald-600' : 'text-emerald-400');

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
        isLight 
          ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]' 
          : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-teal-500/40 hover:shadow-[0_0_50px_rgba(20,184,166,0.2)]'
      }`}
    >
      {/* Glass shimmer effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      </div>
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {!imgError ? (
          <Image
            src={hospital.image}
            alt={`${hospital.name} hospital`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-900/60 to-slate-900 flex items-center justify-center">
            <FiActivity size={48} className="text-teal-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Emergency Badge */}
        {hospital.emergency && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-red-400/30 shadow-md"
            aria-label="24/7 Emergency services available"
          >
            <FiShield size={11} aria-hidden="true" />
            24/7 Emergency
          </motion.div>
        )}

        {/* Hospital Name overlay (always white text on image) */}
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-base leading-tight drop-shadow-md">{hospital.name}</h3>
          <p className="text-xs flex items-center gap-1 text-white/90 mt-0.5 drop-shadow-md">
            <FiMapPin size={11} aria-hidden="true" />
            {hospital.city}, {hospital.state}
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved(s => !s); }}
          aria-label={saved ? 'Remove from saved' : 'Save hospital'}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition ${
            isLight ? 'bg-white/90 hover:bg-white text-slate-400' : 'bg-slate-900/60 hover:bg-slate-800 text-white/60'
          } backdrop-blur-sm border ${isLight ? 'border-white/50' : 'border-white/10'}`}
        >
          <FiHeart size={14} className={saved ? 'text-red-500 fill-red-500' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Bed availability stats with animations */}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Bed availability stats">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/10 border-emerald-500/20'} border rounded-xl p-2.5 text-center relative overflow-hidden`}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.p 
              className={`text-xl font-black ${isLight ? 'text-emerald-600' : 'text-emerald-400'} relative z-10`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <AnimatedNumber value={hospital.beds.available} />
            </motion.p>
            <p className={`text-[10px] ${isLight ? 'text-emerald-700/70' : 'text-emerald-300/70'} font-bold uppercase tracking-wide relative z-10`}>Beds Free</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`${isLight ? 'bg-sky-50 border-sky-100' : 'bg-sky-500/10 border-sky-500/20'} border rounded-xl p-2.5 text-center relative overflow-hidden`}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.2 }}
            />
            <motion.p 
              className={`text-xl font-black ${isLight ? 'text-sky-600' : 'text-sky-400'} relative z-10`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <AnimatedNumber value={hospital.beds.icuAvailable} />
            </motion.p>
            <p className={`text-[10px] ${isLight ? 'text-sky-700/70' : 'text-sky-300/70'} font-bold uppercase tracking-wide relative z-10`}>ICU Free</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`${isLight ? 'bg-violet-50 border-violet-100' : 'bg-violet-500/10 border-violet-500/20'} border rounded-xl p-2.5 text-center relative overflow-hidden`}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.4 }}
            />
            <motion.p 
              className={`text-xl font-black ${isLight ? 'text-violet-600' : 'text-violet-400'} relative z-10`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <AnimatedNumber value={hospital.doctors} />
            </motion.p>
            <p className={`text-[10px] ${isLight ? 'text-violet-700/70' : 'text-violet-300/70'} font-bold uppercase tracking-wide relative z-10`}>Doctors</p>
          </motion.div>
        </div>

        {/* Occupancy bar */}
        <div aria-label={`Bed occupancy: ${occupancyPercentage}%`}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={`${isLight ? 'text-slate-500' : 'text-gray-400'} flex items-center gap-1 font-medium`}>
              <FiTrendingUp size={11} aria-hidden="true" /> Bed Occupancy
            </span>
            <span className={`font-bold ${occupancyTextColor}`}>{occupancyPercentage}%</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${occupancyPercentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              className={`h-full rounded-full bg-gradient-to-r ${occupancyColor}`}
              role="progressbar"
              aria-valuenow={occupancyPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-sm">
          <p className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            <FiPhone size={13} className={`${isLight ? 'text-blue-500' : 'text-teal-400'} shrink-0`} aria-hidden="true" />
            <span className="truncate font-medium">{hospital.phone}</span>
          </p>
          <p className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            <FiClock size={13} className={`${isLight ? 'text-blue-500' : 'text-teal-400'} shrink-0`} aria-hidden="true" />
            <span className="font-medium">{hospital.workingHours}</span>
          </p>
          <p className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            <FiStar size={13} className="text-amber-400 shrink-0" aria-hidden="true" />
            <span className={`font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{hospital.rating}</span>
            <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>/ 5.0</span>
          </p>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5" aria-label="Specialties">
          {hospital.specialties.slice(0, 3).map(specialty => (
            <span
              key={specialty}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isLight 
                  ? 'bg-blue-50 text-blue-600 border-blue-100' 
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
              }`}
            >
              {specialty}
            </span>
          ))}
          {hospital.specialties.length > 3 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLight ? 'text-slate-500 bg-slate-50' : 'text-gray-500 bg-white/5'}`}>
              +{hospital.specialties.length - 3} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-transparent">
          <Link
            href={`/hospitals/${hospital.id}`}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              isLight 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]'
            }`}
            aria-label={`View details for ${hospital.name}`}
          >
            View Details
          </Link>
          {mounted ? (
            <motion.a
              href={`tel:${hospital.phone}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Call ${hospital.name}`}
              className={`px-3 py-2.5 rounded-xl transition text-sm flex items-center justify-center border font-bold ${
                isLight 
                  ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100' 
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
              }`}
            >
              <FiPhone size={16} aria-hidden="true" />
            </motion.a>
          ) : (
            <a
              href={`tel:${hospital.phone}`}
              aria-label={`Call ${hospital.name}`}
              className={`px-3 py-2.5 rounded-xl transition text-sm flex items-center justify-center border font-bold ${
                isLight 
                  ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100' 
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
              }`}
            >
              <FiPhone size={16} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}