'use client';

import { useState, useEffect, useCallback } from 'react';

interface BedAlert {
  id: string;
  hospitalId: string;
  hospitalName: string;
  alertType: 'icu' | 'general' | 'any';
  targetAvailability: number;
  notified: boolean;
  createdAt: string;
}

export function useBedAlerts(userId?: string) {
  const [alerts, setAlerts] = useState<BedAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/beds/alerts?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = async (hospitalId: string, hospitalName: string, alertType: 'icu' | 'general' | 'any' = 'any', targetAvailability = 1) => {
    if (!userId) return null;
    
    const res = await fetch('/api/beds/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        hospitalId,
        hospitalName,
        alertType,
        targetAvailability
      })
    });
    
    const data = await res.json();
    if (data.success) {
      setAlerts(prev => [...prev.filter(a => a.hospitalId !== hospitalId || a.alertType !== alertType), data.alert]);
      return data.alert;
    }
    return null;
  };

  const removeAlert = async (alertId?: string) => {
    if (!userId) return;
    const id = alertId || alerts[0]?.id;
    if (!id) return;
    
    const res = await fetch(`/api/beds/alerts?alertId=${id}&userId=${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const clearAll = async () => {
    if (!userId) return;
    const res = await fetch(`/api/beds/alerts?userId=${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setAlerts([]);
    }
  };

  return { alerts, loading, createAlert, removeAlert, clearAll, refresh: fetchAlerts };
}

export function useWebPush() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setError('Push notifications not supported');
      return null;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm === 'granted';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  return { permission, error, requestPermission };
}