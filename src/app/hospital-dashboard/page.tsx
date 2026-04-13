'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import {
  FiActivity, FiAlertCircle, FiTruck, FiUsers, FiBarChart2,
  FiBell, FiSettings, FiMapPin, FiPhone, FiRadio, FiCheckCircle,
  FiClock, FiAlertTriangle, FiHome, FiPlus, FiRefreshCw
} from 'react-icons/fi';
import { MdLocalHospital, MdEmergency } from 'react-icons/md';

/* ── Mock hospital data ────────────────────────────────── */
const HOSPITAL_ID = 'HOSP_001';
const HOSPITAL_NAME = 'ZyntraCare Medical Center';

const INITIAL_BED_DATA = {
  general: { total: 200, occupied: 142, available: 58 },
  icu: { total: 40, occupied: 31, available: 9 },
  emergency: { total: 30, occupied: 22, available: 8 },
  pediatric: { total: 50, occupied: 38, available: 12 },
};

const AMBULANCES = [
  { id: 'AMB-01', driver: 'Ramesh Kumar', plate: 'DL-4C-AB-1234', status: 'available', location: 'Sector 21, Noida', lastUpdated: '2 min ago' },
  { id: 'AMB-02', driver: 'Suresh Verma', plate: 'DL-4C-CD-5678', status: 'en-route', location: 'Karol Bagh → AIIMS', lastUpdated: '1 min ago' },
  { id: 'AMB-03', driver: 'Mahesh Singh', plate: 'DL-4C-EF-9012', status: 'at-hospital', location: 'Hospital Bay 3', lastUpdated: '5 min ago' },
  { id: 'AMB-04', driver: 'Dinesh Yadav', plate: 'DL-4C-GH-3456', status: 'available', location: 'Dwarka Sector 8', lastUpdated: '3 min ago' },
  { id: 'AMB-05', driver: 'Rajesh Gupta', plate: 'DL-4C-IJ-7890', status: 'maintenance', location: 'Garage', lastUpdated: '1 hr ago' },
];

const EMERGENCY_CASES = [
  { id: 'EM-1049', type: 'Cardiac Arrest', patient: 'Male, ~55 yrs', priority: 'Critical', eta: '4 min', location: 'Connaught Place', unit: 'AMB-02' },
  { id: 'EM-1048', type: 'Road Accident', patient: 'Female, ~28 yrs', priority: 'High', eta: '12 min', location: 'Ring Road, Lajpat', unit: 'AMB-01' },
  { id: 'EM-1047', type: 'Stroke', patient: 'Male, ~68 yrs', priority: 'Critical', eta: '8 min', location: 'Defence Colony', unit: 'AMB-04' },
  { id: 'EM-1046', type: 'Fracture', patient: 'Child, ~10 yrs', priority: 'Medium', eta: '18 min', location: 'Saket', unit: 'AMB-03' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FiHome /> },
  { id: 'ambulances', label: 'Ambulances', icon: <FiTruck /> },
  { id: 'emergencies', label: 'Emergency Feed', icon: <MdEmergency /> },
  { id: 'beds', label: 'Bed Management', icon: <FiActivity /> },
  { id: 'staff', label: 'Staff', icon: <FiUsers /> },
];

const statusStyle: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'en-route': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'at-hospital': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const priorityStyle: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

/* ── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${color}`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-semibold">{label}</span>
        <div className={`p-2 rounded-xl ${color} bg-opacity-20 text-white`}>{icon}</div>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

/* ── Bed Bar ───────────────────────────────────────────── */
function BedBar({ label, data, color }: { label: string; data: { total: number; occupied: number; available: number }; color: string }) {
  const pct = Math.round((data.occupied / data.total) * 100);
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-white">{label}</span>
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400 font-bold">{data.available} free</span>
          <span className="text-gray-500">{data.occupied}/{data.total}</span>
        </div>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">{pct}% occupied</div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function HospitalDashboardPage() {
  const [tab, setTab] = useState('overview');
  const [pulse, setPulse] = useState(true);
  const [notifCount, setNotifCount] = useState(3);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [beds, setBeds] = useState(INITIAL_BED_DATA);

  // Pulse animation
  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(iv);
  }, []);

  // Simulate real-time bed updates
  useEffect(() => {
    const iv = setInterval(() => {
      setBeds(prev => ({
        general: { ...prev.general, occupied: Math.max(0, prev.general.occupied + Math.floor(Math.random() * 3) - 1) },
        icu: { ...prev.icu, occupied: Math.max(0, prev.icu.occupied + (Math.random() > 0.7 ? 1 : 0)) },
        emergency: { ...prev.emergency, occupied: Math.max(0, prev.emergency.occupied + Math.floor(Math.random() * 3) - 1) },
        pediatric: { ...prev.pediatric },
      }));
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <RoleGuard
      allow={['hospital', 'admin', 'owner']}
      title="Hospital staff access required"
      description="Please sign in with a hospital account to view the staff portal."
    >
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-red-600/20 rounded-full blur-[160px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px]"
        />
      </div>
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <MdLocalHospital className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg">{HOSPITAL_NAME}</h1>
              <p className="text-gray-500 text-xs">ID: {HOSPITAL_ID} • Staff Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live pulse indicator */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full bg-emerald-400 transition-all ${pulse ? 'opacity-100' : 'opacity-30'}`} />
              <span className="text-emerald-400 text-xs font-bold">LIVE</span>
            </div>
            <button
              onClick={() => setLastRefresh(new Date())}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
              title="Refresh data"
            >
              <FiRefreshCw size={16} />
            </button>
            <button className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition">
              <FiBell size={16} />
              {notifCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">{notifCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap border text-sm transition ${
                tab === t.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900/40 border-white/5 text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Patients Today" value={289} sub="+14 from yesterday" color="bg-blue-500" icon={<FiUsers size={18} />} />
                  <StatCard label="Available Beds" value={beds.general.available + beds.icu.available + beds.emergency.available} sub="Across all wards" color="bg-emerald-500" icon={<FiActivity size={18} />} />
                  <StatCard label="Active Ambulances" value={AMBULANCES.filter(a => a.status !== 'maintenance').length} sub="Ready to deploy" color="bg-orange-500" icon={<FiTruck size={18} />} />
                  <StatCard label="Emergency Cases" value={EMERGENCY_CASES.length} sub="2 Critical inbound" color="bg-red-500" icon={<FiAlertCircle size={18} />} />
                </div>

                {/* Bed Overview */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
                  <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <FiActivity className="text-blue-400" /> Live Bed Availability
                    <span className="text-xs text-gray-500 font-normal ml-auto">Refreshed: {lastRefresh.toLocaleTimeString()}</span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <BedBar label="General Ward" data={beds.general} color="bg-blue-500" />
                    <BedBar label="ICU" data={beds.icu} color="bg-red-500" />
                    <BedBar label="Emergency" data={beds.emergency} color="bg-orange-500" />
                    <BedBar label="Pediatric" data={beds.pediatric} color="bg-purple-500" />
                  </div>
                </div>

                {/* Recent Emergencies */}
                <div className="bg-slate-900/50 border border-red-500/20 rounded-3xl p-6">
                  <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-red-400 ${pulse ? 'opacity-100' : 'opacity-30'} transition-all`} />
                    Inbound Emergency Feed
                  </h2>
                  <div className="space-y-3">
                    {EMERGENCY_CASES.slice(0, 3).map(em => (
                      <div key={em.id} className="flex items-center justify-between bg-black/20 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${priorityStyle[em.priority]}`}>{em.priority}</span>
                          <div>
                            <div className="font-bold text-white text-sm">{em.type} — {em.patient}</div>
                            <div className="text-gray-500 text-xs flex items-center gap-2"><FiMapPin size={10} />{em.location} • Unit: {em.unit}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 font-bold text-sm flex items-center gap-1"><FiClock size={12} /> ETA {em.eta}</div>
                          <div className="text-gray-600 text-xs">{em.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AMBULANCES ── */}
            {tab === 'ambulances' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-xl text-white">Fleet Status</h2>
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold transition">
                    <FiPlus /> Dispatch Unit
                  </button>
                </div>
                {AMBULANCES.map((amb, idx) => (
                  <motion.div
                    key={amb.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FiTruck size={22} className="text-white" />
                      </div>
                      <div>
                        <div className="font-black text-white text-lg">{amb.id}</div>
                        <div className="text-gray-400 text-sm">{amb.driver} • {amb.plate}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm"><FiMapPin size={14} />{amb.location}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[amb.status]}`}>
                        {amb.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-gray-600 text-xs">{amb.lastUpdated}</span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 transition" title="Call driver">
                          <FiPhone size={16} />
                        </button>
                        <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 transition" title="Track live">
                          <FiRadio size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── EMERGENCY FEED ── */}
            {tab === 'emergencies' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full bg-red-400 ${pulse ? 'scale-125' : 'scale-100'} transition-transform`} />
                  <h2 className="font-bold text-xl text-white">Live Emergency Feed</h2>
                  <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">{EMERGENCY_CASES.length} active</span>
                </div>
                {EMERGENCY_CASES.map((em, idx) => (
                  <motion.div
                    key={em.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`border rounded-2xl p-5 relative overflow-hidden ${em.priority === 'Critical' ? 'border-red-500/40 bg-red-950/20' : 'border-white/10 bg-slate-900/50'}`}
                  >
                    {em.priority === 'Critical' && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${em.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          <FiAlertTriangle size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${priorityStyle[em.priority]}`}>{em.priority}</span>
                            <span className="text-gray-500 text-xs">{em.id}</span>
                          </div>
                          <div className="font-bold text-white">{em.type}</div>
                          <div className="text-gray-400 text-sm">{em.patient} • {em.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div className="text-orange-400 font-bold flex items-center gap-1">
                          <FiClock size={14} /> ETA {em.eta}
                        </div>
                        <div className="text-gray-500 text-sm">Unit: <span className="text-blue-400 font-bold">{em.unit}</span></div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1">
                            <FiCheckCircle size={12} /> Accept
                          </button>
                          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition">
                            Route →
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── BED MANAGEMENT ── */}
            {tab === 'beds' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-xl text-white">Bed Management Panel</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiRefreshCw size={12} /> Auto-refreshes every 10s
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    { label: 'General Ward', data: beds.general, color: 'bg-blue-500' },
                    { label: 'ICU', data: beds.icu, color: 'bg-red-500' },
                    { label: 'Emergency', data: beds.emergency, color: 'bg-orange-500' },
                    { label: 'Pediatric', data: beds.pediatric, color: 'bg-purple-500' },
                  ].map(ward => (
                    <div key={ward.label} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white text-lg">{ward.label}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setBeds(b => ({
                              ...b,
                              [ward.label.toLowerCase().replace(' ', '')]: { ...ward.data, occupied: Math.max(0, ward.data.occupied - 1), available: ward.data.available + 1 }
                            }))}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition"
                          >+ Discharge</button>
                          <button
                            onClick={() => {
                              if (ward.data.available > 0) {
                                setBeds(b => ({
                                  ...b,
                                  [ward.label.toLowerCase().replace(' ', '')]: { ...ward.data, occupied: ward.data.occupied + 1, available: ward.data.available - 1 }
                                }));
                              }
                            }}
                            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition"
                          >+ Admit</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Total', val: ward.data.total, clr: 'text-white' },
                          { label: 'Occupied', val: ward.data.occupied, clr: 'text-red-400' },
                          { label: 'Available', val: ward.data.available, clr: 'text-emerald-400' },
                        ].map(s => (
                          <div key={s.label} className="bg-black/20 rounded-xl p-3 text-center border border-white/5">
                            <div className={`text-2xl font-black ${s.clr}`}>{s.val}</div>
                            <div className="text-gray-500 text-xs">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <BedBar label="" data={ward.data} color={ward.color} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STAFF ── */}
            {tab === 'staff' && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl text-white mb-4">Staff on Duty</h2>
                {[
                  { name: 'Dr. Anil Sharma', role: 'Senior Cardiologist', dept: 'Cardiology', status: 'In surgery', shift: 'Morning' },
                  { name: 'Dr. Priya Mehta', role: 'Emergency Physician', dept: 'Emergency', status: 'On duty', shift: 'Evening' },
                  { name: 'Nurse Sunita', role: 'Head Nurse', dept: 'ICU', status: 'On duty', shift: 'Morning' },
                  { name: 'Dr. Rajiv Kumar', role: 'Anesthesiologist', dept: 'Surgery', status: 'Available', shift: 'Night' },
                  { name: 'Dr. Kavya Reddy', role: 'Pediatrician', dept: 'Pediatrics', status: 'On duty', shift: 'Morning' },
                  { name: 'Paramedic Rahul', role: 'Paramedic', dept: 'Ambulance', status: 'En route', shift: 'Evening' },
                ].map((s, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.07 }}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-gray-400 text-sm">{s.role} • {s.dept}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${s.status === 'On duty' ? 'text-emerald-400' : s.status === 'Available' ? 'text-blue-400' : 'text-yellow-400'}`}>{s.status}</div>
                      <div className="text-gray-600 text-xs">{s.shift} shift</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </RoleGuard>
  );
}
