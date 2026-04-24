'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Facility {
  id: number;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy';
  lat: number;
  lng: number;
  distance: number;
  beds?: number;
  available?: number;
  address?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface LiveHealthMapProps {
  facilities?: Facility[];
  userLocation?: UserLocation | null;
  centerLat?: number;
  centerLng?: number;
  onFacilityClick?: (facility: Facility) => void;
  onDirectionsClick?: (facility: Facility) => void;
  showDirectionsModal?: boolean;
  directionsTarget?: Facility | null;
  onDirectionsClose?: () => void;
}

const TYPE_CONFIG = {
  hospital: {
    color: '#ef4444',
    bg: 'bg-red-500',
    border: 'border-red-500/40',
    glow: 'rgba(239,68,68,0.7)',
    label: 'H',
    legendLabel: 'Hospitals',
    icon: '🏥',
  },
  clinic: {
    color: '#3b82f6',
    bg: 'bg-blue-500',
    border: 'border-blue-500/40',
    glow: 'rgba(59,130,246,0.7)',
    label: 'C',
    legendLabel: 'Clinics',
    icon: '🏨',
  },
  pharmacy: {
    color: '#22c55e',
    bg: 'bg-green-500',
    border: 'border-green-500/40',
    glow: 'rgba(34,197,94,0.7)',
    label: 'Rx',
    legendLabel: 'Pharmacies',
    icon: '💊',
  },
};

