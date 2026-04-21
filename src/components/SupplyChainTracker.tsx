'use client';

import { useState, useEffect } from 'react';

interface MedicineSupply {
  id: string;
  batchId: string;
  medicine: string;
  manufacturer: string;
  distributor: string;
  quantity: number;
  supplyStatus: string;
  currentLocation?: string;
  blockchainHash?: string;
  manufacturingDate: string;
  expiryDate: string;
  createdAt: string;
}

const STATUS_STEPS = ['MANUFACTURED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];

function getStatusIndex(status: string): number {
  return STATUS_STEPS.indexOf(status);
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'MANUFACTURED': return 'bg-yellow-600';
    case 'SHIPPED': return 'bg-purple-600';
    case 'IN_TRANSIT': return 'bg-blue-600';
    case 'DELIVERED': return 'bg-green-600';
    default: return 'bg-gray-600';
  }
}

export default function SupplyChainTracker() {
  const [supplies, setSupplies] = useState<MedicineSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MedicineSupply | null>(null);

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      const res = await fetch('/api/supply-chain');
      const json = await res.json();
      setSupplies(json.supplies || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (supplyId: string, newStatus: string) => {
    try {
      await fetch('/api/supply-chain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplyId, supplyStatus: newStatus }),
      });
      fetchSupplies();
    } catch (e) {
      console.error('Update error:', e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading supply chain data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">📦 Medicine Supply Chain</h2>
        <button onClick={fetchSupplies} className="px-3 py-1 bg-blue-600 rounded">
          🔄 Refresh
        </button>
      </div>

      {/* Supply List */}
      <div className="space-y-3">
        {supplies.map((supply) => (
          <div
            key={supply.id}
            onClick={() => setSelected(supply)}
            className={`p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition ${
              selected?.id === supply.id ? 'border-2 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{supply.medicine}</p>
                <p className="text-sm text-gray-400">Batch: {supply.batchId}</p>
                <p className="text-xs text-gray-500">
                  {supply.manufacturer} → {supply.distributor}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(supply.supplyStatus)}`}>
                  {supply.supplyStatus}
                </span>
                <p className="text-xs text-gray-500 mt-1">Qty: {supply.quantity}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 flex items-center gap-1">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`flex-1 h-2 rounded ${
                    idx <= getStatusIndex(supply.supplyStatus) 
                      ? getStatusColor(step) 
                      : 'bg-gray-700'
                  }`} />
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`w-2 h-2 rotate-45 ${
                      idx < getStatusIndex(supply.supplyStatus)
                        ? getStatusColor(STATUS_STEPS[idx + 1])
                        : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              {STATUS_STEPS.map(step => (
                <span key={step}>{step}</span>
              ))}
            </div>

            {supply.blockchainHash && (
              <p className="text-xs text-gray-600 mt-2 truncate font-mono">
                🔗 {supply.blockchainHash}
              </p>
            )}
          </div>
        ))}
      </div>

      {supplies.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No supplies in chain
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">{selected.medicine}</h3>
            
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Batch ID:</span> {selected.batchId}</p>
              <p><span className="text-gray-500">Manufacturer:</span> {selected.manufacturer}</p>
              <p><span className="text-gray-500">Distributor:</span> {selected.distributor}</p>
              <p><span className="text-gray-500">Quantity:</span> {selected.quantity}</p>
              <p><span className="text-gray-500">Mfg Date:</span> {selected.manufacturingDate}</p>
              <p><span className="text-gray-500">Expiry:</span> {selected.expiryDate}</p>
              {selected.currentLocation && (
                <p><span className="text-gray-500">Location:</span> {selected.currentLocation}</p>
              )}
              {selected.blockchainHash && (
                <p><span className="text-gray-500">Blockchain:</span> {selected.blockchainHash}</p>
              )}
            </div>

            {/* Status Update */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Update Status:</p>
              <div className="flex gap-2">
                {STATUS_STEPS.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selected.id, status)}
                    disabled={status === selected.supplyStatus}
                    className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
                      status === selected.supplyStatus 
                        ? getStatusColor(status) 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
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

// Add New Supply Form
export function AddSupplyForm() {
  const [form, setForm] = useState({
    batchId: '',
    medicine: '',
    manufacturer: '',
    distributor: '',
    quantity: 0,
    manufacturingDate: '',
    expiryDate: '',
    currentLocation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        alert('Supply added successfully!');
        setForm({
          batchId: '',
          medicine: '',
          manufacturer: '',
          distributor: '',
          quantity: 0,
          manufacturingDate: '',
          expiryDate: '',
          currentLocation: '',
        });
      }
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold">Add New Supply</h3>
      
      <input
        type="text"
        placeholder="Batch ID"
        value={form.batchId}
        onChange={e => setForm({ ...form, batchId: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
        required
      />
      
      <input
        type="text"
        placeholder="Medicine Name"
        value={form.medicine}
        onChange={e => setForm({ ...form, medicine: e.target.value })}
        className="w-full p-2 bg-gray-800 rounded"
        required
      />
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Manufacturer"
          value={form.manufacturer}
          onChange={e => setForm({ ...form, manufacturer: e.target.value })}
          className="p-2 bg-gray-800 rounded"
          required
        />
        
        <input
          type="text"
          placeholder="Distributor"
          value={form.distributor}
          onChange={e => setForm({ ...form, distributor: e.target.value })}
          className="p-2 bg-gray-800 rounded"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })}
          className="p-2 bg-gray-800 rounded"
          required
        />
        
        <input
          type="text"
          placeholder="Current Location"
          value={form.currentLocation}
          onChange={e => setForm({ ...form, currentLocation: e.target.value })}
          className="p-2 bg-gray-800 rounded"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          placeholder="Manufacturing Date"
          value={form.manufacturingDate}
          onChange={e => setForm({ ...form, manufacturingDate: e.target.value })}
          className="p-2 bg-gray-800 rounded"
          required
        />
        
        <input
          type="date"
          placeholder="Expiry Date"
          value={form.expiryDate}
          onChange={e => setForm({ ...form, expiryDate: e.target.value })}
          className="p-2 bg-gray-800 rounded"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Supply'}
      </button>
    </form>
  );
}