'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiSearch, FiClock, FiAlertCircle, FiRefreshCw, FiCheck, FiTrendingUp, FiActivity, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface HospitalBedStatus {
  id: string;
  hospitalId: string;
  name: string;
  city: string;
  phone: string;
  emergency: boolean;
  rating: number;
  distance: number;
  beds: {
    total: number;
    available: number;
    occupied: number;
    occupancyPercent: number;
    icu: { total: number; available: number; occupancyPercent: number };
  };
  lastUpdated: string;
}

const MOCK_HOSPITALS: HospitalBedStatus[] = [
  { id: 'H001', hospitalId: 'H001', name: 'Apollo Hospital', city: 'Delhi', phone: '+91-11-2345-6789', emergency: true, rating: 4.5, distance: 2.5, beds: { total: 150, available: 12, occupied: 138, occupancyPercent: 92, icu: { total: 25, available: 3, occupancyPercent: 88 } }, lastUpdated: new Date().toISOString() },
  { id: 'H002', hospitalId: 'H002', name: 'Fortis Memorial', city: 'Delhi', phone: '+91-11-4567-8900', emergency: true, rating: 4.3, distance: 5.2, beds: { total: 200, available: 45, occupied: 155, occupancyPercent: 77, icu: { total: 30, available: 8, occupancyPercent: 73 } }, lastUpdated: new Date().toISOString() },
  { id: 'H003', hospitalId: 'H003', name: 'Max Super Specialty', city: 'Delhi', phone: '+91-11-7890-1234', emergency: true, rating: 4.6, distance: 7.1, beds: { total: 180, available: 30, occupied: 150, occupancyPercent: 83, icu: { total: 20, available: 4, occupancyPercent: 80 } }, lastUpdated: new Date().toISOString() },
  { id: 'H004', hospitalId: 'H004', name: 'BLK Super Hospital', city: 'Delhi', phone: '+91-11-2222-3333', emergency: true, rating: 4.2, distance: 8.5, beds: { total: 120, available: 8, occupied: 112, occupancyPercent: 93, icu: { total: 15, available: 1, occupancyPercent: 93 } }, lastUpdated: new Date().toISOString() },
  { id: 'H005', hospitalId: 'H005', name: 'Sir Ganga Ram', city: 'Delhi', phone: '+91-11-4444-5555', emergency: true, rating: 4.4, distance: 10.2, beds: { total: 100, available: 22, occupied: 78, occupancyPercent: 78, icu: { total: 12, available: 5, occupancyPercent: 58 } }, lastUpdated: new Date().toISOString() },
];

