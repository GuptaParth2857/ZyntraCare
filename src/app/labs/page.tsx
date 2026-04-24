'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiClock, FiNavigation, FiActivity, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask } from 'react-icons/fa';
import Link from 'next/link';
import DirectionsModal from '@/components/DirectionsModal';

interface Lab {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: { lat: number; lng: number };
  tests: string[];
  homeCollection: boolean;
  reportsIn: string;
  rating: string;
  distance?: number;
}

const POPULAR_TESTS = [
  'Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function',
  'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'COVID Test'
];

const FALLBACK_LABS: Lab[] = [
  { id: '1', name: 'Dr. Lal PathLabs', address: 'Near Metro Station', city: 'Delhi', phone: '+91-11-12345678', location: { lat: 28.6139, lng: 77.2090 }, tests: ['Blood Test', 'CBC', 'Thyroid', 'Diabetes'], homeCollection: true, reportsIn: '6 hours', rating: '4.8' },
  { id: '2', name: 'Fortis Lab', address: 'Sector 16', city: 'Noida', phone: '+91-120-1234567', location: { lat: 28.5738, lng: 77.3211 }, tests: ['MRI', 'CT Scan', 'X-Ray', 'Blood Test'], homeCollection: true, reportsIn: '8 hours', rating: '4.6' },
  { id: '3', name: 'SRL Diagnostics', address: 'Civil Lines', city: 'Delhi', phone: '+91-11-23456789', location: { lat: 28.6942, lng: 77.2086 }, tests: ['Blood Test', 'Urine Test', 'COVID Test', 'Dengue'], homeCollection: true, reportsIn: '4 hours', rating: '4.7' },
  { id: '4', name: 'Metropolis Lab', address: 'Connaught Place', city: 'Delhi', phone: '+91-11-45678901', location: { lat: 28.6315, lng: 77.2197 }, tests: ['Thyroid', 'Diabetes', 'Liver Function', 'Kidney Function'], homeCollection: false, reportsIn: '5 hours', rating: '4.9' },
  { id: '5', name: 'Apollo Diagnostics', address: 'Main Market', city: 'Gurgaon', phone: '+91-124-1234567', location: { lat: 28.4595, lng: 77.0266 }, tests: ['CBC', 'Lipid Profile', 'Diabetes', 'Thyroid'], homeCollection: false, reportsIn: '12 hours', rating: '4.5' },
  { id: '6', name: 'Max Lab', address: 'Saket', city: 'Delhi', phone: '+91-11-34567890', location: { lat: 28.5244, lng: 77.2067 }, tests: ['MRI', 'CT Scan', 'ECG', 'Blood Test'], homeCollection: true, reportsIn: '10 hours', rating: '4.4' },
];

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'detected' | 'error'>('loading');
  const [showDirections, setShowDirections] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const openDirections = (lab: Lab) => {
    setSelectedLab(lab);
    setShowDirections(true);
  };

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationStatus('detected');
          },
          () => {
            setUserLocation({ lat: 28.6139, lng: 77.2090 });
            setLocationStatus('error');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
        setLocationStatus('error');
      }
    };
    getUserLocation();
  }, []);

  const labsWithDistance = useMemo(() => {
    if (!userLocation) return FALLBACK_LABS;
    return FALLBACK_LABS.map(lab => ({
      ...lab,
      distance: calculateDistance(userLocation.lat, userLocation.lng, lab.location.lat, lab.location.lng)
    })).sort((a, b) => a.distance - b.distance);
  }, [userLocation]);

  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      const lat = userLocation?.lat || 28.6139;
      const lng = userLocation?.lng || 77.2090;
      
      try {
        const res = await fetch(`/api/labs?lat=${lat}&lng=${lng}&test=${selectedTest}`);
        const data = await res.json();
        
        if (data.labs && data.labs.length > 0) {
          const labsWithDist = data.labs.map((lab: any) => ({
            ...lab,
            distance: calculateDistance(lat, lng, lab.location.lat, lab.location.lng)
          })).sort((a: any, b: any) => a.distance - b.distance);
          setLabs(labsWithDist);
        } else {
          setLabs(labsWithDistance);
        }
      } catch (err) {
        console.error('Failed to fetch labs:', err);
        setLabs(labsWithDistance);
      }
      setLoading(false);
    };
    fetchLabs();
  }, [userLocation, selectedTest, labsWithDistance]);

  const filteredLabs = selectedTest 
    ? labs.filter(lab => lab.tests.some(t => t.toLowerCase().includes(selectedTest.toLowerCase())))
    : labs;

  const displayLabs = labs.length > 0 ? filteredLabs : labsWithDistance.filter(lab => 
    selectedTest ? lab.tests.some(t => t.toLowerCase().includes(selectedTest.toLowerCase())) : true
  );

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white" style={{ background: 'linear-gradient(135deg, #020614 0%, #030a1e 50%, #020612 100%)' }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white">
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Location Status */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          {locationStatus === 'loading' ? (
            <>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs text-amber-400">Detecting location...</span>
            </>
          ) : locationStatus === 'detected' ? (
            <>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400">Location detected</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <span className="text-xs text-slate-400">Default location</span>
            </>
          )}
        </div>
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
        ) : filteredLabs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
            <FaFlask className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No labs found for selected test.</p>
            <p className="text-gray-500 text-sm">Try selecting a different test or check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab, idx) => (
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
                  <button
                    onClick={() => openDirections(lab)}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition"
                  >
                    <FiNavigation size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DirectionsModal
        key={selectedLab?.id || 'default'}
        isOpen={showDirections}
        onClose={() => { setShowDirections(false); setSelectedLab(null); }}
        destination={selectedLab ? {
          name: selectedLab.name,
          address: selectedLab.address,
          lat: selectedLab.location.lat,
          lng: selectedLab.location.lng,
        } : { name: '', address: '', lat: 0, lng: 0 }}
        userLocation={userLocation || { lat: 28.6139, lng: 77.2090 }}
      />
    </div>
  );
}