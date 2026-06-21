// useNearbyPlaces.ts - Fetch Real Places from Overpass API
// Fetches real hospitals, clinics, pharmacies from OpenStreetMap

import { useState, useEffect, useCallback } from 'react';
import { getDistanceKm, sortByDistance } from '@/utils/distance';

export type PlaceType = 'hospital' | 'clinic' | 'pharmacy' | 'lab';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  distance?: number;
  photos?: string[]; // Array of photo URLs for the facility
}

export interface UseNearbyPlacesReturn {
  places: Place[];
  hospitals: Place[];
  clinics: Place[];
  pharmacies: Place[];
  labs: Place[];
  loading: boolean;
  error: string | null;
  radius: number;
  setRadius: (r: number) => void;
  refresh: () => void;
  totalCount: number;
}

// Radius options in km
export const RADIUS_OPTIONS = [2, 5, 10, 15, 20];

export function useNearbyPlaces(
  userLat: number | null,
  userLng: number | null,
  options?: {
    initialRadius?: number;
    autoFetch?: boolean;
  }
): UseNearbyPlacesReturn {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(options?.initialRadius ?? 10);

  const fetchPlaces = useCallback(async () => {
    if (userLat === null || userLng === null) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/hospitals/nearby?lat=${userLat}&lng=${userLng}&radius=${radius * 1000}`,
        { signal: AbortSignal.timeout(15000) }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const hospitals2 = data.hospitals || [];

      const transformedPlaces: Place[] = hospitals2.map((h: any) => ({
        id: h.id,
        name: h.name,
        type: (h.type || 'hospital') as PlaceType,
        lat: h.location?.lat || userLat,
        lng: h.location?.lng || userLng,
        address: h.address || '',
        phone: h.phone || '',
        website: h.website || '',
        openingHours: h.workingHours || '',
        distance: h.distance || getDistanceKm(userLat, userLng, h.location?.lat || userLat, h.location?.lng || userLng),
      }));

      const sortedPlaces = sortByDistance(transformedPlaces, userLat, userLng);
      setPlaces(sortedPlaces);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Could not load nearby places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [userLat, userLng, radius]);

  // Fetch on mount and when location/radius changes
  useEffect(() => {
    if (options?.autoFetch !== false && userLat && userLng) {
      fetchPlaces();
    }
  }, [fetchPlaces, options?.autoFetch]);

  // Filter by type
  const hospitals = places.filter((p) => p.type === 'hospital');
  const clinics = places.filter((p) => p.type === 'clinic');
  const pharmacies = places.filter((p) => p.type === 'pharmacy');
  const labs = places.filter((p) => p.type === 'lab');

  return {
    places,
    hospitals,
    clinics,
    pharmacies,
    labs,
    loading,
    error,
    radius,
    setRadius,
    refresh: fetchPlaces,
    totalCount: places.length,
  };
}

export default useNearbyPlaces;