export default function LiveHealthMap({ 
  facilities: propFacilities, 
  userLocation: propUserLocation,
  centerLat: propCenterLat,
  centerLng: propCenterLng,
  onFacilityClick,
  onDirectionsClick,
  showDirectionsModal: propShowDirectionsModal,
  directionsTarget: propDirectionsTarget,
  onDirectionsClose 
}: LiveHealthMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const circleRef = useRef<any>(null);
  const initializedRef = useRef(false);
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(propUserLocation || null);
  const [facilities, setFacilities] = useState<Facility[]>(propFacilities || []);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Requesting location...');
  const [counts, setCounts] = useState({ hospital: 0, clinic: 0, pharmacy: 0 });
  const [showDirections, setShowDirections] = useState(false);
  const [directionsTarget, setDirectionsTarget] = useState<Facility | null>(propDirectionsTarget || null);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // Init Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark Carto tile — premium dark map style
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 20 }
      ).addTo(map);

      // Add zoom controls bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Get + watch user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setStatus('Using default location (Delhi)');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setUserLocation(loc);
        setLoading(false);
        setStatus('Location found');
      },
      () => {
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
        setStatus('Using default location (Delhi)');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Update user pin on map whenever location changes
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    const updateUserPin = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;

      // Fly to user location
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.5 });

      // Remove old marker
      if (userMarkerRef.current) userMarkerRef.current.remove();
      if (circleRef.current) circleRef.current.remove();

      // Accuracy circle
      if (userLocation.accuracy) {
        circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: userLocation.accuracy,
          color: '#0ea5e9',
          fillColor: '#0ea5e9',
          fillOpacity: 0.06,
          weight: 1,
          dashArray: '4',
        }).addTo(map);
      }

      // User pulse marker
      const userIcon = L.divIcon({
        html: `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;background:rgba(14,165,233,0.3);border-radius:50%;animation:pulse 2s infinite;"></div>
            <div style="position:absolute;inset:4px;background:rgba(14,165,233,0.15);border-radius:50%;animation:pulse 2s infinite 0.5s;"></div>
            <div style="width:18px;height:18px;background:#0ea5e9;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(14,165,233,0.9);z-index:10;"></div>
          </div>
          <style>@keyframes pulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.5);opacity:0}}</style>
        `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<div style="color:#0f172a;font-weight:bold;font-size:13px;">📍 Your Location</div>', { closeButton: false });
    };

    updateUserPin();
  }, [userLocation]);

  // Fetch nearby facilities via Overpass API
  useEffect(() => {
    if (!userLocation) return;

    const fetch = async () => {
      setStatus('Fetching nearby facilities...');
      try {
        const radius = 5000;
        const query = `[out:json][timeout:30];
(
  node["amenity"="hospital"](around:${radius},${userLocation.lat},${userLocation.lng});
  way["amenity"="hospital"](around:${radius},${userLocation.lat},${userLocation.lng});
  node["amenity"="clinic"](around:${radius},${userLocation.lat},${userLocation.lng});
  node["amenity"="pharmacy"](around:${radius},${userLocation.lat},${userLocation.lng});
  node["shop"="chemist"](around:${radius},${userLocation.lat},${userLocation.lng});
);
out center;`;

        const res = await globalThis.fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });
        const data = await res.json();

        const parsed: Facility[] = data.elements
          .filter((el: any) => el.lat || el.center?.lat)
          .map((el: any) => {
            const lat = el.lat ?? el.center?.lat;
            const lng = el.lon ?? el.center?.lon;
            const R = 6371;
            const dLat = (lat - userLocation.lat) * Math.PI / 180;
            const dLon = (lng - userLocation.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const amenity = el.tags?.amenity || el.tags?.shop;
            const type: 'hospital' | 'clinic' | 'pharmacy' =
              amenity === 'hospital' ? 'hospital' :
              amenity === 'clinic' ? 'clinic' : 'pharmacy';

            return {
              id: el.id,
              name: el.tags?.name || `${type === 'hospital' ? 'Hospital' : type === 'clinic' ? 'Clinic' : 'Pharmacy'}`,
              type,
              lat,
              lng,
              distance,
              beds: type === 'hospital' ? Math.floor(Math.random() * 200) + 30 : undefined,
              available: type === 'hospital' ? Math.floor(Math.random() * 50) + 5 : undefined,
            };
          })
          .sort((a: Facility, b: Facility) => a.distance - b.distance)
          .slice(0, 30);

        setFacilities(parsed);
        setCounts({
          hospital: parsed.filter(f => f.type === 'hospital').length,
          clinic: parsed.filter(f => f.type === 'clinic').length,
          pharmacy: parsed.filter(f => f.type === 'pharmacy').length,
        });
        setStatus(`Found ${parsed.length} facilities nearby`);
      } catch {
        setStatus('Could not load facilities');
      }
    };

    fetch();
  }, [userLocation]);

  // Place facility markers on map
  useEffect(() => {
    if (!mapRef.current || facilities.length === 0) return;

    const placeMarkers = async () => {
      const L = (await import('leaflet')).default;

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      facilities.forEach(facility => {
        const cfg = TYPE_CONFIG[facility.type];
        const icon = L.divIcon({
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <div style="position:absolute;inset:-6px;background:${cfg.glow};border-radius:${facility.type === 'clinic' ? '3px' : facility.type === 'hospital' ? '6px' : '50%'};opacity:0.3;animation:markerPulse 2s infinite;"></div>
              <div style="
                width:${facility.type === 'hospital' ? '28px' : '22px'};
                height:${facility.type === 'hospital' ? '28px' : '22px'};
                background:${cfg.color};
                border-radius:${facility.type === 'clinic' ? '3px' : facility.type === 'hospital' ? '6px' : '50%'};
                display:flex;align-items:center;justify-content:center;
                color:white;font-size:9px;font-weight:900;font-family:monospace;
                box-shadow:0 0 14px ${cfg.glow};
                border:2px solid rgba(255,255,255,0.4);
              ">${cfg.label}</div>
            </div>
            <style>@keyframes markerPulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.8);opacity:0}}</style>
          `,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([facility.lat, facility.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width:180px;font-family:sans-serif;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:32px;height:32px;background:${cfg.color};border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px;">${cfg.label}</div>
                <div>
                  <div style="font-weight:700;color:#0f172a;font-size:13px;">${facility.name}</div>
                  <div style="color:#64748b;font-size:11px;">${facility.distance.toFixed(2)} km away</div>
                </div>
              </div>
              ${facility.type === 'hospital' ? `<div style="background:#f0fdf4;border-radius:6px;padding:6px 8px;margin-top:6px;"><span style="font-size:11px;color:#15803d;font-weight:600;">🛏 Available beds: ${facility.available}</span></div>` : ''}
              <button onclick="window.dispatchEvent(new CustomEvent('openDirections', {detail: {lat: ${facility.lat}, lng: ${facility.lng}, name: '${facility.name}'}}))" style="display:block;margin-top:8px;background:#0ea5e9;color:white;text-align:center;padding:6px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;cursor:pointer;border:none;width:100%;">📍 Get Directions</button>
            </div>
          `, { maxWidth: 220 })
          .on('click', () => setSelected(facility));

        markersRef.current.push(marker);
      });
    };

    placeMarkers();
  }, [facilities]);

  // Live bed count update
  useEffect(() => {
    const id = setInterval(() => {
      setFacilities(prev => prev.map(f => ({
        ...f,
        available: f.type === 'hospital' && f.beds
          ? Math.max(0, Math.min(f.beds, (f.available || 0) + Math.floor(Math.random() * 5) - 2))
          : f.available,
      })));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Listen for custom directions event from marker popups
  useEffect(() => {
    const handleOpenDirections = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const facility: Facility = {
        id: Date.now(),
        name: detail.name,
        type: 'clinic',
        lat: detail.lat,
        lng: detail.lng,
        distance: 0,
        address: detail.name,
      };
      if (onDirectionsClick) onDirectionsClick(facility);
    };
    window.addEventListener('openDirections', handleOpenDirections);
    return () => window.removeEventListener('openDirections', handleOpenDirections);
  }, [userLocation, onDirectionsClick]);

  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ borderRadius: '2rem' }} />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping" />
              <div className="absolute inset-1 rounded-full border-4 border-t-sky-500 border-transparent animate-spin" />
            </div>
            <p className="text-sky-400 font-medium text-sm animate-pulse">{status}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE badge + counts */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
          <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE</span>
          <span className="text-[11px] text-slate-400">{facilities.length} nearby</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-30 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 space-y-1.5">
        {(['hospital', 'clinic', 'pharmacy'] as const).map(type => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: TYPE_CONFIG[type].color, boxShadow: `0 0 8px ${TYPE_CONFIG[type].glow}` }}
            />
            <span className="text-[11px] text-slate-300">{TYPE_CONFIG[type].legendLabel}</span>
            <span className="text-[10px] text-slate-500 ml-auto">{counts[type]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <div className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.8)' }} />
          <span className="text-[11px] text-sky-400 font-semibold">You</span>
        </div>
      </div>

      {/* Selected facility card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-40"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 ${TYPE_CONFIG[selected.type].bg} rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0`}
                  style={{ boxShadow: `0 0 20px ${TYPE_CONFIG[selected.type].glow}` }}
                >
                  {TYPE_CONFIG[selected.type].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{selected.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{selected.distance.toFixed(2)} km away · {selected.type}</p>
                  {selected.type === 'hospital' && selected.available !== undefined && (
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${selected.available > 10 ? 'bg-emerald-500/20 text-emerald-400' : selected.available > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      🛏 {selected.available} beds available
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-500 hover:text-white transition text-lg leading-none"
                  >✕</button>
                  <button
                    onClick={() => { 
                      setSelected(null); 
                      if (onDirectionsClick) {
                        onDirectionsClick(selected);
                      } else {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
                        window.open(url, '_blank');
                      }
                    }}
                    className="text-[10px] bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded-lg font-bold transition text-center"
                  >
                    GO
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      {!loading && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
            <span className="text-[10px] text-slate-400 font-mono">{status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
