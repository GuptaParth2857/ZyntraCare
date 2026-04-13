'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiCalendar, FiFileText, FiActivity, FiClock, FiPlus, FiVideo, FiMessageCircle, FiTrendingUp, FiServer, FiStar, FiMapPin } from 'react-icons/fi';
import { FaStethoscope, FaPills, FaNotesMedical } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGuard from '@/components/PremiumGuard';
import ClientOnly from '@/components/ClientOnly';
import NearbyHospitalsMap from '@/components/NearbyHospitalsMap';
const TABS = [
  { id: 'appointments', label: 'Appointments', icon: <FiCalendar /> },
  { id: 'records', label: 'Medical Records', icon: <FiFileText /> },
  { id: 'health', label: 'Health Metrics', icon: <FiActivity /> },
  { id: 'map', label: 'Live Map', icon: <FiMapPin /> },
  { id: 'predictions', label: 'AI Health Trends', icon: <FiTrendingUp /> },
];

const APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Amit Kumar', specialty: 'Cardiology', hospital: 'Fortis Memorial Hospital', date: '2026-04-10', time: '10:00 AM', status: 'upcoming' },
  { id: 2, doctor: 'Dr. Priya Sharma', specialty: 'Oncology', hospital: 'Max Super Speciality', date: '2026-03-20', time: '2:00 PM', status: 'completed' },
];

const RECORDS = [
  { id: 1, title: 'Complete Blood Count', date: '2026-03-15', hospital: 'Apollo Hospital', type: 'report' },
  { id: 2, title: 'ECG Report', date: '2026-03-10', hospital: 'Fortis Memorial', type: 'report' },
  { id: 3, title: 'Blood Pressure Medication', date: '2026-03-05', hospital: 'AIIMS', type: 'prescription' },
];

