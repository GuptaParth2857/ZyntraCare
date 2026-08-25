'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiNavigation, FiClock, FiMapPin, FiX, FiPhone } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

interface RouteInfo {
  distance: string;
  distanceKm: number;
  duration: number;
  durationText: string;
  eta: string;
}

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  userLocation: { lat: number; lng: number };
}

export default function DirectionsModal({ isOpen, onClose, destination, userLocation }: DirectionsModalProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');

  useEffect(() => {
    if (!isOpen) return;

    const calculateRoute = async () => {
      setLoading(true);
      
      const R = 6371;
      const dLat = (destination.lat - userLocation.lat) * Math.PI / 180;
      const dLon = (destination.lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const speedKmh = travelMode === 'driving' ? 30 : travelMode === 'walking' ? 5 : 15;
      const durationMin = Math.round((distanceKm / speedKmh) * 60);
      
      const eta = new Date();
      eta.setMinutes(eta.getMinutes() + durationMin);
      const etaStr = eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      setRouteInfo({
        distance: distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`,
        distanceKm,
        duration: durationMin,
        durationText: durationMin < 60 ? `${durationMin} min` : `${Math.floor(durationMin/60)}h ${durationMin%60}min`,
        eta: etaStr,
      });
      setLoading(false);
    };

    calculateRoute();
  }, [isOpen, travelMode, userLocation, destination]);

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=${travelMode}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full md:max-w-md bg-slate-900 border-t-2 border-teal-500 rounded-t-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiNavigation className="text-white" size={20} />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-base">🗺️ Navigate to Hospital</h3>
                <p className="text-white/80 text-xs">{destination.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">Calculating route...</span>
            </div>
          ) : routeInfo && (
            <div className="space-y-4">
              {/* Route Info Card */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-black text-white">{routeInfo.distance}</div>
                    <div className="text-gray-400 text-xs mt-1">Distance</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-black text-teal-400">{routeInfo.durationText}</div>
                    <div className="text-gray-400 text-xs mt-1">Travel Time</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <FiClock className="text-teal-400" size={14} />
                  <span className="text-teal-400 text-sm font-semibold">ETA: {routeInfo.eta}</span>
                </div>
              </div>

              {/* Travel Mode */}
              <div className="flex gap-2">
                {[
                  { id: 'driving', icon: <FaCar />, label: 'Drive' },
                  { id: 'walking', icon: '🚶', label: 'Walk' },
                  { id: 'cycling', icon: '🚴', label: 'Cycle' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setTravelMode(mode.id as any)}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                      travelMode === mode.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleNavigate}
                  className="py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
                >
                  <FiNavigation size={18} />
                  Open Maps
                </button>
                <a
                  href={`tel:102`}
                  className="py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                >
                  <FiPhone size={18} />
                  Call 102
                </a>
              </div>

              {/* Destination Info */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <FiMapPin className="text-teal-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{destination.name}</p>
                    <p className="text-gray-400 text-xs">{destination.address || 'Hospital'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}