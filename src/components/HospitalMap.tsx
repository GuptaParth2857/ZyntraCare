'use client';

import { useEffect, useState, useCallback } from 'react';
import { FiPhone, FiClock, FiStar, FiPlus, FiMinus, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { Hospital } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

interface HospitalMapProps {
  hospitals: Hospital[];
  onHospitalSelect?: (hospital: Hospital) => void;
}

export default function HospitalMap({ hospitals, onHospitalSelect }: HospitalMapProps) {
  const { latitude, longitude, loading, refreshLocation } = useGeolocation();
  const [radius, setRadius] = useState(50);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(hospitals);
  const [mounted, setMounted] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamic import of leaflet on client only
    import('leaflet').then((leaflet) => {
      // Fix default icon issue
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (latitude && longitude) {
      const filtered = hospitals.filter(h => calculateDistance(latitude, longitude, h.location.lat, h.location.lng) <= radius);
      setFilteredHospitals(filtered.length > 0 ? filtered : hospitals);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [latitude, longitude, radius, hospitals]);

  // Initialize map after Leaflet is loaded
  useEffect(() => {
    if (!L || !mounted || mapInstance) return;
    const container = document.getElementById('hospital-map-container');
    if (!container || container.offsetWidth === 0) return;

    // Use default location if geolocation is still loading
    const centerLat = latitude ?? 28.6139;
    const centerLng = longitude ?? 77.2090;
    const map = L.map(container, {
      zoomControl: true,
      attributionControl: true,
    }).setView([centerLat, centerLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    setMapInstance(map);

    // Invalidate map size after initialization
    setTimeout(() => map.invalidateSize(), 100);

    return () => { map.remove(); };
  }, [L, mounted]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstance || !L) return;

    // Clear existing markers
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapInstance.removeLayer(layer);
      }
    });

    // User location marker (blue pulsing dot)
    if (latitude && longitude) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([latitude, longitude], { icon: userIcon })
        .addTo(mapInstance)
        .bindPopup('<b>📍 Your Location</b>');
    }

    // Hospital markers with custom icons
    const markers: any[] = [];
    filteredHospitals.forEach((hospital) => {
      const occupancy = Math.round((hospital.beds.occupied / hospital.beds.total) * 100);
      const color = occupancy > 80 ? '#ef4444' : occupancy > 50 ? '#f59e0b' : '#22c55e';

      const hospitalIcon = L.divIcon({
        className: 'hospital-marker',
        html: `<div style="position:relative;z-index:1000;">
          <div style="width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🏥</div>
          <div style="position:absolute;top:-8px;right:-8px;background:${hospital.beds.available > 0 ? '#22c55e' : '#ef4444'};color:white;font-size:10px;font-weight:bold;padding:1px 5px;border-radius:10px;border:2px solid white;">${hospital.beds.available}</div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const popupContent = `
        <div style="min-width:260px;font-family:Inter,system-ui,sans-serif;color:#0f172a;">
          <h3 style="font-weight:900;font-size:16px;margin:0 0 4px;color:#1e293b;">${hospital.name}</h3>
          <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">📍 ${hospital.address}, ${hospital.city}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
            <div style="background:#f0fdf4;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:10px;color:#6b7280;">Available</div>
              <div style="font-weight:700;color:#16a34a;font-size:16px;">${hospital.beds.available}</div>
            </div>
            <div style="background:#eff6ff;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:10px;color:#6b7280;">ICU Free</div>
              <div style="font-weight:700;color:#2563eb;font-size:16px;">${hospital.beds.icuAvailable}</div>
            </div>
            <div style="background:#fefce8;padding:6px;border-radius:8px;text-align:center;">
              <div style="font-size:10px;color:#6b7280;">Rating</div>
              <div style="font-weight:700;color:#ca8a04;font-size:16px;">⭐${hospital.rating}</div>
            </div>
          </div>
          <div style="font-size:12px;color:#475569;margin-bottom:4px;font-weight:600;">📞 ${hospital.phone}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:8px;font-weight:600;">🕐 ${hospital.workingHours}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
            ${hospital.specialties.slice(0, 3).map(s => `<span style="font-size:10px;background:#f3f4f6;padding:2px 8px;border-radius:12px;">${s}</span>`).join('')}
          </div>
          <div style="display:flex;gap:6px;">
            <a href="tel:${hospital.phone}" style="flex:1;background:#0284c7;color:white;padding:8px;border-radius:8px;text-align:center;text-decoration:none;font-size:12px;font-weight:600;">📞 Call</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}" target="_blank" style="flex:1;background:#16a34a;color:white;padding:8px;border-radius:8px;text-align:center;text-decoration:none;font-size:12px;font-weight:600;">🗺️ Directions</a>
          </div>
        </div>
      `;

      const marker = L.marker([hospital.location.lat, hospital.location.lng], { icon: hospitalIcon })
        .addTo(mapInstance)
        .bindPopup(popupContent, { maxWidth: 300 });
      markers.push(marker);
    });

    // Fit map to show all markers if we have hospitals
    if (filteredHospitals.length > 0) {
      const group = L.featureGroup(markers);
      mapInstance.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Invalidate map size to ensure proper rendering
    setTimeout(() => mapInstance.invalidateSize(), 200);
  }, [mapInstance, L, filteredHospitals, latitude, longitude]);

  if (!mounted) {
    return (
      <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-slate-900">
      {/* Inline CSS for pulsing user marker */}
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,0.3)}50%{box-shadow:0 0 0 12px rgba(59,130,246,0)}}
        .hospital-marker, .user-location-marker { z-index: 1000 !important; }
        .leaflet-popup { z-index: 1001 !important; }
        .leaflet-container { z-index: 1 !important; }
      `}</style>

      <div id="hospital-map-container" style={{ height: '100%', width: '100%' }} />

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2 hidden sm:block">
        {/* Radius control */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Search Radius</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setRadius(Math.max(5, radius - 10))} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
              <FiMinus size={14} />
            </button>
            <span className="text-sm font-bold w-14 text-center">{radius} km</span>
            <button onClick={() => setRadius(Math.min(100, radius + 10))} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
              <FiPlus size={14} />
            </button>
          </div>
        </div>

        {/* My Location button */}
        <button
          onClick={() => {
            refreshLocation();
            if (mapInstance && latitude && longitude) mapInstance.setView([latitude, longitude], 13);
          }}
          className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 hover:bg-gray-50 transition w-full"
        >
          <FiNavigation className="text-blue-600" size={16} />
          <span className="text-xs font-semibold">My Location</span>
        </button>

        {/* Refresh */}
        <button
          onClick={refreshLocation}
          className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 hover:bg-gray-50 transition w-full"
        >
          <FiRefreshCw className="text-gray-600" size={16} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 hidden sm:block">
        <p className="text-xs font-bold mb-2 text-slate-800">Legend</p>
        <div className="space-y-1.5 text-xs">
          <p className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" /> Your Location</p>
          <p className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full" /> Low Occupancy (&lt;50%)</p>
          <p className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full" /> Medium (50-80%)</p>
          <p className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full" /> High (&gt;80%)</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 hidden xs:block text-slate-800">
        <p className="text-xs font-bold mb-1 text-slate-800">{filteredHospitals.length} Hospitals Nearby</p>
        <p className="text-xs text-slate-600 font-semibold">
          {filteredHospitals.reduce((a, h) => a + h.beds.available, 0)} beds available
        </p>
        {loading && <p className="text-xs text-blue-600 mt-1 animate-pulse">📡 Getting location...</p>}
      </div>
    </div>
  );
}