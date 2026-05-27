'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiStar, FiCalendar, FiArrowRight, FiFilter, FiUserPlus } from 'react-icons/fi';

const doctorsList = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', exp: '15 yrs', rating: 4.8, loc: 'Mumbai', img: '/images/publiczyntracare-logo.png' },
  { id: 2, name: 'Dr. Rajesh Kumar', specialty: 'Neurologist', exp: '12 yrs', rating: 4.7, loc: 'Delhi', img: '/images/publiczyntracare-logo.png' },
  { id: 3, name: 'Dr. Anita Verma', specialty: 'Pediatrician', exp: '10 yrs', rating: 4.9, loc: 'Bangalore', img: '/images/publiczyntracare-logo.png' },
  { id: 4, name: 'Dr. Suresh Patel', specialty: 'Orthopedic', exp: '18 yrs', rating: 4.6, loc: 'Ahmedabad', img: '/images/publiczyntracare-logo.png' },
  { id: 5, name: 'Dr. Meera Joshi', specialty: 'Dermatologist', exp: '8 yrs', rating: 4.8, loc: 'Pune', img: '/images/publiczyntracare-logo.png' },
  { id: 6, name: 'Dr. Vikram Singh', specialty: 'Psychiatrist', exp: '14 yrs', rating: 4.5, loc: 'Jaipur', img: '/images/publiczyntracare-logo.png' },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');

  const filtered = doctorsList.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === 'All' || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  const specialties = ['All', ...new Set(doctorsList.map(d => d.specialty))];

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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors or specialties..." className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {specialties.map(s => (
              <button key={s} onClick={() => setSpecialty(s)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${specialty === s ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/30'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, idx) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-blue-500/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {doc.name.split(' ')[1]?.[0] || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">{doc.name}</h3>
                  <p className="text-xs text-slate-400">{doc.specialty}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><FiStar size={12} className="text-amber-400" /> {doc.rating}</span>
                    <span>Exp: {doc.exp}</span>
                    <span className="flex items-center gap-1"><FiMapPin size={12} /> {doc.loc}</span>
                  </div>
                </div>
              </div>
              <Link href={`/booking?doctor=${doc.id}`} className="flex items-center justify-between w-full px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-all group/btn">
                Book Appointment <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/doctors/register" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <FiUserPlus size={16} /> Register as a Doctor
          </Link>
        </div>
      </div>
    </div>
  );
}
