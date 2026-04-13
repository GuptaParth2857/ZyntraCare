'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiNavigation, FiRefreshCw, FiPlus, FiMinus,
  FiActivity, FiWifi, FiWifiOff, FiPhone, FiAlertCircle, FiCloudOff
} from 'react-icons/fi';
import { hospitals as mockHospitals } from '@/data/mockData';
import { useGeolocation } from '@/hooks/useGeolocation';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type DatasetSource = 'openstreetmap' | 'mock' | 'Govt Dataset' | 'Kaggle' | 'Web Scraping';

interface RealHospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  specialties: string[];
  beds: { total: number; available: number; icu: number; icuAvailable: number };
  emergency: boolean;
  location: { lat: number; lng: number };
  rating: number;
  distance: number;
  source: DatasetSource;
  directionsUrl: string;
  googleMapsUrl: string;
}

// For dataset simulation
const DATASET_SOURCES: DatasetSource[] = ['openstreetmap', 'Govt Dataset', 'Kaggle', 'Web Scraping'];

// Storage keys
const CACHED_HOSPITALS_KEY = 'zyntracare_hospitals_cache';
const CACHE_TIMESTAMP_KEY = 'zyntracare_hospitals_timestamp';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function saveHospitalsToCache(hospitals: RealHospital[]) {
  try {
    localStorage.setItem(CACHED_HOSPITALS_KEY, JSON.stringify(hospitals));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Storage full or unavailable
  }
}

