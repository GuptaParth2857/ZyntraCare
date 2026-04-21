'use client';

import { useEffect, useState, useCallback } from 'react';

export interface RealtimeData {
  type: string;
  [key: string]: any;
}

export interface InitialData {
  beds: any[];
  alerts: any[];
  ambulances: any[];
  supplies: any[];
}

export function useRealtime() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const source = new EventSource('/api/realtime');
    
    source.onopen = () => {
      setIsConnected(true);
    };
    
    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        if (parsed.type === 'initial_data') {
          setInitialData(parsed);
        } else {
          setData(parsed);
          setLastUpdate(new Date());
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    source.onerror = () => {
      setIsConnected(false);
      source.close();
    };
    
    return () => {
      source.close();
      setIsConnected(false);
    };
  }, []);

  const getBedUpdates = useCallback(() => initialData?.beds || [], [initialData]);
  const getAlerts = useCallback(() => initialData?.alerts || [], [initialData]);
  const getAmbulances = useCallback(() => initialData?.ambulances || [], [initialData]);
  const getSupplyChain = useCallback(() => initialData?.supplies || [], [initialData]);

  return {
    data,
    initialData,
    isConnected,
    lastUpdate,
    getBedUpdates,
    getAlerts,
    getAmbulances,
    getSupplyChain,
  };
}

export function useEmergencyAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async (status?: string) => {
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/emergency${params}`);
      const json = await res.json();
      setAlerts(json.alerts || []);
    } catch (e) {
      console.error('Fetch alerts error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = useCallback(async (alertData: {
    userId: string;
    location: string;
    latitude?: number;
    longitude?: number;
    alertType?: string;
    description?: string;
  }) => {
    const res = await fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
    return res.json();
  }, []);

  const updateAlert = useCallback(async (alertId: string, update: {
    status?: string;
    responders?: string;
    ambulanceId?: string;
    hospitalId?: string;
  }) => {
    const res = await fetch('/api/emergency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, ...update }),
    });
    return res.json();
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  return { alerts, loading, fetchAlerts, createAlert, updateAlert };
}

export function useAmbulanceTracking() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAmbulances = useCallback(async (isAvailable?: boolean) => {
    try {
      const params = isAvailable !== undefined ? `?isAvailable=${isAvailable}` : '';
      const res = await fetch(`/api/ambulance/track${params}`);
      const json = await res.json();
      setAmbulances(json.ambulances || []);
    } catch (e) {
      console.error('Fetch ambulances error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (ambulanceId: string, lat: number, lng: number) => {
    const res = await fetch('/api/ambulance/track', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ambulanceId, lat, lng }),
    });
    return res.json();
  }, []);

  useEffect(() => { fetchAmbulances(); }, [fetchAmbulances]);

  return { ambulances, loading, fetchAmbulances, updateLocation };
}

export function useBedManagement(hospitalId?: string) {
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBeds = useCallback(async (status?: string) => {
    try {
      const params = new URLSearchParams();
      if (hospitalId) params.set('hospitalId', hospitalId);
      if (status) params.set('status', status);
      const res = await fetch(`/api/beds/manage?${params}`);
      const json = await res.json();
      setBeds(json.beds || []);
    } catch (e) {
      console.error('Fetch beds error:', e);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  const updateBed = useCallback(async (bedId: string, update: {
    status?: string;
    occupiedBy?: string;
    bedType?: string;
    price?: number;
  }) => {
    const res = await fetch('/api/beds/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedId, ...update }),
    });
    return res.json();
  }, []);

  const createBed = useCallback(async (bedData: {
    hospitalId: string;
    floor?: string;
    ward?: string;
    bedNumber: string;
    bedType?: string;
    price?: number;
    amenities?: string[];
  }) => {
    const res = await fetch('/api/beds/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bedData),
    });
    return res.json();
  }, []);

  useEffect(() => { fetchBeds(); }, [fetchBeds]);

  return { beds, loading, fetchBeds, updateBed, createBed };
}

export function useSupplyChain() {
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupplies = useCallback(async (status?: string, hospitalId?: string) => {
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (hospitalId) params.set('hospitalId', hospitalId);
      const res = await fetch(`/api/supply-chain?${params}`);
      const json = await res.json();
      setSupplies(json.supplies || []);
    } catch (e) {
      console.error('Fetch supplies error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSupply = useCallback(async (supplyData: {
    batchId: string;
    medicine: string;
    manufacturer: string;
    distributor?: string;
    hospitalId?: string;
    quantity: number;
    manufacturingDate: string;
    expiryDate: string;
    currentLocation?: string;
    blockchainHash?: string;
  }) => {
    const res = await fetch('/api/supply-chain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplyData),
    });
    return res.json();
  }, []);

  const updateSupply = useCallback(async (supplyId: string, update: {
    supplyStatus?: string;
    currentLocation?: string;
    hospitalId?: string;
    quantity?: number;
  }) => {
    const res = await fetch('/api/supply-chain', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplyId, ...update }),
    });
    return res.json();
  }, []);

  useEffect(() => { fetchSupplies(); }, [fetchSupplies]);

  return { supplies, loading, fetchSupplies, createSupply, updateSupply };
}