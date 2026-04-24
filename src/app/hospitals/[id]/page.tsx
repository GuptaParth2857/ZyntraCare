'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMapPin, FiClock, FiStar, FiShield, FiActivity, FiAlertCircle, FiNavigation, FiArrowLeft, FiArrowRight, FiHeart, FiCheckCircle, FiAlertTriangle, FiThermometer, FiDroplet, FiEye, FiZap, FiTarget, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { hospitals as allHospitals } from '@/data/mockData';
import { Hospital } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DirectionsModal from '@/components/DirectionsModal';
import { useLanguage } from '@/context/LanguageContext';

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [bedData, setBedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

const specialtyIcons: Record<string, React.ReactNode> = {
  Cardiology: <FiHeart className="text-red-500" />,
  Neurology: <FiTarget className="text-purple-500" />,
  Oncology: <FiZap className="text-amber-500" />,
  Orthopedics: <FiTarget className="text-blue-500" />,
  Pediatrics: <FiHeart className="text-pink-500" />,
  Nephrology: <FiDroplet className="text-cyan-500" />,
  Gastroenterology: <FiActivity className="text-green-500" />,
  Dermatology: <FiEye className="text-amber-600" />,
  Ophthalmology: <FiEye className="text-blue-600" />,
  Pulmonology: <FiThermometer className="text-orange-500" />,
  default: <FiCheckCircle className="text-teal-500" />
};

  useEffect(() => {
    const found = allHospitals.find(h => h.id === id);
    setHospital(found || null);
    
    fetch('/api/beds')
      .then(res => res.json())
      .then(data => {
        const hospitalBed = data.hospitals?.find((h: any) => h.id === id);
        setBedData(hospitalBed);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <FiAlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Hospital Not Found</h1>
        <Link href="/hospitals" className="text-teal-400 hover:underline">Go Back to Hospitals</Link>
      </div>
    );
  }

  const occupancyPercent = bedData?.beds?.occupancyPercent || Math.round((hospital.beds.occupied / hospital.beds.total) * 100);
  const icuOccupancyPercent = bedData?.beds?.icu?.occupancyPercent || Math.round(((hospital.beds.icu - hospital.beds.icuAvailable) / hospital.beds.icu) * 100);

  const getOccupancyColor = (percent: number) => {
    if (percent > 80) return 'text-red-500';
    if (percent > 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`;
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-6"
          >
            <FiArrowLeft size={20} />
            <span>Back to Hospitals</span>
          </motion.button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden mb-8"
          >
            <div className="h-64 md:h-80 relative">
              {!imgError && hospital.image ? (
                <Image
                  src={hospital.image}
                  alt={hospital.name}
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-900/60 to-slate-900 flex items-center justify-center">
                  <FiActivity size={64} className="text-teal-500/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              
              {hospital.emergency && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <FiShield size={18} />
                  24/7 Emergency
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{hospital.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <span className="flex items-center gap-2">
                  <FiMapPin size={16} />
                  {hospital.address}, {hospital.city}, {hospital.state}
                </span>
                <span className="flex items-center gap-2">
                  <FiStar className="text-amber-400" size={16} />
                  {hospital.rating}/5.0
                </span>
                <span className="flex items-center gap-2">
                  <FiClock size={16} />
                  {hospital.workingHours}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Emergency Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <a
              href={`tel:${hospital.phone}`}
              className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              <FiPhone size={24} />
              Call Hospital
            </a>
            <a
              href="tel:102"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              <FiTruck size={24} />
              Call Ambulance (102)
            </a>
            <button
              onClick={() => setShowDirections(true)}
              className="flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              <FiNavigation size={24} />
              Get Directions
            </button>
          </motion.div>

          {/* Real-time Bed Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FiActivity className="text-teal-400" />
                Real-Time Bed Availability
              </h2>
              <span className="text-xs text-gray-500">Live updates</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-emerald-400">{bedData?.beds?.available || hospital.beds.available}</p>
                <p className="text-sm text-gray-400 mt-1">General Beds Available</p>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${100 - occupancyPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-sky-400">{bedData?.beds?.icu?.available || hospital.beds.icuAvailable}</p>
                <p className="text-sm text-gray-400 mt-1">ICU Beds Available</p>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500"
                    style={{ width: `${100 - icuOccupancyPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className={`text-3xl font-black ${getOccupancyColor(occupancyPercent)}`}>{occupancyPercent}%</p>
                <p className="text-sm text-gray-400 mt-1">General Occupancy</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className={`text-3xl font-black ${getOccupancyColor(icuOccupancyPercent)}`}>{icuOccupancyPercent}%</p>
                <p className="text-sm text-gray-400 mt-1">ICU Occupancy</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Last updated: {bedData?.beds?.lastUpdated ? new Date(bedData.beds.lastUpdated).toLocaleTimeString() : 'Just now'}
            </p>
          </motion.div>

          {/* Hospital Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact & Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Contact & Location</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiPhone className="text-teal-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white font-semibold">{hospital.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-teal-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white font-semibold">{hospital.address}</p>
                    <p className="text-gray-400">{hospital.city}, {hospital.state}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock className="text-teal-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Working Hours</p>
                    <p className="text-white font-semibold">{hospital.workingHours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiStar className="text-amber-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-white font-semibold">{hospital.rating}/5.0</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Specialties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Specialties & Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {hospital.specialties.map((specialty, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl">
                    {specialtyIcons[specialty] || specialtyIcons.default}
                    <span className="text-white text-sm">{specialty}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Facilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Facilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <FiCheckCircle />, label: 'Emergency 24/7' },
                { icon: <FiTruck />, label: 'Ambulance Service' },
                { icon: <FiCheckCircle />, label: 'Pharmacy' },
                { icon: <FiCheckCircle />, label: 'Lab Services' },
                { icon: <FiCheckCircle />, label: 'Blood Bank' },
                { icon: <FiCheckCircle />, label: 'ICU' },
                { icon: <FiCheckCircle />, label: 'Operation Theatres' },
                { icon: <FiCheckCircle />, label: 'Parking' },
              ].map((facility, idx) => (
                <div key={idx} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
                  {facility.icon}
                  <span className="text-white text-sm">{facility.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Book Appointment CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Link
              href={`/booking?hospital=${hospital.id}`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-teal-500/20"
            >
              Book Appointment
              <FiArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />

      <DirectionsModal
        isOpen={showDirections}
        onClose={() => setShowDirections(false)}
        destination={hospital ? {
          name: hospital.name,
          address: hospital.address,
          lat: hospital.location.lat,
          lng: hospital.location.lng,
        } : { name: '', address: '', lat: 0, lng: 0 }}
        userLocation={userLocation || { lat: 28.6139, lng: 77.2090 }}
      />
    </div>
  );
}