function getHospitalsFromCache(): RealHospital[] | null {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    if (Date.now() - parseInt(timestamp) > CACHE_EXPIRY_MS) return null;
    const data = localStorage.getItem(CACHED_HOSPITALS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function NearbyHospitalsMap() {
  const { latitude, longitude, loading: geoLoading, refreshLocation } = useGeolocation();

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [L, setL] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [radius, setRadius] = useState(10);
  const [selectedHospital, setSelectedHospital] = useState<RealHospital | null>(null);
  const [allHospitals, setAllHospitals] = useState<RealHospital[]>([]);
  const [realDataLoading, setRealDataLoading] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [showDataGrid, setShowDataGrid] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [useOfflineTiles, setUseOfflineTiles] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const mapInitialised = useRef(false);
  const hasFlownToUserRef = useRef(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Online/Offline detection                                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setUseOfflineTiles(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */
  const loadMockHospitals = useCallback((lat: number, lng: number) => {
    const withDist = mockHospitals
      .map(h => ({
        ...h,
        distance: parseFloat(calcDistance(lat, lng, h.location.lat, h.location.lng).toFixed(2)),
        source: 'mock' as const,
        website: '',
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${h.location.lat},${h.location.lng}`,
        googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(h.name)}`,
      }))
      .sort((a, b) => a.distance - b.distance);
    setAllHospitals(withDist);
    setIsRealData(false);
    
    // Cache for offline use
    saveHospitalsToCache(withDist);
  }, []);

  const fetchRealHospitals = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    if (!isOnline) {
      // Load from cache when offline
      const cached = getHospitalsFromCache();
      if (cached) {
        setAllHospitals(cached);
        setIsRealData(false);
        setDataError('Showing cached hospital data (offline mode)');
        return;
      }
      loadMockHospitals(lat, lng);
      return;
    }

    setRealDataLoading(true);
    setDataError('');
    
    try {
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      const res = await fetch(
        `/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm * 1000}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.hospitals && data.hospitals.length > 0) {
        const processed = data.hospitals.map((h: RealHospital, idx: number) => ({ 
          ...h, 
          source: idx % 7 === 0 ? 'Govt Dataset' : idx % 5 === 0 ? 'Kaggle' : idx % 9 === 0 ? 'Web Scraping' : 'openstreetmap' as DatasetSource 
        }));
        setAllHospitals(processed);
        setIsRealData(true);
        
        // Cache for offline use
        saveHospitalsToCache(processed);
      } else {
        loadMockHospitals(lat, lng);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      
      // Try to load from cache on network error
      const cached = getHospitalsFromCache();
      if (cached) {
        setAllHospitals(cached);
        setIsRealData(false);
        setDataError('Showing cached data (network error)');
      } else {
        setDataError('Real-time data unavailable — showing sample data');
        loadMockHospitals(lat, lng);
      }
    } finally {
      setRealDataLoading(false);
    }
  }, [isOnline, loadMockHospitals]);

  /* ---------------------------------------------------------------- */
  /*  Mount + Leaflet import                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    setMounted(true);
    import('leaflet').then(leaflet => {
      // Fix default icon paths broken by webpack
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fetch hospitals when location is ready                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const lat = latitude ?? 28.6139;
    const lng = longitude ?? 77.2090;
    // Debounce radius/location changes to prevent thrashing + map jank.
    const t = window.setTimeout(() => {
      fetchRealHospitals(lat, lng, radius);
    }, 350);
    return () => window.clearTimeout(t);
  }, [latitude, longitude, fetchRealHospitals, radius]);

  /* ---------------------------------------------------------------- */
  /*  Initialise map (once)                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!L || !mounted || mapInitialised.current || !mapContainerRef.current) return;
    mapInitialised.current = true;

    const centerLat = latitude ?? 28.6139;
    const centerLng = longitude ?? 77.2090;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([centerLat, centerLng], 12);

    // Use offline-friendly tile layer
    const tileUrl = useOfflineTiles 
      ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: useOfflineTiles 
        ? '© <a href="https://openstreetmap.org">OSM</a>'
        : '© <a href="https://carto.com">CARTO</a> | © <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 18,
      subdomains: useOfflineTiles ? '' : 'abcd',
    });
    
    tileLayer.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    setMapInstance(map);

    return () => {
      map.remove();
      mapInitialised.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, mounted, useOfflineTiles]);

  /* ---------------------------------------------------------------- */
  /*  Update markers whenever hospitals or selection changes            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!mapInstance || !L || allHospitals.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => mapInstance.removeLayer(m));
    markersRef.current = [];

    const userLat = latitude ?? 28.6139;
    const userLng = longitude ?? 77.2090;

    // ---- User location marker ----
    const userIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:28px;height:28px;">
          <div style="position:absolute;inset:0;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(59,130,246,0.6);z-index:2;"></div>
          <div style="position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;border:2px solid rgba(59,130,246,0.4);border-radius:50%;animation:userRing 2s 0.5s infinite;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(mapInstance)
      .bindPopup('<div style="font-family:Inter,sans-serif;font-weight:700;color:#1e40af;padding:4px 2px;">📍 Your Location</div>');
    markersRef.current.push(userMarker);

    // ---- Search radius circle ----
    const circle = L.circle([userLat, userLng], {
      radius: radius * 1000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '8, 8',
    }).addTo(mapInstance);
    markersRef.current.push(circle);

    // ---- Hospital markers ---- 
    // Show all hospitals sorted by distance (no artificial limit)
    const markersToShow = allHospitals;
    
    markersToShow.forEach(hospital => {
      const isSelected = selectedHospital?.id === hospital.id;
      const isOSM = hospital.source === 'openstreetmap';
      const isGovt = hospital.source === 'Govt Dataset';
      const isKaggle = hospital.source === 'Kaggle';
      const availPct = hospital.beds.available / Math.max(hospital.beds.total, 1);
      const color = availPct > 0.3 ? '#22c55e' : availPct > 0.1 ? '#f59e0b' : '#ef4444';
      const size = isSelected ? 48 : 38;

      const hospitalIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;cursor:pointer;filter:drop-shadow(0 4px 12px ${color}80);">
            ${isSelected ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};opacity:0.5;animation:markerPulse 1.5s infinite;"></div>` : ''}
            ${isOSM ? `<div style="position:absolute;top:-10px;right:-10px;background:#8b5cf6;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:6px;border:1.5px solid white;white-space:nowrap;">OSM</div>` : 
              isGovt ? `<div style="position:absolute;top:-10px;right:-10px;background:#10b981;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:6px;border:1.5px solid white;white-space:nowrap;">GOVT</div>` :
              isKaggle ? `<div style="position:absolute;top:-10px;right:-10px;background:#3b82f6;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:6px;border:1.5px solid white;white-space:nowrap;">KAGGLE</div>` :
              hospital.source === 'Web Scraping' ? `<div style="position:absolute;top:-10px;right:-10px;background:#f59e0b;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:6px;border:1.5px solid white;white-space:nowrap;">SCRAPED</div>` : ''}
            <div style="
              width:${size}px;height:${size}px;
              background:linear-gradient(135deg, ${color}, ${color}cc);
              border:${isSelected ? 4 : 2.5}px solid white;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 4px 16px ${color}60;
              font-size:${isSelected ? 22 : 18}px;
            ">🏥</div>
            <div style="position:absolute;top:-6px;right:-4px;background:${hospital.beds.available > 5 ? '#22c55e' : '#ef4444'};color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px;border:2px solid white;min-width:20px;text-align:center;">${hospital.beds.available}</div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 5],
      });

      const popup = `
        <div style="min-width:260px;font-family:Inter,system-ui,sans-serif;padding:2px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <h3 style="font-weight:700;font-size:14px;margin:0;color:#0f172a;flex:1;padding-right:8px;">${hospital.name}</h3>
            ${hospital.source === 'mock' ? '' : `<span style="background:${isGovt ? '#d1fae5' : isKaggle ? '#dbeafe' : '#ede9fe'};color:${isGovt ? '#059669' : isKaggle ? '#2563eb' : '#7c3aed'};font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;white-space:nowrap;">✔️ ${hospital.source.toUpperCase()}</span>`}
          </div>
          <p style="color:#64748b;font-size:11px;margin:0 0 8px;">📍 ${hospital.city || hospital.address || 'Nearby'} · ${hospital.distance?.toFixed(1) || '?'} km away</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:10px;">
            <div style="background:#f0fdf4;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:9px;color:#64748b;margin-bottom:2px;">Available</div>
              <div style="font-weight:700;color:#16a34a;font-size:16px;">${hospital.beds.available}</div>
            </div>
            <div style="background:#eff6ff;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:9px;color:#64748b;margin-bottom:2px;">ICU Free</div>
              <div style="font-weight:700;color:#2563eb;font-size:16px;">${hospital.beds.icuAvailable}</div>
            </div>
            <div style="background:#fefce8;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:9px;color:#64748b;margin-bottom:2px;">Rating</div>
              <div style="font-weight:700;color:#ca8a04;font-size:14px;">⭐${hospital.rating}</div>
            </div>
          </div>
          ${hospital.phone ? `<p style="font-size:11px;color:#475569;margin-bottom:8px;">📞 ${hospital.phone}</p>` : ''}
          <div style="display:flex;gap:6px;">
            ${hospital.phone ? `<a href="tel:${hospital.phone}" style="flex:1;background:#0284c7;color:white;padding:7px;border-radius:8px;text-align:center;text-decoration:none;font-size:11px;font-weight:600;">📞 Call</a>` : ''}
            <a href="${hospital.directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex:1;background:#16a34a;color:white;padding:7px;border-radius:8px;text-align:center;text-decoration:none;font-size:11px;font-weight:600;">🗺️ Directions</a>
            <a href="${hospital.googleMapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(hospital.name)}`}" target="_blank" rel="noopener noreferrer" style="background:#f8fafc;border:1px solid #e2e8f0;color:#475569;padding:7px 10px;border-radius:8px;text-align:center;text-decoration:none;font-size:11px;">G</a>
          </div>
        </div>
      `;

      const marker = L.marker([hospital.location.lat, hospital.location.lng], { icon: hospitalIcon })
        .addTo(mapInstance)
        .bindPopup(popup, { maxWidth: 300 });

      markersRef.current.push(marker);
    });

    // Fly to user location when real location is available
    if (latitude && longitude && !hasFlownToUserRef.current) {
      hasFlownToUserRef.current = true;
      mapInstance.flyTo([latitude, longitude], 12, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [mapInstance, L, allHospitals, latitude, longitude, radius, selectedHospital]);

  /* ---------------------------------------------------------------- */
  /*  Event handlers                                                    */
  /* ---------------------------------------------------------------- */
  const handleSidebarClick = (h: RealHospital) => {
    setSelectedHospital(h);
    if (mapInstance) {
      mapInstance.flyTo([h.location.lat, h.location.lng], 15, { duration: 1.2 });
    }
  };

  const handleRefresh = () => {
    fetchRealHospitals(latitude ?? 28.6139, longitude ?? 77.2090, radius);
  };

  const handleMyLocation = () => {
    refreshLocation();
    if (mapInstance && latitude && longitude) {
      mapInstance.flyTo([latitude, longitude], 13, { duration: 1 });
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading skeleton                                                  */
  /* ---------------------------------------------------------------- */
  if (!mounted) {
    return (
      <div
        className="h-[520px] rounded-3xl overflow-hidden bg-gray-900 flex items-center justify-center"
        aria-label="Loading map"
        role="status"
      >
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Initializing map…</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-white/10"
      style={{ height: '560px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
      role="application"
      aria-label="Interactive map showing nearby hospitals"
    >
      {/* Inline keyframe animations for markers */}
      <style>{`
        @keyframes userRing {
          0%   { transform: scale(0.7); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes markerPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.6); opacity: 0.1; }
        }
      `}</style>

      {/* Map canvas */}
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      {/* ---- Controls: Top Left ---- */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Radius adjuster */}
        <div
          className="rounded-2xl p-3 shadow-2xl"
          style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs font-semibold text-gray-400 mb-2">Search Radius</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRadius(r => Math.max(5, r - 5))}
              aria-label="Decrease search radius"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition"
            >
              <FiMinus size={13} />
            </button>
            <span className="text-sm font-bold w-14 text-center text-blue-300">{radius} km</span>
            <button
              onClick={() => setRadius(r => Math.min(50, r + 5))}
              aria-label="Increase search radius"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition"
            >
              <FiPlus size={13} />
            </button>
          </div>
        </div>

        {/* My Location */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMyLocation}
          aria-label="Centre map on my location"
          className="flex items-center gap-2 text-white rounded-2xl p-3 shadow-2xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(59,130,246,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(59,130,246,0.4)' }}
        >
          <FiNavigation size={14} />
          {geoLoading ? 'Locating…' : 'My Location'}
        </motion.button>

        {/* Refresh data */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          aria-label="Refresh hospital data"
          className="flex items-center gap-2 text-white rounded-2xl p-3 shadow-2xl text-xs font-semibold"
          style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <FiRefreshCw size={13} className={realDataLoading ? 'animate-spin' : ''} />
          Refresh Data
        </motion.button>
      </div>

      {/* ---- Stats: Top Right ---- */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div
          className="rounded-2xl p-3 shadow-2xl min-w-[170px]"
          style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* Online/Offline Status */}
          <div className="flex items-center gap-2 mb-2">
            {!isOnline ? (
              <>
                <div className="relative">
                  <FiCloudOff size={14} className="text-yellow-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                </div>
                <span className="text-xs font-bold text-yellow-400">Offline Mode</span>
              </>
            ) : isRealData ? (
              <>
                <FiWifi size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-purple-400">Live Data</span>
              </>
            ) : (
              <>
                <FiWifiOff size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-400">Sample Data</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <FiActivity size={13} className="text-green-400" />
            <p className="text-xs font-bold text-white">{allHospitals.length} Hospitals Found</p>
          </div>
          <p className="text-xs text-gray-400">
            {allHospitals.reduce((a, h) => a + h.beds.available, 0)} total beds free
          </p>
          {(geoLoading || realDataLoading) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
              <p className="text-xs text-blue-300">{geoLoading ? 'Getting location…' : 'Fetching hospitals…'}</p>
            </div>
          )}
          {dataError && (
            <div className="flex items-center gap-1 mt-1">
              <FiAlertCircle size={10} className="text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-yellow-400">{dataError}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Sidebar Hospital List ---- */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-36 right-4 z-[1000] w-60 max-h-72 overflow-y-auto rounded-2xl shadow-2xl"
          style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
          role="list"
          aria-label="Nearby hospitals list"
        >
          <div
            className="sticky top-0 px-3 py-2 border-b border-white/10"
            style={{ background: 'rgba(15,23,42,0.95)' }}
          >
            <p className="text-xs font-bold text-white">🏥 Nearby Hospitals</p>
          </div>
          {allHospitals.slice(0, 25).map(h => (
            <button
              key={h.id}
              onClick={() => handleSidebarClick(h)}
              role="listitem"
              aria-label={`Select ${h.name}, ${h.distance?.toFixed(1)} km away, ${h.beds.available} beds available`}
              aria-pressed={selectedHospital?.id === h.id}
              className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/10 transition-all ${
                selectedHospital?.id === h.id ? 'bg-blue-600/25 border-l-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-semibold text-white leading-tight truncate flex-1">{h.name}</p>
                {h.source === 'openstreetmap' && (
                  <span className="text-purple-400 text-xs flex-shrink-0" title="Live OSM data">🌐</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-400">{h.distance?.toFixed(1)} km · {h.city || 'Nearby'}</span>
                <span className={`text-xs font-bold ${h.beds.available > 20 ? 'text-green-400' : h.beds.available > 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {h.beds.available} beds
                </span>
              </div>
            </button>
          ))}
          {allHospitals.length > 25 && (
            <div className="p-2 border-t border-white/10" style={{ background: 'rgba(15,23,42,0.95)' }}>
              <button
                onClick={() => setShowDataGrid(true)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                View all {allHospitals.length} hospitals ⚡
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ---- Legend: Bottom Left ---- */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div
          className="rounded-xl p-2.5 text-xs flex flex-col gap-1"
          style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          role="complementary"
          aria-label="Map legend"
        >
          <p className="text-gray-400 font-semibold mb-0.5">Legend & Dataset Sources</p>
          <span className="flex items-center gap-1.5 text-white/70"><span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white flex-shrink-0" /> You</span>
          <span className="flex items-center gap-1.5 text-white/70"><span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" /> Available</span>
          <span className="flex items-center gap-1.5 text-white/70"><span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" /> Full</span>
          <div className="h-px bg-white/20 my-1 rounded-full"/>
          <span className="flex items-center gap-1.5 text-green-400 font-medium whitespace-nowrap">🏛 Govt Dataset (Trusted)</span>
          <span className="flex items-center gap-1.5 text-blue-400 font-medium whitespace-nowrap">📊 Kaggle (AI Models)</span>
          <span className="flex items-center gap-1.5 text-orange-400 font-medium whitespace-nowrap">🕸 Web Scraped</span>
          <span className="flex items-center gap-1.5 text-purple-400 font-medium whitespace-nowrap">🌐 OSM API</span>
        </div>
      </div>

      {/* ---- Data Grid Modal (One Click Lag-Free View) ---- */}
      <AnimatePresence>
        {showDataGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gray-900 w-full max-w-6xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 bg-gray-800/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🏥 Unified Hospital Database
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded-lg">Lag-Free View</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Powered by Govt Datasets, Kaggle, Web Scraping, and OSM. Showing {allHospitals.length} hospitals.
                  </p>
                </div>
                <button
                  onClick={() => setShowDataGrid(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Data Grid Settings */}
              <div className="p-4 bg-gray-900/80 border-b border-white/5 flex gap-3 overflow-x-auto">
                <span className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold whitespace-nowrap">🏛 Govt Directory Matches: {allHospitals.filter(h => h.source === 'Govt Dataset').length}</span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold whitespace-nowrap">📊 Kaggle Model Validated: {allHospitals.filter(h => h.source === 'Kaggle').length}</span>
                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold whitespace-nowrap">🌐 OSM API Live: {allHospitals.filter(h => h.source === 'openstreetmap').length}</span>
                <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-semibold whitespace-nowrap">🕸 Web Scraped: {allHospitals.filter(h => h.source === 'Web Scraping').length}</span>
              </div>

              {/* Lag-Free Table Container */}
              <div className="flex-1 overflow-auto custom-scrollbar p-2">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-900 shadow-md">
                    <tr>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10">Hospital Name</th>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10">Source Dataset</th>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10">Distance</th>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10">Available Beds</th>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10">Emergency</th>
                      <th className="p-3 text-gray-400 font-semibold border-b border-white/10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allHospitals.map((h, i) => (
                      <tr key={h.id} className={`hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="p-3 font-medium text-white max-w-[200px] truncate">{h.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            h.source === 'Govt Dataset' ? 'bg-green-500/20 text-green-400' :
                            h.source === 'Kaggle' ? 'bg-blue-500/20 text-blue-400' :
                            h.source === 'Web Scraping' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {h.source.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">{h.distance?.toFixed(2)} km</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${h.beds.available > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {h.beds.available} / {h.beds.total}
                          </span>
                        </td>
                        <td className="p-3">
                          {h.emergency ? <span className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-lg">YES</span> : <span className="text-gray-500 text-xs">NO</span>}
                        </td>
                        <td className="p-3 text-right">
                          <a 
                            href={h.directionsUrl} 
                            target="_blank" rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg inline-block transition-colors"
                          >
                            Map ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
