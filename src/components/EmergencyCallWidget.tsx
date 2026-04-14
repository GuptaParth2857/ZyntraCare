'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiX, FiPhone, FiNavigation, FiMapPin, FiCrosshair,
  FiActivity, FiGrid, FiHeart, FiClock, FiShield, FiAlertCircle
} from 'react-icons/fi';
import { FaAmbulance, FaHospital, FaUserMd, FaBed } from 'react-icons/fa';

interface Hospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  distance?: number;
  beds?: { total: number; available: number };
  emergency?: boolean;
  location: { lat: number; lng: number };
  type?: string;
}

type EmergencyStage = 'idle' | 'locating' | 'fetching' | 'ready' | 'error';

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchRealNearbyHospitals(lat: number, lng: number): Promise<Hospital[]> {
  const radius = 30000; // 30km radius
  const query = `[out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center 20;`;

  try {
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(15000)
    });
    
    if (!res.ok) throw new Error('API failed');
    
    const data = await res.json();
    const hospitals: Hospital[] = (data.elements || [])
      .filter((el: any) => el.tags?.name && (el.tags.amenity === 'hospital' || el.tags.amenity === 'clinic'))
      .map((el: any) => {
        const hLat = el.lat ?? el.center?.lat;
        const hLng = el.lon ?? el.center?.lon;
        return {
          id: String(el.id),
          name: el.tags.name,
          phone: el.tags['contact:phone'] || el.tags.phone || '',
          address: [el.tags['addr:street'], el.tags['addr:city'], el.tags['addr:state']].filter(Boolean).join(', '),
          city: el.tags['addr:city'] || 'Nearby',
          distance: calculateHaversine(lat, lng, hLat, hLng),
          location: { lat: hLat, lng: hLng },
          emergency: el.tags.emergency === 'yes' || el.tags['emergency:ward'] === 'yes',
          beds: { total: 0, available: 0 },
          type: el.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
        };
      })
      .sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 15);
    
    return hospitals;
  } catch (error) {
    console.error('Hospital fetch error:', error);
    return [];
  }
}

