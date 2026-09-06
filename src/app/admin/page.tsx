'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import {
  FiUsers, FiActivity, FiServer,
  FiAlertTriangle, FiCheckCircle, FiRefreshCw,
  FiMapPin, FiUser, FiList, FiDatabase, FiHome, FiStar
} from 'react-icons/fi';
import ClientOnly from '@/components/ClientOnly';
import dynamic from 'next/dynamic';

const LazyLoadAreaChart = dynamic(
  () => import('recharts').then(mod => {
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = mod;
    return function LoadAreaChart({ data }: { data: { label: string; users: number; appointments: number }[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="label" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} />
            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f650', borderRadius: '12px', color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#fff' }} />
            <Area type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAppointments)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div> }
);

const LazyBedBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = mod;
    return function BedBarChart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 11 }} />
            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: '#ffffff10' }}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #10b98150', borderRadius: '12px', color: '#fff' }}
            />
            <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} name="Free Beds" />
            <Bar dataKey="occupied"  fill="#ef4444" radius={[4, 4, 0, 0]} name="Occupied"  />
          </BarChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div> }
);

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
interface ActiveUser {
  name: string;
  email: string;
  device: string;
  ipAddress: string;
  lastSeen: string;
}

interface BedStat {
  id: string;
  name: string;
  beds: { available: number; occupied: number; icu: { available: number } };
}

interface TrendPoint {
  label: string;
  users: number;
  appointments: number;
}

