// src/app/hospitals/page.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { FiFilter, FiMapPin, FiGrid, FiSearch, FiActivity, FiTrendingUp, FiHeart, FiClock } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import HospitalCard from '@/components/HospitalCard';
import HospitalMap from '@/components/HospitalMap';
import { Hospital } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const CACHE_KEY = 'zyntracare_hospitals_cache';
const CACHE_TIMESTAMP_KEY = 'zyntracare_hospitals_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedHospitalData {
  hospitals: Hospital[];
  location: { lat: number; lng: number };
  timestamp: number;
}

function getCachedHospitals(): CachedHospitalData | null {
  if (typeof window === 'undefined') return null;
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    if (Date.now() - parseInt(timestamp) > CACHE_DURATION) return null;
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setCachedHospitals(hospitals: Hospital[], location: { lat: number; lng: number }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ hospitals, location, timestamp: Date.now() }));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {}
}

const SPECIALTIES_LIST = ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Nephrology', 'Transplant', 'Ophthalmology'];
const INDIAN_STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Bihar', 'Jharkhand'];

export default function HospitalsPage() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedState, setSelectedState] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [dataLastUpdated, setDataLastUpdated] = useState<number | null>(null);
  const [searchRadius, setSearchRadius] = useState(5);

  useEffect(() => {

    const fetchHospitals = async () => {
      const cached = getCachedHospitals();
      if (cached) {
        setHospitals(cached.hospitals);
        setUserLocation(cached.location);
        setDataLastUpdated(cached.timestamp);
        setLoading(false);
      }

      const getUserLocation = () => {
        return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
          );
        });
      };

      try {
        const location = await getUserLocation();
        setUserLocation(location);

        if (!cached || cached.location.lat !== location.lat || cached.location.lng !== location.lng) {
          setLoading(true);
        }

        const res = await fetch(`/api/hospitals/nearby?lat=${location.lat}&lng=${location.lng}&radius=${searchRadius * 1000}`);
        const data = await res.json();
        if (data.hospitals && data.hospitals.length > 0) {
          setHospitals(data.hospitals);
          setCachedHospitals(data.hospitals, location);
          setDataLastUpdated(Date.now());
        }
      } catch (err: any) {
        console.log('Using default location, error:', err.message);
        setLocationError('Using default location');

        if (!cached) {
          const res = await fetch(`/api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=${searchRadius * 1000}`);
          const data = await res.json();
          if (data.hospitals && data.hospitals.length > 0) {
            setHospitals(data.hospitals);
            setCachedHospitals(data.hospitals, { lat: 28.6139, lng: 77.2090 });
            setDataLastUpdated(Date.now());
          }
        }
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(fetchHospitals, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchRadius]);

  const platformStats = useMemo(() => {
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.beds?.available || 0), 0);
    const avgRating = hospitals.length > 0 
      ? (hospitals.reduce((sum, h) => sum + (h.rating || 4), 0) / hospitals.length).toFixed(1) 
      : '4.0';
    return [
      { label: 'Partner Hospitals', value: hospitals.length.toString(), icon: MdLocalHospital, color: 'text-teal-400' },
      { label: 'Cities Covered', value: `${new Set(hospitals.map(h => h.city).filter(Boolean)).size}+`, icon: FiMapPin, color: 'text-blue-400' },
      { label: 'Beds Available', value: totalBeds.toLocaleString(), icon: FiActivity, color: 'text-emerald-400' },
      { label: 'Avg Rating', value: `${avgRating}★`, icon: FiHeart, color: 'text-amber-400' },
    ];
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    let result = hospitals.filter(hospital => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!hospital.name?.toLowerCase().includes(q) && !hospital.city?.toLowerCase().includes(q)) return false;
      }
      if (selectedState && hospital.state !== selectedState) return false;
      if (selectedSpecialty && !hospital.specialties?.includes(selectedSpecialty)) return false;
      if (showEmergencyOnly && !hospital.emergency) return false;
      return true;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'beds') result.sort((a, b) => (b.beds?.available || 0) - (a.beds?.available || 0));
    else if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }, [hospitals, searchQuery, selectedState, selectedSpecialty, showEmergencyOnly, sortBy]);

  const handleHospitalSelect = (hospital: Hospital) => {
    console.log('Selected hospital:', hospital);
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedSpecialty('');
    setShowEmergencyOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedState || selectedSpecialty || showEmergencyOnly || searchQuery;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.6, ease: 'easeOut' as const, staggerChildren: 0.05 }
    },
    exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center p-5 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6 relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0"
          />
          <MdLocalHospital size={36} className="text-teal-400 relative z-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-none"
        >
          Find{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
            Premium Hospitals
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Real-time bed availability, ICU tracking, and instant contact for India&apos;s top hospitals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8"
        >
          {platformStats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center relative overflow-hidden group"
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <stat.icon size={18} className={`mx-auto mb-1 ${stat.color} relative z-10`} />
              <motion.p className={`text-xl font-black ${stat.color} relative z-10`}>
                {stat.value}
              </motion.p>
              <p className="text-gray-500 text-[11px] mt-0.5 relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto relative"
        >
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name or city…"
            className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition text-base"
          />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
              selectedSpecialty === '' ? 'bg-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >All</button>
          {SPECIALTIES_LIST.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(prev => prev === spec ? '' : spec)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
                selectedSpecialty === spec ? 'bg-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >{spec}</button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-wrap gap-3 items-center"
        >
          <div className="flex items-center gap-2 text-teal-400">
            <FiFilter size={15} />
            <span className="font-bold uppercase tracking-wider text-xs">{t('filters')}:</span>
          </div>

          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">{t('allStates')}</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state} className="bg-slate-900">{state}</option>
            ))}
          </select>

          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">{t('allSpecialties')}</option>
            {SPECIALTIES_LIST.map(s => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="rating" className="bg-slate-900">Highest Rated</option>
            <option value="beds" className="bg-slate-900">Most Beds Available</option>
            <option value="name" className="bg-slate-900">A–Z by Name</option>
          </select>

          <select
            value={searchRadius}
            onChange={e => {
              const val = parseInt(e.target.value);
              if (val > 6) {
                if (window.confirm('Searching beyond 6km requires ZyntraCare Premium. View plans?')) {
                  window.location.href = '/subscription';
                }
                return;
              }
              setSearchRadius(val);
            }}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-white text-sm"
          >
            <option value="1" className="bg-slate-900">Radius: 1 km</option>
            <option value="2" className="bg-slate-900">Radius: 2 km</option>
            <option value="5" className="bg-slate-900">Radius: 5 km (Default)</option>
            <option value="6" className="bg-slate-900">Radius: 6 km</option>
            <option value="10" className="bg-slate-900">Radius: 10 km 👑</option>
            <option value="25" className="bg-slate-900">Radius: 25 km 👑</option>
            <option value="50" className="bg-slate-900">Radius: 50 km 👑</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={showEmergencyOnly}
              onChange={e => setShowEmergencyOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-white/20 accent-teal-500"
            />
            <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{t('emergencyOnly')}</span>
          </label>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearFilters}
                className="px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 font-medium rounded-xl transition border border-red-500/20 text-sm"
              >
                {t('clearFilters')}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="ml-auto flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <FiMapPin size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm font-medium">
            Showing <span className="text-teal-400 font-bold text-base">{filteredHospitals.length}</span> hospitals
          </p>
          {hasActiveFilters && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-teal-400/70 text-xs">
              <FiTrendingUp size={12} /> Filtered results
            </motion.div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">
              {userLocation 
                ? `Loading hospitals near you...` 
                : locationError 
                  ? 'Getting your location...'
                  : 'Loading hospitals...'}
            </p>
            {dataLastUpdated && (
              <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                <FiClock size={12} />
                Last updated: {new Date(dataLastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          filteredHospitals.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
              <FiSearch size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg font-medium">{t('noResults')}</p>
              <button onClick={clearFilters} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl transition font-semibold border border-teal-400/30 mt-4">
                {t('clearFilters')}
              </button>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredHospitals.map((hospital, idx) => (
                  <motion.div layout key={hospital.id} variants={cardVariants} initial="hidden" animate="visible" exit="exit" custom={idx}>
                    <HospitalCard hospital={hospital} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative" style={{ filter: 'drop-shadow(0 0 40px rgba(20, 184, 166, 0.1))' }}>
            <HospitalMap hospitals={filteredHospitals} onHospitalSelect={handleHospitalSelect} />
          </motion.div>
        )}
      </div>
    </div>
  );
}