'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMapPin, FiNavigation, FiAlertCircle, FiCheck, FiX, FiPhoneCall, FiRefreshCw, FiTarget, FiExternalLink, FiPlus, FiHeart, FiGrid, FiActivity } from 'react-icons/fi';
import { FaAmbulance, FaHospital } from 'react-icons/fa';

interface NearbyHospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  source: 'osm' | 'fallback';
}

type EmergencyStage = 'idle' | 'locating' | 'fetching' | 'tracking' | 'calling' | 'error';

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchRealNearbyHospitals(lat: number, lng: number): Promise<NearbyHospital[]> {
  try {
    const radius = 10000;
    const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng}););out center 10;`;
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return (data.elements || []).filter((el: any) => el.tags?.name).map((el: any) => ({
      id: String(el.id),
      name: el.tags.name,
      phone: el.tags['contact:phone'] || el.tags.phone || '',
      address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || 'See on Maps',
      distance: calcDistance(lat, lng, el.lat ?? el.center?.lat, el.lon ?? el.center?.lon),
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
      source: 'osm' as const,
    })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 6);
  } catch { return []; }
}

export default function GlobalActionHub() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<NearbyHospital[]>([]);
  const [locationError, setLocationError] = useState('');
  const [addressLabel, setAddressLabel] = useState('');

  const watchIdRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const loadHospitals = useCallback(async (lat: number, lng: number) => {
    setStage('fetching');
    const results = await fetchRealNearbyHospitals(lat, lng);
    if (results.length > 0) {
      setNearestHospitals(results);
      setStage('tracking');
    } else {
      setLocationError('No hospitals found nearby.');
      setStage('error');
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Not supported');
      return;
    }
    setStage('locating');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      await loadHospitals(pos.coords.latitude, pos.coords.longitude);
    }, () => {
      setLocationError('Enable location access');
      setStage('error');
    });
  }, [loadHospitals]);

  return (
    <>
      {/* Floating Action Hub — Pack everything into 1 button to save space */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              className="flex flex-col-reverse gap-4 mb-4"
            >
              {[
                { label: 'Check', icon: <FiActivity />, color: 'from-teal-500 to-cyan-600', link: '/symptoms' },
                { label: 'Meds', icon: <FiGrid />, color: 'from-purple-500 to-indigo-600', link: '/medicines' },
                { label: 'ID', icon: <FiHeart />, color: 'from-pink-500 to-rose-600', link: '/medical-id' },
                { label: 'SOS', icon: <FiPhoneCall />, color: 'from-red-500 to-rose-700', action: () => { setIsSOSOpen(true); startTracking(); } },
              ].map((btn, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xl border border-white/10">
                    {btn.label}
                  </span>
                  <button
                    onClick={() => btn.action ? btn.action() : window.location.href = btn.link || '#'}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${btn.color} flex items-center justify-center text-white shadow-lg border-2 border-white/20 hover:scale-110 transition`}
                  >
                    {btn.icon}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Hub Menu Button — GPU OPTIMIZED ANIMATION */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }} // Important for lag-free
          className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] border-2 border-blue-500/50 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} className="z-10">
            <FiPlus size={28} className={isMenuOpen ? 'text-red-400' : 'text-blue-400'} />
          </motion.div>
          {!isMenuOpen && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-slate-900 animate-pulse">
              4
            </div>
          )}
        </motion.button>
      </div>

      {/* SOS Backdrop & Modal */}
      <AnimatePresence>
        {isSOSOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
          >
             <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full md:max-w-md bg-slate-900 rounded-t-3xl md:rounded-3xl border-t border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* SOS Modal Content (Same as before but with better CSS) */}
              <div className="bg-red-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiPhoneCall className="text-white text-2xl animate-pulse" />
                  <h2 className="text-white font-bold text-lg">Emergency Center</h2>
                </div>
                <button onClick={() => { setIsSOSOpen(false); stopTracking(); }} className="text-white bg-white/20 p-2 rounded-full"><FiX /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {stage === 'locating' && (
                  <div className="text-center py-10">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiNavigation className="text-blue-400 text-2xl" />
                    </motion.div>
                    <p className="text-white font-bold">Getting Location...</p>
                  </div>
                )}
                {stage === 'tracking' && (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-green-400 text-xs font-bold uppercase">GPS Active</span>
                    </div>
                    {nearestHospitals.map(h => (
                      <div key={h.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">{h.name}</p>
                          <p className="text-gray-400 text-[10px]">{h.distance.toFixed(1)} km away</p>
                        </div>
                        <a href={`tel:${h.phone}`} className="bg-green-600 text-white p-2 rounded-lg"><FiPhoneCall size={14} /></a>
                      </div>
                    ))}
                    <button onClick={() => window.location.href = 'tel:102'} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 hover:shadow-lg shadow-red-500/20 transition-all">
                      <FaAmbulance /> Call Ambulance 102
                    </button>
                  </div>
                )}
                {stage === 'error' && <p className="text-red-400 text-center py-10">{locationError}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
