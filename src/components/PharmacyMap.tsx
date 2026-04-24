'use client';

import { useEffect, useRef, useState } from 'react';
import { FaPills } from 'react-icons/fa';

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

interface PharmacyMapProps {
  userLocation: { lat: number; lng: number };
  pharmacies: Pharmacy[];
}

export default function PharmacyMap({ userLocation, pharmacies }: PharmacyMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: #22d3ee;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4);
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<div class="font-bold text-slate-900">📍 You are here</div>');

        userMarkerRef.current = userMarker;
        mapRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setMapError('Failed to load map');
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    pharmacies.forEach((pharmacy) => {
      const iconHtml = pharmacy.open24x7 
        ? `<div style="
            width: 32px;
            height: 32px;
            background: #22c55e;
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
          ">💊</div>`
        : `<div style="
            width: 32px;
            height: 32px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          ">💊</div>`;

      const icon = L.divIcon({
        className: 'pharmacy-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pharmacy.location.lat, pharmacy.location.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; color: #1e293b; margin-bottom: 4px;">${pharmacy.name}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${pharmacy.address || pharmacy.city}</div>
            <div style="font-size: 11px; color: #22c55e; margin-bottom: 4px;">📍 ${pharmacy.distance?.toFixed(1)} km away</div>
            ${pharmacy.open24x7 ? '<span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px;">24/7 Open</span>' : ''}
          </div>
        `);

      markersRef.current.push(marker);
    });

    if (pharmacies.length > 0) {
      const bounds = L.latLngBounds(
        pharmacies.map(p => [p.location.lat, p.location.lng])
      );
      bounds.extend([userLocation.lat, userLocation.lng]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pharmacies, userLocation, mapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-400 mb-2">⚠️ {mapError}</p>
          <p className="text-gray-500 text-sm">Please check your connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}