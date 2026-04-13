'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMapPin, FiNavigation, FiAlertCircle, FiCheck, FiX, FiPhoneCall, FiRefreshCw, FiTarget } from 'react-icons/fi';
import { FaAmbulance, FaHospital } from 'react-icons/fa';
import { hospitals as allHospitals } from '@/data/mockData';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  specialties: string[];
  beds: { total: number; occupied: number; available: number; icu: number; icuAvailable: number };
  emergency: boolean;
  location: { lat: number; lng: number };
  rating: number;
  distance?: number;
}

type EmergencyStage = 'idle' | 'locating' | 'tracking' | 'calling' | 'connected' | 'error';

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestHospitals(lat: number, lng: number, limit: number = 5) {
  const withDistance = allHospitals.map(h => ({
    ...h,
    distance: calcDistance(lat, lng, h.location.lat, h.location.lng),
  }));
  
  return withDistance
    .filter(h => h.emergency && h.beds.available > 0)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, limit);
}

export default function EmergencyCallWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([]);
  const [locationError, setLocationError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const selectedHospitalRef = useRef<Hospital | null>(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingActive(false);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setStage('error');
      return;
    }

    setStage('locating');
    setLocationError('');

    // First get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        const nearest = findNearestHospitals(latitude, longitude, 5);
        if (nearest.length > 0) {
          setNearestHospitals(nearest);
          setStage('tracking');
          setLastUpdate(new Date());
          setTrackingActive(true);
        } else {
          setLocationError('No emergency hospitals found nearby');
          setStage('error');
        }
      },
      (error) => {
        setLocationError(error.message);
        setStage('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Then start continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Recalculate nearest hospitals as user moves
        const nearest = findNearestHospitals(latitude, longitude, 5);
        setNearestHospitals(nearest);
        setLastUpdate(new Date());
        
        // Auto-select nearest hospital
        if (nearest.length > 0) {
          selectedHospitalRef.current = nearest[0];
        }
      },
      (error) => {
        console.warn('Tracking error:', error.message);
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000 
      }
    );
  }, []);

  const handleEmergencyCall = () => {
    setIsOpen(true);
    setShowInstructions(true);
    setTimeout(() => {
      setShowInstructions(false);
      startTracking();
    }, 2000);
  };

  const handleCallHospital = (hospital: Hospital) => {
    if (hospital?.phone) {
      setStage('calling');
      selectedHospitalRef.current = hospital;
      
      // Stop tracking when call is made
      stopTracking();
      window.location.href = `tel:${hospital.phone}`;
      
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleAutoCallNearest = () => {
    if (nearestHospitals.length > 0 && nearestHospitals[0]) {
      handleCallHospital(nearestHospitals[0]);
    }
  };

  const handleCallAmbulance = () => {
    stopTracking();
    window.location.href = 'tel:102';
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopTracking();
    setIsOpen(false);
    setStage('idle');
    setCallDuration(0);
    setNearestHospitals([]);
    setUserLocation(null);
    setShowInstructions(false);
    setTrackingActive(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      {/* Floating Emergency Button - HIDDEN on mobile, visible md+ */}
      <div className="hidden md:block">
      <motion.button
        initial={{ scale: 1, transform: 'none' }}
        onClick={handleEmergencyCall}
        className="fixed bottom-[270px] left-6 z-[9999] flex flex-col items-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="relative w-[70px] h-[70px] bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 border-4 border-white">
            <FiPhoneCall className="text-white text-3xl" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            <span className="text-white text-[10px] font-black">SOS</span>
          </div>
          {trackingActive && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white animate-ping">
              <FiTarget className="text-white text-[8px]" />
            </div>
          )}
        </div>
        <span className="text-[9px] font-bold text-white mt-2 drop-shadow-lg bg-red-500/80 px-2 py-1 rounded-full">SOS</span>
      </motion.button>
      </div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !trackingActive && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                  aria-label="Close emergency widget"
                >
                  <FiX size={16} aria-hidden="true" />
                </button>
                
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={stage === 'locating' || trackingActive ? { rotate: 360 } : {}}
                    transition={stage === 'locating' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    {stage === 'idle' || showInstructions ? (
                      <FiPhoneCall className="text-white text-xl" />
                    ) : stage === 'locating' ? (
                      <FiNavigation className="text-white text-xl animate-pulse" />
                    ) : stage === 'tracking' ? (
                      <FiTarget className="text-white text-xl" />
                    ) : stage === 'calling' ? (
                      <FiPhone className="text-white text-xl animate-pulse" />
                    ) : stage === 'connected' ? (
                      <FiCheck className="text-white text-xl" />
                    ) : (
                      <FiAlertCircle className="text-white text-xl" />
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {stage === 'idle' && showInstructions ? 'Emergency Help' :
                       stage === 'locating' ? 'Finding You...' :
                       stage === 'tracking' ? 'Live Tracking' :
                       stage === 'calling' ? 'Calling...' :
                       stage === 'connected' ? 'Connected!' :
                       'Error'}
                    </h2>
                    <p className="text-red-100 text-sm flex items-center gap-1">
                      {trackingActive && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                      {stage === 'tracking' && userLocation ? (
                        <>
                          Tracking: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </>
                      ) : stage === 'locating' ? (
                        'Finding your location...'
                      ) : locationError}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Instructions */}
                {showInstructions && stage === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3 bg-blue-500/10 rounded-xl p-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <FiMapPin className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">1. Real-Time Tracking</p>
                        <p className="text-xs text-gray-400">GPS tracks you continuously</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-green-500/10 rounded-xl p-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <FaHospital className="text-green-400" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">2. Auto-Updating Hospitals</p>
                        <p className="text-xs text-gray-400">Nearest hospital updates as you move</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-red-500/10 rounded-xl p-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <FiPhoneCall className="text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">3. One-Tap Call</p>
                        <p className="text-xs text-gray-400">Direct call to nearest hospital</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Locating */}
                {stage === 'locating' && (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <FiNavigation className="text-blue-400 text-3xl" />
                    </motion.div>
                    <p className="text-white font-semibold">Getting your location...</p>
                    <p className="text-gray-400 text-sm mt-1">Please enable location access</p>
                  </div>
                )}

                {/* Live Tracking Mode */}
                {stage === 'tracking' && (
                  <div className="space-y-4">
                    {/* Live Location Card */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400 font-bold text-sm">LIVE TRACKING ACTIVE</span>
                        </div>
                        {lastUpdate && (
                          <span className="text-gray-500 text-xs">
                            Updated: {formatTime(lastUpdate)}
                          </span>
                        )}
                      </div>
                      
                      {userLocation && (
                        <div className="bg-white/5 rounded-lg p-2 mb-3">
                          <p className="text-gray-400 text-xs">Your Location</p>
                          <p className="text-white text-sm font-mono">
                            {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      )}

                      {/* Auto-Call Nearest Hospital */}
                      {nearestHospitals.length > 0 && (
                        <motion.button
                          initial={{ scale: 0.9 }}
                          animate={{ scale: [0.9, 1, 0.9] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          onClick={handleAutoCallNearest}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 transition-all animate-pulse"
                        >
                          <FiPhoneCall size={24} />
                          <span className="text-lg">📞 Call Nearest: {nearestHospitals[0]?.name}</span>
                        </motion.button>
                      )}
                    </div>

                    {/* Hospital List */}
                    <div className="space-y-2">
                      <p className="text-gray-400 text-xs font-semibold">🏥 Nearest Hospitals (Auto-Updated)</p>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {nearestHospitals.map((hospital, index) => (
                          <motion.div
                            key={hospital.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white/5 border rounded-xl p-3 transition-all ${
                              index === 0 ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <h3 className={`font-bold text-sm ${index === 0 ? 'text-green-400' : 'text-white'}`}>
                                    {hospital.name}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500">{hospital.distance?.toFixed(1)} km</p>
                                    {index === 0 && <p className="text-[8px] text-green-500 font-semibold">NEAREST</p>}
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-green-400 font-semibold">{hospital.beds.available} beds</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-blue-400 font-semibold">{hospital.beds.icuAvailable} ICU</p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCallHospital(hospital)}
                                className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                                  index === 0 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                <FiPhoneCall size={12} />
                                Call
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Ambulance Button */}
                    <button
                      onClick={handleCallAmbulance}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 border border-red-500/30 text-red-400 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all"
                    >
                      <FaAmbulance size={20} />
                      <span>Call Ambulance (102)</span>
                    </button>
                  </div>
                )}

                {/* Calling */}
                {stage === 'calling' && (
                  <div className="text-center py-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                      <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                        <FiPhoneCall className="text-white text-3xl animate-pulse" />
                      </div>
                    </div>
                    <p className="text-white font-semibold mb-1">Calling {selectedHospitalRef.current?.name}...</p>
                    <p className="text-gray-400 text-sm mb-4">{selectedHospitalRef.current?.phone}</p>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-mono">{formatDuration(callDuration)}</span>
                    </div>
                  </div>
                )}

                {/* Connected */}
                {stage === 'connected' && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <FiCheck className="text-white text-3xl" />
                    </motion.div>
                    <h3 className="text-white font-bold text-lg mb-2">Call Connected!</h3>
                    <p className="text-gray-400 text-sm mb-2">{selectedHospitalRef.current?.name}</p>
                    <p className="text-green-400 font-mono text-xl">{formatDuration(callDuration)}</p>
                  </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <FiAlertCircle className="text-red-400 text-3xl" />
                    </div>
                    <h3 className="text-white font-bold">Unable to Track</h3>
                    <p className="text-gray-400 text-sm">{locationError || 'Please enable location access'}</p>
                    
                    <div className="space-y-2">
                      <button
                        onClick={startTracking}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        <FiRefreshCw size={16} /> Try Again
                      </button>
                      <button
                        onClick={handleCallAmbulance}
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        <FaAmbulance size={16} /> Call Ambulance (102)
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions - Initial State */}
                {stage === 'idle' && !showInstructions && (
                  <div className="space-y-2">
                    <button
                      onClick={startTracking}
                      className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]"
                    >
                      <FiTarget size={20} />
                      <span>Start Real-Time Tracking</span>
                    </button>
                    <button
                      onClick={handleCallAmbulance}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                      <FaAmbulance size={20} />
                      <span>Call Ambulance (102)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
