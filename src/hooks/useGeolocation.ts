// src/hooks/useGeolocation.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

// Delhi as the default fallback
const FALLBACK_LAT = 28.6139;
const FALLBACK_LNG = 77.2090;

/**
 * useGeolocation — requests the user's current position.
 * Falls back to Delhi coordinates if permission is denied or unsupported.
 * Returns refreshLocation() to manually re-request location.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionDenied: false,
  });

  const getLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState({
        latitude: FALLBACK_LAT,
        longitude: FALLBACK_LNG,
        error: 'Geolocation is not supported by your browser',
        loading: false,
        permissionDenied: false,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        setState({
          latitude: FALLBACK_LAT,
          longitude: FALLBACK_LNG,
          error: isDenied
            ? 'Location access denied — showing Delhi hospitals'
            : 'Could not determine location, using Delhi as default',
          loading: false,
          permissionDenied: isDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    error: state.error,
    loading: state.loading,
    permissionDenied: state.permissionDenied,
    refreshLocation: getLocation,
  };
}