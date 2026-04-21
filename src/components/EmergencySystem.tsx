'use client';

import { useState, useEffect } from 'react';
import { useEmergencyAlerts, useRealtime } from '@/hooks/useRealtime';

interface EmergencyAlert {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  alertType: string;
  description?: string;
  status: string;
  responders?: string;
  createdAt: string;
}

export default function EmergencySystem() {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { data } = useRealtime();

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (data?.type === 'emergency_alert') {
      fetchAlerts();
    }
  }, [data]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/emergency?status=TRIGGERED');
      const json = await res.json();
      setActiveAlerts(json.alerts || []);
    } catch (e) {
      console.error('Fetch alerts error:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerEmergency = async (userId: string, type: string = 'MEDICAL') => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              location: 'Current Location',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              alertType: type,
              description: `Emergency triggered: ${type}`,
            }),
          });
          
          if (res.ok) {
            alert('🚨 Emergency alert sent! Help is on the way.');
            fetchAlerts();
          }
        } catch (e) {
          console.error('Trigger error:', e);
          alert('Failed to send emergency alert');
        }
      },
      (error) => {
        console.error('Location error:', error);
        alert('Could not get location. Alert sent anyway.');
      }
    );
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/emergency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'RESOLVED' }),
      });
      fetchAlerts();
    } catch (e) {
      console.error('Resolve error:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-600 animate-pulse p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">🚨 {activeAlerts.length} Active Emergency</h3>
              <p className="text-red-200 text-sm">Help is being dispatched</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 bg-red-900/50 rounded-lg border border-red-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-1 bg-red-600 rounded text-xs">
                  {alert.alertType}
                </span>
                <p className="mt-2 font-medium">{alert.location}</p>
                {alert.description && (
                  <p className="text-sm text-gray-400">{alert.description}</p>
                )}
                {alert.responders && (
                  <p className="text-sm text-yellow-400">👤 {alert.responders}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => resolveAlert(alert.id)}
                className="px-3 py-1 bg-green-600 rounded text-sm"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeAlerts.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          <p>No active emergencies</p>
        </div>
      )}
    </div>
  );
}

// Standalone SOS Button
export function SOSButton({ userId }: { userId: string }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleEmergency = async () => {
    setIsPressed(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      setIsPressed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              location: 'Current Location',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              alertType: 'MEDICAL',
              description: 'Emergency SOS triggered',
            }),
          });
          
          if (res.ok) {
            alert('🚨 Emergency Alert Sent! Dispatchers have been notified.');
          }
        } catch (e) {
          console.error('Error:', e);
        } finally {
          setIsPressed(false);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setIsPressed(false);
      }
    );
  };

  return (
    <button
      onClick={handleEmergency}
      disabled={isPressed}
      className={`
        fixed bottom-8 right-8 z-50
        w-20 h-20 rounded-full
        flex items-center justify-center
        text-white font-bold text-xl
        shadow-xl transition-all
        ${isPressed 
          ? 'bg-gray-600 cursor-wait' 
          : 'bg-red-600 hover:bg-red-700 hover:scale-110 animate-pulse'
        }
      `}
    >
      {isPressed ? '...' : 'SOS'}
    </button>
  );
}

// Emergency Map View
export function EmergencyMap() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    fetch('/api/emergency')
      .then(res => res.json())
      .then(json => setAlerts(json.alerts || []))
      .catch(console.error);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      {/* Map placeholder - integrate with actual map library */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <p>Emergency locations will appear here</p>
        </div>
      </div>
      
      {/* Alert markers */}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: alert.longitude ? ((alert.longitude + 180) / 3.6) * 100 : 50,
            top: alert.latitude ? ((90 - alert.latitude) / 1.8) * 100 : 50,
          }}
        >
          <div className="text-3xl animate-bounce">🚨</div>
        </div>
      ))}
    </div>
  );
}