export default function LiveBedsPage() {
  const [hospitals, setHospitals] = useState<HospitalBedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'icu'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'availability' | 'rating'>('availability');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beds/realtime?all=true');
      const data = await res.json();
      
      if (data.success && data.data?.length > 0) {
        const formatted = data.data.map((h: any) => ({
          ...h,
          beds: {
            total: h.totalBeds,
            available: h.availableBeds,
            occupied: h.occupiedBeds,
            occupancyPercent: h.occupancyPercent,
            icu: { total: h.totalICU, available: h.availableICU, occupancyPercent: h.icuOccupancy }
          }
        }));
        setHospitals(formatted);
      } else {
        setHospitals(MOCK_HOSPITALS);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error:', err);
      setHospitals(MOCK_HOSPITALS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      );
    }

    const interval = setInterval(fetchHospitals, 60000);
    return () => clearInterval(interval);
  }, [fetchHospitals]);

  const filteredHospitals = hospitals
    .filter(h => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!h.name.toLowerCase().includes(q) && !h.city.toLowerCase().includes(q)) return false;
      }
      if (filterType === 'available') return h.beds.available > 0;
      if (filterType === 'icu') return h.beds.icu.available > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'availability') return b.beds.available - a.beds.available;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.distance - b.distance;
    });

  const stats = {
    totalHospitals: filteredHospitals.length,
    totalBeds: filteredHospitals.reduce((sum, h) => sum + h.beds.total, 0),
    availableBeds: filteredHospitals.reduce((sum, h) => sum + h.beds.available, 0),
    totalICU: filteredHospitals.reduce((sum, h) => sum + h.beds.icu.total, 0),
    availableICU: filteredHospitals.reduce((sum, h) => sum + h.beds.icu.available, 0),
    criticalCount: filteredHospitals.filter(h => h.beds.occupancyPercent >= 90).length,
  };

  const getAvailabilityColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (percent >= 70) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-500 bg-green-500/10 border-green-500/30';
  };

  const getStatusLabel = (percent: number) => {
    if (percent >= 90) return 'CRITICAL';
    if (percent >= 70) return 'HIGH';
    return 'Available';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-red-500/10 border border-red-500/30 rounded-2xl mb-4"
          >
            <FiActivity size={32} className="text-red-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Bed Availability</span>
          </h1>
          <p className="text-gray-400">Real-time bed status across all partner hospitals</p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              realTimeConnected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${realTimeConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              {realTimeConnected ? 'Live Connected' : 'Auto-refresh'}
            </div>
            {lastRefreshed && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <FiClock size={14} />
                Updated: {lastRefreshed.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <FiActivity className="text-teal-400 mb-1" size={18} />
            <p className="text-xl font-bold">{stats.totalHospitals}</p>
            <p className="text-xs text-gray-400">Hospitals</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <FiTrendingUp className="text-blue-400 mb-1" size={18} />
            <p className="text-xl font-bold">{stats.totalBeds}</p>
            <p className="text-xs text-gray-400">Total Beds</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
            <FiCheck className="text-green-400 mb-1" size={18} />
            <p className="text-xl font-bold text-green-400">{stats.availableBeds}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <FiActivity className="text-purple-400 mb-1" size={18} />
            <p className="text-xl font-bold">{stats.totalICU}</p>
            <p className="text-xs text-gray-400">ICU Beds</p>
          </div>
          <div className={`${stats.criticalCount > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50 border-white/5'} rounded-xl p-4 border`}>
            <FiAlertCircle className="text-red-400 mb-1" size={18} />
            <p className="text-xl font-bold text-red-400">{stats.criticalCount}</p>
            <p className="text-xs text-gray-400">Critical</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospital by name..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="all">All Beds</option>
              <option value="available">Available</option>
              <option value="icu">ICU Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="availability">Most Available</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest</option>
            </select>

            <button
              onClick={fetchHospitals}
              disabled={loading}
              className="px-4 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl transition disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            </button>
          </div>
        </div>

        {/* Hospital List */}
        {loading && hospitals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading live bed data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredHospitals.map((hospital, idx) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-slate-800/50 rounded-2xl p-5 border ${
                    hospital.beds.occupancyPercent >= 90 
                      ? 'border-red-500/30' 
                      : hospital.beds.occupancyPercent >= 70 
                        ? 'border-yellow-500/30' 
                        : 'border-white/5'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Hospital Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🏥</div>
                        <div>
                          <h3 className="font-bold text-lg">{hospital.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><FiMapPin size={12} /> {hospital.distance} km</span>
                            <span>⭐ {hospital.rating}</span>
                            {hospital.emergency && <span className="text-red-400">24/7 Emergency</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bed Stats */}
                    <div className="flex flex-wrap gap-3">
                      <div className={`px-4 py-2 rounded-xl text-center ${getAvailabilityColor(hospital.beds.occupancyPercent)}`}>
                        <p className="text-lg font-bold">{hospital.beds.available}</p>
                        <p className="text-xs opacity-70">General</p>
                        <p className={`text-xs font-semibold mt-1 ${
                          hospital.beds.occupancyPercent >= 90 ? 'text-red-400' :
                          hospital.beds.occupancyPercent >= 70 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {getStatusLabel(hospital.beds.occupancyPercent)}
                        </p>
                      </div>

                      <div className={`px-4 py-2 rounded-xl text-center ${
                        hospital.beds.icu.occupancyPercent >= 90 
                          ? 'text-red-500 bg-red-500/10 border border-red-500/30' :
                        hospital.beds.icu.occupancyPercent >= 70
                          ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/30'
                          : 'text-green-500 bg-green-500/10 border border-green-500/30'
                      }`}>
                        <p className="text-lg font-bold">{hospital.beds.icu.available}</p>
                        <p className="text-xs opacity-70">ICU</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold"
                      >
                        Call
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.name}`}
                        target="_blank"
                        rel="noopener"
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold"
                      >
                        Directions
                      </a>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500 flex items-center gap-2">
                    <FiClock size={12} />
                    Last updated: {hospital.lastUpdated ? new Date(hospital.lastUpdated).toLocaleTimeString() : 'Just now'}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredHospitals.length === 0 && !loading && (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl">
            <FiAlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No hospitals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}