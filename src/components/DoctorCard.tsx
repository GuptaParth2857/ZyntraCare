// src/components/DoctorCard.tsx
'use client';

import { Doctor } from '@/types';
import { FiMapPin, FiStar, FiClock, FiPhone, FiVideo, FiMessageCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: (doctor: Doctor) => void;
  variant?: 'light' | 'dark';
}

const specialtyColorsDark: Record<string, string> = {
  Cardiology: 'from-red-500/20 to-rose-600/20 border-red-500/30 text-red-300',
  Oncology: 'from-purple-500/20 to-violet-600/20 border-purple-500/30 text-purple-300',
  Neurology: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30 text-blue-300',
  Orthopedics: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-300',
  Pediatrics: 'from-pink-500/20 to-rose-400/20 border-pink-500/30 text-pink-300',
  Nephrology: 'from-teal-500/20 to-cyan-600/20 border-teal-500/30 text-teal-300',
  Dermatology: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-300',
  default: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-300',
};

const specialtyColorsLight: Record<string, string> = {
  Cardiology: 'bg-red-50 border-red-100 text-red-600',
  Oncology: 'bg-purple-50 border-purple-100 text-purple-700',
  Neurology: 'bg-blue-50 border-blue-100 text-blue-700',
  Orthopedics: 'bg-amber-50 border-amber-100 text-amber-700',
  Pediatrics: 'bg-pink-50 border-pink-100 text-pink-600',
  Nephrology: 'bg-teal-50 border-teal-100 text-teal-700',
  Dermatology: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  default: 'bg-slate-100 border-slate-200 text-slate-700',
};

export default function DoctorCard({ doctor, onBook, variant = 'dark' }: DoctorCardProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [booking, setBooking] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = variant === 'light';
  const specColor = isLight 
      ? (specialtyColorsLight[doctor.specialty] ?? specialtyColorsLight.default)
      : (specialtyColorsDark[doctor.specialty] ?? specialtyColorsDark.default);

  const handleBook = () => {
    setBooking(true);
    setTimeout(() => setBooking(false), 1500);
    onBook?.(doctor);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isLight
           ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]'
           : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]'
      }`}
    >
      {/* Glass shimmer effect - CSS powered */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div
          className="absolute top-0 left-0 w-full h-full specialty-shimmer"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          }}
        />
      </div>
      {/* Gradient accent top line */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${isLight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`} />

      <div className="p-5">
        {/* Top section */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {!imgError ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={`relative w-20 h-20 rounded-[1rem] overflow-hidden border-2 ${isLight ? 'border-slate-100 shadow-sm' : 'border-white/10'}`}
              >
                <Image
                  src={doctor.image}
                  alt={`Dr. ${doctor.name}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              </motion.div>
            ) : (
              <div className={`w-20 h-20 rounded-[1rem] border-2 flex items-center justify-center text-3xl font-black ${
                 isLight ? 'bg-blue-50 border-blue-100 text-blue-300' : 'bg-gradient-to-br from-blue-900/60 to-slate-900 border-white/10 text-blue-400/60'
              }`}>
                {doctor.name.charAt(3).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] ${isLight ? 'border-white' : 'border-slate-900'} ${
                doctor.available ? 'bg-emerald-500' : 'bg-slate-400'
              } shadow-sm`}
              title={doctor.available ? "Online" : "Offline"}
              aria-hidden="true"
            />
          </div>

          {/* Name & Specialty */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className={`font-black text-lg leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{doctor.name}</h3>
            <p className={`font-bold text-xs mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-blue-400'}`}>{doctor.qualification}</p>
            <div
              className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider ${
                 isLight ? `border ${specColor}` : `border bg-gradient-to-r ${specColor}`
              }`}
            >
              {doctor.specialty}
            </div>

            {/* Stars + Experience */}
            <div className={`flex items-center gap-2 mt-2.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              <div className="flex items-center gap-1 bg-amber-50 px-1.5 rounded-md" aria-label={`Rating: ${doctor.rating} out of 5`}>
                <FiStar size={11} className={`text-amber-500 fill-amber-500`} aria-hidden="true" />
                <span className={`font-black text-[11px] ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{doctor.rating}</span>
              </div>
              <span className="text-xs font-semibold">|</span>
              <span className="text-[11px] font-bold">{doctor.experience} yrs exp.</span>
            </div>
          </div>
        </div>

        {/* Hospital Info */}
        <div className={`mt-4 p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <p className={`text-[13px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{doctor.hospitalName}</p>
          <p className={`text-[11px] flex items-center gap-1.5 mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            <FiMapPin size={11} className={isLight ? 'text-blue-500' : ''} aria-hidden="true" />
            {doctor.hospitalName}
          </p>
        </div>

        {/* Availability & Price */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2">
          <div>
            <div className={`flex items-center gap-1.5 text-[13px] font-black tracking-tight ${doctor.available ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-slate-500' : 'text-gray-500')}`}>
              {doctor.available ? <FiCheckCircle size={14} aria-hidden="true" /> : <FiXCircle size={14} aria-hidden="true" />}
              {doctor.available ? 'Available Today' : 'Not Available'}
            </div>
            <p className={`text-[11px] flex items-center gap-1 mt-1 font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              <FiClock size={11} className={isLight ? 'text-blue-500' : ''} aria-hidden="true" />
              {doctor.nextAvailable}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xl font-black ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>₹{doctor.consultationFee.toLocaleString()}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>per consult</p>
          </div>
        </div>

        {/* Languages */}
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Languages spoken">
          {doctor.languages.map(lang => (
            <span
              key={lang}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                 isLight ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
              }`}
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2">
          {mounted ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBook}
              disabled={!doctor.available || booking}
              aria-label={`Book appointment with ${doctor.name}`}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                !doctor.available
                  ? (isLight ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5')
                  : booking
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                  : (isLight 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]')
              }`}
            >
              {booking ? '✓ Confirmed!' : doctor.available ? 'Book Appointment' : 'Unavailable'}
            </motion.button>
          ) : (
            <button
              onClick={handleBook}
              disabled={!doctor.available || booking}
              aria-label={`Book appointment with ${doctor.name}`}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                !doctor.available
                  ? (isLight ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5')
                  : booking
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                  : (isLight 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]')
              }`}
            >
              {booking ? '✓ Confirmed!' : doctor.available ? 'Book Appointment' : 'Unavailable'}
            </button>
          )}

          {mounted ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Message ${doctor.name}`}
              className={`px-3 py-3 rounded-xl border transition flex items-center justify-center font-bold ${
                 isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' : 'bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-gray-400 hover:text-blue-400'
              }`}
            >
              <FiMessageCircle size={18} aria-hidden="true" />
            </motion.button>
          ) : (
            <button
              aria-label={`Message ${doctor.name}`}
              className={`px-3 py-3 rounded-xl border transition flex items-center justify-center font-bold ${
                 isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' : 'bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-gray-400 hover:text-blue-400'
              }`}
            >
              <FiMessageCircle size={18} aria-hidden="true" />
            </button>
          )}
          
        </div>
      </div>
    </motion.div>
  );
}