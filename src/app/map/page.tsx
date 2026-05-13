'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiMapPin, FiActivity, FiPhone, FiNavigation, FiGrid, FiMap, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';

function MapLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-teal-500/40 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-teal-500/30 flex items-center justify-center">
            <FiMapPin className="text-teal-400" size={20} />
          </div>
        </div>
        <p className="text-teal-400 font-semibold text-lg mb-1">Initializing Map</p>
        <p className="text-slate-500 text-sm">Fetching nearby hospitals & clinics…</p>
      </div>
    </div>
  );
}

// Dynamically import the heavy map component (no SSR)
const NearbyHospitalsMap = dynamic(
  () => import('@/components/NearbyHospitalsMap'),
  {
    ssr: false,
    loading: () => <MapLoader />,
  }
);

interface RouteDestination {
  lat: number;
  lng: number;
  name: string;
  address: string;
  mode: 'driving' | 'walking' | 'cycling';
}

function MapContent() {
  const searchParams = useSearchParams();
  const [radius, setRadius] = useState(5);
  const [routeDestination, setRouteDestination] = useState<RouteDestination | null>(null);

  useEffect(() => {
    const fromLat = searchParams.get('fromlat');
    const fromLng = searchParams.get('fromlng');
    const toLat = searchParams.get('tolat');
    const toLng = searchParams.get('tolng');
    const destName = searchParams.get('destName');
    const destAddress = searchParams.get('destAddress');
    const mode = searchParams.get('mode') as 'driving' | 'walking' | 'cycling';

    if (fromLat && fromLng && toLat && toLng) {
      setRouteDestination({
        lat: parseFloat(toLat),
        lng: parseFloat(toLng),
        name: destName || 'Destination',
        address: destAddress || '',
        mode: mode || 'driving'
      });
    }
  }, [searchParams]);

  return (
    <div className="flex-1 relative" style={{ minHeight: 0 }}>
      <NearbyHospitalsMap 
        initialRadius={radius} 
        routeDestination={routeDestination}
        userLat={routeDestination ? parseFloat(searchParams.get('fromlat') || '0') : undefined}
        userLng={routeDestination ? parseFloat(searchParams.get('fromlng') || '0') : undefined}
      />
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="relative w-full bg-slate-950" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Header Bar ── */}
      <div
        className="relative z-[2000] flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0"
        style={{ background: 'rgba(2, 8, 23, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all flex-shrink-0"
          aria-label="Back to home"
        >
          <FiArrowLeft size={17} />
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/30 to-blue-500/30 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <FiMapPin size={15} className="text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-black text-base leading-tight truncate">Healthcare Map</h1>
            <p className="text-slate-500 text-xs truncate hidden sm:block">Real-time hospitals, clinics & pharmacies near you</p>
          </div>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold">LIVE</span>
        </div>

        {/* Quick Nav Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {[
            { href: '/hospitals', icon: FiActivity, label: 'Hospitals', color: 'text-red-400' },
            { href: '/pharmacies', icon: FiGrid, label: 'Pharmacies', color: 'text-green-400' },
            { href: '/emergency', icon: FiPhone, label: 'Emergency', color: 'text-rose-400' },
            { href: '/blood-donors', icon: FiNavigation, label: 'Blood', color: 'text-pink-400' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all text-xs font-semibold text-slate-400 hover:text-white"
            >
              <Icon size={13} className={color} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-[1999] flex-shrink-0"
        style={{ background: 'rgba(2, 8, 23, 0.9)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-0 overflow-x-auto border-b border-white/5">
          {[
            { emoji: '🏥', label: 'Hospitals', value: 'Nearby', color: '#ef4444' },
            { emoji: '🏠', label: 'Clinics', value: 'Nearby', color: '#3b82f6' },
            { emoji: '💊', label: 'Pharmacies', value: 'Nearby', color: '#10b981' },
            { emoji: '🛏️', label: 'Beds Available', value: 'Real-time', color: '#f59e0b' },
            { emoji: '🚨', label: 'Emergency', value: '24/7', color: '#f43f5e' },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2.5 border-r border-white/5 flex-shrink-0 hover:bg-white/5 transition-colors cursor-default"
            >
              <span className="text-base">{stat.emoji}</span>
              <div>
                <p className="text-xs text-slate-500 leading-none">{stat.label}</p>
                <p className="text-xs font-bold text-white mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 px-4 flex-shrink-0">
            <span className="text-slate-600 text-xs">Powered by</span>
            <span className="text-purple-400 text-xs font-bold">OpenStreetMap</span>
          </div>
        </div>
      </motion.div>

      {/* ── Full-Screen Map ── */}
      <Suspense fallback={<MapLoader />}>
        <MapContent />
      </Suspense>

      {/* ── Mobile bottom quick nav ── */}
      <div
        className="md:hidden relative z-[2000] flex items-center justify-around px-2 py-2 border-t border-white/10 flex-shrink-0"
        style={{ background: 'rgba(2, 8, 23, 0.97)', backdropFilter: 'blur(20px)' }}
      >
        {[
          { href: '/', icon: FiMap, label: 'Home' },
          { href: '/hospitals', icon: FiActivity, label: 'Hospitals' },
          { href: '/emergency', icon: FiPhone, label: 'Emergency' },
          { href: '/pharmacies', icon: FiGrid, label: 'Pharmacy' },
          { href: '/dashboard', icon: FiList, label: 'My Health' },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-teal-400 transition-colors"
          >
            <Icon size={18} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}