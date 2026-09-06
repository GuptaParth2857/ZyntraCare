'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiNavigation, FiShield, FiRefreshCw, FiArrowLeft, FiMap, FiList } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPills } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DirectionsModal from '@/components/DirectionsModal';

const NearbyMap = dynamic(() => import('@/components/NearbyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/80 animate-pulse flex items-center justify-center rounded-3xl">
      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  ),
});

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: { lat: number; lng: number };
  distance: number;
  open24x7: boolean;
  rating: string;
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'detected' | 'error'>('loading');
  const [showDirections, setShowDirections] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [radius, setRadius] = useState(5);
  const [source, setSource] = useState('');
  const [show24Only, setShow24Only] = useState(false);
  const [error, setError] = useState('');

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('detected');
      },
      () => {
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const fetchPharmacies = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    const { lat, lng } = userLocation;
    try {
      const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}&search=${searchQuery}&radius=${radius * 1000}`);
      if (!res.ok) throw new Error('Failed to load pharmacies');
      const data = await res.json();
      setPharmacies(data.pharmacies || []);
      setSource(data.source || '');
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch pharmacies:', err);
      setError(err.message || 'Failed to load pharmacies');
      setPharmacies([]);
    }
    setLoading(false);
  }, [userLocation, searchQuery, radius]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const filteredPharmacies = useMemo(() => {
    let list = pharmacies;
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (show24Only) list = list.filter(p => p.open24x7);
    return list;
  }, [pharmacies, searchQuery, show24Only]);

  // Map-compatible places
  const mapPlaces = useMemo(() => filteredPharmacies.map(p => ({
    id: p.id,
    name: p.name,
    type: 'pharmacy' as const,
    lat: p.location.lat,
    lng: p.location.lng,
    address: p.address || p.city,
    phone: p.phone,
    distance: p.distance,
  })), [filteredPharmacies]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Back */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
          <FiArrowLeft size={18} /><span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Location status */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          {locationStatus === 'loading' ? (
            <><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /><span className="text-xs text-amber-400">Detecting location...</span></>
          ) : locationStatus === 'detected' ? (
            <><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-emerald-400">Location detected</span></>
          ) : (
            <><div className="w-2 h-2 bg-slate-400 rounded-full" /><span className="text-xs text-slate-400">Default location</span></>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FaPills size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pharmacies</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time nearby pharmacies based on your location. Find 24/7 stores and get directions instantly.
          </p>
        </motion.div>

        {/* Search + filters */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacies by name or location..."
              className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
            />
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <select
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-xl outline-none"
            >
              {[2, 5, 10, 15, 20].map(r => <option key={r} value={r} className="bg-slate-900">Radius: {r}km</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition">
              <input
                type="checkbox"
                checked={show24Only}
                onChange={e => setShow24Only(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <FiShield size={14} className="text-emerald-400" />
              <span className="text-xs text-gray-300 font-medium">24/7 Only</span>
            </label>
            <button
              onClick={fetchPharmacies}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-emerald-400 hover:bg-white/10 transition text-sm"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
            {source && (
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                {source === 'overpass' ? '🌍 Live OSM' : source === 'database' ? '🗄️ DB' : '📋 Sample'}
              </span>
            )}
          </div>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'map' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FiMap size={14} /> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FiList size={14} /> List
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Finding pharmacies near you...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row gap-4">
                {/* Map */}
                <div className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-2xl" style={{ height: 'clamp(400px, 60vh, 600px)' }}>
                  {userLocation ? (
                    <NearbyMap
                      places={mapPlaces}
                      userLat={userLocation.lat}
                      userLng={userLocation.lng}
                      radius={radius}
                      height="100%"
                      showRadiusCircle
                      onPlaceSelect={(place) => {
                        const pharmacy = pharmacies.find(p => p.id === place.id);
                        if (pharmacy) setSelectedPharmacy(pharmacy);
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-900/80">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Getting your location...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side list */}
                <div className="w-full lg:w-80 space-y-3 max-h-[300px] lg:max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                  <p className="text-slate-400 text-sm font-medium px-1">
                    <span className="text-emerald-400 font-bold text-base">{filteredPharmacies.length}</span> pharmacies within {radius}km
                  </p>
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                      <FiShield className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-xs font-bold">{error}</p>
                    </div>
                  )}
                  {filteredPharmacies.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5">
                      <FaPills className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No pharmacies found nearby.</p>
                      <button onClick={() => setRadius(r => Math.min(r + 5, 20))} className="text-emerald-400 text-xs mt-2 hover:text-emerald-300">
                        Expand to {Math.min(radius + 5, 20)}km
                      </button>
                    </div>
                  ) : (
                    filteredPharmacies.map((pharmacy) => (
                      <motion.div
                        key={pharmacy.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer ${selectedPharmacy?.id === pharmacy.id ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/10'}`}
                        onClick={() => setSelectedPharmacy(selectedPharmacy?.id === pharmacy.id ? null : pharmacy)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-white leading-tight">{pharmacy.name}</h3>
                          {pharmacy.open24x7 && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">24/7</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{pharmacy.address || pharmacy.city}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><FiMapPin size={10} />{pharmacy.distance?.toFixed(1)} km</span>
                          <span>⭐ {pharmacy.rating}</span>
                        </div>
                        <div className="flex gap-2">
                          {pharmacy.phone && (
                            <a href={`tel:${pharmacy.phone}`} onClick={e => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition">
                              <FiPhone size={12} /> Call
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPharmacy(pharmacy); setShowDirections(true); }}
                            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition"
                          >
                            <FiNavigation size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {filteredPharmacies.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
                    <FaPills className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No pharmacies found. Try expanding the radius.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPharmacies.map((pharmacy, idx) => (
                      <motion.div
                        key={pharmacy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{pharmacy.name}</h3>
                            <p className="text-gray-400 text-sm">{pharmacy.address || pharmacy.city}</p>
                          </div>
                          {pharmacy.open24x7 && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">24/7</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><FiMapPin size={14} />{pharmacy.distance?.toFixed(1)} km</span>
                          <span>⭐ {pharmacy.rating}</span>
                        </div>
                        <div className="flex gap-2">
                          {pharmacy.phone && (
                            <a href={`tel:${pharmacy.phone}`}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition">
                              <FiPhone size={14} /> Call
                            </a>
                          )}
                          <button
                            onClick={() => { setSelectedPharmacy(pharmacy); setShowDirections(true); }}
                            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition"
                          >
                            <FiNavigation size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <DirectionsModal
        isOpen={showDirections}
        onClose={() => { setShowDirections(false); setSelectedPharmacy(null); }}
        destination={selectedPharmacy ? {
          name: selectedPharmacy.name,
          address: selectedPharmacy.address,
          lat: selectedPharmacy.location.lat,
          lng: selectedPharmacy.location.lng,
        } : { name: '', address: '', lat: 0, lng: 0 }}
        userLocation={userLocation || { lat: 28.6139, lng: 77.2090 }}
      />
    </div>
  );
}