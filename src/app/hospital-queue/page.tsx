'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiClock, FiActivity, FiBell, FiBellOff, FiTrendingUp,
  FiChevronDown, FiArrowRight, FiX, FiCheck, FiAlertCircle, FiBarChart2,
  FiRefreshCw, FiMapPin, FiStar, FiCalendar
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';

interface Hospital {
  id: string;
  name: string;
  city: string;
  type: string;
  rating: number;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  icon: string;
  queueLength: number;
  avgTimePerPatient: number;
  currentAvgWait: string;
  isOpen: boolean;
}

interface QueueEntry {
  id: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  position: number;
  totalInQueue: number;
  joinedAt: Date;
  estimatedWaitMinutes: number;
  avgTimePerPatient: number;
}

interface QueueStats {
  avgWaitToday: string;
  peakHours: { hour: string; count: number }[];
  totalServedToday: number;
  currentAvgWait: number;
}

const HOSPITALS: Hospital[] = [
  {
    id: 'h1', name: 'Apollo Hospitals', city: 'Delhi', type: 'Private',
    rating: 4.6,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 24, avgTimePerPatient: 12, currentAvgWait: '4 hr 48 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 8, avgTimePerPatient: 15, currentAvgWait: '2 hr 0 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 15, avgTimePerPatient: 8, currentAvgWait: '2 hr 0 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 30, avgTimePerPatient: 3, currentAvgWait: '1 hr 30 min', isOpen: true },
    ]
  },
  {
    id: 'h2', name: 'AIIMS Delhi', city: 'Delhi', type: 'Government',
    rating: 4.8,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 56, avgTimePerPatient: 10, currentAvgWait: '9 hr 20 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 18, avgTimePerPatient: 12, currentAvgWait: '3 hr 36 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 32, avgTimePerPatient: 7, currentAvgWait: '3 hr 44 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 45, avgTimePerPatient: 2, currentAvgWait: '1 hr 30 min', isOpen: true },
    ]
  },
  {
    id: 'h3', name: 'Fortis Healthcare', city: 'Mumbai', type: 'Private',
    rating: 4.5,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 18, avgTimePerPatient: 14, currentAvgWait: '4 hr 12 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 5, avgTimePerPatient: 15, currentAvgWait: '1 hr 15 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 12, avgTimePerPatient: 10, currentAvgWait: '2 hr 0 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 22, avgTimePerPatient: 3, currentAvgWait: '1 hr 6 min', isOpen: true },
    ]
  },
  {
    id: 'h4', name: 'Manipal Hospitals', city: 'Bengaluru', type: 'Private',
    rating: 4.4,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 20, avgTimePerPatient: 13, currentAvgWait: '4 hr 20 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 7, avgTimePerPatient: 14, currentAvgWait: '1 hr 38 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 10, avgTimePerPatient: 9, currentAvgWait: '1 hr 30 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 16, avgTimePerPatient: 3, currentAvgWait: '48 min', isOpen: true },
    ]
  },
  {
    id: 'h5', name: 'Government General Hospital', city: 'Chennai', type: 'Government',
    rating: 4.2,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 42, avgTimePerPatient: 11, currentAvgWait: '7 hr 42 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 12, avgTimePerPatient: 13, currentAvgWait: '2 hr 36 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 28, avgTimePerPatient: 8, currentAvgWait: '3 hr 44 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 35, avgTimePerPatient: 2, currentAvgWait: '1 hr 10 min', isOpen: true },
    ]
  },
  {
    id: 'h6', name: 'Max Super Speciality Hospital', city: 'Gurugram', type: 'Private',
    rating: 4.7,
    departments: [
      { id: 'opd', name: 'OPD', icon: '🏥', queueLength: 16, avgTimePerPatient: 15, currentAvgWait: '4 hr 0 min', isOpen: true },
      { id: 'emergency', name: 'Emergency', icon: '🚨', queueLength: 4, avgTimePerPatient: 16, currentAvgWait: '1 hr 4 min', isOpen: true },
      { id: 'lab', name: 'Laboratory', icon: '🔬', queueLength: 8, avgTimePerPatient: 10, currentAvgWait: '1 hr 20 min', isOpen: true },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', queueLength: 14, avgTimePerPatient: 4, currentAvgWait: '56 min', isOpen: true },
    ]
  },
];

