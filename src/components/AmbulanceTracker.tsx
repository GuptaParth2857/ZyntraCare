'use client';

import { useState, useEffect } from 'react';

interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  isAvailable: boolean;
  type: string;
  email?: string;
  locationUpdates?: { lat: number; lng: number; timestamp: string }[];
  bookings?: any[];
}

export default function AmbulanceTracker() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ambulance | null>(null);

  useEffect(() => {
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch('/api/ambulance/track');
      const json = await res.json();
      setAmbulances(json.ambulances || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (ambulanceId: string, lat: number, lng: number) => {
    try {
      await fetch('/api/ambulance/track', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulanceId, lat, lng }),
      });
      fetchAmbulances();
    } catch (e) {
      console.error('Update error:', e);
    }
  };

  const toggleAvailability = async (ambulanceId: string, isAvailable: boolean) => {
    try {
      await fetch('/api/ambulance/track', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulanceId, isAvailable }),
      });
      fetchAmbulances();
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading ambulances...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🚑 Ambulance Tracker</h2>
        <div className="text-sm text-gray-500">
          {ambulances.filter(a => a.isAvailable).length} / {ambulances.length} available
        </div>
      </div>

      {/* Map View */}
      <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <p className="text-4xl mb-4">🗺️</p>
            <p>Real-time ambulance locations</p>
          </div>
        </div>
        
        {ambulances.map((amb, idx) => (
          <div
            key={amb.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: amb.lng ? ((amb.lng + 180) / 3.6) * 100 : (idx + 1) * 20,
              top: amb.lat ? ((90 - amb.lat) / 1.8) * 100 : (idx + 1) * 20,
            }}
            onClick={() => setSelected(amb)}
          >
            <div className={`text-2xl ${amb.isAvailable ? '' : 'opacity-50'}`}>
              {amb.isAvailable ? '🚑' : '🏥'}
            </div>
          </div>
        ))}
      </div>

      {/* Ambulance List */}
      <div className="space-y-2">
        {ambulances.map((amb) => (
          <div
            key={amb.id}
            onClick={() => setSelected(amb)}
            className={`p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 ${
              selected?.id === amb.id ? 'border-2 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{amb.vehicleNumber}</p>
                <p className="text-sm text-gray-400">{amb.driverName || 'Unassigned'}</p>
                <p className="text-xs text-gray-500">{amb.type} type</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  amb.isAvailable ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {amb.isAvailable ? 'Available' : 'Busy'}
                </span>
                {amb.lat && amb.lng && (
                  <p className="text-xs text-gray-500 mt-1">
                    {amb.lat.toFixed(4)}, {amb.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Active Booking */}
            {amb.bookings?.[0] && (
              <div className="mt-2 p-2 bg-yellow-900/30 rounded text-sm">
                <p className="text-yellow-400">
                  📍 Picking up: {amb.bookings[0].pickupAddress}
                </p>
              </div>
            )}
          </div>
        ))}

        {ambulances.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No ambulances registered
          </div>
        )}
      </div>

      {/* Selected Ambulance Details */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">{selected.vehicleNumber}</h3>
            
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Driver:</span> {selected.driverName || 'Unassigned'}</p>
              <p><span className="text-gray-500">Phone:</span> {selected.phone || 'N/A'}</p>
              <p><span className="text-gray-500">Type:</span> {selected.type}</p>
              <p><span className="text-gray-500">Email:</span> {selected.email || 'N/A'}</p>
              
              {selected.lat && selected.lng && (
                <>
                  <p><span className="text-gray-500">Location:</span></p>
                  <p className="font-mono text-xs">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => toggleAvailability(selected.id, !selected.isAvailable)}
                className={`w-full py-2 rounded ${
                  selected.isAvailable 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selected.isAvailable ? 'Mark as Busy' : 'Mark as Available'}
              </button>
              
              {selected.isAvailable && (
                <button
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      updateLocation(selected.id, pos.coords.latitude, pos.coords.longitude);
                    });
                  }}
                  className="w-full py-2 bg-blue-600 rounded"
                >
                  📍 Update My Location
                </button>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2 bg-gray-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add New Ambulance Form
export function AddAmbulanceForm() {
  const [form, setForm] = useState({
    vehicleNumber: '',
    phone: '',
    driverName: '',
    type: 'basic',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/ambulance/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        alert('Ambulance added!');
        setForm({ vehicleNumber: '', phone: '', driverName: '', type: 'basic', email: '' });
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold">Add Ambulance</h3>
      
      <input
        type="text"
        placeholder="Vehicle Number (e.g., PB-01-AB-1234)"
        value={form.vehicleNumber}
        onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
        required
      />
      
      <input
        type="tel"
        placeholder="Driver Phone"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
        required
      />
      
      <input
        type="text"
        placeholder="Driver Name"
        value={form.driverName}
        onChange={e => setForm({ ...form, driverName: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
      />
      
      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
      >
        <option value="basic">Basic Life Support</option>
        <option value="acls">ACLS (Advanced)</option>
        <option value="neonatal">Neonatal</option>
      </select>
      
      <input
        type="email"
        placeholder="Driver Email (optional)"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
      />
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Ambulance'}
      </button>
    </form>
  );
}