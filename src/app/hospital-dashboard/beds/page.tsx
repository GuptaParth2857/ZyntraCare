'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiGrid, FiUsers, FiAlertCircle, FiRefreshCw, FiCheck, FiClock, FiActivity, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface BedData {
  id?: string;
  hospitalId: string;
  hospitalName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  totalICU: number;
  availableICU: number;
  occupiedICU: number;
  generalWard: number;
  generalAvailable: number;
  pediatric: number;
  pediatricAvailable: number;
  maternity: number;
  maternityAvailable: number;
  lastUpdated: string;
  lastUpdatedBy: string;
}

const DEFAULT_BED_DATA: BedData = {
  hospitalId: 'H001',
  hospitalName: '',
  totalBeds: 100,
  availableBeds: 25,
  occupiedBeds: 75,
  totalICU: 20,
  availableICU: 5,
  occupiedICU: 15,
  generalWard: 60,
  generalAvailable: 15,
  pediatric: 10,
  pediatricAvailable: 3,
  maternity: 10,
  maternityAvailable: 2,
  lastUpdated: new Date().toISOString(),
  lastUpdatedBy: 'Admin'
};

export default function HospitalBedDashboard() {
  const [bedData, setBedData] = useState<BedData>(DEFAULT_BED_DATA);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'icu' | 'wards'>('overview');

  const fetchBedStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/beds/realtime?hospitalId=${bedData.hospitalId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setBedData(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Error fetching bed status:', err);
    } finally {
      setLoading(false);
    }
  }, [bedData.hospitalId]);

  useEffect(() => {
    fetchBedStatus();
    const interval = setInterval(fetchBedStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchBedStatus]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/beds/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bedData,
          hospitalId: bedData.hospitalId,
          hospitalName: bedData.hospitalName || 'Hospital',
          updateSource: 'manual'
        })
      });

      const result = await res.json();
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Failed to save');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BedData, value: number) => {
    setBedData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (['totalBeds', 'availableBeds', 'totalICU', 'availableICU'].includes(field)) {
        updated.occupiedBeds = updated.totalBeds - updated.availableBeds;
        updated.occupiedICU = updated.totalICU - updated.availableICU;
      }
      
      updated.lastUpdated = new Date().toISOString();
      return updated;
    });
  };

  const occupancyPercent = bedData.totalBeds > 0 
    ? Math.round(((bedData.totalBeds - bedData.availableBeds) / bedData.totalBeds) * 100) 
    : 0;

  const icuOccupancy = bedData.totalICU > 0 
    ? Math.round(((bedData.totalICU - bedData.availableICU) / bedData.totalICU) * 100) 
    : 0;

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500 bg-red-500/10';
    if (percent >= 70) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const getStatusLabel = (percent: number) => {
    if (percent >= 90) return 'CRITICAL';
    if (percent >= 70) return 'HIGH';
    return 'NORMAL';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <FiGrid className="text-teal-400" />
              Bed Management
            </h1>
            <p className="text-gray-400 mt-1">Real-time bed availability control center</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBedStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              } disabled:opacity-50`}
            >
              {saved ? <FiCheck size={16} /> : null}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Update Beds'}
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <FiAlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <FiCheck size={18} />
            Bed status updated successfully!
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <FiActivity className="text-teal-400" />
              <span className="text-xs text-gray-500">TOTAL</span>
            </div>
            <p className="text-3xl font-black">{bedData.totalBeds}</p>
            <p className="text-sm text-gray-400">beds</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="text-green-400" />
              <span className="text-xs text-gray-500">AVAILABLE</span>
            </div>
            <p className="text-3xl font-black text-green-400">{bedData.availableBeds}</p>
            <p className="text-sm text-gray-400">beds free</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-yellow-400" />
              <span className="text-xs text-gray-500">OCCUPANCY</span>
            </div>
            <p className="text-3xl font-black">{occupancyPercent}%</p>
            <p className={`text-sm ${
              occupancyPercent >= 90 ? 'text-red-400' : 
              occupancyPercent >= 70 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {getStatusLabel(occupancyPercent)}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="text-purple-400" />
              <span className="text-xs text-gray-500">LAST UPDATE</span>
            </div>
            <p className="text-lg font-bold truncate">
              {bedData.lastUpdated ? new Date(bedData.lastUpdated).toLocaleTimeString() : '--'}
            </p>
            <p className="text-sm text-gray-400">{bedData.lastUpdatedBy}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'icu', label: 'ICU' },
            { id: 'wards', label: 'Wards' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeTab === tab.id 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiGrid className="text-teal-400" />
                  General Beds
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Total Beds</label>
                    <input
                      type="number"
                      value={bedData.totalBeds}
                      onChange={(e) => updateField('totalBeds', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Available Beds</label>
                    <input
                      type="number"
                      value={bedData.availableBeds}
                      onChange={(e) => updateField('availableBeds', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                    />
                  </div>
                  <div className={`p-4 rounded-xl ${getStatusColor(occupancyPercent)}`}>
                    <p className="text-sm font-semibold">Current Occupancy: {occupancyPercent}%</p>
                    <p className="text-xs opacity-70">{bedData.occupiedBeds} beds occupied</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiActivity className="text-purple-400" />
                  ICU Beds
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Total ICU Beds</label>
                    <input
                      type="number"
                      value={bedData.totalICU}
                      onChange={(e) => updateField('totalICU', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Available ICU</label>
                    <input
                      type="number"
                      value={bedData.availableICU}
                      onChange={(e) => updateField('availableICU', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                    />
                  </div>
                  <div className={`p-4 rounded-xl ${getStatusColor(icuOccupancy)}`}>
                    <p className="text-sm font-semibold">ICU Occupancy: {icuOccupancy}%</p>
                    <p className="text-xs opacity-70">{bedData.occupiedICU} ICU occupied</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'icu' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4">ICU Breakdown</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'ICU Beds', total: bedData.totalICU, available: bedData.availableICU },
                  { label: 'NICU', total: Math.floor(bedData.totalICU * 0.3), available: Math.floor(bedData.availableICU * 0.3) },
                  { label: 'PICU', total: Math.floor(bedData.totalICU * 0.2), available: Math.floor(bedData.availableICU * 0.2) }
                ].map(ward => (
                  <div key={ward.label} className="bg-slate-900 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">{ward.label}</p>
                    <p className="text-2xl font-bold">
                      {ward.available} <span className="text-gray-500">/ {ward.total}</span>
                    </p>
                    <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full ${ward.available > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${ward.total > 0 ? (ward.available / ward.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wards' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4">Ward Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'General Ward', total: bedData.generalWard, available: bedData.generalAvailable, key: 'generalWard' as const, keyAvail: 'generalAvailable' as const },
                  { label: 'Pediatric', total: bedData.pediatric, available: bedData.pediatricAvailable, key: 'pediatric' as const, keyAvail: 'pediatricAvailable' as const },
                  { label: 'Maternity', total: bedData.maternity, available: bedData.maternityAvailable, key: 'maternity' as const, keyAvail: 'maternityAvailable' as const }
                ].map(ward => (
                  <div key={ward.label} className="bg-slate-900 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{ward.label}</p>
                      <span className={`text-sm font-bold ${
                        ward.available > 5 ? 'text-green-400' : 
                        ward.available > 0 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {ward.available} / {ward.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          ward.available > 5 ? 'bg-green-500' : 
                          ward.available > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${ward.total > 0 ? ((ward.total - ward.available) / ward.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Last Saved Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <FiClock className="inline mr-2" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}