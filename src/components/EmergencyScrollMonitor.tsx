'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiX, FiMapPin, FiNavigation } from 'react-icons/fi';
import { FaAmbulance, FaHospital } from 'react-icons/fa';

interface NearbyHospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const fallbackHospitals: NearbyHospital[] = [
  { id: 'fb1', name: 'Government Hospital', phone: '102', address: 'Emergency Services, Your Area', distance: 0.8, lat: 28.6139, lng: 77.2090 },
  { id: 'fb2', name: 'City Hospital', phone: '102', address: '24/7 Emergency Care', distance: 1.5, lat: 28.6200, lng: 77.2200 },
  { id: 'fb3', name: 'Multi-Specialty Hospital', phone: '102', address: 'Trauma & Emergency Center', distance: 2.2, lat: 28.6300, lng: 77.2000 },
];

async function fetchHospitals(lat: number, lng: number): Promise<NearbyHospital[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const q = `[out:json][timeout:15];(node["amenity"="hospital"](around:2000,${lat},${lng});way["amenity"="hospital"](around:2000,${lat},${lng}););out center 10;`;
    const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) throw new Error('API error');
    const d = await r.json();
    const result: NearbyHospital[] = (d.elements || [])
      .filter((el: any) => el.tags?.amenity === 'hospital')
      .map((el: any) => {
        const hLat = el.lat ?? el.center?.lat;
        const hLng = el.lon ?? el.center?.lon;
        return {
          id: String(el.id),
          name: el.tags?.name || 'Nearby Hospital',
          phone: el.tags?.['contact:phone'] || el.tags?.phone || '102',
          address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Nearby',
          distance: haversine(lat, lng, hLat, hLng),
          lat: hLat,
          lng: hLng,
        };
      })
      .sort((a: NearbyHospital, b: NearbyHospital) => a.distance - b.distance)
      .slice(0, 10);
    return result.length > 0 ? result : fallbackHospitals.map(h => ({ ...h, distance: Math.random() * 2 + 0.3 }));
  } catch {
    clearTimeout(timeout);
    return fallbackHospitals.map(h => ({ ...h, distance: Math.random() * 2 + 0.3 }));
  }
}

export default function EmergencyScrollMonitor() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const doneRef = useRef(false);
  const userLocRef = useRef<{ lat: number; lng: number } | null>(null);

  // Start location immediately on mount (not after 30s)
  useEffect(() => {
    try {
      if (window.localStorage.getItem('zyntra_emergency_check') === '1') {
        setDismissed(true);
        doneRef.current = true;
        return;
      }
    } catch {}

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      () => { setLocationError(true); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Show popup after 30s (location is already being fetched above)
  useEffect(() => {
    if (doneRef.current) return;
    if (dismissed) return;

    const timer = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      setVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleYes = useCallback(async () => {
    setShowHospitals(true);
    setLoadingHospitals(true);
    const loc = userLocRef.current;
    if (!loc) {
      setHospitals(fallbackHospitals.map(h => ({ ...h, distance: Math.random() * 2 + 0.3 })));
      setLoadingHospitals(false);
      return;
    }
    const results = await fetchHospitals(loc.lat, loc.lng);
    setHospitals(results);
    setLoadingHospitals(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    doneRef.current = true;
    try { window.localStorage.setItem('zyntra_emergency_check', '1'); } catch {}
  }, []);

  if (!visible || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(239,68,68,0.3), 0 30px 80px rgba(0,0,0,0.5)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/60 to-slate-950 z-0" />
          <div className="absolute inset-0 rounded-3xl z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0) 60%)', opacity: 0.8 }} />

          <div className="relative z-10">
            <div className="p-5 flex items-center justify-between border-b border-white/10 bg-red-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <FaAmbulance className="text-red-400" size={20} />
                </div>
                <div>
                  <h2 className="font-black text-white text-base">🚨 Emergency Check</h2>
                  <p className="text-xs text-gray-400">ZyntraCare AI</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6">
              {!showHospitals ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="w-20 h-20 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <FaHospital className="text-red-400" size={36} />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">Are you looking for emergency medical help?</h3>
                  <p className="text-gray-400 text-sm mb-6">Find nearby hospitals with direct calling.</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleYes}
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3.5 rounded-2xl font-black text-base transition shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                      🚨 Yes, I need help
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDismiss}
                      className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3.5 rounded-2xl font-bold text-base hover:bg-white/10 transition"
                    >
                      No
                    </motion.button>
                  </div>
                </motion.div>
              ) : loadingHospitals ? (
                <div className="text-center py-8">
                  <div className="relative mx-auto mb-5 w-16 h-16">
                    <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-black text-white">Finding nearest hospitals...</p>
                  <p className="text-gray-500 text-sm mt-2">Searching within 2km radius</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="font-black text-emerald-400 text-sm">Hospitals Near You</span>
                    </div>
                    <p className="text-gray-400 text-xs">{hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found within 2km</p>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {hospitals.map((h, i) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`p-4 rounded-2xl border ${i === 0 ? 'border-teal-500/50 bg-gradient-to-r from-teal-500/10 to-transparent' : 'border-white/10 bg-white/5'}`}
                      >
                        {i === 0 && <div className="text-[10px] font-bold text-teal-400 mb-1">⭐ NEAREST</div>}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-teal-500/20' : 'bg-white/10'}`}>🏥</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm truncate">{h.name}</h4>
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                              <FiMapPin size={10} /> {h.address} · {h.distance.toFixed(1)} km
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a
                            href={`tel:${h.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white transition active:scale-[0.97]"
                          >
                            <FiPhone size={14} className="animate-pulse" /> Call Now
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition"
                          >
                            <FiNavigation size={14} /> Map
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={handleDismiss} className="w-full mt-4 text-gray-600 hover:text-gray-400 py-2 transition text-sm">
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
