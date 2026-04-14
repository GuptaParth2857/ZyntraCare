'use client';

/**
 * GlobalActionHub — Two-part floating UI:
 *
 *  LEFT (bottom-left):  Plus button → opens menu with Check, Meds, ID, SOS options
 *  RIGHT (bottom-right): Standalone SOS-only emergency button (always visible)
 *
 * All other floating widgets (MedicalID, MedicineReminder, SymptomChecker)
 * are accessible ONLY through the plus menu — not floating separately.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiX, FiPhoneCall, FiNavigation,
  FiActivity, FiGrid, FiHeart
} from 'react-icons/fi';
import { FaAmbulance } from 'react-icons/fa';

interface NearbyHospital {
  id: string; name: string; phone: string;
  address: string; distance: number; lat: number; lng: number;
}

type EmergencyStage = 'idle' | 'locating' | 'fetching' | 'tracking' | 'error';

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyHospitals(lat: number, lng: number): Promise<NearbyHospital[]> {
  try {
    const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:10000,${lat},${lng});way["amenity"="hospital"](around:10000,${lat},${lng});node["amenity"="clinic"](around:10000,${lat},${lng}););out center 8;`;
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: String(el.id),
        name: el.tags.name,
        phone: el.tags['contact:phone'] || el.tags.phone || '',
        address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || 'See on Maps',
        distance: calcDistance(lat, lng, el.lat ?? el.center?.lat, el.lon ?? el.center?.lon),
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
      }))
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 6);
  } catch { return []; }
}

/* ─────────────────────────────────────────────────────────── */

