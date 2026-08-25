'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiSearch, FiMapPin, FiStar, FiCalendar, FiArrowRight, FiFilter, FiUserPlus, FiLoader } from 'react-icons/fi';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  consultingFee: number;
  isAvailable: boolean;
  hospital?: string;
  rating?: number;
  languages?: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctors?limit=50');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
      } else {
        // Fallback to empty array if API fails
        setDoctors([]);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                       d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === 'All' || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
            <FiUserPlus size={14} /> Find Doctors
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Doctors</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Browse and book appointments with top healthcare professionals.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search doctors or specialties..." 
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" 
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {specialties.slice(0, 10).map(s => (
              <button 
                key={s} 
                onClick={() => setSpecialty(s)} 
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  specialty === s 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="animate-spin text-blue-400 mb-4" size={32} />
            <p className="text-slate-400">Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchDoctors} className="text-blue-400 hover:text-blue-300">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No doctors found</p>
            <Link href="/doctors/register" className="text-blue-400 hover:text-blue-300">
              Register as a Doctor
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc, idx) => (
              <motion.div 
                key={doc.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }} 
                className="group bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {doc.name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">{doc.name}</h3>
                    <p className="text-xs text-slate-400">{doc.specialty}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {doc.rating && (
                        <span className="flex items-center gap-1">
                          <FiStar size={12} className="text-amber-400" /> {doc.rating.toFixed(1)}
                        </span>
                      )}
                      <span>{doc.experience} yrs exp</span>
                      {doc.consultingFee > 0 && (
                        <span className="text-green-400">₹{doc.consultingFee}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {doc.hospital && (
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <FiMapPin size={12} /> {doc.hospital}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${doc.isAvailable ? 'text-green-400' : 'text-slate-500'}`}>
                    {doc.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <Link 
                    href={`/booking?doctor=${doc.id}`} 
                    className="flex items-center gap-2 text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors"
                  >
                    Book <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/doctors/register" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <FiUserPlus size={16} /> Register as a Doctor
          </Link>
        </div>
      </div>
    </div>
  );
}
