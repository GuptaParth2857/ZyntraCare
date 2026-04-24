// useGeolocation.ts - Browser Geolocation Hook
// Real-time location tracking with permission handling

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  requestLocation: () => void;
  isWatching: boolean;
  stopWatching: () => void;
}

const DEFAULT_POSITION: GeolocationPosition = {
  lat: 28.6139,  // Delhi as default
  lng: 77.2090,
  accuracy: 0,
};

export function useGeolocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const geoOptions = {
    enableHighAccuracy: options?.enableHighAccuracy ?? true,
    timeout: options?.timeout ?? 10000,
    maximumAge: options?.maximumAge ?? 0,
  };

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition(pos);
    setLoading(false);
    setError(null);
    setHasPermission(true);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setLoading(false);
    setHasPermission(false);
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Location permission denied. Using default location.');
        setPosition(DEFAULT_POSITION);
        break;
      case err.POSITION_UNAVAILABLE:
        setError('Location unavailable. Using default location.');
        setPosition(DEFAULT_POSITION);
        break;
      case err.TIMEOUT:
        setError('Location request timed out. Using default location.');
        setPosition(DEFAULT_POSITION);
        break;
      default:
        setError('Unknown location error. Using default location.');
        setPosition(DEFAULT_POSITION);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      setPosition(DEFAULT_POSITION);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      handleError,
      geoOptions
    );
  }, [handleSuccess, handleError, geoOptions]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        handleSuccess({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      handleError,
      geoOptions
    );

    setWatchId(id);
    setIsWatching(true);
  }, [handleSuccess, handleError, geoOptions]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    // Request location on mount
    requestLocation();

    // Start watching if enabled
    if (options?.watchPosition) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, []);

  return {
    position,
    loading,
    error,
    hasPermission,
    requestLocation,
    isWatching,
    stopWatching,
  };
}

// Default export
export default useGeolocation;