export default function GlobalActionHub() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen]   = useState(false);
  const [stage, setStage]           = useState<EmergencyStage>('idle');
  const [hospitals, setHospitals]   = useState<NearbyHospital[]>([]);
  const [locationError, setLocationError] = useState('');

  const startSOS = useCallback(() => {
    setIsSOSOpen(true);
    setIsMenuOpen(false);
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); setStage('error'); return; }
    setStage('locating');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setStage('fetching');
      const results = await fetchNearbyHospitals(lat, lng);
      if (results.length > 0) { setHospitals(results); setStage('tracking'); }
      else { setLocationError('No hospitals found nearby'); setStage('error'); }
    }, () => { setLocationError('Enable location access to find hospitals'); setStage('error'); });
  }, []);

  const closeSOSModal = useCallback(() => {
    setIsSOSOpen(false);
    setStage('idle');
    setHospitals([]);
    setLocationError('');
  }, []);

  /* ── Plus menu actions ── */
  const MENU_ITEMS = [
    { label: 'Symptom Check',    icon: <FiActivity size={18} />,  color: 'from-teal-500 to-cyan-600',    href: '/symptoms' },
    { label: 'Medicines',        icon: <FiGrid size={18} />,       color: 'from-purple-500 to-indigo-600', href: '/medicines' },
    { label: 'Medical ID',       icon: <FiHeart size={18} />,      color: 'from-pink-500 to-rose-600',    href: '/medical-id' },
    { label: 'SOS Emergency',    icon: <FiPhoneCall size={18} />,  color: 'from-red-500 to-rose-700',     action: startSOS },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          LEFT — Plus Hub Button + Menu (bottom-left)
          ══════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-6 z-[9990] flex flex-col items-start">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col-reverse gap-3 mb-4"
            >
              {MENU_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0,   opacity: 1 }}
                  exit={{ x: -20,    opacity: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280 }}
                  className="flex items-center gap-3 group"
                >
                  {/* Label tooltip */}
                  <span className="bg-slate-900/95 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                    {item.label}
                  </span>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (item.action) item.action();
                      else if (item.href) window.location.href = item.href;
                    }}
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

        {/* Plus / Close button — CSS pulse, not Framer Infinity */}
        <button
          onClick={() => setIsMenuOpen(v => !v)}
          aria-label={isMenuOpen ? 'Close quick actions' : 'Open quick actions'}
          aria-expanded={isMenuOpen}
          className="w-14 h-14 rounded-full flex items-center justify-center text-blue-400 border-2 border-blue-500/50 relative overflow-hidden hub-pulse transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)' }}
        >
          <div className="absolute inset-0 bg-blue-500/10 hover:bg-blue-500/20 transition-colors" />
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="relative z-10">
            {isMenuOpen
              ? <FiX size={24} className="text-red-400" />
              : <FiPlus size={24} className="text-blue-400" />
            }
          </motion.div>
          {/* Notification badge when closed */}
          {!isMenuOpen && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-black border-2 border-slate-900 animate-pulse">
              4
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Standalone SOS button (bottom-right)
          Always visible. Red. Pulsing rings.
          ══════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-[9990]">
        <button
          onClick={startSOS}
          aria-label="Emergency SOS — call nearest hospital"
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xs tracking-wider active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            boxShadow: '0 0 0 0 rgba(220,38,38,0)',
          }}
        >
          {/* 3 expanding pulse rings — CSS only */}
          <span className="absolute inset-0 rounded-full bg-red-500/40 sos-ring"  aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-red-500/25 sos-ring-2" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-red-500/15 sos-ring-3" aria-hidden="true" />
          <span className="relative z-10 flex flex-col items-center leading-none">
            <FiPhoneCall size={20} />
            <span className="text-[9px] font-black mt-0.5 tracking-widest">SOS</span>
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════
          SOS MODAL — Bottom sheet (mobile) / centered (desktop)
          ══════════════════════════════════════════ */}
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
              className="w-full md:max-w-md flex flex-col max-h-[90vh] overflow-hidden"
              style={{
                borderRadius: '28px 28px 0 0',
                background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(10,15,30,1) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/8" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.9), rgba(153,27,27,0.95))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FiPhoneCall size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg leading-none">Emergency Center</h2>
                    <p className="text-red-200 text-xs mt-0.5">Finding nearest hospitals...</p>
                  </div>
                </div>
                <button
                  onClick={closeSOSModal}
                  aria-label="Close emergency panel"
                  className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Quick call buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:112" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}>
                    <FiPhoneCall size={16} /> Call 112
                  </a>
                  <a href="tel:102" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #9a3412)', boxShadow: '0 4px 20px rgba(234,88,12,0.4)' }}>
                    <FaAmbulance size={16} /> Ambulance 102
                  </a>
                </div>

                {/* Status */}
                {stage === 'locating' && (
                  <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Getting your location...</p>
                      <p className="text-blue-400 text-xs mt-0.5">Please allow location access</p>
                    </div>
                  </div>
                )}

                {stage === 'fetching' && (
                  <div className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Scanning nearby hospitals...</p>
                      <p className="text-teal-400 text-xs mt-0.5">Via OpenStreetMap API</p>
                    </div>
                  </div>
                )}

                {stage === 'tracking' && hospitals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs font-bold">GPS Active — {hospitals.length} hospitals found</span>
                    </div>
                    {hospitals.map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-white font-bold text-sm truncate">{h.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{h.distance.toFixed(1)} km away</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {h.phone && (
                            <a href={`tel:${h.phone}`} aria-label={`Call ${h.name}`}
                              className="w-9 h-9 bg-green-600 hover:bg-green-500 rounded-xl flex items-center justify-center text-white transition">
                              <FiPhoneCall size={14} />
                            </a>
                          )}
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                            target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${h.name}`}
                            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition">
                            <FiNavigation size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {stage === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                    <p className="text-red-400 font-semibold text-sm">{locationError}</p>
                    <button onClick={startSOS} className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition font-semibold">
                      Try Again →
                    </button>
                  </div>
                )}

                {/* Nationwide helplines */}
                <div className="pt-2 border-t border-white/8">
                  <p className="text-white/30 text-xs font-semibold mb-2 uppercase tracking-widest">National Helplines</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Police', num: '100' },
                      { label: 'Fire', num: '101' },
                      { label: 'Ambulance', num: '102' },
                      { label: 'Emergency', num: '112' },
                    ].map(h => (
                      <a key={h.num} href={`tel:${h.num}`}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/8 text-white hover:bg-white/5 transition"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-gray-400">{h.label}</span>
                        <span className="font-bold text-white">{h.num}</span>
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
