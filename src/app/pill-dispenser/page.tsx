'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiBattery, FiWifi, FiWifiOff, FiClock, FiAlertCircle, FiCheck, FiX, FiPlus, FiTrash2, FiEdit2, FiBell, FiBellOff, FiRefreshCw, FiActivity, FiPackage, FiArrowRight, FiCalendar, FiChevronDown, FiChevronUp, FiSend, FiZap, FiShield } from 'react-icons/fi';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  quantityRemaining: number;
  reorderThreshold: number;
  schedule: Record<string, string[]>;
}

interface DispenseLog {
  id: string;
  date: string;
  time: string;
  medication: string;
  status: 'dispensed' | 'skipped' | 'missed';
}

interface Alert {
  id: string;
  type: 'missed' | 'low' | 'offline' | 'interaction';
  message: string;
  time: string;
  read: boolean;
}

interface DeviceStatus {
  name: string;
  batteryLevel: number;
  online: boolean;
  lastSynced: string;
  totalSlots: number;
  filledSlots: number;
  nextDispense: string;
}

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INITIAL_MEDICATIONS: Medication[] = [];

const INITIAL_LOGS: DispenseLog[] = [];

const INITIAL_ALERTS: Alert[] = [];

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const STATUS_ICON: Record<string, string> = { dispensed: '✓', skipped: '⊘', missed: '✗' };
const STATUS_COLOR: Record<string, string> = { dispensed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', skipped: 'text-amber-400 bg-amber-500/10 border-amber-500/20', missed: 'text-red-400 bg-red-500/10 border-red-500/20' };

export default function PillDispenserPage() {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [logs, setLogs] = useState<DispenseLog[]>(INITIAL_LOGS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [device, setDevice] = useState<DeviceStatus>({
    name: 'ZyntraCare Dispenser Pro', batteryLevel: 78, online: true,
    lastSynced: '2 min ago', totalSlots: 30, filledSlots: 24,
    nextDispense: '08:00 PM',
  });
  const [activeTab, setActiveTab] = useState<'schedule' | 'dispenser' | 'alerts' | 'history'>('schedule');
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'Once daily', quantityRemaining: 30, reorderThreshold: 7 });
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [familyAlerts, setFamilyAlerts] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [loading, setLoading] = useState(true);
  const [dispenserSlots, setDispenserSlots] = useState(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      status: 'empty' as 'filled' | 'empty' | 'dispensed' | 'missed',
      medication: '',
    }));
  });

  const fetchDispenserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pill-dispenser?userId=demo-user');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.medications) setMedications(data.medications);
      if (data.logs) setLogs(data.logs);
      if (data.alerts) setAlerts(data.alerts);
      if (data.device) setDevice(data.device);
      if (data.dispenserSlots) setDispenserSlots(data.dispenserSlots);
    } catch {
      // Use empty defaults on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispenserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addMedication = async () => {
    if (!newMed.name || !newMed.dosage) return;
    const schedule: Record<string, string[]> = {};
    DAYS.forEach(d => { schedule[d] = newMed.frequency === 'Twice daily' ? ['Morning', 'Evening'] : ['Morning']; });
    const med: Medication = { id: `m_${Date.now()}`, ...newMed, schedule };
    setMedications([...medications, med]);
    setNewMed({ name: '', dosage: '', frequency: 'Once daily', quantityRemaining: 30, reorderThreshold: 7 });
    setShowAddMed(false);
    try {
      await fetch('/api/pill-dispenser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', action: 'addMedication', medication: med }),
      });
    } catch { /* optimistically added */ }
  };

  const removeMedication = (id: string) => setMedications(medications.filter(m => m.id !== id));

  const toggleScheduleSlot = (medId: string, day: string, time: string) => {
    setMedications(medications.map(m => {
      if (m.id !== medId) return m;
      const current = m.schedule[day] || [];
      const updated = current.includes(time) ? current.filter(t => t !== time) : [...current, time];
      return { ...m, schedule: { ...m.schedule, [day]: updated } };
    }));
  };

  const handleDispenseNow = useCallback(async () => {
    setDispensing(true);
    try {
      const res = await fetch('/api/pill-dispenser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', action: 'dispense' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.log) {
          setLogs([data.log, ...logs]);
        }
      }
    } catch {
      const newLog: DispenseLog = {
        id: `l_${Date.now()}`, date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        medication: 'Manual Dispense — Metformin 500mg', status: 'dispensed',
      };
      setLogs([newLog, ...logs]);
    } finally {
      setDispensing(false);
    }
  }, [logs]);

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const lowStockMeds = medications.filter(m => m.quantityRemaining <= m.reorderThreshold);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white py-12 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-rose-600/18 rounded-full blur-[175px]" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-orange-600/14 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to ZyntraCare
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiPackage size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Smart Pill Dispenser</h1>
          <p className="text-gray-400 text-lg">IoT-connected medication management</p>
        </motion.div>

        {/* Device Status Card */}
        <GlassCard className="p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${device.online ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20'}`}>
                {device.online ? <FiWifi size={24} /> : <FiWifiOff size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-white">{device.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className={`flex items-center gap-1 ${device.online ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.online ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {device.online ? 'Online' : 'Offline'}
                  </span>
                  <span className="flex items-center gap-1"><FiClock size={10} /> Synced {device.lastSynced}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="relative w-10 h-10 mx-auto mb-1">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={device.batteryLevel > 50 ? '#22c55e' : device.batteryLevel > 20 ? '#eab308' : '#ef4444'} strokeWidth="3" strokeDasharray={`${device.batteryLevel} 100`} strokeLinecap="round" />
                  </svg>
                  <FiBattery className="absolute inset-0 m-auto" size={14} />
                </div>
                <span className="text-[10px] text-gray-400">{device.batteryLevel}%</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white">{device.filledSlots}/{device.totalSlots}</div>
                <span className="text-[10px] text-gray-400">Slots Filled</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-orange-400">{lowStockMeds.length}</div>
                <span className="text-[10px] text-gray-400">Low Stock</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'schedule', label: 'Schedule', icon: <FiCalendar size={14} /> },
            { key: 'dispenser', label: 'Dispenser', icon: <FiPackage size={14} /> },
            { key: 'alerts', label: `Alerts${unreadAlerts > 0 ? ` (${unreadAlerts})` : ''}`, icon: <FiBell size={14} /> },
            { key: 'history', label: 'History', icon: <FiClock size={14} /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${activeTab === tab.key ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading dispenser data...</p>
          </div>
        )}

        {!loading && (

        <AnimatePresence mode="wait">
          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Weekly Medication Schedule</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddMed(true)} className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs transition">
                  <FiPlus size={14} /> Add Medication
                </motion.button>
              </div>

              {/* Schedule Grid */}
              <GlassCard className="p-4 mb-6 overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header */}
                  <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-1 mb-2">
                    <div />
                    {DAYS.map(d => (
                      <button key={d} onClick={() => setSelectedDay(d)} className={`text-center py-2 rounded-lg text-xs font-bold transition ${selectedDay === d ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{d}</button>
                    ))}
                  </div>
                  {/* Time Slots */}
                  {TIME_SLOTS.map(time => (
                    <div key={time} className="grid grid-cols-[120px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-gray-400 flex items-center justify-end pr-3 font-medium">{time}</div>
                      {DAYS.map(day => {
                        const medsInSlot = medications.filter(m => m.schedule[day]?.includes(time));
                        return (
                          <div key={day} className={`min-h-[44px] rounded-xl p-1.5 border border-white/5 transition-all ${medsInSlot.length > 0 ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
                            {medsInSlot.map(m => (
                              <div key={m.id} className="bg-rose-500/15 border border-rose-500/20 rounded-lg px-1.5 py-0.5 mb-0.5 last:mb-0">
                                <span className="text-[9px] text-rose-300 font-semibold block leading-tight truncate">{m.name}</span>
                                <span className="text-[8px] text-gray-500 block leading-tight">{m.dosage}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Medication List */}
              <h3 className="font-bold text-white mb-3">Medications ({medications.length})</h3>
              <div className="space-y-3">
                {medications.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                    <GlassCard className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm">{med.name}</h4>
                            <span className="text-xs text-gray-500">{med.dosage}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded-full text-gray-400">{med.frequency}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className={med.quantityRemaining <= med.reorderThreshold ? 'text-amber-400 font-semibold' : ''}>
                              {med.quantityRemaining} tablets remaining
                            </span>
                            {med.quantityRemaining <= med.reorderThreshold && <span className="text-amber-400 text-[10px] flex items-center gap-0.5"><FiAlertCircle size={10} /> Low stock</span>}
                          </div>
                          {/* Toggle schedule for selected day */}
                          <div className="flex gap-1.5 mt-2">
                            {TIME_SLOTS.map(time => (
                              <button key={time} onClick={() => toggleScheduleSlot(med.id, selectedDay, time)} className={`text-[10px] px-2 py-1 rounded-lg font-medium transition border ${med.schedule[selectedDay]?.includes(time) ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-white/5 border-white/5 text-gray-600 hover:bg-white/10'}`}>
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => setEditingMed(editingMed === med.id ? null : med.id)} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"><FiEdit2 size={14} /></button>
                          <button onClick={() => removeMedication(med.id)} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"><FiTrash2 size={14} /></button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DISPENSER TAB */}
          {activeTab === 'dispenser' && (
            <motion.div key="dispenser" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispenser Grid */}
                <div className="lg:col-span-2">
                  <GlassCard className="p-5">
                    <h3 className="font-bold text-white mb-4">Dispenser Layout ({device.totalSlots} Slots)</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {dispenserSlots.map(slot => {
                        const colors = { filled: 'bg-emerald-500/20 border-emerald-500/30', empty: 'bg-white/5 border-white/10', dispensed: 'bg-blue-500/20 border-blue-500/30', missed: 'bg-red-500/20 border-red-500/30' };
                        return (
                          <motion.div key={slot.id} whileHover={{ scale: 1.1 }} className={`aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition ${colors[slot.status]}`}>
                            <span className="text-[10px] font-bold text-white">{slot.id + 1}</span>
                            {slot.medication && <span className="text-[7px] text-gray-400 leading-tight text-center truncate w-full px-0.5">{slot.medication}</span>}
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/30 rounded" /> Filled</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500/20 border border-blue-500/30 rounded" /> Dispensed</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded" /> Missed</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white/5 border border-white/10 rounded" /> Empty</span>
                    </div>
                  </GlassCard>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Next Dispense */}
                  <GlassCard className="p-5 text-center">
                    <FiClock size={28} className="text-orange-400 mx-auto mb-2" />
                    <h4 className="text-xs text-gray-400 mb-1">Next Dispense In</h4>
                    <div className="text-3xl font-black text-white font-mono">
                      {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tonight — 08:00 PM</p>
                  </GlassCard>

                  {/* Manual Override */}
                  <GlassCard className="p-5">
                    <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2"><FiZap size={14} className="text-amber-400" /> Manual Override</h4>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleDispenseNow} disabled={dispensing || !device.online} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2">
                      {dispensing ? (
                        <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Dispensing...</>
                      ) : (
                        <><FiZap size={16} /> Dispense Now</>
                      )}
                    </motion.button>
                  </GlassCard>

                  {/* Family Alerts */}
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {familyAlerts ? <FiBell size={16} className="text-emerald-400" /> : <FiBellOff size={16} className="text-gray-500" />}
                        <div>
                          <h4 className="font-bold text-white text-sm">Family Alerts</h4>
                          <p className="text-[10px] text-gray-500">Alert family when dose missed</p>
                        </div>
                      </div>
                      <button onClick={() => setFamilyAlerts(!familyAlerts)} className={`w-12 h-6 rounded-full transition-all relative ${familyAlerts ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                        <motion.div animate={{ x: familyAlerts ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Alerts ({alerts.length})</h2>
                <button onClick={() => setAlerts(alerts.map(a => ({ ...a, read: true })))} className="text-xs text-gray-400 hover:text-white transition">Mark all read</button>
              </div>

              {/* Low Stock Warnings */}
              {lowStockMeds.length > 0 && (
                <GlassCard className="p-5 mb-6 border-amber-500/20">
                  <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2"><FiAlertCircle size={16} /> Low Medication Stock</h3>
                  <div className="space-y-2">
                    {lowStockMeds.map(med => (
                      <div key={med.id} className="flex items-center justify-between bg-amber-500/5 rounded-xl px-4 py-2.5 border border-amber-500/10">
                        <div>
                          <span className="text-sm font-semibold text-white">{med.name} {med.dosage}</span>
                          <span className="text-xs text-amber-400 ml-2">{med.quantityRemaining} left (threshold: {med.reorderThreshold})</span>
                        </div>
                        <button className="text-xs px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg font-semibold hover:bg-amber-500/30 transition">Reorder</button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Alert List */}
              <div className="space-y-3">
                {alerts.map((alert, i) => {
                  const icon = alert.type === 'missed' ? <FiAlertCircle size={18} className="text-red-400" /> : alert.type === 'low' ? <FiAlertCircle size={18} className="text-amber-400" /> : alert.type === 'offline' ? <FiWifiOff size={18} className="text-gray-400" /> : <FiShield size={18} className="text-violet-400" />;
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                      <GlassCard className={`p-4 ${!alert.read ? 'border-l-2 border-l-rose-500' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{icon}</div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{alert.message}</p>
                            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1"><FiClock size={10} /> {alert.time}</p>
                          </div>
                          {!alert.read && <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0 mt-2" />}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-lg font-bold text-white mb-4">Dispense History</h2>
              <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Date</th>
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Time</th>
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Medication</th>
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * i }} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                          <td className="px-5 py-3 text-gray-300 text-xs">{log.date}</td>
                          <td className="px-5 py-3 text-gray-400 text-xs">{log.time}</td>
                          <td className="px-5 py-3 text-white text-xs font-medium">{log.medication}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${STATUS_COLOR[log.status]}`}>
                              {STATUS_ICON[log.status]} {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddMed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddMed(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add Medication</h3>
                <button onClick={() => setShowAddMed(false)} className="text-gray-500 hover:text-white"><FiX size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 font-semibold text-sm block mb-2">Medication Name *</label>
                  <input value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} placeholder="e.g. Metformin" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold text-sm block mb-2">Dosage *</label>
                  <input value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} placeholder="e.g. 500mg" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold text-sm block mb-2">Frequency</label>
                  <select value={newMed.frequency} onChange={e => setNewMed({ ...newMed, frequency: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none appearance-none cursor-pointer">
                    <option value="Once daily" className="bg-slate-900">Once daily</option>
                    <option value="Twice daily" className="bg-slate-900">Twice daily</option>
                    <option value="Three times daily" className="bg-slate-900">Three times daily</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Quantity</label>
                    <input type="number" value={newMed.quantityRemaining} onChange={e => setNewMed({ ...newMed, quantityRemaining: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Reorder At</label>
                    <input type="number" value={newMed.reorderThreshold} onChange={e => setNewMed({ ...newMed, reorderThreshold: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addMedication} disabled={!newMed.name || !newMed.dosage} className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2">
                  <FiPlus /> Add Medication
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