export default function EmergencyCallWidget() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const startSOS = useCallback(() => {
    setIsSOSOpen(true);
    setIsMenuOpen(false);
    setStage('locating');
    setLocationError('');
    setHospitals([]);
    setSelectedHospital(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setStage('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setStage('fetching');
        
        const results = await fetchRealNearbyHospitals(lat, lng);
        
        if (results.length > 0) {
          setHospitals(results);
          setStage('ready');
        } else {
          setLocationError('No hospitals found in 30km radius');
          setStage('error');
        }
      },
      (err) => {
        let msg = 'Location access denied';
        if (err.code === 1) msg = 'Please enable location access';
        else if (err.code === 2) msg = 'Location unavailable';
        else if (err.code === 3) msg = 'Location timeout';
        setLocationError(msg);
        setStage('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const closeSOSModal = useCallback(() => {
    setIsSOSOpen(false);
    setStage('idle');
    setHospitals([]);
    setLocationError('');
    setSelectedHospital(null);
  }, []);

  const MENU_ITEMS = [
    { label: 'Symptom Check', icon: <FiActivity size={18} />, color: 'from-teal-500 to-cyan-600', action: () => window.location.href = '/symptoms' },
    { label: 'Medicines', icon: <FiGrid size={18} />, color: 'from-purple-500 to-indigo-600', action: () => window.location.href = '/medicines' },
    { label: 'Medical ID', icon: <FiHeart size={18} />, color: 'from-pink-500 to-rose-600', action: () => window.location.href = '/medical-id' },
    { label: 'SOS Emergency', icon: <FiPhone size={18} />, color: 'from-red-500 to-rose-700', action: startSOS },
  ];

  return (
    <>
      {/* LEFT — Plus Hub Button */}
      <div className="fixed bottom-6 left-6 z-[9990] flex flex-col items-start">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col-reverse gap-3 mb-4"
            >
              {MENU_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-slate-900/95 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                  <button
                    onClick={() => { setIsMenuOpen(false); item.action?.(); }}
                    aria-label={item.label}
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xl border border-white/20 hover:scale-110 active:scale-95 transition-transform`}
                  >
                    {item.icon}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsMenuOpen(v => !v)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="w-14 h-14 rounded-full flex items-center justify-center text-blue-400 border-2 border-blue-500/50 relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)' }}
        >
          <div className="absolute inset-0 bg-blue-500/10 hover:bg-blue-500/20 transition-colors" />
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="relative z-10">
            {isMenuOpen ? <FiX size={24} className="text-red-400" /> : <FiPlus size={24} className="text-blue-400" />}
          </motion.div>
        </button>
      </div>

      {/* RIGHT — SOS Button */}
      <div className="fixed bottom-6 right-6 z-[9990]">
        <button
          onClick={startSOS}
          aria-label="Emergency SOS"
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xs tracking-wider active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
        >
          <span className="absolute inset-0 rounded-full bg-red-500/40 sos-ring" />
          <span className="absolute inset-0 rounded-full bg-red-500/25 sos-ring-2" />
          <span className="absolute inset-0 rounded-full bg-red-500/15 sos-ring-3" />
          <span className="relative z-10 flex flex-col items-center leading-none">
            <FiPhone size={20} />
            <span className="text-[9px] font-black mt-0.5 tracking-widest">SOS</span>
          </span>
        </button>
      </div>

      {/* SOS MODAL */}
      <AnimatePresence>
        {isSOSOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) closeSOSModal(); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-full md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
              style={{ borderRadius: '28px 28px 0 0', background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/8" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.95), rgba(153,27,27,1))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaHospital size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg">Emergency Center</h2>
                    <p className="text-red-200 text-xs mt-0.5">
                      {stage === 'locating' && 'Getting your location...'}
                      {stage === 'fetching' && 'Finding nearby hospitals...'}
                      {stage === 'ready' && `${hospitals.length} hospitals found near you`}
                      {stage === 'error' && 'Location issue'}
                    </p>
                  </div>
                </div>
                <button onClick={closeSOSModal} className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition">
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Quick Emergency Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:112" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition active:scale-95" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                    <FiPhone size={16} /> Call 112
                  </a>
                  <a href="tel:102" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition active:scale-95" style={{ background: 'linear-gradient(135deg, #ea580c, #9a3412)' }}>
                    <FaAmbulance size={16} /> 102
                  </a>
                </div>

                {/* Status Indicators */}
                {stage === 'locating' && (
                  <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    <div>
                      <p className="text-white font-semibold text-sm">Getting your live location...</p>
                      <p className="text-blue-400 text-xs">Please allow location access</p>
                    </div>
                  </div>
                )}

                {stage === 'fetching' && (
                  <div className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                    <div>
                      <p className="text-white font-semibold text-sm">Searching hospitals near you...</p>
                      <p className="text-teal-400 text-xs">Using GPS: {userLocation?.lat.toFixed(4)}, {userLocation?.lng.toFixed(4)}</p>
                    </div>
                  </div>
                )}

                {stage === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <FiAlertCircle className="text-red-400" size={24} />
                      <div>
                        <p className="text-red-400 font-semibold">{locationError}</p>
                        <p className="text-red-300/60 text-xs mt-1">Please enable location services and try again</p>
                      </div>
                    </div>
                    <button onClick={startSOS} className="mt-3 w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold text-sm">
                      Try Again
                    </button>
                  </div>
                )}

                {/* Hospital List - Sorted by Distance */}
                {stage === 'ready' && hospitals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                      <FiCrosshair className="text-green-400" size={14} />
                      <span className="text-green-400 text-xs font-bold">Live GPS Active</span>
                      <span className="text-green-400/60 text-xs">• Nearest hospitals</span>
                    </div>
                    
                    {hospitals.map((h, i) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-bold text-sm truncate">{h.name}</h3>
                              {h.emergency && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">24/7</span>}
                              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">{h.type}</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{h.address || h.city}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-sky-400">
                                <FiMapPin size={12} />
                                {h.distance ? `${h.distance.toFixed(1)} km` : 'N/A'}
                              </span>
                              {i === 0 && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                  NEAREST
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {h.phone ? (
                            <a href={`tel:${h.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition">
                              <FiPhone size={14} /> Call
                            </a>
                          ) : (
                            <a href={`https://www.google.com/search?q=${encodeURIComponent(h.name + ' hospital phone')}`} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-slate-600 text-white transition">
                              <FiPhone size={14} /> Find Phone
                            </a>
                          )}
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.location.lat},${h.location.lng}`} target="_blank" rel="noopener" className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition">
                            <FiNavigation size={16} />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* National Helplines */}
                <div className="pt-2 border-t border-white/8">
                  <p className="text-white/30 text-xs font-semibold mb-2 uppercase tracking-widest">National Emergency</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Police', num: '100' },
                      { label: 'Fire', num: '101' },
                      { label: 'Ambulance', num: '102' },
                      { label: 'Emergency', num: '112' },
                    ].map(h => (
                      <a key={h.num} href={`tel:${h.num}`} className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-white/8 text-white hover:bg-white/5 transition">
                        <span className="font-bold text-white">{h.num}</span>
                        <span className="text-[10px] text-gray-500">{h.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
