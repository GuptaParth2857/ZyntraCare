'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMapPin, FiNavigation, FiAlertCircle, FiCheck, FiX, FiPhoneCall, FiRefreshCw, FiTarget, FiExternalLink } from 'react-icons/fi';
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
  bedsAvail?: number;
  icuAvail?: number;
}

type EmergencyStage = 'idle' | 'locating' | 'fetching' | 'tracking' | 'calling' | 'error';

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Real hospital fetch via OpenStreetMap Overpass API
async function fetchRealNearbyHospitals(lat: number, lng: number): Promise<NearbyHospital[]> {
  try {
    const radius = 10000; // 10km radius
    const query = `[out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
      );
      out center 10;`;

    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) throw new Error('Overpass API failed');
    const data = await res.json();

    const hospitals: NearbyHospital[] = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat ?? lat;
        const elLng = el.lon ?? el.center?.lon ?? lng;
        return {
          id: String(el.id),
          name: el.tags.name,
          phone: el.tags['contact:phone'] || el.tags.phone || el.tags['contact:mobile'] || '',
          address: [el.tags['addr:full'], el.tags['addr:street'], el.tags['addr:city']]
            .filter(Boolean).join(', ') || 'See on Maps',
          distance: calcDistance(lat, lng, elLat, elLng),
          lat: elLat,
          lng: elLng,
          source: 'osm' as const,
        };
      })
      .sort((a: NearbyHospital, b: NearbyHospital) => a.distance - b.distance)
      .slice(0, 6);

    return hospitals;
  } catch {
    return [];
  }
}

