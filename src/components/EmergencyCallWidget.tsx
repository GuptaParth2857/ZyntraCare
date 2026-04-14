'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiX, FiPhone, FiNavigation,
  FiActivity, FiGrid, FiHeart, FiMapPin, FiClock, FiShield
} from 'react-icons/fi';
import { FaAmbulance, FaUserMd, FaHospital } from 'react-icons/fa';

interface Hospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  type: string;
  beds: { total: number; available: number };
  emergency: boolean;
  distance?: number;
  location: { lat: number; lng: number };
}

type EmergencyStage = 'idle' | 'locating' | 'ready' | 'error';

const INDIAN_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'AIIMS New Delhi', phone: '+91-11-2659-3308', address: 'Sri Aurobindo Marg, Ansari Nagar', city: 'New Delhi', state: 'Delhi', type: 'Government', beds: { total: 2478, available: 277 }, emergency: true, location: { lat: 28.5672, lng: 77.2100 } },
  { id: 'h2', name: 'Fortis Escorts Heart Institute', phone: '+91-11-4713-5000', address: 'Okhla Road, New Friends Colony', city: 'New Delhi', state: 'Delhi', type: 'Private', beds: { total: 340, available: 42 }, emergency: true, location: { lat: 28.5662, lng: 77.2831 } },
  { id: 'h3', name: 'Apollo Hospital Delhi', phone: '+91-11-2659-2829', address: 'Sarita Vihar', city: 'New Delhi', state: 'Delhi', type: 'Private', beds: { total: 710, available: 130 }, emergency: true, location: { lat: 28.5983, lng: 77.2256 } },
  { id: 'h4', name: 'Max Super Speciality Hospital', phone: '+91-11-2651-5050', address: 'Press Enclave Road, Saket', city: 'New Delhi', state: 'Delhi', type: 'Private', beds: { total: 500, available: 85 }, emergency: true, location: { lat: 28.5264, lng: 77.2138 } },
  { id: 'h5', name: 'Medanta The Medicity', phone: '+91-124-4141-414', address: 'Sector 38, DLF City', city: 'Gurgaon', state: 'Haryana', type: 'Private', beds: { total: 1250, available: 270 }, emergency: true, location: { lat: 28.4551, lng: 77.0442 } },
  { id: 'h6', name: 'KEM Hospital Mumbai', phone: '+91-22-2410-7000', address: 'Acharya Donde Marg, Parel', city: 'Mumbai', state: 'Maharashtra', type: 'Government', beds: { total: 1800, available: 180 }, emergency: true, location: { lat: 18.9956, lng: 72.8361 } },
  { id: 'h7', name: 'Tata Memorial Hospital', phone: '+91-22-2417-7000', address: 'Dr Ernest Borges Road, Parel', city: 'Mumbai', state: 'Maharashtra', type: 'Government', beds: { total: 629, available: 63 }, emergency: true, location: { lat: 18.9987, lng: 72.8129 } },
  { id: 'h8', name: 'Apollo Hospitals Chennai', phone: '+91-44-2829-3333', address: '21 Greams Lane, Off Greams Road', city: 'Chennai', state: 'Tamil Nadu', type: 'Private', beds: { total: 560, available: 112 }, emergency: true, location: { lat: 13.0601, lng: 80.2487 } },
  { id: 'h9', name: 'Manipal Hospitals Bangalore', phone: '+91-80-2222-1133', address: 'HAL 3rd Stage, New Thippasandra', city: 'Bangalore', state: 'Karnataka', type: 'Private', beds: { total: 600, available: 90 }, emergency: true, location: { lat: 12.9457, lng: 77.6015 } },
  { id: 'h10', name: 'Narayana Health City', phone: '+91-80-7121-2222', address: 'Bommasandra Industrial Area', city: 'Bangalore', state: 'Karnataka', type: 'Private', beds: { total: 2000, available: 300 }, emergency: true, location: { lat: 12.8387, lng: 77.6815 } },
  { id: 'h11', name: 'Fortis Hospital Bannerghatta', phone: '+91-80-6621-4444', address: 'Bannerghatta Road', city: 'Bangalore', state: 'Karnataka', type: 'Private', beds: { total: 280, available: 42 }, emergency: true, location: { lat: 12.8707, lng: 77.5966 } },
  { id: 'h12', name: 'PGIMER Chandigarh', phone: '+91-172-2756-002', address: 'Sector 12', city: 'Chandigarh', state: 'Punjab', type: 'Government', beds: { total: 2073, available: 207 }, emergency: true, location: { lat: 30.7648, lng: 76.7745 } },
  { id: 'h13', name: 'SGPGI Lucknow', phone: '+91-522-2660-014', address: 'Raibareli Road', city: 'Lucknow', state: 'Uttar Pradesh', type: 'Government', beds: { total: 1500, available: 150 }, emergency: true, location: { lat: 26.8451, lng: 80.9996 } },
  { id: 'h14', name: 'KGMU Lucknow', phone: '+91-522-2256-600', address: 'Chowk', city: 'Lucknow', state: 'Uttar Pradesh', type: 'Government', beds: { total: 3500, available: 350 }, emergency: true, location: { lat: 26.8499, lng: 80.9485 } },
  { id: 'h15', name: 'Civil Hospital Ahmedabad', phone: '+91-79-2268-3700', address: 'Asarwa', city: 'Ahmedabad', state: 'Gujarat', type: 'Government', beds: { total: 2200, available: 220 }, emergency: true, location: { lat: 23.0583, lng: 72.5866 } },
  { id: 'h16', name: 'Sterling Hospital Ahmedabad', phone: '+91-79-4001-4001', address: 'Memnagar', city: 'Ahmedabad', state: 'Gujarat', type: 'Private', beds: { total: 570, available: 85 }, emergency: true, location: { lat: 23.0401, lng: 72.5500 } },
  { id: 'h17', name: 'Ruby Hall Clinic Pune', phone: '+91-20-6645-5500', address: 'Sassoon Road', city: 'Pune', state: 'Maharashtra', type: 'Private', beds: { total: 450, available: 67 }, emergency: true, location: { lat: 18.5362, lng: 73.8795 } },
  { id: 'h18', name: 'Jehangir Hospital Pune', phone: '+91-20-6680-7999', address: 'Jahangir Hospital Avenue', city: 'Pune', state: 'Maharashtra', type: 'Private', beds: { total: 350, available: 52 }, emergency: true, location: { lat: 18.5309, lng: 73.8770 } },
];

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EmergencyCallWidget() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const cities = [...new Set(INDIAN_HOSPITALS.map(h => h.city))].sort();

  const startSOS = useCallback(() => {
    setIsSOSOpen(true);
    setIsMenuOpen(false);
    setStage('locating');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setStage('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        
        const nearby = INDIAN_HOSPITALS.map(h => ({
          ...h,
          distance: calcDistance(lat, lng, h.location.lat, h.location.lng)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 10);
        
        setHospitals(nearby);
        setStage('ready');
      },
      (err) => {
        setLocationError('Location access denied - showing all major hospitals');
        setHospitals(INDIAN_HOSPITALS.slice(0, 10));
        setStage('ready');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const closeSOSModal = useCallback(() => {
    setIsSOSOpen(false);
    setStage('idle');
    setHospitals([]);
    setLocationError('');
  }, []);

  const filteredHospitals = selectedCity === 'all' 
    ? hospitals 
    : hospitals.filter(h => h.city === selectedCity);

  const MENU_ITEMS = [
    { label: 'Symptom Check', icon: <FiActivity size={18} />, color: 'from-teal-500 to-cyan-600', action: () => window.location.href = '/symptoms' },
    { label: 'Medicines', icon: <FiGrid size={18} />, color: 'from-purple-500 to-indigo-600', action: () => window.location.href = '/medicines' },
    { label: 'Medical ID', icon: <FiHeart size={18} />, color: 'from-pink-500 to-rose-600', action: () => window.location.href = '/medical-id' },
    { label: 'SOS Emergency', icon: <FiPhone size={18} />, color: 'from-red-500 to-rose-700', action: startSOS },
  ];

  return (
    <>
      {/* LEFT — Plus Hub Button + Menu */}
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

      {/* RIGHT — Standalone SOS button */}
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
                      {stage === 'locating' ? 'Getting your location...' : stage === 'ready' ? `${filteredHospitals.length} hospitals available` : 'Tap to find hospitals'}
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

                {/* City Filter */}
                {stage === 'ready' && cities.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button onClick={() => setSelectedCity('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCity === 'all' ? 'bg-sky-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                      All Cities
                    </button>
                    {cities.slice(0, 6).map(city => (
                      <button key={city} onClick={() => setSelectedCity(city)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCity === city ? 'bg-sky-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                )}

                {/* Status */}
                {stage === 'locating' && (
                  <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    <div>
                      <p className="text-white font-semibold text-sm">Getting your location...</p>
                      <p className="text-blue-400 text-xs">Please allow location access</p>
                    </div>
                  </div>
                )}

                {stage === 'error' && (
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                    <p className="text-orange-400 font-semibold text-sm">{locationError}</p>
                  </div>
                )}

                {/* Hospital List */}
                {stage === 'ready' && filteredHospitals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs font-bold">{filteredHospitals.length} hospitals found</span>
                      {userLocation && <span className="text-green-400/60 text-xs">(GPS Active)</span>}
                    </div>
                    
                    {filteredHospitals.map(h => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-bold text-sm truncate">{h.name}</h3>
                              {h.emergency && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">24/7</span>}
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{h.address}, {h.city}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="flex items-center gap-1 text-gray-500">
                                <FiMapPin size={12} /> {h.distance ? `${h.distance.toFixed(1)} km` : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <FaUserMd size={12} /> {h.beds.available} beds free
                              </span>
                              <span className={`flex items-center gap-1 ${h.type === 'Government' ? 'text-blue-400' : 'text-purple-400'}`}>
                                {h.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {/* Direct Call */}
                          <a href={`tel:${h.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition">
                            <FiPhone size={14} /> Call Now
                          </a>
                          {/* Directions */}
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.location.lat},${h.location.lng}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition">
                            <FiNavigation size={14} />
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
                      { label: 'Police', num: '100', icon: '👮' },
                      { label: 'Fire', num: '101', icon: '🔥' },
                      { label: 'Ambulance', num: '102', icon: '🚑' },
                      { label: 'Emergency', num: '112', icon: '🚨' },
                    ].map(h => (
                      <a key={h.num} href={`tel:${h.num}`} className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-white/8 text-white hover:bg-white/5 transition">
                        <span className="text-lg">{h.icon}</span>
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
