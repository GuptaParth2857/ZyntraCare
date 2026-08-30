'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiActivity, FiTrendingUp, FiBarChart2, FiArrowRight, FiUsers, FiHeart,
  FiDatabase, FiAlertTriangle, FiFileText, FiClock, FiCheckCircle,
} from 'react-icons/fi';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    partnerHospitals: number;
    totalAppointments: number;
    healthRecords: number;
    emergencies: number;
    feedback: number;
    patients: number;
    activeLast7Days: number;
  };
  weeklySignups: number[];
  source: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/analytics')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const overviewCards = data
    ? [
        { label: 'Total Users', value: data.overview.totalUsers.toLocaleString(), icon: FiUsers, color: 'from-cyan-500 to-blue-500' },
        { label: 'Partner Hospitals', value: data.overview.partnerHospitals.toLocaleString(), icon: FiHeart, color: 'from-rose-500 to-red-500' },
        { label: 'Health Records', value: data.overview.healthRecords.toLocaleString(), icon: FiDatabase, color: 'from-amber-500 to-orange-500' },
        { label: 'Appointments & Care', value: data.overview.totalAppointments.toLocaleString(), icon: FiFileText, color: 'from-emerald-500 to-teal-500' },
        { label: 'Emergencies Handled', value: data.overview.emergencies.toLocaleString(), icon: FiAlertTriangle, color: 'from-purple-500 to-pink-500' },
        { label: 'New Users (7d)', value: data.overview.activeLast7Days.toLocaleString(), icon: FiTrendingUp, color: 'from-teal-500 to-emerald-500' },
      ]
    : [];

  const maxWeekly = data && data.weeklySignups.length
    ? Math.max(...data.weeklySignups, 1)
    : 1;
  const days = data && data.weeklySignups.length ? data.weeklySignups : [];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <FiBarChart2 size={14} /> Live Data Analytics
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Health{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Real-time platform metrics fetched from the live database.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/predictive-analytics', icon: '🔮', label: 'AI Predictions', desc: 'ML-based health forecasting', color: 'from-cyan-500 to-blue-500' },
            { href: '/beds', icon: '🛏️', label: 'Bed Tracker', desc: 'ICU & bed availability', color: 'from-amber-500 to-orange-500' },
            { href: '/health-tracker', icon: '📈', label: 'Health Tracker', desc: 'Monitor your vitals', color: 'from-emerald-500 to-teal-500' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group p-5 bg-white/[0.03] border border-white/10 rounded-xl hover:border-cyan-500/40 transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-3`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
                {item.label} <FiArrowRight className="opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Live Overview */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiActivity className="text-cyan-400" size={20} /> Platform Overview
            {data?.source === 'live' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            )}
          </h2>

          {loading ? (
            <div className="py-12 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Loading live analytics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {overviewCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center"
                >
                  <card.icon className={`text-xl mx-auto mb-2 text-transparent bg-clip-text bg-gradient-to-r ${card.color}`} />
                  <p className="text-lg font-black">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.label}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly signups chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-teal-400" size={20} /> New Signups (Last 7 Days)
          </h2>
          {days.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {days.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{val}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-teal-400"
                    style={{ height: `${(val / maxWeekly) * 100}%` }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] || ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">No signup data available.</p>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-400" size={20} /> System Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'Live', label: 'Data Source', color: 'from-emerald-500 to-teal-500' },
              { value: data ? `${data.overview.patients} regions` : '—', label: 'Cities Tracked', color: 'from-cyan-500 to-blue-500' },
              { value: data ? `${data.overview.feedback.toLocaleString()}` : '—', label: 'Feedback Received', color: 'from-amber-500 to-orange-500' },
              { value: 'Secure', label: 'Encrypted', color: 'from-purple-500 to-pink-500' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center">
                <p className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          {data?.updatedAt && (
            <p className="text-[10px] text-slate-600 mt-4 text-center">
              Last updated: {new Date(data.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
