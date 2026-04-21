'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiClock, FiNavigation, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaPills } from 'react-icons/fa';
import Link from 'next/link';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: { lat: number; lng: number };
  distance: number;
  open24x7: boolean;
  rating: string;
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    };
    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      const lat = userLocation?.lat || 28.6139;
      const lng = userLocation?.lng || 77.2090;
      
      try {
        const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}&search=${searchQuery}`);
        const data = await res.json();
        setPharmacies(data.pharmacies || []);
      } catch (err) {
        console.error('Failed to fetch pharmacies:', err);
      }
      setLoading(false);
    };
    fetchPharmacies();
  }, [userLocation, searchQuery]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FaPills size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pharmacies</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Locate nearby pharmacies, check 24/7 availability, and get directions instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacies by name or location..."
              className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Finding pharmacies near you...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-lg">No pharmacies found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy, idx) => (
              <motion.div
                key={pharmacy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {pharmacy.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{pharmacy.address || pharmacy.city}</p>
                  </div>
                  {pharmacy.open24x7 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                      24/7
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} />
                    {pharmacy.distance?.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1">
                    ⭐ {pharmacy.rating}
                  </span>
                </div>

                <div className="flex gap-2">
                  {pharmacy.phone && (
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition"
                    >
                      <FiPhone size={14} /> Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`}
                    target="_blank"
                    rel="noopener"
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition"
                  >
                    <FiNavigation size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}