export default function EmergencyCallWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<NearbyHospital[]>([]);
  const [locationError, setLocationError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [addressLabel, setAddressLabel] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const selectedHospRef = useRef<NearbyHospital | null>(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Reverse geocode user location to address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address;
      const label = [addr?.neighbourhood || addr?.suburb, addr?.city || addr?.town, addr?.state]
        .filter(Boolean).join(', ');
      setAddressLabel(label || 'Your location');
    } catch {
      setAddressLabel('Your location');
    }
  };

  const loadHospitals = useCallback(async (lat: number, lng: number) => {
    setStage('fetching');
    const results = await fetchRealNearbyHospitals(lat, lng);
    if (results.length > 0) {
      setNearestHospitals(results);
      selectedHospRef.current = results[0];
      setStage('tracking');
    } else {
      setLocationError('No hospitals found nearby. Try increasing search area.');
      setStage('error');
    }
    setLastUpdate(new Date());
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported on this device');
      setStage('error');
      return;
    }
    setStage('locating');
    setLocationError('');
    setNearestHospitals([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        await loadHospitals(latitude, longitude);

        // Watch for position updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const { latitude: wLat, longitude: wLng } = pos.coords;
            setUserLocation({ lat: wLat, lng: wLng });
            setLastUpdate(new Date());
            // Refresh hospitals every 60s on movement
            await loadHospitals(wLat, wLng);
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? 'Location access denied. Please enable location in browser settings.'
            : 'Could not get location. Try again.'
        );
        setStage('error');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [loadHospitals]);

  const handleCallHospital = (hospital: NearbyHospital) => {
    selectedHospRef.current = hospital;
    stopTracking();
    if (hospital.phone) {
      setStage('calling');
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      window.location.href = `tel:${hospital.phone}`;
    } else {
      // Open in Google Maps if no phone
      window.open(
        `https://www.google.com/maps/search/hospitals/@${hospital.lat},${hospital.lng},15z`,
        '_blank'
      );
    }
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopTracking();
    setIsOpen(false);
    setStage('idle');
    setCallDuration(0);
    setNearestHospitals([]);
    setUserLocation(null);
    setAddressLabel('');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      {/* Floating SOS Button — compact on mobile, full on desktop */}
      <motion.button
        onClick={() => { setIsOpen(true); setTimeout(() => startTracking(), 300); }}
        className="fixed bottom-[270px] left-2 md:left-6 z-[9999] flex flex-col items-center group"
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        aria-label="SOS Emergency"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-40" />
          {/* Mobile: 48px | Desktop: 70px */}
          <div className="relative w-12 h-12 md:w-[70px] md:h-[70px] bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 border-2 md:border-4 border-white">
            <FiPhoneCall className="text-white text-lg md:text-3xl" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-7 md:h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-[8px] md:text-[10px] font-black">SOS</span>
          </div>
        </div>
        <span className="text-[8px] md:text-[9px] font-bold text-white mt-1 drop-shadow-lg bg-red-500/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">SOS</span>
      </motion.button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full md:max-w-md bg-slate-900 rounded-t-3xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 relative flex-shrink-0">
                {/* Drag handle on mobile */}
                <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-3 md:hidden" />
                <button onClick={handleClose}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <FiX size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={stage === 'locating' || stage === 'fetching' ? { rotate: 360 } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    {stage === 'locating' ? <FiNavigation className="text-white text-xl" /> :
                     stage === 'fetching' ? <FaHospital className="text-white text-xl" /> :
                     stage === 'tracking' ? <FiTarget className="text-white text-xl" /> :
                     stage === 'calling' ? <FiPhone className="text-white text-xl animate-pulse" /> :
                     stage === 'error' ? <FiAlertCircle className="text-white text-xl" /> :
                     <FiPhoneCall className="text-white text-xl" />}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white">
                      {stage === 'locating' ? 'Getting Your Location...' :
                       stage === 'fetching' ? 'Finding Real Hospitals...' :
                       stage === 'tracking' ? '🏥 Nearby Hospitals' :
                       stage === 'calling' ? 'Calling...' :
                       stage === 'error' ? 'Error' : 'Emergency Help'}
                    </h2>
                    {(stage === 'tracking' || stage === 'locating') && userLocation && (
                      <p className="text-red-100 text-xs truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                        {addressLabel || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                      </p>
                    )}
                    {stage === 'error' && <p className="text-red-200 text-xs">{locationError}</p>}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Locating / Fetching */}
                {(stage === 'locating' || stage === 'fetching') && (
                  <div className="text-center py-12 px-6">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {stage === 'locating' ? <FiNavigation className="text-blue-400 text-4xl" /> : <FaHospital className="text-blue-400 text-3xl" />}
                    </motion.div>
                    <p className="text-white font-semibold">
                      {stage === 'locating' ? 'Detecting your GPS location...' : 'Searching real hospitals near you...'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {stage === 'locating' ? 'Please allow location access' : 'Using OpenStreetMap data'}
                    </p>
                  </div>
                )}

                {/* Tracking — Real Nearby Hospitals */}
                {stage === 'tracking' && (
                  <div className="p-4 space-y-3">
                    {/* Location info */}
                    {userLocation && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs font-bold">LIVE GPS ACTIVE</span>
                        </div>
                        {lastUpdate && (
                          <span className="text-gray-500 text-[10px]">Updated: {formatTime(lastUpdate)}</span>
                        )}
                      </div>
                    )}

                    {/* Call nearest button */}
                    {nearestHospitals[0] && (
                      <motion.button
                        animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        onClick={() => handleCallHospital(nearestHospitals[0])}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/30"
                      >
                        <FiPhoneCall size={22} />
                        <div className="text-left">
                          <p className="text-sm leading-tight">📞 Call Nearest Hospital</p>
                          <p className="text-xs text-green-100 font-normal truncate max-w-[200px]">{nearestHospitals[0].name}</p>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-auto">{nearestHospitals[0].distance.toFixed(1)} km</span>
                      </motion.button>
                    )}

                    {/* Hospital List */}
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Real Hospitals Near You ({nearestHospitals.length} found)
                    </p>
                    <div className="space-y-2">
                      {nearestHospitals.map((h, i) => (
                        <motion.div key={h.id}
                          initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`border rounded-xl p-3 ${i === 0 ? 'border-green-500/40 bg-green-500/8' : 'border-white/10 bg-white/5'}`}>
                          <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${i === 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${i === 0 ? 'text-green-400' : 'text-white'}`}>{h.name}</p>
                              {h.address && h.address !== 'See on Maps' && (
                                <p className="text-gray-500 text-[10px] truncate">{h.address}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-semibold ${h.distance < 2 ? 'text-green-400' : h.distance < 5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  📍 {h.distance.toFixed(1)} km
                                </span>
                                {!h.phone && (
                                  <span className="text-[10px] text-gray-500">No phone — Maps link</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <button onClick={() => handleCallHospital(h)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition ${i === 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                {h.phone ? <><FiPhoneCall size={11} /> Call</> : <><FiExternalLink size={11} /> Maps</>}
                              </button>
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                                target="_blank" rel="noopener noreferrer"
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-blue-500/20 text-blue-400 flex items-center gap-1 hover:bg-blue-500/30 transition text-center justify-center">
                                <FiMapPin size={10} /> Route
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Ambulance */}
                    <button onClick={() => { stopTracking(); window.location.href = 'tel:102'; }}
                      className="w-full py-3 bg-red-500/15 border border-red-500/30 text-red-400 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-red-500/25 transition">
                      <FaAmbulance size={18} /> Call Ambulance 102
                    </button>

                    {/* Refresh */}
                    <button onClick={() => userLocation && loadHospitals(userLocation.lat, userLocation.lng)}
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-gray-400 text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
                      <FiRefreshCw size={14} /> Refresh Nearby Hospitals
                    </button>
                  </div>
                )}

                {/* Calling */}
                {stage === 'calling' && (
                  <div className="text-center py-10 px-6">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
                      <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                        <FiPhoneCall className="text-white text-3xl animate-pulse" />
                      </div>
                    </div>
                    <p className="text-white font-bold text-lg">{selectedHospRef.current?.name}</p>
                    {selectedHospRef.current?.phone && (
                      <p className="text-gray-400 text-sm mb-4">{selectedHospRef.current.phone}</p>
                    )}
                    <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-mono text-lg">{formatDuration(callDuration)}</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                  <div className="text-center py-8 px-6 space-y-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <FiAlertCircle className="text-red-400 text-3xl" />
                    </div>
                    <p className="text-gray-300 text-sm">{locationError}</p>
                    <button onClick={startTracking}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                      <FiRefreshCw size={16} /> Try Again
                    </button>
                    <button onClick={() => window.location.href = 'tel:102'}
                      className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                      <FaAmbulance size={16} /> Call Ambulance 102
                    </button>
                  </div>
                )}

                {/* Idle */}
                {stage === 'idle' && (
                  <div className="p-4 space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-gray-300 space-y-2">
                      <p className="font-bold text-white">How it works:</p>
                      <p>📍 Detects your real GPS location</p>
                      <p>🏥 Finds actual hospitals from OpenStreetMap within 10km</p>
                      <p>📞 One-tap call + Google Maps route</p>
                    </div>
                    <button onClick={startTracking}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                      <FiTarget size={20} /> Find Hospitals Near Me
                    </button>
                    <button onClick={() => window.location.href = 'tel:102'}
                      className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2">
                      <FaAmbulance size={16} /> Direct Ambulance (102)
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
