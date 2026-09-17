'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiShoppingCart, FiPackage, FiTrendingUp, FiZap, FiBell, FiRefreshCw,
  FiPlus, FiX, FiLock, FiInfo, FiLoader, FiTrash2,
} from 'react-icons/fi';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSession } from 'next-auth/react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  remainingDoses: number;
  totalDoses: number;
  adherenceRate: number;
  loggedTaken: number;
  loggedMissed: number;
  autoReorder: boolean;
  reorderThreshold: number;
  stockLevel: number;
  lowStock: boolean;
  dosesPerDay: number;
  nextRefill: string;
}

interface AdherenceHistory {
  week: string;
  adherenceRate: number;
  taken: number;
  missed: number;
}

interface InteractionAlert {
  id: string;
  medicineA: string;
  medicineB: string;
  severity: 'severe' | 'moderate' | 'mild' | 'critical';
  message: string;
}

export default function MedicationAdherencePage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const isAuthenticated = demoMode || status === 'authenticated';

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<AdherenceHistory[]>([]);
  const [interactions, setInteractions] = useState<InteractionAlert[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [today, setToday] = useState({ taken: 0, missed: 0, scheduled: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordered, setReordered] = useState<Record<string, string>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('Once daily');
  const [medTimes, setMedTimes] = useState('08:00');

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`/api/medication-adherence${demoMode ? '?userId=demo-user' : ''}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
        setHistory(Array.isArray(data.history) ? data.history : []);
        setInteractions(Array.isArray(data.interactions) ? data.interactions : []);
        setOverallScore(data.overallScore || 0);
        setStreak(data.streak || 0);
        setToday(data.today || { taken: 0, missed: 0, scheduled: 0, rate: 0 });
      })
      .catch((e) => setError(e.message || 'Could not load medication data'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, demoMode]);

  const applyMedicines = (list: Medicine[]) => {
    setMedicines(list);
    const total = list.reduce((s, m) => s + m.loggedTaken + m.loggedMissed, 0);
    const taken = list.reduce((s, m) => s + m.loggedTaken, 0);
    if (total > 0) setOverallScore(Math.round((taken / total) * 100));
  };

  const handleAddMedication = async () => {
    if (!medName.trim()) return;
    setBusyId('add');
    setError('');
    try {
      const res = await fetch('/api/medication-adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          name: medName,
          dosage: medDosage,
          frequency: medFrequency,
          times: medTimes.split(/[,\s]+/).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add medicine');
      applyMedicines([...medicines, data.medicine]);
      setShowAddModal(false);
      setMedName('');
      setMedDosage('');
      setMedFrequency('Once daily');
      setMedTimes('08:00');
    } catch (e: any) {
      setError(e.message || 'Failed to add medicine');
    } finally {
      setBusyId(null);
    }
  };

  const handleLog = async (med: Medicine, statusType: 'taken' | 'missed') => {
    setBusyId(med.id);
    setError('');
    try {
      const res = await fetch('/api/medication-adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          adherenceId: med.id,
          status: statusType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log dose');
      setMedicines(data.medicines || []);
      setOverallScore(data.overallScore || 0);
      setStreak(data.streak || 0);
      setToday(data.today || { taken: 0, missed: 0, scheduled: 0, rate: 0 });
      setHistory(data.history || []);
    } catch (e: any) {
      setError(e.message || 'Failed to log dose');
    } finally {
      setBusyId(null);
    }
  };

  const handleReorder = async (med: Medicine) => {
    setBusyId(med.id);
    setError('');
    try {
      const res = await fetch('/api/medication-adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          adherenceId: med.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reorder failed');
      setReordered(prev => ({ ...prev, [med.id]: data.order.trackingId }));
    } catch (e: any) {
      setError(e.message || 'Reorder failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleAutoReorder = async (med: Medicine) => {
    setBusyId(med.id);
    setError('');
    try {
      const res = await fetch('/api/medication-adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleAutoReorder',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          adherenceId: med.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMedicines(prev => prev.map(m => (m.id === med.id ? data.medicine : m)));
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (med: Medicine) => {
    setBusyId(med.id);
    setError('');
    try {
      const res = await fetch('/api/medication-adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          adherenceId: med.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMedicines(prev => prev.filter(m => m.id !== med.id));
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 80) return '#f59e0b';
    return '#ef4444';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'severe': case 'critical': return <FiAlertTriangle className="text-red-400" />;
      case 'moderate': return <FiClock className="text-amber-400" />;
      default: return <FiCheckCircle className="text-emerald-400" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'severe': case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'moderate': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
  };

  const nextDose = (() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let best: { mins: number; label: string; name: string } | null = null;
    for (const m of medicines) {
      for (const t of m.times) {
        const [h, min] = t.split(':').map(Number);
        const mins = h * 60 + (min || 0);
        if (mins > nowMin && (!best || mins < best.mins)) best = { mins, label: t, name: m.name };
      }
    }
    return best;
  })();
  const nextDoseHours = nextDose ? Math.max(1, Math.round((nextDose.mins - (new Date().getHours() * 60 + new Date().getMinutes())) / 60)) : null;

  const lowStockMeds = medicines.filter(m => m.lowStock);
  const currentLabel = overallScore >= 90 ? 'EXCELLENT' : overallScore >= 80 ? 'GOOD' : 'NEEDS IMPROVEMENT';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Medication Management</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track adherence, detect interactions, auto-reorder refills, and build healthy medication habits.
          </p>
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl"
          >
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Your medication schedule and adherence history are personal. Sign in to track your doses.</p>
            <a href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm hover:from-indigo-500 hover:to-violet-500 transition">
              Sign In
            </a>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/medication-adherence?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' || loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-indigo-400" size={32} />
            <p className="text-white/40 text-sm">Loading…</p>
          </div>
        ) : (
          <>
            {demoMode && (
              <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to track your own medications.
              </div>
            )}

            {error && (
              <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                <p className="text-red-400/90 text-sm font-medium flex-1">{error}</p>
                <button onClick={() => setError('')} className="px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Dismiss</button>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 mb-10">
              {/* Overall Adherence Score */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="65%" outerRadius="90%" data={[{ value: overallScore }]} startAngle={0} endAngle={360}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} fill={getAdherenceColor(overallScore)} cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black" style={{ color: getAdherenceColor(overallScore) }}>{overallScore}%</span>
                      <span className="text-[10px] text-gray-500">Adherence</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Overall Adherence Score</h3>
                  <p className="text-xs text-gray-400 mb-3">Based on logged doses (last 30 days)</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    overallScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : overallScore >= 80 ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {currentLabel}
                  </div>
                </div>
              </div>

              {/* Today's Status */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiZap className="text-amber-400" /> Today&apos;s Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <FiCheckCircle className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Doses Taken</p>
                        <p className="text-xs text-gray-400">{today.taken} of {today.scheduled} scheduled {today.scheduled === 1 ? 'dose' : 'doses'}</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">{today.rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <FiAlertTriangle className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Missed Doses</p>
                        <p className="text-xs text-gray-400">{today.missed} missed today</p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold">-{today.missed * today.rate > 0 ? Math.min(100, today.missed * 20) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <FiTrendingUp className="text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Current Streak</p>
                        <p className="text-xs text-gray-400">{streak} {streak === 1 ? 'day' : 'days'} without a missed dose</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold">{streak}d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <FiBell className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Next Dose</p>
                        <p className="text-xs text-gray-400">{nextDose ? `${nextDose.name} at ${nextDose.label}` : 'Nothing scheduled today'}</p>
                      </div>
                    </div>
                    {nextDose && <span className="text-purple-400 font-bold">{nextDoseHours}h</span>}
                  </div>
                </div>
              </div>

              {/* Auto-Reorder Alerts */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiShoppingCart className="text-sky-400" /> Auto-Reorder Updates
                </h3>
                <div className="space-y-3">
                  {lowStockMeds.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <FiCheckCircle className="text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">All stock healthy</p>
                        <p className="text-xs text-gray-400">No medications below reorder threshold</p>
                      </div>
                    </div>
                  )}
                  {lowStockMeds.map(med => (
                    <div key={med.id} className="flex items-center gap-3 p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl">
                      <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                        <FiPackage className="text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{med.name}</p>
                        <p className="text-xs text-gray-400">{reordered[med.id] ? `Order ${reordered[med.id]} placed` : `${med.remainingDoses} doses left · ${med.nextRefill}`}</p>
                      </div>
                      {reordered[med.id] ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-1 font-bold">✓ Placed</span>
                      ) : (
                        <button
                          onClick={() => handleReorder(med)}
                          disabled={busyId === med.id}
                          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-400 transition disabled:opacity-50"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  ))}
                  {medicines.some(m => m.autoReorder) && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <FiRefreshCw className="text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">Auto-Reorder Active</p>
                        <p className="text-xs text-gray-400">Refill orders placed through E-Prescription</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">ON</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medicine List */}
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FiPackage className="text-emerald-400" /> Your Medications
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-teal-500 transition"
                >
                  <FiPlus size={16} /> Add Medicine
                </button>
              </div>

              {medicines.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.03] rounded-2xl">
                  <FiPackage size={36} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 font-bold">No medications tracked</p>
                  <p className="text-white/30 text-sm mt-1 mb-4">Add your first medicine to start logging doses.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    Add Medicine
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Medicine</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Dosage</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Times</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Adherence</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Stock</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Auto-Reorder</th>
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Log Today</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {medicines.map(med => (
                        <tr key={med.id} className="border-b border-white/5 align-middle">
                          <td className="py-4">
                            <p className="font-bold text-white">{med.name}</p>
                            <p className="text-[10px] text-gray-500">{med.frequency}</p>
                          </td>
                          <td className="py-4 text-gray-400">{med.dosage || '—'}</td>
                          <td className="py-4 text-gray-400">{med.times.join(', ') || '—'}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${med.adherenceRate}%`, backgroundColor: getAdherenceColor(med.adherenceRate) }} />
                              </div>
                              <span className="font-bold" style={{ color: getAdherenceColor(med.adherenceRate) }}>{med.adherenceRate}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-gray-400">{med.remainingDoses} doses</p>
                            <p className={`text-[10px] ${med.lowStock ? 'text-red-400' : 'text-gray-500'}`}>
                              {med.lowStock ? 'Low stock' : med.nextRefill}
                            </p>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleAutoReorder(med)}
                              disabled={busyId === med.id}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                                med.autoReorder ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                              }`}
                            >
                              {med.autoReorder ? 'Active' : 'Off'}
                            </button>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLog(med, 'taken')}
                                disabled={busyId === med.id}
                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition disabled:opacity-50"
                              >
                                Taken
                              </button>
                              <button
                                onClick={() => handleLog(med, 'missed')}
                                disabled={busyId === med.id}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition disabled:opacity-50"
                              >
                                Missed
                              </button>
                              <button
                                onClick={() => handleDelete(med)}
                                disabled={busyId === med.id}
                                className="p-1.5 bg-white/5 text-gray-500 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                                title="Remove medicine"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Adherence Trend */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-400" /> Adherence Trend (from logged doses)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="week" stroke="#888" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="adherenceRate" name="Adherence %" stroke="#10b981" fill="rgba(16,185,129,0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Interaction Alerts */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-400" /> Drug Interaction Alerts
                </h3>
                <div className="space-y-3">
                  {interactions.map(interaction => (
                    <div key={interaction.id} className={`p-4 rounded-xl border ${getAlertColor(interaction.severity)}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {getAlertIcon(interaction.severity)}
                        <div>
                          <p className="font-bold text-sm">
                            {interaction.medicineA} + {interaction.medicineB}
                          </p>
                          <p className="text-xs opacity-70">{interaction.severity.toUpperCase()} INTERACTION</p>
                        </div>
                      </div>
                      <p className="text-sm opacity-90">{interaction.message}</p>
                    </div>
                  ))}
                  <div className="text-center py-6 bg-white/5 rounded-xl">
                    {interactions.length === 0 && (
                      <>
                        <FiCheckCircle className="text-emerald-400 mx-auto mb-2" size={28} />
                        <p className="text-gray-400 text-sm">No known interactions between your medicines in our knowledge base</p>
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 text-[10px]">Knowledge base check across current medications · always consult your pharmacist.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <a href="/medicine-reminder" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
                <div className="text-4xl mb-3">💊</div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">Medicine Reminders</h3>
                <p className="text-sm text-gray-400">Set up reminders and never miss a dose</p>
              </a>
              <a href="/medicine-interactions" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">Interaction Checker</h3>
                <p className="text-sm text-gray-400">Check drug interactions before taking</p>
              </a>
              <a href="/e-prescription" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">E-Prescription Orders</h3>
                <p className="text-sm text-gray-400">Manage refill orders and delivery</p>
              </a>
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Add Medication</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-bold text-gray-300 mb-2 block">Medicine Name *</label>
              <input
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="e.g. Metformin 500mg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">Dosage</label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="1 tablet"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">Frequency</label>
                <select
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Thrice daily">Thrice daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-300 mb-2 block">Dose Times <span className="text-gray-500 font-normal">(comma separated, 24h)</span></label>
              <input
                type="text"
                value={medTimes}
                onChange={(e) => setMedTimes(e.target.value)}
                placeholder="08:00, 20:00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">
                Cancel
              </button>
              <button
                onClick={handleAddMedication}
                disabled={!medName.trim() || busyId === 'add'}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyId === 'add' ? 'Adding…' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}