'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPhone,
  FiCheck,
  FiX,
  FiClock,
  FiNavigation,
  FiAlertTriangle,
  FiChevronRight,
  FiLoader,
  FiRefreshCw,
  FiActivity,
  FiUser,
  FiTruck,
  FiList,
  FiRadio,
  FiWifi,
  FiWifiOff,
  FiStar,
  FiArrowRight,
} from 'react-icons/fi';
import { FaAmbulance, FaHospital } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

interface Booking {
  id: string;
  patientName: string;
  patientPhone: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number | null;
  dropLng: number | null;
  dropAddress: string | null;
  status: string;
  createdAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  distance: number | null;
}

type DriverStatus = 'available' | 'busy' | 'offline';
type TabView = 'requests' | 'map' | 'history';

const STATUS_CONFIG: Record<DriverStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  available: { label: 'Available', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <FiWifi size={14} /> },
  busy: { label: 'Busy', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: <FiAlertTriangle size={14} /> },
  offline: { label: 'Offline', color: 'text-gray-500', bg: 'bg-gray-500/15 border-gray-500/30', icon: <FiWifiOff size={14} /> },
};

const SEVERITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/15' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

export default function AmbulanceDashboard() {
  const [driverId, setDriverId] = useState('');
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('available');
  const [activeTab, setActiveTab] = useState<TabView>('requests');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]);
  const gpsInterval = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const getDriverId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ambulance_driver_id') || '';
    }
    return '';
  }, []);

  useEffect(() => {
    const id = getDriverId();
    setDriverId(id);

    const savedStatus = localStorage.getItem('ambulance_driver_status') as DriverStatus | null;
    if (savedStatus) setDriverStatus(savedStatus);
  }, [getDriverId]);

  const fetchBookings = useCallback(async () => {
    try {
      const lat = driverPos?.lat || 0;
      const lng = driverPos?.lng || 0;
      const res = await fetch(`/api/ambulance?lat=${lat}&lng=${lng}&status=pending`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch {
      setBookings([
        {
          id: 'demo-1',
          patientName: 'Ravi Kumar',
          patientPhone: '+919876543210',
          pickupLat: 28.6139,
          pickupLng: 77.209,
          pickupAddress: 'AIIMS Hospital, New Delhi',
          dropLat: 28.628,
          dropLng: 77.219,
          dropAddress: 'Safdarjung Hospital',
          status: 'pending',
          createdAt: new Date().toISOString(),
          assignedAt: null,
          completedAt: null,
          distance: 2.3,
        },
        {
          id: 'demo-2',
          patientName: 'Priya Sharma',
          patientPhone: '+919876543211',
          pickupLat: 28.628,
          pickupLng: 77.219,
          pickupAddress: 'Sector 14, Gurgaon',
          dropLat: null,
          dropLng: null,
          dropAddress: null,
          status: 'pending',
          createdAt: new Date(Date.now() - 120000).toISOString(),
          assignedAt: null,
          completedAt: null,
          distance: 5.1,
        },
        {
          id: 'demo-3',
          patientName: 'Amit Singh',
          patientPhone: '+919876543212',
          pickupLat: 28.635,
          pickupLng: 77.225,
          pickupAddress: 'Connaught Place, Delhi',
          dropLat: 28.65,
          dropLng: 77.23,
          dropAddress: 'Ram Manohar Lohia Hospital',
          status: 'pending',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          assignedAt: null,
          completedAt: null,
          distance: 3.7,
        },
      ]);
    }
  }, [driverPos]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/ambulance?driverId=${driverId}&status=history`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.bookings);
      }
    } catch {
      setHistory([
        {
          id: 'hist-1',
          patientName: 'Sunita Devi',
          patientPhone: '+919876543220',
          pickupLat: 28.6139,
          pickupLng: 77.209,
          pickupAddress: 'Lodhi Road, Delhi',
          dropLat: 28.628,
          dropLng: 77.219,
          dropAddress: 'AIIMS Emergency',
          status: 'completed',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          assignedAt: new Date(Date.now() - 7000000).toISOString(),
          completedAt: new Date(Date.now() - 3600000).toISOString(),
          distance: 4.2,
        },
        {
          id: 'hist-2',
          patientName: 'Vikram Patel',
          patientPhone: '+919876543221',
          pickupLat: 28.635,
          pickupLng: 77.225,
          pickupAddress: 'Karol Bagh, Delhi',
          dropLat: 28.65,
          dropLng: 77.23,
          dropAddress: 'LNJP Hospital',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedAt: new Date(Date.now() - 86000000).toISOString(),
          completedAt: new Date(Date.now() - 82800000).toISOString(),
          distance: 6.8,
        },
      ]);
    }
  }, [driverId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBookings(), fetchHistory()]).finally(() => setLoading(false));
  }, [fetchBookings, fetchHistory]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMapReady(true);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverPos(newPos);
        setMapCenter([newPos.lat, newPos.lng]);
        setMapReady(true);
      },
      () => {
        setDriverPos({ lat: 28.6139, lng: 77.209 });
        setMapCenter([28.6139, 77.209]);
        setMapReady(true);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    gpsInterval.current = setInterval(() => {
      if (driverPos && driverStatus !== 'offline') {
        setGpsLoading(true);
        fetch('/api/ambulance/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverId, lat: driverPos.lat, lng: driverPos.lng, status: driverStatus }),
        })
          .then(() => {})
          .catch(() => {})
          .finally(() => setGpsLoading(false));
      }
    }, 10000);

    return () => {
      if (gpsInterval.current) clearInterval(gpsInterval.current);
    };
  }, [driverPos, driverStatus, driverId]);

  const updateStatus = async (newStatus: DriverStatus) => {
    setDriverStatus(newStatus);
    localStorage.setItem('ambulance_driver_status', newStatus);
    if (driverPos) {
      try {
        await fetch('/api/ambulance/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverId, lat: driverPos.lat, lng: driverPos.lng, status: newStatus }),
        });
      } catch {}
    }
  };

  const acceptBooking = async (booking: Booking) => {
    try {
      const res = await fetch('/api/ambulance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, driverId, action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBooking({ ...booking, status: 'assigned' });
        setDriverStatus('busy');
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
        setActiveTab('map');
      }
    } catch {
      setActiveBooking({ ...booking, status: 'assigned' });
      setDriverStatus('busy');
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      setActiveTab('map');
    }
  };

  const declineBooking = async (bookingId: string) => {
    try {
      await fetch('/api/ambulance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, driverId, action: 'decline' }),
      });
    } catch {}
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const completeTrip = async () => {
    if (!activeBooking) return;
    try {
      await fetch('/api/ambulance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeBooking.id, driverId, action: 'complete' }),
      });
    } catch {}
    setHistory((prev) => [{ ...activeBooking, status: 'completed', completedAt: new Date().toISOString() }, ...prev]);
    setActiveBooking(null);
    setDriverStatus('available');
  };

  const navigateToPatient = () => {
    if (!activeBooking || !driverPos) return;
    const url = `https://www.google.com/maps/dir/${driverPos.lat},${driverPos.lng}/${activeBooking.pickupLat},${activeBooking.pickupLng}`;
    window.open(url, '_blank');
  };

  const callPatient = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatDuration = (start: string, end: string) => {
    const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-inter pb-24">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-teal-700/15 rounded-full blur-[140px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 px-4 pt-12 pb-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={driverStatus === 'available' ? { scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500/40 rounded-full"
                  aria-hidden="true"
                />
                <div className="relative p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl backdrop-blur-sm">
                  <FaAmbulance size={24} className="text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Ambulance Driver</h1>
                <p className="text-xs text-gray-500">ZyntraCare Emergency Fleet</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {gpsLoading && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <FiRefreshCw size={14} className="text-cyan-400" />
                </motion.div>
              )}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[driverStatus].bg} ${STATUS_CONFIG[driverStatus].color}`}>
                {STATUS_CONFIG[driverStatus].icon}
                {STATUS_CONFIG[driverStatus].label}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {(Object.keys(STATUS_CONFIG) as DriverStatus[]).map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                  driverStatus === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-current shadow-lg`
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                }`}
              >
                {STATUS_CONFIG[s].label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 px-4">
        <div className="max-w-4xl mx-auto">
          {activeBooking && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Active Trip</span>
                </div>
                <button onClick={completeTrip} className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full hover:bg-emerald-500/25 transition">
                  Complete Trip
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FiUser size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{activeBooking.patientName}</p>
                  <p className="text-xs text-gray-400 truncate">{activeBooking.pickupAddress}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => callPatient(activeBooking.patientPhone)} className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition">
                    <FiPhone size={16} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={navigateToPatient} className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/25 transition">
                    <FiNavigation size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 border border-white/10">
            {([
              { key: 'requests' as TabView, label: 'Requests', icon: <FiRadio size={14} />, count: bookings.length },
              { key: 'map' as TabView, label: 'Map', icon: <FiMapPin size={14} /> },
              { key: 'history' as TabView, label: 'History', icon: <FiList size={14} /> },
            ]).map((tab) => (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.key ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${activeTab === tab.key ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-gray-400'}`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="text-center py-20">
                    <FiLoader className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
                    <p className="text-gray-500 text-sm">Loading requests...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <FiCheck size={40} className="mx-auto text-emerald-500/50 mb-3" />
                    <p className="text-gray-400 font-bold">No pending requests</p>
                    <p className="text-gray-600 text-xs mt-1">New emergencies will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking, idx) => {
                      const severity = SEVERITY_MAP[booking.status] || SEVERITY_MAP.medium;
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-cyan-500/20 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                <FiUser size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{booking.patientName}</p>
                                <p className="text-[10px] text-gray-500">{booking.patientPhone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FiClock size={10} className="text-gray-500" />
                              <span className="text-[10px] text-gray-500">{formatTime(booking.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                            <FiMapPin size={12} className="text-cyan-400 shrink-0" />
                            <span className="truncate">{booking.pickupAddress}</span>
                            {booking.distance != null && (
                              <span className="shrink-0 text-cyan-400 font-bold">{booking.distance.toFixed(1)} km</span>
                            )}
                          </div>

                          {booking.dropAddress && (
                            <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                              <FaHospital size={12} className="text-teal-400 shrink-0" />
                              <span className="truncate">{booking.dropAddress}</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => acceptBooking(booking)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition"
                            >
                              <FiCheck size={14} />
                              Accept
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => declineBooking(booking.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/25 transition"
                            >
                              <FiX size={14} />
                              Decline
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => callPatient(booking.patientPhone)}
                              className="w-10 flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/25 transition"
                            >
                              <FiPhone size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden border border-white/10 h-[50vh] min-h-[320px]"
              >
                {mapReady ? (
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {driverPos && (
                      <Marker position={[driverPos.lat, driverPos.lng]}>
                        <Popup>
                          <div className="text-center p-1">
                            <p className="font-bold text-sm">Your Location</p>
                            <p className="text-xs text-gray-500">{driverPos.lat.toFixed(4)}, {driverPos.lng.toFixed(4)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {activeBooking && (
                      <Marker position={[activeBooking.pickupLat, activeBooking.pickupLng]}>
                        <Popup>
                          <div className="text-center p-1">
                            <p className="font-bold text-sm">{activeBooking.patientName}</p>
                            <p className="text-xs text-gray-500">{activeBooking.pickupAddress}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {activeBooking?.dropLat && activeBooking?.dropLng && (
                      <Marker position={[activeBooking.dropLat, activeBooking.dropLng]}>
                        <Popup>
                          <div className="text-center p-1">
                            <p className="font-bold text-sm">Drop Location</p>
                            <p className="text-xs text-gray-500">{activeBooking.dropAddress}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-800/60">
                    <FiLoader className="animate-spin text-cyan-400" size={28} />
                  </div>
                )}
                {activeBooking && driverPos && (
                  <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={navigateToPatient}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl font-bold text-sm backdrop-blur-xl hover:bg-cyan-500/30 transition"
                    >
                      <FiNavigation size={16} />
                      Navigate to Patient
                      <FiArrowRight size={14} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {history.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <FiList size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 font-bold">No trip history</p>
                    <p className="text-gray-600 text-xs mt-1">Completed trips will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((trip, idx) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              trip.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                              {trip.status === 'completed' ? <FiCheck size={14} /> : <FiX size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{trip.patientName}</p>
                              <p className="text-[10px] text-gray-500">{trip.patientPhone}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            trip.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {trip.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <FiMapPin size={10} className="text-cyan-400 shrink-0" />
                            <span className="truncate">{trip.pickupAddress}</span>
                          </div>
                          {trip.dropAddress && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <FaHospital size={10} className="text-teal-400 shrink-0" />
                              <span className="truncate">{trip.dropAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <div className="flex items-center gap-3">
                            <span>{formatTime(trip.createdAt)}</span>
                            {trip.assignedAt && trip.completedAt && (
                              <span className="flex items-center gap-1">
                                <FiClock size={9} />
                                {formatDuration(trip.assignedAt, trip.completedAt)}
                              </span>
                            )}
                          </div>
                          {trip.distance != null && (
                            <span className="text-cyan-400 font-bold">{trip.distance.toFixed(1)} km</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-4 py-3"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            {driverPos ? (
              <>
                <FiMapPin size={10} className="text-emerald-400" />
                <span>GPS Active — {driverPos.lat.toFixed(4)}, {driverPos.lng.toFixed(4)}</span>
              </>
            ) : (
              <>
                <FiWifiOff size={10} className="text-gray-600" />
                <span>Acquiring GPS...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FiTruck size={12} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400">{activeBooking ? '1 Active' : 'Idle'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