interface Overview {
  counts: {
    users: number;
    hospitals: number;
    doctors: number;
    labs: number;
    pharmacies: number;
    appointments: number;
    emergencyAlerts: number;
    healthRecords: number;
    subscriptions: number;
    feedback: number;
    rewards: number;
    transactions: number;
    drones: number;
    onlineNow: number;
  };
  today: {
    users: number;
    appointments: number;
    emergencyAlerts: number;
    healthRecords: number;
    feedback: number;
    transactions: number;
    rewards: number;
    drones: number;
  };
  trend: TrendPoint[];
  recent: { type: string; message: string; time: string }[];
  rates: {
    appointmentConfirmation: number;
    doctorAvailability: number;
    verifiedHospitals: number;
    alertResolution: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [bedData, setBedData]         = useState<{ name: string; available: number; occupied: number; icu: number }[]>([]);
  const [overview, setOverview]       = useState<Overview | null>(null);
  const [trend, setTrend]             = useState<TrendPoint[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /* ---------------------------------------------------------------- */
  /*  Fetch active users from API                                      */
  /* ---------------------------------------------------------------- */
  const fetchActiveUsers = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/active-users');
      const data = await res.json();
      setActiveUsers(data.users ?? []);
      setActiveCount(data.count ?? 0);
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fetch bed data once                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    fetch('/api/beds')
      .then(r => r.json())
      .then((data: { hospitals: BedStat[] }) => {
        const formatted = (data.hospitals || []).map(h => ({
          name:      h.name,
          available: h.beds.available,
          occupied:  h.beds.occupied,
          icu:       h.beds.icu.available,
        }));
        setBedData(formatted.slice(0, 8));
      })
      .catch(console.error);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fetch real overview stats from database                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    fetch('/api/admin/overview')
      .then(r => r.json())
      .then((data: Overview) => {
        setOverview(data);
        setTrend(data.trend || []);
        setActiveCount(data.counts.onlineNow ?? 0);
      })
      .catch(() => {});
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Poll active users every 30s + initial fetch                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    fetchActiveUsers();
    const timer = setInterval(fetchActiveUsers, 30_000);
    return () => clearInterval(timer);
  }, [fetchActiveUsers]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <RoleGuard
      allow={['admin']}
      title="Admin access required"
      description="Please sign in with an admin account to view the command center."
    >
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white" aria-label="Admin Dashboard">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-violet-600/18 rounded-full blur-[170px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-fuchsia-600/14 rounded-full blur-[125px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 text-white">

        {/* ---- Header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              ZyntraCare Command Center
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              Real-time infrastructure &amp; live patient tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchActiveUsers}
              aria-label="Refresh active user data"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
            <a
              href="/admin/users"
              className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30"
            >
              <FiList size={14} />
              Users
            </a>
            <a
              href="/admin/data"
              className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
            >
              <FiDatabase size={14} />
              Data Manager
            </a>
            <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
              SYSTEM OPERATIONAL
            </span>
          </div>
        </motion.div>

        {/* ---- KPI Cards ---- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Users Online',
              value: activeCount.toLocaleString(),
              icon: FiUsers,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              live: true,
            },
            {
              label: 'Registered Users',
              value: (overview?.counts.users ?? 0).toLocaleString(),
              icon: FiUser,
              color: 'text-sky-400',
              bg: 'bg-sky-500/10',
              live: false,
            },
            {
              label: 'Hospitals',
              value: (overview?.counts.hospitals ?? 0).toLocaleString(),
              icon: FiHome,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              live: false,
            },
            {
              label: 'Emergency Alerts',
              value: (overview?.counts.emergencyAlerts ?? 0).toLocaleString(),
              icon: FiAlertTriangle,
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              live: false,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                    {stat.label}
                    {stat.live && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-label="Live data" />
                    )}
                  </p>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} aria-hidden="true" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ---- Charts Row ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Server Load Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FiActivity className="text-blue-400" aria-hidden="true" />
              New Users &amp; Appointments (Last 7 Days)
            </h2>
            <div className="h-64">
              <ClientOnly>
                <LazyLoadAreaChart data={trend} />
              </ClientOnly>
            </div>
          </motion.div>

          {/* Bed Occupancy Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FiServer className="text-emerald-400" aria-hidden="true" />
              Regional Bed Occupancy
            </h2>
            <div className="h-64">
              <ClientOnly>
                <LazyBedBarChart data={bedData} />
              </ClientOnly>
            </div>
          </motion.div>
        </div>

        {/* ---- Live Active Users Table ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiUsers className="text-blue-400" aria-hidden="true" />
              Live Active Users
              <span className="ml-2 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                {activeCount} online
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString('en-IN')}
            </p>
          </div>

          {activeUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiUsers size={32} className="mx-auto mb-3 opacity-30" />
              <p>No active sessions tracked yet.</p>
              <p className="text-xs mt-1">Users appear here after visiting any page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Active users list">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 text-gray-400 font-semibold uppercase text-xs tracking-wider">User</th>
                    <th className="pb-3 text-gray-400 font-semibold uppercase text-xs tracking-wider">Email</th>
                    <th className="pb-3 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                      <FiMapPin className="inline mr-1" size={11} />Device / IP
                    </th>
                    <th className="pb-3 text-gray-400 font-semibold uppercase text-xs tracking-wider">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {activeUsers.map((u, idx) => (
                      <motion.tr
                        key={u.email + idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <FiUser size={14} aria-hidden="true" />
                            </div>
                            <span className="font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{u.email || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-lg text-xs font-mono">
                            {u.device || 'web'} · {u.ipAddress || '—'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">
                          {new Date(u.lastSeen).toLocaleTimeString('en-IN')}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ---- System Event Log ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <FiActivity className="text-indigo-400" aria-hidden="true" />
            Recent Activity (Live from Database)
          </h2>
          <div className="space-y-4">
            {(overview?.recent?.length ? overview.recent : []).map((log, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                <div className={`p-2 rounded-lg ${log.type === 'user' ? 'text-blue-400' : log.type === 'appointment' ? 'text-emerald-400' : 'text-amber-400'} bg-black/20 flex-shrink-0`}>
                  {log.type === 'user' ? <FiUser size={20} aria-hidden="true" /> : log.type === 'appointment' ? <FiCheckCircle size={20} aria-hidden="true" /> : <FiStar size={20} aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-relaxed">{log.message}</p>
                  <p className="text-gray-400 text-xs font-semibold mt-1">{new Date(log.time).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            {!overview?.recent?.length && (
              <p className="text-gray-500 text-sm py-8 text-center">No recent activity yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
    </RoleGuard>
  );
}