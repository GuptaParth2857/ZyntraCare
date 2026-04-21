'use client';

import { useState, useEffect } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiClock, FiNavigation, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaFlask } from 'react-icons/fa';

interface Lab {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: { lat: number; lng: number };
  distance: number;
  tests: string[];
  homeCollection: boolean;
  reportsIn: string;
  rating: string;
}

const POPULAR_TESTS = [
  'Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function',
  'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'COVID Test'
];

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState('');
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
    const fetchLabs = async () => {
      setLoading(true);
      const lat = userLocation?.lat || 28.6139;
      const lng = userLocation?.lng || 77.2090;
      
      try {
        const res = await fetch(`/api/labs?lat=${lat}&lng=${lng}&test=${selectedTest}`);
        const data = await res.json();
        setLabs(data.labs || []);
      } catch (err) {
        console.error('Failed to fetch labs:', err);
      }
      setLoading(false);
    };
    fetchLabs();
  }, [userLocation, selectedTest]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/10" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6">
            <FaFlask size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Diagnostic Labs</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Locate nearby labs, check test availability, and book appointments.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {POPULAR_TESTS.map((test) => (
            <button
              key={test}
              onClick={() => setSelectedTest(selectedTest === test ? '' : test)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedTest === test
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {test}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Finding labs near you...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-lg">No labs found for selected test.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab, idx) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                      {lab.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{lab.address || lab.city}</p>
                  </div>
                  {lab.homeCollection && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <FiCheckCircle size={10} /> Home
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {lab.tests.slice(0, 4).map((test) => (
                    <span key={test} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">
                      {test}
                    </span>
                  ))}
                  {lab.tests.length > 4 && (
                    <span className="text-[10px] text-gray-500">+{lab.tests.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} />
                    {lab.distance?.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={14} />
                    {lab.reportsIn}
                  </span>
                  <span className="flex items-center gap-1">
                    ⭐ {lab.rating}
                  </span>
                </div>

                <div className="flex gap-2">
                  {lab.phone && (
                    <a
                      href={`tel:${lab.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition"
                    >
                      <FiPhone size={14} /> Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lab.location.lat},${lab.location.lng}`}
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