const QUEUE_STATS: Record<string, QueueStats> = {
  h1: { avgWaitToday: '3 hr 42 min', totalServedToday: 312, currentAvgWait: 34, peakHours: [{ hour: '9AM', count: 45 }, { hour: '10AM', count: 62 }, { hour: '11AM', count: 58 }, { hour: '12PM', count: 40 }, { hour: '2PM', count: 55 }, { hour: '3PM', count: 48 }, { hour: '4PM', count: 38 }, { hour: '5PM', count: 30 }] },
  h2: { avgWaitToday: '5 hr 15 min', totalServedToday: 520, currentAvgWait: 52, peakHours: [{ hour: '9AM', count: 80 }, { hour: '10AM', count: 95 }, { hour: '11AM', count: 88 }, { hour: '12PM', count: 60 }, { hour: '2PM', count: 75 }, { hour: '3PM', count: 70 }, { hour: '4PM', count: 55 }, { hour: '5PM', count: 40 }] },
  h3: { avgWaitToday: '2 hr 55 min', totalServedToday: 268, currentAvgWait: 28, peakHours: [{ hour: '9AM', count: 35 }, { hour: '10AM', count: 48 }, { hour: '11AM', count: 45 }, { hour: '12PM', count: 30 }, { hour: '2PM', count: 42 }, { hour: '3PM', count: 38 }, { hour: '4PM', count: 28 }, { hour: '5PM', count: 20 }] },
  h4: { avgWaitToday: '3 hr 20 min', totalServedToday: 290, currentAvgWait: 32, peakHours: [{ hour: '9AM', count: 42 }, { hour: '10AM', count: 55 }, { hour: '11AM', count: 50 }, { hour: '12PM', count: 35 }, { hour: '2PM', count: 48 }, { hour: '3PM', count: 44 }, { hour: '4PM', count: 32 }, { hour: '5PM', count: 24 }] },
  h5: { avgWaitToday: '4 hr 50 min', totalServedToday: 445, currentAvgWait: 46, peakHours: [{ hour: '9AM', count: 68 }, { hour: '10AM', count: 82 }, { hour: '11AM', count: 76 }, { hour: '12PM', count: 52 }, { hour: '2PM', count: 65 }, { hour: '3PM', count: 60 }, { hour: '4PM', count: 48 }, { hour: '5PM', count: 35 }] },
  h6: { avgWaitToday: '2 hr 30 min', totalServedToday: 240, currentAvgWait: 24, peakHours: [{ hour: '9AM', count: 30 }, { hour: '10AM', count: 42 }, { hour: '11AM', count: 40 }, { hour: '12PM', count: 25 }, { hour: '2PM', count: 36 }, { hour: '3PM', count: 32 }, { hour: '4PM', count: 24 }, { hour: '5PM', count: 18 }] },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function PeakHoursChart({ stats }: { stats: QueueStats }) {
  const max = Math.max(...stats.peakHours.map(h => h.count));
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-32">
        {stats.peakHours.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500">{item.count}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.count / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
              className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 min-h-[4px]"
            />
            <span className="text-[9px] text-gray-500 font-medium">{item.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HospitalQueuePage() {
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [activeQueue, setActiveQueue] = useState<QueueEntry | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [joinedDepartment, setJoinedDepartment] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedHospital = HOSPITALS.find(h => h.id === selectedHospitalId);
  const stats = selectedHospitalId ? QUEUE_STATS[selectedHospitalId] : null;

  const elapsedTimer = useCallback(() => {
    setElapsedSeconds(prev => prev + 1);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(elapsedTimer, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [elapsedTimer]);

  useEffect(() => {
    if (!activeQueue) return;
    const moveInterval = setInterval(() => {
      setCurrentPosition(prev => {
        if (prev <= 1) {
          clearInterval(moveInterval);
          return 1;
        }
        return prev - 1;
      });
    }, 12000);
    return () => clearInterval(moveInterval);
  }, [activeQueue]);

  const joinQueue = (dept: Department) => {
    const pos = dept.queueLength + 1;
    const waitMinutes = pos * dept.avgTimePerPatient;
    const entry: QueueEntry = {
      id: `q-${Date.now()}`,
      hospitalId: selectedHospitalId,
      hospitalName: selectedHospital?.name || '',
      department: dept.name,
      position: pos,
      totalInQueue: dept.queueLength + 1,
      joinedAt: new Date(),
      estimatedWaitMinutes: waitMinutes,
      avgTimePerPatient: dept.avgTimePerPatient,
    };
    setActiveQueue(entry);
    setCurrentPosition(pos);
    setElapsedSeconds(0);
    setJoinedDepartment(dept.name);
  };

  const leaveQueue = () => {
    setActiveQueue(null);
    setCurrentPosition(0);
    setElapsedSeconds(0);
    setJoinedDepartment('');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const maxQueueLength = 60;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-teal-600/20 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 pt-24 pb-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-flex mb-4">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-teal-500/30 rounded-full"
            />
            <div className="relative p-4 bg-teal-500/15 border border-teal-500/40 rounded-full backdrop-blur-sm">
              <FiUsers size={32} className="text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Hospital{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400">
              Queue Manager
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Skip the uncertainty. Track your queue position in real-time across hospitals and departments.
          </p>
        </motion.div>

        {/* Active Queue Display */}
        <AnimatePresence>
          {activeQueue && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-slate-900/70 backdrop-blur-2xl border border-teal-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-teal-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse" />
                        <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Live Queue</span>
                      </div>
                      <h2 className="text-xl font-black text-white">{activeQueue.hospitalName}</h2>
                      <p className="text-gray-400 text-sm">{activeQueue.department} Department</p>
                    </div>
                    <button
                      onClick={leaveQueue}
                      className="px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/25 transition"
                    >
                      Leave Queue
                    </button>
                  </div>

                  {/* Position Display */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your Position</p>
                      <p className="text-4xl font-black text-teal-400">#{currentPosition}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ahead of You</p>
                      <p className="text-4xl font-black text-white">{Math.max(0, currentPosition - 1)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Est. Wait</p>
                      <p className="text-2xl font-black text-amber-400">{Math.max(0, currentPosition * activeQueue.avgTimePerPatient)}m</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Time</p>
                      <p className="text-2xl font-black text-emerald-400">{activeQueue.avgTimePerPatient}m</p>
                    </div>
                  </div>

                  {/* Queue Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Queue Progress</span>
                      <span className="text-xs text-teal-400 font-bold">
                        {activeQueue.totalInQueue - currentPosition + 1} / {activeQueue.totalInQueue} served
                      </span>
                    </div>
                    <div className="h-6 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeQueue.totalInQueue - currentPosition + 1) / activeQueue.totalInQueue) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full relative"
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-teal-500/50 border-2 border-teal-500" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Timer & Notifications */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                        <FiClock size={14} className="text-teal-400" />
                        <span className="text-sm text-gray-300">Waiting for: </span>
                        <span className="text-sm font-bold text-white font-mono">{formatDuration(elapsedSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                        <FiCalendar size={14} className="text-emerald-400" />
                        <span className="text-sm text-gray-300">Joined: </span>
                        <span className="text-sm font-bold text-white">{activeQueue.joinedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border ${
                        notificationsEnabled
                          ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {notificationsEnabled ? <FiBell size={14} /> : <FiBellOff size={14} />}
                      {notificationsEnabled ? 'Updates ON' : 'Get Updates'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hospital Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Select Hospital</label>
          <div className="relative">
            <button
              onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
              className="w-full bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-teal-500/30 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/15 border border-teal-500/30 rounded-xl flex items-center justify-center">
                  <MdLocalHospital size={20} className="text-teal-400" />
                </div>
                <div className="text-left">
                  {selectedHospital ? (
                    <>
                      <p className="font-bold text-white">{selectedHospital.name}</p>
                      <p className="text-xs text-gray-500">{selectedHospital.city} • {selectedHospital.type} • ★ {selectedHospital.rating}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 font-medium">Choose a hospital to view queues...</p>
                  )}
                </div>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform ${showHospitalDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showHospitalDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                >
                  {HOSPITALS.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setSelectedHospitalId(h.id); setShowHospitalDropdown(false); }}
                      className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition text-left ${
                        selectedHospitalId === h.id ? 'bg-teal-500/10 border-l-2 border-teal-500' : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        h.type === 'Government' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        <MdLocalHospital size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{h.name}</p>
                        <p className="text-xs text-gray-500">{h.city} • {h.type}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs"><FiStar size={10} fill="currentColor" />{h.rating}</div>
                        <p className="text-[10px] text-gray-600">{h.departments.reduce((s, d) => s + d.queueLength, 0)} in queues</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Departments & Join Queue */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-8"
            >
              <h2 className="text-sm text-gray-500 uppercase tracking-widest font-bold">
                Select Department to Join Queue
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedHospital.departments.map((dept, i) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-slate-900/70 backdrop-blur-xl border rounded-2xl p-5 transition-all ${
                      activeQueue?.department === dept.name
                        ? 'border-teal-500/50 shadow-lg shadow-teal-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{dept.icon}</div>
                        <div>
                          <h3 className="font-bold text-white">{dept.name}</h3>
                          <p className="text-xs text-gray-500">
                            {dept.isOpen ? (
                              <span className="text-emerald-400">● Open Now</span>
                            ) : (
                              <span className="text-red-400">● Closed</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">In Queue</p>
                        <p className="text-2xl font-black text-white">{dept.queueLength}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 mb-0.5">Avg Wait</p>
                        <p className="text-sm font-bold text-amber-400">{dept.currentAvgWait}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 mb-0.5">Per Patient</p>
                        <p className="text-sm font-bold text-teal-400">{dept.avgTimePerPatient} min</p>
                      </div>
                    </div>

                    {/* Queue length bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((dept.queueLength / maxQueueLength) * 100, 100)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className={`h-full rounded-full ${
                            dept.queueLength > 40 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                            dept.queueLength > 20 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                            'bg-gradient-to-r from-teal-500 to-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    {activeQueue?.department === dept.name ? (
                      <div className="w-full py-3 bg-teal-500/20 border border-teal-500/40 text-teal-400 font-bold rounded-xl text-center text-sm flex items-center justify-center gap-2">
                        <FiCheck size={16} /> In Queue — Position #{currentPosition}
                      </div>
                    ) : (
                      <button
                        onClick={() => joinQueue(dept)}
                        disabled={!dept.isOpen || !!activeQueue}
                        className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                      >
                        <FiUsers size={16} /> Join {dept.name} Queue
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-sm text-teal-400 font-bold mb-4 hover:text-teal-300 transition"
            >
              <FiBarChart2 size={16} />
              {showStats ? 'Hide' : 'Show'} Queue Statistics
              <FiChevronDown className={`transition-transform ${showStats ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <FiClock size={20} className="text-amber-400 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Wait Today</p>
                        <p className="text-xl font-black text-white mt-1">{stats.avgWaitToday}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <FiUsers size={20} className="text-teal-400 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Served Today</p>
                        <p className="text-xl font-black text-white mt-1">{stats.totalServedToday}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <FiActivity size={20} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Current Avg Wait</p>
                        <p className="text-xl font-black text-white mt-1">{stats.currentAvgWait} min</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                        <FiTrendingUp size={12} /> Busiest Hours
                      </h3>
                      <PeakHoursChart stats={stats} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* All Hospitals Overview */}
        {!selectedHospitalId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4">All Hospitals — Live Queue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOSPITALS.map((h, i) => {
                const totalQueue = h.departments.reduce((s, d) => s + d.queueLength, 0);
                return (
                  <motion.button
                    key={h.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.02, y: -3 }}
                    onClick={() => setSelectedHospitalId(h.id)}
                    className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-left hover:border-teal-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        h.type === 'Government' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        <MdLocalHospital size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{h.name}</h3>
                        <p className="text-xs text-gray-500">{h.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        <FiStar size={10} fill="currentColor" />{h.rating}
                      </div>
                      <div className="flex items-center gap-1 text-teal-400 text-xs font-bold">
                        <FiUsers size={11} />{totalQueue} in queue
                      </div>
                      <FiArrowRight size={14} className="text-gray-600 group-hover:text-teal-400 transition" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
