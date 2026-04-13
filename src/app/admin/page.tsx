'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import {
  FiUsers, FiActivity, FiServer, FiShield,
  FiAlertTriangle, FiCheckCircle, FiRefreshCw,
  FiMapPin, FiUser
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import ClientOnly from '@/components/ClientOnly';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
interface ActiveUser {
  name: string;
  email: string;
  page: string;
  lastSeen: string;
}

interface BedStat {
  id: string;
  beds: { available: number; occupied: number; icuAvailable: number };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [bedData, setBedData]         = useState<{ name: string; available: number; occupied: number; icu: number }[]>([]);
  const [serverLoad, setServerLoad]   = useState<{ time: string; load: number }[]>([]);
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
      .then((data: BedStat[]) => {
        const formatted = data.map(h => ({
          name:      h.id.split('_')[0].slice(0, 10),
          available: h.beds.available,
          occupied:  h.beds.occupied,
          icu:       h.beds.icuAvailable,
        }));
        setBedData(formatted.slice(0, 8));
      })
      .catch(console.error);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Simulated real-time server-load chart                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const initial = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      load: 35 + Math.random() * 40,
    }));
    setServerLoad(initial);

    const interval = setInterval(() => {
      setServerLoad(prev => {
        const updated = [...prev, {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          load: 35 + Math.random() * 40,
        }];
        if (updated.length > 20) updated.shift();
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
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
      allow={['admin', 'owner']}
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
              label: 'Active Users Online',
              value: activeCount.toLocaleString(),
              icon: FiUsers,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              live: true,
            },
            {
              label: 'Avg Server Load',
              value: `${Math.round(serverLoad[serverLoad.length - 1]?.load ?? 42)}%`,
              icon: FiServer,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              live: true,
            },
            {
              label: 'API Health',
              value: '99.99%',
              icon: FiActivity,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              live: false,
            },
            {
              label: 'Security Incidents',
              value: '0',
              icon: FiShield,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
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
              Live Request Load (req/s)
            </h2>
            <div className="h-64">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={serverLoad}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <XAxis dataKey="time" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} />
                    <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f650', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                  </AreaChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={bedData}>
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
                      <FiMapPin className="inline mr-1" size={11} />Current Page
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
                            {u.page}
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
            <FiShield className="text-indigo-400" aria-hidden="true" />
            Live AI Insights &amp; System Events
          </h2>
          <div className="space-y-4">
            {[
              {
                time: 'Just now',
                msg: 'AI detected abnormal spike in respiratory queries from Delhi region. Predictive model alerted local tier-1 hospitals.',
                icon: FiAlertTriangle,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
              {
                time: '2 mins ago',
                msg: 'System scale-up triggered automatically due to +15% traffic deviation. Spun up 3 additional Edge functions.',
                icon: FiCheckCircle,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                time: '5 mins ago',
                msg: 'Overpass API fetched 145 new hospital capacity updates successfully. Database synchronised.',
                icon: FiCheckCircle,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
            ].map((log, idx) => (
              <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${log.bg} backdrop-blur-md`}>
                <div className={`p-2 rounded-lg ${log.color} bg-black/20 flex-shrink-0`}>
                  <log.icon size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-relaxed">{log.msg}</p>
                  <p className="text-gray-400 text-xs font-semibold mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </RoleGuard>
  );
}