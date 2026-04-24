'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RouteInfo {
  distance: string;
  distanceKm: number;
  duration: number;
  durationByTransit: string;
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
      const transitMin = Math.round(durationMin * 1.3) + Math.floor(Math.random() * 10);
      
      const eta = new Date();
      eta.setMinutes(eta.getMinutes() + durationMin);
      const etaStr = eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const transitEta = new Date();
      transitEta.setMinutes(transitEta.getMinutes() + transitMin);
      const transitEtaStr = transitEta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      setRouteInfo({
        distance: distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`,
        distanceKm,
        duration: durationMin,
        durationByTransit: `${transitMin} min (arrive by ${transitEtaStr})`,
        eta: `Arrive by ${etaStr}`,
      });
      setLoading(false);
    };

    calculateRoute();
  }, [isOpen, travelMode, userLocation, destination]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{destination.name}</h3>
            <p className="text-sm text-gray-400">{destination.address}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-6">
            {[
              { id: 'driving', icon: '🚗', label: 'Car' },
              { id: 'walking', icon: '🚶', label: 'Walk' },
              { id: 'cycling', icon: '🚴', label: 'Cycle' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTravelMode(mode.id as any)}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  travelMode === mode.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span className="text-lg">{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">Calculating route...</span>
            </div>
          ) : routeInfo ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-2">{routeInfo.distance}</div>
                  <div className="text-gray-400">Total Distance</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-5 text-center border border-purple-500/20">
                  <div className="text-3xl mb-2">{travelMode === 'driving' ? '🚗' : travelMode === 'walking' ? '🚶' : '🚴'}</div>
                  <div className="text-2xl font-bold text-white">{routeInfo.duration} min</div>
                  <div className="text-xs text-gray-400 mt-1">{routeInfo.eta}</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 rounded-2xl p-5 text-center border border-teal-500/20">
                  <div className="text-3xl mb-2">🚇</div>
                  <div className="text-2xl font-bold text-white">{routeInfo.durationByTransit.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400 mt-1">By Transit</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-sky-500 rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Your Location</div>
                    <div className="text-xs text-gray-400">Starting point</div>
                  </div>
                </div>
                <div className="ml-2 w-0.5 h-8 bg-gradient-to-b from-sky-500 to-purple-500" />
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{destination.name}</div>
                    <div className="text-xs text-gray-400">{destination.address}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat},${userLocation.lng};${destination.lat},${destination.lng}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <span>🗺️</span> Open Full Map
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}