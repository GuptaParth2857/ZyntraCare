'use client';

import { useRealtime, useEmergencyAlerts, useAmbulanceTracking, useBedManagement, useSupplyChain } from '@/hooks/useRealtime';

interface Props {
  hospitalId?: string;
}

export default function RealtimeDashboard({ hospitalId }: Props) {
  const { data, initialData, isConnected, lastUpdate } = useRealtime();
  const { alerts, loading: alertsLoading, createAlert } = useEmergencyAlerts();
  const { ambulances, loading: ambLoading } = useAmbulanceTracking();
  const { beds, loading: bedsLoading, updateBed } = useBedManagement(hospitalId);
  const { supplies, loading: supplyLoading } = useSupplyChain();

  if (alertsLoading || ambLoading || bedsLoading || supplyLoading) {
    return <div className="p-4">Loading real-time data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        <h3 className="font-bold">Connection</h3>
        <p>{isConnected ? '🟢 Live' : '🔴 Disconnected'}</p>
        {lastUpdate && <p className="text-xs text-gray-400">Last: {lastUpdate.toLocaleTimeString()}</p>}
      </div>

      {/* Emergency Alerts */}
      <div className="p-4 rounded-lg bg-red-500/20">
        <h3 className="font-bold">🚨 Emergency Alerts</h3>
        <p className="text-2xl font-bold">{alerts.length}</p>
        {alerts.slice(0, 2).map((alert) => (
          <div key={alert.id} className="text-sm mt-2">
            <span className={`px-2 py-1 rounded ${
              alert.status === 'TRIGGERED' ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
              {alert.alertType}
            </span>
            <p>{alert.location}</p>
          </div>
        ))}
      </div>

      {/* Available Ambulances */}
      <div className="p-4 rounded-lg bg-blue-500/20">
        <h3 className="font-bold">🚑 Ambulances</h3>
        <p className="text-2xl font-bold">{ambulances.length}</p>
        {ambulances.slice(0, 3).map((amb) => (
          <div key={amb.id} className="text-sm mt-2">
            <p>{amb.vehicleNumber}</p>
            <p className="text-xs text-gray-400">
              {amb.lat && amb.lng ? `${amb.lat.toFixed(4)}, ${amb.lng.toFixed(4)}` : 'Location unknown'}
            </p>
          </div>
        ))}
      </div>

      {/* Bed Availability */}
      <div className="p-4 rounded-lg bg-purple-500/20">
        <h3 className="font-bold">🛏️ Hospital Beds</h3>
        <p className="text-2xl font-bold">{beds.length}</p>
        <div className="text-sm mt-2">
          {beds.filter(b => b.status === 'AVAILABLE').length} available
        </div>
      </div>

      {/* Supply Chain */}
      <div className="p-4 rounded-lg bg-yellow-500/20 col-span-full">
        <h3 className="font-bold">📦 Supply Chain</h3>
        <p className="text-2xl font-bold">{supplies.length}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {supplies.slice(0, 4).map((supply) => (
            <div key={supply.id} className="text-sm p-2 bg-black/20 rounded">
              <p className="font-bold">{supply.medicine}</p>
              <p className="text-xs">{supply.batchId}</p>
              <span className={`text-xs px-2 py-1 rounded ${
                supply.supplyStatus === 'DELIVERED' ? 'bg-green-600' :
                supply.supplyStatus === 'IN_TRANSIT' ? 'bg-blue-600' :
                'bg-yellow-600'
              }`}>
                {supply.supplyStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Updates */}
      {data && (
        <div className="col-span-full p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold">📡 Live Update</h3>
          <pre className="text-xs mt-2 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Emergency Alert Button Component
export function EmergencyButton({ userId }: { userId: string }) {
  const { createAlert } = useEmergencyAlerts();

  const handleEmergency = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      await createAlert({
        userId,
        location: 'Current Location',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        alertType: 'MEDICAL',
        description: 'Emergency alert triggered',
      });
    }, (error) => {
      console.error('Location error:', error);
      createAlert({
        userId,
        location: 'Unknown',
        alertType: 'MEDICAL',
        description: 'Emergency alert triggered (location unavailable)',
      });
    });
  };

  return (
    <button
      onClick={handleEmergency}
      className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg animate-pulse"
    >
      🚨 SOS
    </button>
  );
}

// Bed Status Card
export function BedStatusCard({ bed, onUpdate }: { bed: any; onUpdate?: (bedId: string, status: string) => void }) {
  return (
    <div className={`p-4 rounded-lg ${
      bed.status === 'AVAILABLE' ? 'bg-green-500/20' :
      bed.status === 'OCCUPIED' ? 'bg-red-500/20' :
      'bg-yellow-500/20'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">{bed.hospital?.name || 'Hospital'}</p>
          <p className="text-sm">Bed: {bed.bedNumber} | {bed.bedType}</p>
          <p className="text-xs text-gray-400">Floor: {bed.floor} | Ward: {bed.ward}</p>
        </div>
        <span className={`px-3 py-1 rounded ${
          bed.status === 'AVAILABLE' ? 'bg-green-600' :
          bed.status === 'OCCUPIED' ? 'bg-red-600' :
          'bg-yellow-600'
        }`}>
          {bed.status}
        </span>
      </div>
    </div>
  );
}

// Ambulance Tracker Map
export function AmbulanceTrackerMap() {
  const { ambulances } = useAmbulanceTracking();

  return (
    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
      {ambulances.map((amb) => (
        <div
          key={amb.id}
          className="absolute"
          style={{
            left: amb.lng ? ((amb.lng + 180) / 3.6) * 100 : 0,
            top: amb.lat ? ((90 - amb.lat) / 1.8) * 100 : 0,
          }}
        >
          <div className="text-2xl">🚑</div>
          <p className="text-xs bg-black/50 px-1 rounded">{amb.vehicleNumber}</p>
        </div>
      ))}
      {ambulances.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          No ambulances available
        </div>
      )}
    </div>
  );
}

// Supply Chain Tracker
export function SupplyChainTracker() {
  const { supplies } = useSupplyChain();

  return (
    <div className="space-y-2">
      {supplies.map((supply) => (
        <div key={supply.id} className="p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">{supply.medicine}</p>
              <p className="text-sm text-gray-400">Batch: {supply.batchId}</p>
              <p className="text-xs text-gray-500">
                {supply.manufacturer} → {supply.distributor}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs ${
                supply.supplyStatus === 'DELIVERED' ? 'bg-green-600' :
                supply.supplyStatus === 'IN_TRANSIT' ? 'bg-blue-600' :
                supply.supplyStatus === 'SHIPPED' ? 'bg-purple-600' :
                'bg-yellow-600'
              }`}>
                {supply.supplyStatus}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Qty: {supply.quantity}
              </p>
            </div>
          </div>
          {supply.blockchainHash && (
            <p className="text-xs text-gray-600 mt-2 truncate">
              🔗 {supply.blockchainHash}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}