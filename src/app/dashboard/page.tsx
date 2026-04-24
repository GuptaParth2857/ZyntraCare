'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiUser, FiCalendar, FiFileText, FiActivity, FiClock, FiPlus, FiVideo, FiMessageCircle, FiTrendingUp, FiServer, FiStar, FiMapPin, FiChevronRight, FiZap } from 'react-icons/fi';
import { FaStethoscope, FaPills, FaNotesMedical, FaHeartbeat } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGuard from '@/components/PremiumGuard';
import ClientOnly from '@/components/ClientOnly';
import dynamic from 'next/dynamic';
import WellnessMissions from '@/components/WellnessMissions';

const NearbyHospitalsMap = dynamic(() => import('@/components/NearbyHospitalsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-900/50 animate-pulse rounded-3xl flex items-center justify-center border border-white/5"><span className="text-white/40 text-sm font-bold tracking-widest uppercase">Initializing Live Map...</span></div>,
});

const LazyLineChart = dynamic(
  () => import('recharts').then(mod => {
    const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tickFormatter={(hr: number) => `${hr}:00`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(2,6,23,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', backdropFilter: 'blur(12px)' }} />
            <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><p className="text-white/40 font-bold uppercase tracking-widest text-xs">Loading AI Models...</p></div> }
);

const TABS = [
  { id: 'appointments', label: 'Appointments', short: 'Visits', icon: <FiCalendar /> },
  { id: 'records', label: 'Medical Records', short: 'Records', icon: <FiFileText /> },
  { id: 'health', label: 'Health Metrics', short: 'Vitals', icon: <FaHeartbeat /> },
  { id: 'map', label: 'Hospital Radar', short: 'Map', icon: <FiMapPin /> },
  { id: 'predictions', label: 'AI Health Trends', short: 'AI Hub', icon: <FiTrendingUp /> },
];

const APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Amit Kumar', specialty: 'Cardiology', hospital: 'Fortis Memorial', date: '2026-04-10', time: '10:00 AM', status: 'Upcoming', type: 'Teleconsult' },
  { id: 2, doctor: 'Dr. Priya Sharma', specialty: 'Oncology', hospital: 'Max Super Speciality', date: '2026-03-20', time: '2:00 PM', status: 'Completed', type: 'In-Person' },
];

const RECORDS = [
  { id: 1, title: 'Complete Blood Count', date: '2026-03-15', hospital: 'Apollo Hospital', type: 'report' },
  { id: 2, title: 'Electrocardiogram (ECG)', date: '2026-03-10', hospital: 'Fortis Memorial', type: 'report' },
  { id: 3, title: 'Cardiology Prescription', date: '2026-03-05', hospital: 'AIIMS Delhi', type: 'prescription' },
];

const HEALTH_METRICS = [
  { label: 'Blood Pressure', val: '120/80', unit: 'mmHg', color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/30' },
  { label: 'Heart Rate', val: '72', unit: 'BPM', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30' },
  { label: 'Blood Oxygen', val: '98', unit: '% SpO2', color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/30' },
  { label: 'BMI Index', val: '24.2', unit: 'Normal', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
];

export default function DashboardPage() {
  // No login required - Guest mode (no session needed)
  const status = 'authenticated'; // Skip loading state
  const session = null; // Mock guest user
  const [activeTab, setActiveTab] = useState('appointments');
  const [predictions, setPredictions] = useState<number[]>([]);
  const [bedStats, setBedStats] = useState<any[]>([]);

  const handleTabChange = useCallback((tabId: string) => setActiveTab(tabId), []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/predict-flow', { signal: controller.signal })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPredictions(data); })
      .catch(() => {});
    fetch('/api/beds', { signal: controller.signal })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBedStats(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // For guest mode, hide loading and use guest user
  const isPremium = false; // Guest users can see basic features
  const isLoggedIn = false;
  const userName = 'Guest User';
  const userEmail = '';

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden font-inter pb-32 text-white">
      
      {/* ── CINEMATIC BG ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.15) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNmY2VjU0SDU0VjMwbS0wIDBiLTZiLTZiNi02aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-20 mask-image-gradient" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10 pt-28">
        
        {/* ── HEADER / PROFILE CARD ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="relative bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 md:p-10 mb-10 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[60px]" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 w-full text-center md:text-left">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse border-2 border-sky-500/30" style={{ animationDuration: '3s' }} />
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-sky-500 to-indigo-600 p-1 rounded-full shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center border-4 border-[#020617] relative overflow-hidden">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser size={48} className="text-white/80 z-10" />
                  )}
                  <div className="absolute bottom-0 w-full h-1/2 bg-sky-500/20 blur-md" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{userName}</h1>
                {isPremium && (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    <FiStar className="inline mr-1" size={12} /> PREMIUM
                  </span>
                )}
                {!isLoggedIn && (
                  <span className="bg-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/30">
                    Guest User
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3">{userEmail || 'Sign in to access all features'}</p>
              {isLoggedIn ? (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-sky-500/15 text-sky-400 text-xs font-semibold px-3 py-1 rounded-full border border-sky-500/20">Patient</span>
                  <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20">Verified</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <button onClick={() => window.location.href = '/subscription'} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30 transition">
                    <FiStar className="inline mr-1" size={12} /> Sign up for Premium
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10 w-full md:w-auto">
            {isLoggedIn ? (
              <>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiPlus size={15} /> Book Appointment
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiVideo size={15} /> Teleconsult
                </button>
              </>
            ) : (
              <div className="w-full flex gap-2">
                <button onClick={() => window.location.href = '/'} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiUser size={15} /> Sign In
                </button>
                <button onClick={() => window.location.href = '/emergency'} className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiActivity size={15} /> Emergency
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Access for Non-Logged Users ── */}
        {!isLoggedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-950/60 to-sky-950/40 border border-teal-500/20 rounded-[2rem] p-6 mb-10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <FiZap className="text-teal-400" size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Welcome to ZyntraCare!</h3>
                <p className="text-slate-400 text-sm">Access emergency features and health info without signing up</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/emergency" className="flex flex-col items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/20 transition">
                <FiActivity className="text-red-400" size={24} />
                <span className="text-white text-xs font-bold">Emergency</span>
              </Link>
              <Link href="/hospitals" className="flex flex-col items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 hover:bg-sky-500/20 transition">
                <FiMapPin className="text-sky-400" size={24} />
                <span className="text-white text-xs font-bold">Hospitals</span>
              </Link>
              <Link href="/pharmacies" className="flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 hover:bg-emerald-500/20 transition">
                <FaPills className="text-emerald-400" size={24} />
                <span className="text-white text-xs font-bold">Pharmacies</span>
              </Link>
              <Link href="/labs" className="flex flex-col items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-500/20 transition">
                <FaNotesMedical className="text-purple-400" size={24} />
                <span className="text-white text-xs font-bold">Labs</span>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 custom-scrollbar relative z-10">
            {[
              { icon: <FiVideo />, label: 'Fast Teleconsult', bg: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
              { icon: <FiCalendar />, label: 'Book Doctor', bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
              { icon: <FaNotesMedical />, label: 'Upload Meds', bg: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20' },
            ].map((btn, i) => (
              <button key={i} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r ${btn.bg} shadow-lg ${btn.shadow} text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap`}>
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

        {/* ── WELLNESS MISSIONS (GAMIFICATION) ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiZap className="text-blue-400" /> Daily Health Missions
          </h2>
          <WellnessMissions />
        </motion.div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar mb-4 relative">
          <div className="absolute bottom-6 left-0 w-full h-[1px] bg-white/5" />
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap z-10 text-sm ${
                  isActive ? 'bg-white/[0.08] text-white shadow-2xl' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}>
                <span className={isActive ? 'text-sky-400' : ''}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {isActive && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]" />}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT AREAS ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type: 'spring', damping: 25 }}>
            
            {/* 1. APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {APPOINTMENTS.map((apt, i) => (
                  <div key={apt.id} className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-sky-500/50 transition-colors">
                          <FaStethoscope className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl leading-snug">{apt.doctor}</h3>
                          <p className="text-sky-400 font-bold text-sm tracking-wide">{apt.specialty}</p>
                          <p className="text-white/40 text-xs mt-1 font-medium">{apt.hospital}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        apt.status === 'Upcoming' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-[#0f172a] rounded-2xl p-5 border border-white/5 mb-8">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1 pl-1">Date</p>
                        <p className="text-white font-bold flex items-center gap-2"><FiCalendar className="text-sky-400"/> {apt.date}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1 pl-1">Time</p>
                        <p className="text-white font-bold flex items-center gap-2"><FiClock className="text-indigo-400"/> {apt.time}</p>
                      </div>
                    </div>

                    {apt.status === 'Upcoming' ? (
                      <div className="flex gap-4">
                        <button className="flex-[2] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                          {apt.type === 'Teleconsult' ? <><FiVideo /> Join Room</> : <><FiMapPin /> Directions</>}
                        </button>
                        <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                          <FiMessageCircle size={18} /> Chat
                        </button>
                      </div>
                    ) : (
                      <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-4 rounded-2xl font-bold transition-all">
                        View Summary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2. HEALTH METRICS */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {HEALTH_METRICS.map((metric, i) => (
                  <div key={i} className={`bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group hover:bg-white/[0.04] transition-colors`}>
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${metric.color} rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} mb-6 flex items-center justify-center shadow-lg ${metric.shadow}`}>
                      <FiActivity className="text-white text-xl" />
                    </div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl lg:text-4xl font-black text-white">{metric.val}</span>
                      <span className="text-white/40 font-bold text-sm tracking-wide">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. AI PREDICTIONS */}
            {activeTab === 'predictions' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-500/20"><FiTrendingUp size={24}/></div>
                      <div>
                        <h3 className="font-black text-white text-xl">Hospital Visit Forecaster</h3>
                        <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Live AI Predictions</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    {predictions.length > 0 ? (
                      <ClientOnly><LazyLineChart data={predictions.map((val, hr) => ({ hour: hr, count: val }))} /></ClientOnly>
                    ) : <div className="w-full h-full flex items-center justify-center"><p className="text-white/40 font-bold">Querying Gemini AI...</p></div>}
                  </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8">
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-3"><FiServer className="text-emerald-400" /> Resource Nodes</h3>
                  <div className="space-y-4">
                    {Array.isArray(bedStats) && bedStats.slice(0, 5).map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                        <span className="text-white/80 font-bold text-sm truncate max-w-[120px]">{h?.id.split('_')[0]}...</span>
                        <div className="flex gap-3 text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <span className="text-white"><span className="text-emerald-400 font-black">{h?.beds?.available ?? 0}</span> Bed</span>
                          <span className="text-white/20">|</span>
                          <span className="text-white"><span className="text-sky-400 font-black">{h?.beds?.icuAvailable ?? 0}</span> ICU</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. HOSPITAL RADAR (MAP) */}
            {activeTab === 'map' && (
              <div className="rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative bg-[#020617] ring-1 ring-sky-500/20">
                <div className="bg-white/[0.02] border-b border-white/10 p-6 md:p-8 z-10 relative flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-1"><FiMapPin className="text-sky-400" /> ZyntraCare Radar</h2>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Overpass Global Database Active</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
                <div style={{ height: '600px', filter: 'brightness(0.9) contrast(1.1) saturate(1.2)' }}>
                  <NearbyHospitalsMap initialRadius={5} />
                </div>
              </div>
            )}

            {/* 5. MEDICAL RECORDS */}
            {activeTab === 'records' && (
              <PremiumGuard>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {RECORDS.map((rec, i) => (
                    <div key={rec.id} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-[2rem] p-6 md:p-8 group transition-all relative overflow-hidden cursor-pointer hover:bg-white/[0.04]">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        {rec.type === 'report' ? <FaNotesMedical size={24} /> : <FaPills size={24} />}
                      </div>
                      <h3 className="font-black text-white text-lg mb-2">{rec.title}</h3>
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6">{rec.hospital} • {rec.date}</p>
                      <button className="text-emerald-400 text-sm font-black uppercase tracking-wide flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                        View Document <FiChevronRight />
                      </button>
                    </div>
                  ))}
                  
                  <div className="bg-white/[0.01] backdrop-blur-xl border-2 border-dashed border-white/10 hover:border-sky-500/50 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[250px] cursor-pointer transition-colors group hover:bg-sky-500/5">
                    <div className="w-16 h-16 bg-white/5 text-white/50 group-hover:bg-sky-500/20 group-hover:text-sky-400 rounded-full flex items-center justify-center mb-4 transition-colors">
                      <FiPlus size={32} />
                    </div>
                    <span className="font-black text-white/50 group-hover:text-white uppercase tracking-widest text-sm transition-colors">Upload Record</span>
                  </div>
                </div>
              </PremiumGuard>
            )}
            
          </motion.div>
        </AnimatePresence>
        
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.5); }
      `}</style>
    </div>
  );
}