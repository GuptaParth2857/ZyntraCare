// src/app/specialists/page.tsx
'use client';

import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiFilter, FiActivity, FiSearch, FiAward, FiUsers, FiStar, FiTrendingUp, FiGrid, FiList } from 'react-icons/fi';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import DoctorCard from '@/components/DoctorCard';
import { specialties, states } from '@/data/mockData';
import { Doctor } from '@/types';

const STATS = [
  { label: 'Trusted Specialists', value: '500+', icon: FiUsers, color: 'text-blue-400' },
  { label: 'Years Avg. Experience', value: '18+', icon: FiAward, color: 'text-purple-400' },
  { label: 'Avg. Rating', value: '4.8★', icon: FiStar, color: 'text-amber-400' },
  { label: 'Consultations Done', value: '2M+', icon: FiTrendingUp, color: 'text-emerald-400' },
];

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return <span ref={ref} className={inView ? 'opacity-100' : 'opacity-0'}>{value}</span>;
}

function SpecialistsContent() {
  const searchParams = useSearchParams();
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    };
    getUserLocation();

    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedSpecialty) params.set('specialty', selectedSpecialty);
        if (selectedLocation) params.set('city', selectedLocation);
        if (showAvailableOnly) params.set('available', 'true');
        
        const res = await fetch(`/api/doctors?${params}`);
        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
      setLoading(false);
    };
    fetchDoctors();
  }, [selectedSpecialty, selectedLocation, showAvailableOnly]);

  const featuredSpecialties = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Gynecology'];

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospitalName.toLowerCase().includes(q)
      );
    }

    const spec = activeSpecialtyTab || selectedSpecialty;
    if (spec) result = result.filter(d => d.specialty === spec);

    if (selectedLocation) result = result.filter(d => d.hospitalName.toLowerCase().includes(selectedLocation.toLowerCase()));
    if (showAvailableOnly) result = result.filter(d => d.available);

    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'experience') result.sort((a, b) => b.experience - a.experience);
    else if (sortBy === 'fee') result.sort((a, b) => a.consultationFee - b.consultationFee);

    return result;
  }, [selectedSpecialty, activeSpecialtyTab, selectedLocation, showAvailableOnly, sortBy, searchQuery]);

  const handleBookAppointment = (doctor: Doctor) => {
    // handled inside DoctorCard
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 as number },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[160px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]"
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
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 blur-sm"
            />
            <FiActivity size={32} className="text-blue-400 relative z-10" aria-hidden="true" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-none"
          >
            India&apos;s{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Top Specialists
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Book appointments with India&apos;s most trusted, verified, and highly-rated medical practitioners.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8"
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center">
                <stat.icon size={18} className={`mx-auto mb-1 ${stat.color}`} aria-hidden="true" />
                <p className={`text-xl font-black ${stat.color}`}>
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-gray-500 text-[11px] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto relative"
          >
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specialties, hospitals…"
              aria-label="Search specialists"
              className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition text-base"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Specialty Quick Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin snap-x" role="tablist" aria-label="Filter by specialty">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSpecialtyTab('')}
            role="tab"
            aria-selected={activeSpecialtyTab === ''}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
              activeSpecialtyTab === ''
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            All
          </motion.button>
          {featuredSpecialties.map(spec => (
            <motion.button
              key={spec}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSpecialtyTab(prev => prev === spec ? '' : spec)}
              role="tab"
              aria-selected={activeSpecialtyTab === spec}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
                activeSpecialtyTab === spec
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {spec}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-wrap gap-3 items-center"
        >
          <div className="flex items-center gap-2 text-blue-400">
            <FiFilter size={15} aria-hidden="true" />
            <span className="font-bold uppercase tracking-wider text-xs">Filters:</span>
          </div>

          <select
            value={selectedSpecialty}
            onChange={e => { setSelectedSpecialty(e.target.value); setActiveSpecialtyTab(''); }}
            aria-label="Filter by specialty"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">All Specialties</option>
            {specialties.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>

          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            aria-label="Filter by location"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">All Locations</option>
            {states.filter(s => s !== 'All India').map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort by"
            className="flex-1 min-w-[130px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white text-sm"
          >
            <option value="rating" className="bg-slate-900">Highest Rated</option>
            <option value="experience" className="bg-slate-900">Most Experienced</option>
            <option value="fee" className="bg-slate-900">Lowest Fee</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={e => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-white/20 accent-blue-500"
              aria-label="Show available today only"
            />
            <span className="text-gray-300 text-sm font-medium whitespace-nowrap">Available Today</span>
          </label>

          {/* View toggle */}
          <div className="ml-auto flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500 hover:text-white'}`}
            >
              <FiGrid size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500 hover:text-white'}`}
            >
              <FiList size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm font-medium">
            Showing <span className="text-blue-400 font-bold text-base">{filteredDoctors.length}</span> specialists
          </p>
          {(searchQuery || selectedSpecialty || activeSpecialtyTab || showAvailableOnly) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setSearchQuery(''); setSelectedSpecialty(''); setActiveSpecialtyTab(''); setShowAvailableOnly(false); }}
              className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition"
            >
              Clear all filters
            </motion.button>
          )}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}
        >
          <AnimatePresence mode="popLayout">
            {filteredDoctors.map(doctor => (
              <motion.div
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={doctor.id}
              >
                <DoctorCard doctor={doctor} onBook={handleBookAppointment} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <FiActivity size={48} className="mx-auto text-gray-600 mb-4" aria-hidden="true" />
            </motion.div>
            <p className="text-gray-400 text-lg font-medium">No specialists found matching your criteria</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">Try adjusting your filters or search term</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedSpecialty(''); setActiveSpecialtyTab(''); setShowAvailableOnly(false); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition font-semibold border border-blue-400/30"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SpecialistsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center" role="status" aria-label="Loading specialists">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          <p className="text-blue-400 font-bold tracking-widest uppercase text-sm">Loading Specialists</p>
        </div>
      </div>
    }>
      <SpecialistsContent />
    </Suspense>
  );
}