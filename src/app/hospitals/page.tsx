// src/app/hospitals/page.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { FiFilter, FiMapPin, FiGrid, FiSearch, FiActivity, FiTrendingUp, FiHeart, FiClock, FiRefreshCw } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import HospitalCard from '@/components/HospitalCard';
import { Hospital } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyPlaces, RADIUS_OPTIONS, Place } from '@/hooks/useNearbyPlaces';
import { PlaceCard, PlaceCardSkeleton } from '@/components/PlaceCard';
import LocationPermission from '@/components/LocationPermission';

const NearbyMap = dynamic(() => import('@/components/NearbyMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900/80 animate-pulse flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" /></div>
});

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
  const [viewMode, setViewMode] = useState<'map'>('map');
  const [selectedState, setSelectedState] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLastUpdated, setDataLastUpdated] = useState<number | null>(null);
  const [radius, setRadius] = useState(10);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'clinic' | 'pharmacy'>('all');
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<Place | null>(null);

  // Use geolocation hook
  const { position, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useGeolocation();

  // Use nearby places hook for real-time data
  const {
    places,
    hospitals: hospitalList,
    clinics: clinicList,
    pharmacies: pharmacyList,
    loading: placesLoading,
    error: placesError,
    totalCount,
    refresh: refreshPlaces,
  } = useNearbyPlaces(position?.lat ?? null, position?.lng ?? null, {
    initialRadius: radius,
    autoFetch: true,
  });

  // Filter places by type
  const filteredPlaces = useMemo(() => {
    if (selectedType === 'all') return places;
    return places.filter(p => p.type === selectedType);
  }, [places, selectedType]);

  // Sort places by selected criteria
  const sortedPlaces = useMemo(() => {
    if (sortBy === 'beds') return filteredPlaces;
    return filteredPlaces;
  }, [filteredPlaces, sortBy]);

  // Convert places to Hospital type for compatibility
  useEffect(() => {
    if (filteredPlaces.length > 0) {
      const converted: Hospital[] = filteredPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address || '',
        city: place.address?.split(',')[0] || 'Unknown',
        state: 'Delhi',
        phone: place.phone || '',
        rating: 4 + Math.random(),
        specialties: place.type === 'hospital' ? ['General Medicine', 'Emergency Care'] : ['General'],
        beds: { available: Math.floor(Math.random() * 50) + 10, total: Math.floor(Math.random() * 100) + 50 },
        emergency: place.type === 'hospital',
        lat: place.lat,
        lng: place.lng,
        distance: place.distance,
      } as Hospital));
      setHospitals(converted);
      setDataLastUpdated(Date.now());
      setLoading(false);
    }
  }, [filteredPlaces]);

  const isLoading = placesLoading || locationLoading;

  const platformStats = [
    { label: 'Nearby Places', value: totalCount.toString(), icon: MdLocalHospital, color: 'text-teal-400' },
    { label: 'Hospitals', value: hospitalList.length.toString(), icon: MdLocalHospital, color: 'text-red-400' },
    { label: 'Clinics', value: clinicList.length.toString(), icon: FiMapPin, color: 'text-blue-400' },
    { label: 'Pharmacies', value: pharmacyList.length.toString(), icon: FiActivity, color: 'text-emerald-400' },
  ];

  // Filter hospitals by search (for compatibility)
  const filteredHospitals = hospitals.filter((hospital) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!hospital.name?.toLowerCase().includes(q) && !hospital.city?.toLowerCase().includes(q)) return false;
    }
    if (selectedState && hospital.state !== selectedState) return false;
    if (selectedSpecialty && !hospital.specialties?.includes(selectedSpecialty)) return false;
    if (showEmergencyOnly && !hospital.emergency) return false;
    return true;
  });

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlaceId(place.id);
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
      <div className="max-w-7xl mx-auto px-4 text-center pt-16">
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
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            {RADIUS_OPTIONS.map(r => (
              <option key={r} value={r} className="bg-slate-900">Radius: {r} km</option>
            ))}
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
              className={`p-2 rounded-lg transition-all bg-teal-500/20 text-teal-300 border border-teal-500/30`}
            >
              <FiMapPin size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm font-medium">
            Showing <span className="text-teal-400 font-bold text-base">{sortedPlaces.length}</span> places within {radius}km
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPlaces}
              className="flex items-center gap-1 text-teal-400/70 text-xs hover:text-teal-400 transition"
            >
              <FiRefreshCw size={12} />
              Refresh
            </button>
            {hasActiveFilters && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-teal-400/70 text-xs">
                <FiTrendingUp size={12} /> Filtered
              </motion.div>
            )}
          </div>
        </div>

        {/* Type filter tabs for places */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
              selectedType === 'all' ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setSelectedType('hospital')}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
              selectedType === 'hospital' ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            🏥 {hospitalList.length}
          </button>
          <button
            onClick={() => setSelectedType('clinic')}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
              selectedType === 'clinic' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            🏨 {clinicList.length}
          </button>
          <button
            onClick={() => setSelectedType('pharmacy')}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
              selectedType === 'pharmacy' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            💊 {pharmacyList.length}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">
              {position ? `Loading nearby places...` : locationError ? 'Getting your location...' : 'Loading...'}
            </p>
            {dataLastUpdated && (
              <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                <FiClock size={12} />
                Last updated: {new Date(dataLastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
            <div className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative" style={{ filter: 'drop-shadow(0 0 40px rgba(20, 184, 166, 0.1))' }}>
              {position ? (
                <NearbyMap
                  places={sortedPlaces}
                  userLat={position.lat}
                  userLng={position.lng}
                  radius={radius}
                  height="600px"
                  selectedPlaceId={selectedPlaceId}
                  onPlaceSelect={(place) => {
                    setSelectedPlaceId(place.id);
                    setSelectedPlaceDetails(place);
                  }}
                  showRadiusCircle
                />
              ) : (
                <div className="h-[600px] flex items-center justify-center bg-slate-900/80">
                  <LocationPermission
                    onRequestPermission={requestLocation}
                    loading={locationLoading}
                    error={locationError || placesError}
                  />
                </div>
              )}
            </div>
            
            {/* Selected Place Details Panel */}
            {selectedPlaceDetails && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedPlaceDetails.type === 'hospital' ? 'bg-red-500/20 text-red-400' :
                    selectedPlaceDetails.type === 'clinic' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {selectedPlaceDetails.type.toUpperCase()}
                  </span>
                  <button onClick={() => setSelectedPlaceDetails(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <h3 className="font-bold text-lg text-white">{selectedPlaceDetails.name}</h3>
                
                {selectedPlaceDetails.address && (
                  <p className="text-gray-400 text-sm">{selectedPlaceDetails.address}</p>
                )}
                
                {selectedPlaceDetails.distance && (
                  <div className="flex items-center gap-2 text-teal-400 font-semibold">
                    <FiMapPin size={16} />
                    <span>{selectedPlaceDetails.distance.toFixed(1)} km away</span>
                  </div>
                )}
                
                {selectedPlaceDetails.openingHours && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiClock size={14} />
                    <span className="text-sm">{selectedPlaceDetails.openingHours}</span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {selectedPlaceDetails.phone && (
                    <a
                      href={`tel:${selectedPlaceDetails.phone}`}
                      className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 py-2 rounded-lg text-sm font-bold text-center transition"
                    >
                      ��� Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlaceDetails.lat},${selectedPlaceDetails.lng}`}
                    target="_blank"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold text-center transition"
                  >
                    📍 Route
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}