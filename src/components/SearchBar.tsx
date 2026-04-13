// src/components/SearchBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiSliders } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { specialties, states } from '@/data/mockData';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
}

const locationList = Array.from(new Set(
  states.filter(s => s !== 'All India').map(s => s.trim())
));

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (specialty) params.set('specialty', specialty);
    if (location) params.set('location', location);
    router.push(`/specialists?${params.toString()}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-2" role="search">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
          <label htmlFor="search-compact" className="sr-only">Search</label>
          <input
            id="search-compact"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search doctors, hospitals..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition"
          />
        </div>
        <button
          onClick={handleSearch}
          aria-label="Search for doctors or hospitals"
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 font-semibold text-sm"
        >
          <FiSearch size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full" role="search" aria-label="Search doctors and hospitals">
      <div className="flex flex-col md:flex-row gap-2 p-2 rounded-2xl">
        <div className="flex-1 relative min-w-0">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} aria-hidden="true" />
          <label htmlFor="search-query" className="sr-only">Search query</label>
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search doctors, hospitals, conditions..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-base focus:outline-none focus:border-sky-500/40 focus:bg-white/8 transition-all"
          />
        </div>

        <div className="relative md:w-44">
          <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} aria-hidden="true" />
          <label htmlFor="search-specialty" className="sr-only">Select specialty</label>
          <select
            id="search-specialty"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="w-full pl-9 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-sky-500/40 focus:bg-white/8 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-300">All Specialties</option>
            {specialties.map(s => (
              <option key={s} value={s} className="bg-slate-900 text-slate-300">{s}</option>
            ))}
          </select>
        </div>

        <div className="relative md:w-40">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} aria-hidden="true" />
          <label htmlFor="search-location" className="sr-only">Select location</label>
          <select
            id="search-location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-9 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-sky-500/40 focus:bg-white/8 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-300">All Locations</option>
            {locationList.map(s => (
              <option key={s} value={s} className="bg-slate-900 text-slate-300">{s}</option>
            ))}
          </select>
        </div>

        {mounted ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            aria-label="Search"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] whitespace-nowrap"
          >
            <FiSearch size={18} aria-hidden="true" />
            <span>Search</span>
          </motion.button>
        ) : (
          <button
            onClick={handleSearch}
            aria-label="Search"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] whitespace-nowrap"
          >
            <FiSearch size={18} aria-hidden="true" />
            <span>Search</span>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-2" role="group" aria-label="Popular search terms">
        <span className="text-slate-500 text-xs font-medium">Popular:</span>
        {['Cardiology', 'Orthopedics', 'Cancer Care', 'Neurology', 'Pediatrics'].map((term, idx) => (
          mounted ? (
            <motion.button
              key={term}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => { setQuery(term); router.push(`/specialists?q=${encodeURIComponent(term)}`); }}
              aria-label={`Search for ${term}`}
              className="text-xs bg-white/5 hover:bg-sky-500/15 border border-white/8 hover:border-sky-500/30 px-3 py-1.5 rounded-full text-slate-400 hover:text-sky-300 transition-all"
            >
              {term}
            </motion.button>
          ) : (
            <button
              key={term}
              onClick={() => { setQuery(term); router.push(`/specialists?q=${encodeURIComponent(term)}`); }}
              aria-label={`Search for ${term}`}
              className="text-xs bg-white/5 hover:bg-sky-500/15 border border-white/8 hover:border-sky-500/30 px-3 py-1.5 rounded-full text-slate-400 hover:text-sky-300 transition-all"
            >
              {term}
            </button>
          )
        ))}
      </div>
    </div>
  );
}