const ACTIONS = [
  { icon: <FiCalendar />, label: 'Book', color: 'bg-blue-500 text-white hover:bg-blue-600 border-blue-400/50' },
  { icon: <FaNotesMedical />, label: 'Upload\nRecords', color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30' },
  { icon: <FiVideo />, label: 'Teleconsult', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30' },
];

const HEALTH_METRICS = [
  { label: 'Blood Pressure', val: '120/80', unit: 'mmHg', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
  { label: 'Heart Rate', val: '72', unit: 'bpm', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  { label: 'Blood Sugar', val: '95', unit: 'mg/dL', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  { label: 'BMI Index', val: '24.2', unit: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('appointments');
  const [predictions, setPredictions] = useState<number[]>([]);
  const [bedStats, setBedStats] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/predict-flow')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPredictions(data);
      })
      .catch(() => setPredictions([]));

    fetch('/api/beds')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBedStats(data);
      })
      .catch(() => setBedStats([]));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.06, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-cyan-600/18 rounded-full blur-[170px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px]"
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <FiUser size={48} className="mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to view your patient dashboard.</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">Return Home</Link>
        </motion.div>
      </div>
    );
  }

  const isPremium = session?.user?.subscription?.plan !== 'Free' && session?.user?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-cyan-600/18 rounded-full blur-[165px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/14 rounded-full blur-[125px]"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12">
        {/* Glassmorphic Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-full shadow-lg shadow-blue-500/30"
            >
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-900">
                <FiUser size={40} className="text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, {session.user?.name || 'Patient'}</h1>
              <p className="text-blue-200/70 font-medium">{session.user?.email}</p>
              <div className="mt-3">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    <FiStar className="text-amber-400" /> Premium Member
                  </span>
                ) : (
                  <Link href="/subscription" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-bold transition">
                    <FiStar /> Upgrade to Premium
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {ACTIONS.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border backdrop-blur-md transition whitespace-pre font-bold text-sm ${action.color}`}
              >
                {action.icon} <span className="hidden sm:inline">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900/40 border-white/5 text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            
            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="grid md:grid-cols-2 gap-6">
                {APPOINTMENTS.map((apt, idx) => (
                  <motion.div key={apt.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <FaStethoscope className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{apt.doctor}</h3>
                          <p className="text-blue-400 text-sm font-medium">{apt.specialty}</p>
                          <p className="text-gray-400 text-xs mt-1">{apt.hospital}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${apt.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 bg-black/20 rounded-2xl p-4 text-sm font-medium text-gray-300 mb-6 border border-white/5">
                      <div className="flex items-center gap-2"><FiCalendar className="text-blue-400"/> {apt.date}</div>
                      <div className="flex items-center gap-2"><FiClock className="text-purple-400"/> {apt.time}</div>
                    </div>
                    {apt.status === 'upcoming' && (
                      <div className="flex gap-3">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                          <FiVideo /> Join Teleconsult Call
                        </button>
                        <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition">
                          <FiMessageCircle size={20} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Add new appointment card */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="bg-slate-900/30 backdrop-blur-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[250px] transition text-gray-400 hover:text-blue-400 group">
                  <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center mb-4 transition">
                    <FiPlus size={28} />
                  </div>
                  <span className="font-bold text-lg">Book New Appointment</span>
                </motion.button>
              </div>
            )}

            {/* LIVE MAP TAB (Map integration requested) */}
            {activeTab === 'map' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900 to-transparent p-6 z-[1001] pointer-events-none">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiMapPin className="text-blue-400" /> Live Nearby Hospitals & Real-time Beds</h2>
                </div>
                {/* Use the already beautiful NearbyHospitalsMap component inside the glowing container */}
                <div style={{ filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.1))' }}>
                  <NearbyHospitalsMap />
                </div>
              </motion.div>
            )}

            {/* AI PREDICTIONS TAB */}
            {activeTab === 'predictions' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30"><FiTrendingUp size={24} /></div>
                    <div>
                      <h3 className="font-bold text-white text-lg">AI Hospital Footfall Prediction</h3>
                      <p className="text-xs text-gray-400">Optimize your visit times for today</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {predictions.length > 0 ? (
                      <ClientOnly>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <LineChart data={predictions.map((val, hr) => ({ hour: hr, count: val }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                            <XAxis dataKey="hour" stroke="#ffffff50" tickFormatter={(hr) => `${hr}:00`} tick={{ fill: '#ffffff50', fontSize: 12 }} />
                            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px', color: '#fff' }} />
                            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ClientOnly>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><p className="text-white">Connecting to AI Models...</p></div>
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><FiServer className="text-emerald-400" /> Live Resource Summary</h3>
                    <div className="space-y-3">
                      {Array.isArray(bedStats) && bedStats.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                          <span className="text-white font-medium">{(h?.id ? h.id.split('_')[0].slice(0, 15) : 'Hospital')}...</span>
                          <div className="flex gap-4">
                            <span className="text-sm"><span className="text-emerald-400 font-bold">{h?.beds?.available ?? 0}</span> Free Beds</span>
                            <span className="text-sm"><span className="text-blue-400 font-bold">{h?.beds?.icuAvailable ?? 0}</span> Free ICU</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* MEDICAL RECORDS TAB */}
            {activeTab === 'records' && (
              <PremiumGuard>
                <div className="grid md:grid-cols-3 gap-6">
                  {RECORDS.map((record, idx) => (
                    <motion.div key={record.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                      className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 hover:border-emerald-500/40 transition group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        {record.type === 'report' ? <FaNotesMedical size={20} /> : <FaPills size={20} />}
                      </div>
                      <h3 className="font-bold text-white mb-1">{record.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{record.hospital} • {record.date}</p>
                      <button className="text-emerald-400 text-sm font-bold uppercase tracking-wide group-hover:text-emerald-300 transition flex items-center gap-1">
                        View Document &rarr;
                      </button>
                    </motion.div>
                  ))}
                  <motion.button whileHover={{ scale: 1.02 }} className="bg-slate-900/30 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[200px] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition">
                    <FiPlus size={28} className="mb-3" />
                    <span className="font-bold">Upload New Record</span>
                  </motion.button>
                </div>
              </PremiumGuard>
            )}

            {/* HEALTH METRICS TAB */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {HEALTH_METRICS.map((metric, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className={`bg-slate-900/50 backdrop-blur-xl border ${metric.border} rounded-3xl p-6 relative overflow-hidden`}>
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${metric.bg} rounded-full blur-2xl`} />
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${metric.color}`}>{metric.val}</span>
                      <span className="text-white/50 font-medium text-sm">{metric.unit}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}