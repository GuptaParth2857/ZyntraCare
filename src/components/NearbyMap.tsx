'use client';

// NearbyMap.tsx - Interactive Map with Real Hospital Markers
// Uses Leaflet + OpenStreetMap (free, no API key required)

import { useEffect, useState, useRef } from 'react';
import { Place } from '@/hooks/useNearbyPlaces';
import { formatDistance } from '@/utils/distance';

interface NearbyMapProps {
  places: Place[];
  userLat: number;
  userLng: number;
  centerLat?: number;
  centerLng?: number;
  radius?: number;
  height?: string;
  onPlaceSelect?: (place: Place) => void;
  selectedPlaceId?: string;
  showRadiusCircle?: boolean;
  compact?: boolean;
}

// Type definitions for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default function NearbyMap({
  places,
  userLat,
  userLng,
  centerLat,
  centerLng,
  radius = 10,
  height = '400px',
  onPlaceSelect,
  selectedPlaceId,
  showRadiusCircle = true,
  compact = false,
}: NearbyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  // Load Leaflet dynamically
  useEffect(() => {
    // Check if already loaded
    if (window.L) {
      setIsMapReady(true);
      setMapLoading(false);
      return;
    }

    // Load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.async = true;
    scriptEl.onload = () => {
      setIsMapReady(true);
      setMapLoading(false);
    };
    scriptEl.onerror = () => {
      setLoadError('Failed to load map');
      setMapLoading(false);
    };
    document.head.appendChild(scriptEl);

    return () => {
      // Cleanup is handled by component unmount
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    try {
      const L = window.L;
      
      // Create map centered on user location
      const map = L.map(mapRef.current, {
        center: [centerLat ?? userLat, centerLng ?? userLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: !compact,
      });

      // Add OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Map initialization error:', err);
      setLoadError('Failed to initialize map');
    }
  }, [isMapReady, userLat, userLng, centerLat, centerLng, compact]);

  // Add/update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    markersRef.current = [];

    // Remove radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Add user location marker (pulsing blue dot)
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="user-marker-container">
          <div class="user-marker-pulse"></div>
          <div class="user-marker-dot"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<strong>Your Location</strong>');

    // Add radius circle
    if (showRadiusCircle) {
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: radius * 1000,
        color: '#14b8a6',
        fillColor: '#14b8a6',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 10',
      }).addTo(mapInstanceRef.current);
    }

    // Add place markers
    const seenKeys = new Set<string>();
    places.forEach((place, index) => {
      const isSelected = selectedPlaceId === place.id;
      
      // Generate unique key to avoid React duplicate key error
      const uniqueKey = `${place.type}_${place.id}_${index}`;
      if (seenKeys.has(uniqueKey)) {
        return; // Skip duplicate
      }
      seenKeys.add(uniqueKey);
      
      // Different colors for different types - Hospital(Red), Clinic(Blue), Pharmacy(Green)
      let markerColor = '#6b7280'; // default gray
      let markerIcon = '📍';
      if (place.type === 'hospital') {
        markerColor = '#ef4444'; // Red
        markerIcon = 'H';
      } else if (place.type === 'pharmacy') {
        markerColor = '#22c55e'; // Green
        markerIcon = 'P';
      } else if (place.type === 'clinic') {
        markerColor = '#3b82f6'; // Blue
        markerIcon = 'C';
      }

      const iconHtml = `<div class="marker-color" style="background-color: ${markerColor}; ${isSelected ? 'transform: scale(1.2);' : ''}">
        <span class="marker-letter">${markerIcon}</span>
      </div>`;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const distance = place.distance ? formatDistance(place.distance) : 'N/A';
      
      const popupContent = `
        <div class="map-popup">
          <h4>${place.name}</h4>
          <p class="popup-type">${place.type.charAt(0).toUpperCase() + place.type.slice(1)}</p>
          <p class="popup-distance">📍 ${distance} away</p>
          ${place.address ? `<p class="popup-address">${place.address}</p>` : ''}
          ${place.openingHours ? `<p class="popup-hours">⏰ ${place.openingHours}</p>` : ''}
          <div class="popup-actions">
            ${place.phone ? `<a href="tel:${place.phone}" class="popup-btn call">📞 Call</a>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="popup-btn directions">📍 Directions</a>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup',
        });

      marker.on('click', () => {
        if (onPlaceSelect) {
          onPlaceSelect(place);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (places.length > 0) {
      const bounds = L.latLngBounds([
        [userLat, userLng],
        ...places.map((p) => [p.lat, p.lng]),
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, userLat, userLng, isMapReady, selectedPlaceId, onPlaceSelect, showRadiusCircle, radius]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl">
          <div className="text-center p-4">
            <p className="text-red-400 mb-2">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-teal-400 hover:text-teal-300 text-sm"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mapLoading || !isMapReady) {
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-teal-400 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900">
      <div ref={mapRef} style={{ height }} className="w-full" />
      
      {/* Map Legend */}
      {!compact && (
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg p-2 z-[1000]">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="text-lg">🏥</span> Hospital
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">🏨</span> Clinic
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">💊</span> Pharmacy
            </span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-3 mx-auto" />
            <p className="text-teal-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .user-marker-container {
          position: relative;
          width: 24px;
          height: 24px;
        }
        
        .user-marker-pulse {
          position: absolute;
          inset: -6px;
          background: rgba(245, 158, 11, 0.3);
          border-radius: 50%;
          animation: userPulse 2s ease-out infinite;
        }
        
        .user-marker-dot {
          position: absolute;
          inset: 4px;
          background: #f59e0b;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        @keyframes userPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        
        .custom-marker {
          background: none;
          border: none;
        }
        
        .marker-color {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transition: all 0.2s;
          cursor: pointer;
          border: 2px solid white;
        }
        
        .marker-letter {
          color: white;
          font-size: 14px;
          font-weight: 800;
          font-family: sans-serif;
        }
        
        .marker-hospital, .marker-clinic, .marker-pharmacy {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: rgba(10, 22, 18, 0.9);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .marker-hospital:hover, .marker-clinic:hover, .marker-pharmacy:hover {
          transform: scale(1.2);
        }
        
        .marker-hospital.selected {
          background: #14b8a6;
          box-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
        }
        
        .marker-clinic.selected {
          background: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        
        .marker-pharmacy.selected {
          background: #22c55e;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 22, 18, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: rgba(10, 22, 18, 0.95);
        }
        
        .map-popup h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 700;
        }
        
        .map-popup .popup-type {
          color: #14b8a6;
          font-size: 12px;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .map-popup .popup-distance {
          color: #94a3b8;
          font-size: 12px;
          margin: 0 0 4px 0;
        }
        
        .map-popup .popup-address, .map-popup .popup-hours {
          color: #94a3b8;
          font-size: 11px;
          margin: 0 0 8px 0;
        }
        
        .map-popup .popup-actions {
          display: flex;
          gap: 8px;
        }
        
        .map-popup .popup-btn {
          flex: 1;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .map-popup .popup-btn.call {
          background: #14b8a6;
          color: white;
        }
        
        .map-popup .popup-btn.directions {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .map-popup .popup-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}