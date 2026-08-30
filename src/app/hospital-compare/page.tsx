'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiCheck, FiClock, FiGrid, FiMapPin, FiPhone, FiPlus, FiSearch, FiStar, FiTrendingUp, FiX, FiShare2, FiBookmark, FiTruck } from 'react-icons/fi';

interface Hospital {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  specialties: string[];
  beds: { general: number; icu: number; emergency: number };
  bedAvailability: 'Available' | 'Limited' | 'Full';
  doctors: number;
  avgFee: number;
  distance: string;
  waitTime: string;
  emergency: boolean;
  parking: boolean;
  visitingHours: string;
  insurance: string[];
  established: number;
  image: string;
}

const HOSPITALS: Hospital[] = [];

const CATEGORIES = [
  'Overall Rating',
  'Bed Count',
  'Doctor Count',
  'Avg Fee (Low)',
  'Distance',
  'Wait Time (Low)',
];

function getStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty');
}

function getBestFor(hospitals: Hospital[]): Record<string, string> {
  if (hospitals.length < 2) return {};
  const bests: Record<string, string> = {};
  bests['Overall Rating'] = hospitals.reduce((a, b) => a.rating > b.rating ? a : b).id;
  bests['Bed Count'] = hospitals.reduce((a, b) => (a.beds.general + a.beds.icu + a.beds.emergency) > (b.beds.general + b.beds.icu + b.beds.emergency) ? a : b).id;
  bests['Doctor Count'] = hospitals.reduce((a, b) => a.doctors > b.doctors ? a : b).id;
  bests['Avg Fee (Low)'] = hospitals.reduce((a, b) => a.avgFee < b.avgFee ? a : b).id;
  bests['Distance'] = hospitals.reduce((a, b) => parseFloat(a.distance) < parseFloat(b.distance) ? a : b).id;
  bests['Wait Time (Low)'] = hospitals.reduce((a, b) => parseFloat(a.waitTime) < parseFloat(b.waitTime) ? a : b).id;
  return bests;
}

function getAvailabilityColor(status: string) {
  switch (status) {
    case 'Available': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'Limited': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Full': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default: return 'bg-white/10 text-white/50';
  }
}

