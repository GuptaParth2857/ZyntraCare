'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiClock, FiNavigation, FiCheckCircle, FiArrowLeft, FiRefreshCw, FiList, FiMap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DirectionsModal from '@/components/DirectionsModal';

const NearbyMap = dynamic(() => import('@/components/NearbyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/80 animate-pulse flex items-center justify-center rounded-3xl">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  ),
});

interface Lab {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: { lat: number; lng: number };
  tests: string[];
  homeCollection: boolean;
  reportsIn: string;
  rating: string;
  distance?: number;
}

const POPULAR_TESTS = [
  'Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function',
  'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'COVID Test',
];

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'detected' | 'error'>('loading');
  const [showDirections, setShowDirections] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [source, setSource] = useState<string>('');
  const [radius, setRadius] = useState(10);

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

  const fetchLabs = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    const { lat, lng } = userLocation;

    try {
      const res = await fetch(`/api/labs?lat=${lat}&lng=${lng}&test=${selectedTest}&radius=${radius * 1000}`);
      const data = await res.json();

      if (data.labs && data.labs.length > 0) {
        const labsWithDist = data.labs.map((lab: any) => ({
          ...lab,
          distance: calculateDistance(lat, lng, lab.location.lat, lab.location.lng),
        })).sort((a: any, b: any) => a.distance - b.distance);
        setLabs(labsWithDist);
        setSource(data.source || '');
      } else {
        setLabs([]);
      }
    } catch (err) {
      console.error('Failed to fetch labs:', err);
      setLabs([]);
    }
    setLoading(false);
  }, [userLocation, selectedTest, radius]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Map-compatible places format
  const mapPlaces = useMemo(() => labs.map(lab => ({
    id: lab.id,
    name: lab.name,
    type: 'lab' as const,
    lat: lab.location.lat,
    lng: lab.location.lng,
    address: lab.address || lab.city,
    phone: lab.phone,
    distance: lab.distance,
  })), [labs]);

  const filteredLabs = selectedTest
    ? labs.filter(lab => lab.tests.some(t => t.toLowerCase().includes(selectedTest.toLowerCase())))
    : labs;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white">
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Location Status */}
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
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6">
            <FaFlask size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Diagnostic Labs</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time nearby labs based on your location. Book tests and get results fast.
          </p>
        </motion.div>

        {/* Test filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {POPULAR_TESTS.map((test) => (
            <button
              key={test}
              onClick={() => setSelectedTest(selectedTest === test ? '' : test)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedTest === test
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {test}
            </button>
          ))}
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
            <button
              onClick={fetchLabs}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-purple-400 hover:bg-white/10 transition text-sm"
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'map' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FiMap size={14} /> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FiList size={14} /> List
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Finding labs near you...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex gap-4">
                {/* Map */}
                <div className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-2xl" style={{ height: '600px' }}>
                  {userLocation ? (
                    <NearbyMap
                      places={mapPlaces}
                      userLat={userLocation.lat}
                      userLng={userLocation.lng}
                      radius={radius}
                      height="600px"
                      showRadiusCircle
                      onPlaceSelect={(place) => {
                        const lab = labs.find(l => l.id === place.id);
                        if (lab) setSelectedLab(lab);
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-900/80">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Getting your location...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side panel */}
                <div className="w-80 space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                  <p className="text-slate-400 text-sm font-medium px-1">
                    <span className="text-purple-400 font-bold text-base">{filteredLabs.length}</span> labs within {radius}km
                  </p>
                  {filteredLabs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5">
                      <FaFlask className="w-12 h-12 text-purple-500/30 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No labs found nearby.</p>
                      <button onClick={() => setRadius(r => Math.min(r + 5, 20))} className="text-purple-400 text-xs mt-2 hover:text-purple-300">
                        Expand to {Math.min(radius + 5, 20)}km
                      </button>
                    </div>
                  ) : (
                    filteredLabs.map((lab) => (
                      <motion.div
                        key={lab.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-4 hover:border-purple-500/40 transition-all cursor-pointer ${selectedLab?.id === lab.id ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/10'}`}
                        onClick={() => setSelectedLab(selectedLab?.id === lab.id ? null : lab)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-white leading-tight">{lab.name}</h3>
                          {lab.homeCollection && (
                            <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-2">
                              <FiCheckCircle size={8} /> Home
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{lab.address || lab.city}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><FiMapPin size={10} />{lab.distance?.toFixed(1)} km</span>
                          <span className="flex items-center gap-1"><FiClock size={10} />{lab.reportsIn}</span>
                          <span>⭐ {lab.rating}</span>
                        </div>
                        <div className="flex gap-2">
                          {lab.phone && (
                            <a href={`tel:${lab.phone}`} onClick={e => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-xs transition">
                              <FiPhone size={12} /> Call
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedLab(lab); setShowDirections(true); }}
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
                {filteredLabs.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
                    <FaFlask className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No labs found for selected test.</p>
                    <p className="text-gray-500 text-sm">Try selecting a different test or expand the radius.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLabs.map((lab, idx) => (
                      <motion.div
                        key={lab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{lab.name}</h3>
                            <p className="text-gray-400 text-sm">{lab.address || lab.city}</p>
                          </div>
                          {lab.homeCollection && (
                            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <FiCheckCircle size={10} /> Home
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {lab.tests.slice(0, 4).map((test) => (
                            <span key={test} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">{test}</span>
                          ))}
                          {lab.tests.length > 4 && <span className="text-[10px] text-gray-500">+{lab.tests.length - 4} more</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><FiMapPin size={14} />{lab.distance?.toFixed(1)} km</span>
                          <span className="flex items-center gap-1"><FiClock size={14} />{lab.reportsIn}</span>
                          <span>⭐ {lab.rating}</span>
                        </div>
                        <div className="flex gap-2">
                          {lab.phone && (
                            <a href={`tel:${lab.phone}`}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition">
                              <FiPhone size={14} /> Call
                            </a>
                          )}
                          <button
                            onClick={() => { setSelectedLab(lab); setShowDirections(true); }}
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
        key={selectedLab?.id || 'default'}
        isOpen={showDirections}
        onClose={() => { setShowDirections(false); setSelectedLab(null); }}
        destination={selectedLab ? {
          name: selectedLab.name,
          address: selectedLab.address,
          lat: selectedLab.location.lat,
          lng: selectedLab.location.lng,
        } : { name: '', address: '', lat: 0, lng: 0 }}
        userLocation={userLocation || { lat: 28.6139, lng: 77.2090 }}
      />
    </div>
  );
}