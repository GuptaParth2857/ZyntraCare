'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Place, PlaceType } from '@/hooks/useNearbyPlaces';

interface NearbyMapProps {
  places: Place[];
  userLat: number;
  userLng: number;
  radius?: number;
  height?: string | number;
  compact?: boolean;
  showRadiusCircle?: boolean;
  onPlaceSelect?: (place: Place) => void;
  selectedPlaceId?: string;
}

function createIcon(L: any, color: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:${color};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;font-family:Arial,sans-serif;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const typeIcons: Record<string, { color: string; label: string }> = {
  hospital: { color: '#ef4444', label: 'H' },
  lab: { color: '#8b5cf6', label: 'L' },
  pharmacy: { color: '#22c55e', label: 'P' },
  clinic: { color: '#3b82f6', label: 'C' },
  dentist: { color: '#ec4899', label: 'D' },
  pet_clinic: { color: '#f97316', label: '🐾' },
  pet_shop: { color: '#f59e0b', label: '🐕' },
  pet_pharmacy: { color: '#22c55e', label: '💊' },
};

function FitBounds({ places, userLat, userLng }: { places: Place[]; userLat: number; userLng: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (places.length === 0) {
      map.setView([userLat, userLng], 12);
      return;
    }
    import('leaflet').then(L => {
      const haversine = (a: number, b: number, c: number, d: number) => {
        const R = 6371;
        const toRad = (x: number) => (x * Math.PI) / 180;
        const dLat = toRad(c - a);
        const dLng = toRad(d - b);
        const h =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      };

      // If any place is very far from the user, don't zoom out to fit it —
      // keep the map centered on the user so far-away POIs never spread the
      // view across the whole country.
      let far = false;
      for (const p of places) {
        if (haversine(userLat, userLng, p.lat, p.lng) > 30) { far = true; break; }
      }
      if (far) {
        map.setView([userLat, userLng], 12);
        return;
      }

      const bounds = L.latLngBounds([
        [userLat, userLng],
        ...places.map(p => [p.lat, p.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    });
  }, [places, userLat, userLng, map]);
  return null;
}

export default function NearbyMap({
  places,
  userLat,
  userLng,
  radius = 10,
  height = '400px',
  compact = false,
  showRadiusCircle = true,
  onPlaceSelect,
}: NearbyMapProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then(leaflet => {
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  const heightStr = typeof height === 'number' ? `${height}px` : height;

  const userIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;position:relative;">
        <div style="position:absolute;inset:-6px;background:rgba(245,158,11,0.3);border-radius:50%;animation:mpulse 2s infinite;"></div>
        <div style="width:20px;height:20px;background:#f59e0b;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);position:relative;z-index:2;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, [L]);

  const markers = useMemo(() => {
    if (!L) return [];
    return places.map(place => {
      const t = typeIcons[place.type] || typeIcons.hospital;
      return { ...place, icon: createIcon(L, t.color, t.label), color: t.color };
    });
  }, [places, L]);

  if (!mounted || !L) {
    return (
      <div style={{ height: heightStr, width: '100%', borderRadius: '1rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', height: heightStr, width: '100%', background: '#0f172a' }}>
      <style>{`
        @keyframes mpulse { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.8); opacity:0; } }
        .leaflet-container { background: #0f172a !important; }
      `}</style>
      <MapContainer
        center={[userLat, userLng]}
        zoom={compact ? 11 : 12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={!compact}
        scrollWheelZoom={!compact}
        attributionControl={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={compact ? '' : '&copy; OpenStreetMap contributors'}
          maxZoom={19}
        />

        <FitBounds places={places} userLat={userLat} userLng={userLng} />

        {/* User marker */}
        {userIcon && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup><b>Your Location</b></Popup>
          </Marker>
        )}

        {/* Radius circle */}
        {showRadiusCircle && (
          <Circle
            center={[userLat, userLng]}
            radius={radius * 1000}
            pathOptions={{
              color: '#14b8a6',
              fillColor: '#14b8a6',
              fillOpacity: 0.06,
              weight: 2,
              dashArray: '6,8',
            }}
          />
        )}

        {/* Place markers */}
        {markers.map((place, idx) => (
          <Marker
            key={`${place.id}_${idx}`}
            position={[place.lat, place.lng]}
            icon={place.icon}
            eventHandlers={{
              click: () => onPlaceSelect?.(place),
            }}
          >
            <Popup maxWidth={240}>
              <div style={{ fontFamily: 'Arial, sans-serif' }}>
                <b style={{ fontSize: '13px' }}>{place.name}</b>
                <div style={{ color: place.color, fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, margin: '2px 0' }}>
                  {place.type}
                </div>
                {place.distance != null && (
                  <div style={{ color: '#666', fontSize: '11px' }}>
                    {place.distance < 1 ? `${Math.round(place.distance * 1000)} m` : `${place.distance.toFixed(1)} km`}
                  </div>
                )}
                {place.address && (
                  <div style={{ color: '#666', fontSize: '11px', marginTop: 2 }}>{place.address}</div>
                )}
                {place.rating != null && place.rating > 0 && (
                  <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: 2 }}>
                    {'★'.repeat(Math.round(place.rating))} {place.rating.toFixed(1)}
                  </div>
                )}
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  {place.phone && (
                    <a href={`tel:${place.phone}`} style={{ background: place.color, color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 10, textDecoration: 'none', fontWeight: 600 }}>
                      Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#f3f4f6', color: '#333', padding: '3px 8px', borderRadius: 4, fontSize: 10, textDecoration: 'none', fontWeight: 600 }}
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {places.length === 0 && (
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.85)', color: '#94a3b8', padding: '6px 14px', borderRadius: 8, fontSize: 12, zIndex: 1000, pointerEvents: 'none' }}>
          No places found nearby
        </div>
      )}
    </div>
  );
}