export default function HospitalComparePage() {
  const [allHospitals, setAllHospitals] = useState<Hospital[]>(HOSPITALS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<string[][]>([]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospitals');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const hospitals = data.hospitals || data;
      setAllHospitals(hospitals);
      if (hospitals.length >= 3) {
        setSelectedIds([hospitals[0].id, hospitals[1].id, hospitals[2].id]);
      } else if (hospitals.length >= 2) {
        setSelectedIds([hospitals[0].id, hospitals[1].id]);
      }
    } catch {
      // Use empty defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const selectedHospitals = useMemo(
    () => allHospitals.filter(h => selectedIds.includes(h.id)),
    [allHospitals, selectedIds]
  );

  const filteredHospitals = useMemo(() => {
    if (!searchQuery) return allHospitals;
    return allHospitals.filter(h =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allHospitals, searchQuery]);

  const bestFor = useMemo(() => getBestFor(selectedHospitals), [selectedHospitals]);

  const toggleHospital = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const removeHospital = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const saveComparison = () => {
    setSavedComparisons(prev => [...prev, [...selectedIds]]);
  };

  const totalBeds = (h: Hospital) => h.beds.general + h.beds.icu + h.beds.emergency;
  const maxBeds = Math.max(...selectedHospitals.map(totalBeds));
  const maxDoctors = Math.max(...selectedHospitals.map(h => h.doctors));
  const maxFee = Math.max(...selectedHospitals.map(h => h.avgFee));
  const maxReviews = Math.max(...selectedHospitals.map(h => h.reviews));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-violet-700/90 backdrop-blur-xl p-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                <FiGrid className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Hospital Compare</h1>
                <p className="text-blue-200 text-sm">Find the Best Hospital for You</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveComparison}
                className="bg-white/15 hover:bg-white/25 p-2 rounded-xl transition-all"
                title="Save comparison"
              >
                <FiBookmark className="text-sm" />
              </button>
              <button
                className="bg-white/15 hover:bg-white/25 p-2 rounded-xl transition-all"
                title="Share"
              >
                <FiShare2 className="text-sm" />
              </button>
            </div>
          </div>
          <p className="text-sm text-blue-200/80">
            Comparing {selectedHospitals.length} of 3 max hospitals
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 space-y-4 pb-8">
        {loading && (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/50">Loading hospitals...</p>
          </div>
        )}

        {!loading && (
        <>

        {/* Hospital Selector */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Selected Hospitals</h3>
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs text-blue-300 hover:bg-blue-500/30 transition-all"
            >
              <FiPlus /> Add Hospital
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedHospitals.map(h => (
              <div key={h.id} className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span>{h.image}</span>
                <span className="text-sm font-medium">{h.name}</span>
                <span className="text-xs text-white/40">{h.city}</span>
                <button onClick={() => removeHospital(h.id)} className="text-white/30 hover:text-red-400 transition-all ml-1">
                  <FiX className="text-xs" />
                </button>
              </div>
            ))}
            {selectedHospitals.length === 0 && (
              <p className="text-sm text-white/40 py-2">Select hospitals to compare</p>
            )}
          </div>
        </div>

        {/* Hospital Selector Dropdown */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden"
            >
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search hospitals by name, city, or specialty..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {filteredHospitals.map(h => (
                  <button
                    key={h.id}
                    onClick={() => toggleHospital(h.id)}
                    disabled={!selectedIds.includes(h.id) && selectedIds.length >= 3}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                      selectedIds.includes(h.id)
                        ? 'bg-blue-500/15 border-blue-500/30'
                        : selectedIds.length >= 3
                        ? 'bg-white/3 border-white/5 opacity-40 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{h.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{h.name}</p>
                      <p className="text-xs text-white/40">{h.city} · ⭐ {h.rating}</p>
                    </div>
                    {selectedIds.includes(h.id) && <FiCheck className="text-blue-400" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowSelector(false); setSearchQuery(''); }}
                className="w-full mt-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/50 hover:bg-white/10 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side by Side Comparison Table */}
        {selectedHospitals.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Quick Visual Comparison */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-400" /> Key Metrics Comparison
              </h3>
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <p className="text-xs text-white/50 mb-2">Overall Rating</p>
                  <div className="space-y-2">
                    {selectedHospitals.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate text-white/60">{h.name.split(' ')[0]}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                            style={{ width: `${(h.rating / 5) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 w-24 justify-end">
                          {getStars(h.rating).map((s, i) => (
                            <FiStar key={i} className={`text-xs ${s === 'full' ? 'text-amber-400 fill-amber-400' : s === 'half' ? 'text-amber-400' : 'text-white/10'}`} />
                          ))}
                          <span className="text-xs font-bold ml-1">{h.rating}</span>
                        </div>
                        {bestFor['Overall Rating'] === h.id && (
                          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] text-amber-300 font-medium">Best</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Beds */}
                <div>
                  <p className="text-xs text-white/50 mb-2">Total Beds</p>
                  <div className="space-y-2">
                    {selectedHospitals.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate text-white/60">{h.name.split(' ')[0]}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                            style={{ width: `${(totalBeds(h) / maxBeds) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-20 text-right">{totalBeds(h)}</span>
                        {bestFor['Bed Count'] === h.id && (
                          <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] text-blue-300 font-medium">Best</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctors */}
                <div>
                  <p className="text-xs text-white/50 mb-2">Doctor Count</p>
                  <div className="space-y-2">
                    {selectedHospitals.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate text-white/60">{h.name.split(' ')[0]}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                            style={{ width: `${(h.doctors / maxDoctors) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-20 text-right">{h.doctors}</span>
                        {bestFor['Doctor Count'] === h.id && (
                          <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-300 font-medium">Best</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avg Fee */}
                <div>
                  <p className="text-xs text-white/50 mb-2">Avg Consultation Fee</p>
                  <div className="space-y-2">
                    {selectedHospitals.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate text-white/60">{h.name.split(' ')[0]}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all"
                            style={{ width: `${(h.avgFee / maxFee) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-20 text-right">₹{h.avgFee}</span>
                        {bestFor['Avg Fee (Low)'] === h.id && (
                          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] text-purple-300 font-medium">Best</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/95 backdrop-blur-xl">Feature</th>
                      {selectedHospitals.map(h => (
                        <th key={h.id} className="p-4 text-center min-w-[180px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{h.image}</span>
                            <span className="font-bold text-sm">{h.name}</span>
                            <span className="text-xs text-white/40">{h.city}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Rating */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Rating</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStars(h.rating).map((s, i) => (
                              <FiStar key={i} className={`text-xs ${s === 'full' ? 'text-amber-400 fill-amber-400' : s === 'half' ? 'text-amber-400' : 'text-white/10'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-white/40 mt-1">{h.rating} ({h.reviews} reviews)</p>
                        </td>
                      ))}
                    </tr>

                    {/* Specialties */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Specialties</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {h.specialties.slice(0, 4).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60">
                                {s}
                              </span>
                            ))}
                            {h.specialties.length > 4 && (
                              <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-white/40">
                                +{h.specialties.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Bed Count */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Bed Count</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm font-bold">{h.beds.general}</p>
                              <p className="text-[9px] text-white/30">General</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-300">{h.beds.icu}</p>
                              <p className="text-[9px] text-white/30">ICU</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-red-300">{h.beds.emergency}</p>
                              <p className="text-[9px] text-white/30">Emergency</p>
                            </div>
                          </div>
                          <p className="text-xs text-white/40 mt-1">Total: {totalBeds(h)}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Bed Availability */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Bed Availability</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(h.bedAvailability)}`}>
                            {h.bedAvailability}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Doctor Count */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Doctor Count</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className="text-lg font-black">{h.doctors}</span>
                          <p className="text-[10px] text-white/30">specialists</p>
                        </td>
                      ))}
                    </tr>

                    {/* Avg Fee */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Avg Consultation Fee</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className="text-lg font-black text-green-400">₹{h.avgFee}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Distance */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Distance</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className="text-sm font-medium flex items-center justify-center gap-1">
                            <FiMapPin className="text-xs text-blue-400" /> {h.distance}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Wait Time */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Wait Time</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className="text-sm font-medium flex items-center justify-center gap-1">
                            <FiClock className="text-xs text-amber-400" /> {h.waitTime}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Emergency */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Emergency Services</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          {h.emergency ? (
                            <FiCheck className="text-green-400 mx-auto" />
                          ) : (
                            <FiX className="text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Parking */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Parking</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          {h.parking ? (
                            <FiCheck className="text-green-400 mx-auto" />
                          ) : (
                            <FiX className="text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Visiting Hours */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Visiting Hours</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4 text-center">
                          <span className="text-xs text-white/60">{h.visitingHours}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Insurance */}
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-xs text-white/50 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-xl">Insurance Accepted</td>
                      {selectedHospitals.map(h => (
                        <td key={h.id} className="p-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {h.insurance.slice(0, 3).map(ins => (
                              <span key={ins} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60">
                                {ins}
                              </span>
                            ))}
                            {h.insurance.length > 3 && (
                              <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-white/40">
                                +{h.insurance.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Map View */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
              >
                <span className="font-bold text-sm flex items-center gap-2">
                  <FiMapPin className="text-blue-400" /> Map View
                </span>
                <motion.span animate={{ rotate: showMap ? 180 : 0 }} className="text-white/50">
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 300 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative w-full h-[300px] bg-slate-800/50 flex items-center justify-center">
                      <div className="text-center">
                        <FiMapPin className="text-4xl text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-white/50">Map View</p>
                        <div className="flex gap-3 mt-3 flex-wrap justify-center">
                          {selectedHospitals.map(h => (
                            <div key={h.id} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs">
                              <span className="mr-1">{h.image}</span> {h.name} ({h.distance})
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-white/30 mt-2">Interactive map available in production with Google Maps API</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Book Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedHospitals.map(h => (
                <motion.button
                  key={h.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl text-blue-300 font-medium text-sm hover:from-blue-500/30 hover:to-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FiActivity className="text-sm" /> Book at {h.name.split(' ')[0]}
                </motion.button>
              ))}
            </div>

            {/* Saved Comparisons */}
            {savedComparisons.length > 0 && (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <FiBookmark className="text-amber-400" /> Saved Comparisons
                </h3>
                <div className="space-y-2">
                  {savedComparisons.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                      <span className="text-xs text-white/50">
                        {comp.map(id => allHospitals.find(h => h.id === id)?.name.split(' ')[0]).join(' vs ')}
                      </span>
                      <button
                        onClick={() => setSelectedIds(comp)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Not enough hospitals selected */}
        {selectedHospitals.length < 2 && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <FiGrid className="text-4xl text-white/20 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white/60 mb-2">Select 2-3 Hospitals to Compare</h3>
            <p className="text-sm text-white/30 mb-4">Choose hospitals from the selector above to see a detailed side-by-side comparison</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allHospitals.slice(0, 6).map(h => (
                <button
                  key={h.id}
                  onClick={() => toggleHospital(h.id)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all"
                >
                  <span className="text-xl">{h.image}</span>
                  <p className="text-sm font-medium mt-1">{h.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-white/40">{h.city} · ⭐ {h.rating}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
