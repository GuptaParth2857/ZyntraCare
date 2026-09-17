'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiHeart, FiActivity, FiZap, FiAlertCircle, FiMoon, FiTarget, FiLoader, FiCheck } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

interface TrendPoint {
  date: string;
  heartRate: number | null;
  bp: number | null;
  oxygen: number | null;
  weight: number | null;
}

interface ReferenceRow {
  metric: string;
  value: number | null;
  unit: string;
  range: string;
  status: 'normal' | 'warning' | 'critical' | 'missing';
}

interface Insight {
  category: 'heart' | 'sleep' | 'activity' | 'nutrition' | 'stress' | 'risk';
  title: string;
  description: string;
  severity: 'positive' | 'warning' | 'critical' | 'info';
  recommendation: string;
}

export default function AdvancedAnalyticsPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [reference, setReference] = useState<ReferenceRow[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;

    const controller = new AbortController();
    setLoading(true);
    fetch('/api/personal-analytics', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics');
        return res.json();
      })
      .then((data) => {
        setHasData(data.hasData || false);
        setTrend(data.trend || []);
        setReference(data.reference || []);
        setInsights(data.insights || []);
      })
      .catch(() => setError('Analytics are unavailable right now.'))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isLoggedIn]);

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'heart': return <FiHeart />;
      case 'sleep': return <FiMoon />;
      case 'activity': return <FiActivity />;
      case 'stress': return <FiAlertCircle />;
      case 'risk': return <FiTarget />;
      default: return <FiTrendingUp />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  const statusPill = (s: ReferenceRow['status']) => {
    switch (s) {
      case 'normal': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Normal</span>;
      case 'warning': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">Watch</span>;
      case 'critical': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400">Critical</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 text-white/40">No data</span>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FiTrendingUp size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Health Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Trends, comparisons and insights derived from the health records you log in Health Tracker.
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-10 text-center">
            <FiHeart className="mx-auto text-cyan-400 mb-4" size={48} />
            <p className="text-gray-300 mb-2 font-bold">Sign in to view your personal analytics</p>
            <p className="text-gray-500 text-sm mb-6">Your trends and insights are built from your own logged health data.</p>
            <Link href="/auth/signin?callbackUrl=/personal-analytics" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold">
              Sign In
            </Link>
          </motion.div>
        ) : loading ? (
          <div className="py-24 text-center">
            <FiLoader className="animate-spin text-cyan-400 mx-auto mb-4" size={36} />
            <p className="text-gray-400">Crunching your health records...</p>
          </div>
        ) : !hasData ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-10 text-center">
            <FiZap className="mx-auto text-amber-400 mb-4" size={48} />
            <p className="text-gray-300 mb-2 font-bold">No health records yet</p>
            <p className="text-gray-500 text-sm mb-6">Log your blood pressure, heart rate, weight and oxygen in Health Tracker to unlock personal analytics.</p>
            <Link href="/health-tracker" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold">
              Open Health Tracker
            </Link>
          </motion.div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                <FiAlertCircle className="text-amber-400 flex-shrink-0" />
                <p className="text-amber-400/90 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiHeart className="text-cyan-400" /> Heart & BP Trends
                </h3>
                <p className="text-xs text-gray-500 mb-4 -mt-2">Weekly averages from your logged readings</p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#ef4444" fill="rgba(239,68,68,0.1)" unit=" bpm" />
                    <Area type="monotone" dataKey="bp" name="Systolic BP" stroke="#f59e0b" fill="rgba(245,158,11,0.1)" unit=" mmHg" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiActivity className="text-cyan-400" /> Body & Oxygen Trends
                </h3>
                <p className="text-xs text-gray-500 mb-4 -mt-2">Weekly averages from your logged readings</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="weight" name="Weight" stroke="#8b5cf6" strokeWidth={2} unit=" kg" />
                    <Line type="monotone" dataKey="oxygen" name="Blood Oxygen" stroke="#06b6d4" strokeWidth={2} unit=" %" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
            >
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <FiTarget className="text-cyan-400" /> Your Latest vs Reference Ranges
              </h3>
              <p className="text-xs text-gray-500 mb-6">Compared against standard clinical guidelines (ACC / AHA / CDC)</p>
              <div className="space-y-3">
                {reference.map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-white">{row.metric}</p>
                      <p className="text-[10px] text-gray-500">
                        {row.status === 'missing' ? 'No reading logged yet' : `Range: ${row.range} ${row.unit}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-lg">
                        {row.status === 'missing' ? '—' : `${row.value} ${row.unit}`}
                      </span>
                      {statusPill(row.status)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <p className="text-sm text-cyan-200">
                  <strong>Note:</strong> These are reference ranges, not diagnoses. Analytics are computed only from your logged records. Always consult a doctor for medical advice.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiZap className="text-amber-400" /> Insights from Your Data
              </h3>
              {insights.length === 0 ? (
                <p className="text-gray-400 text-sm">No insights yet. Keep logging your vitals.</p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.title} className={`p-5 rounded-2xl border ${getSeverityColor(insight.severity)}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getInsightIcon(insight.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-white text-sm">{insight.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              insight.severity === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                              insight.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                              insight.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {insight.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{insight.description}</p>
                          <p className="text-xs mt-2 text-gray-400">
                            <strong className="text-gray-300">Recommendation:</strong> {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-[2rem] p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCheck className="text-cyan-400" /> General Wellness Guidance
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-3xl mb-2">😴</div>
                  <h4 className="font-bold text-white text-sm mb-1">Improve Sleep</h4>
                  <p className="text-xs text-gray-400">Target 7-8 hours of sleep. Reduce screen time 1 hour before bed.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-3xl mb-2">🚶</div>
                  <h4 className="font-bold text-white text-sm mb-1">Maintain Activity</h4>
                  <p className="text-xs text-gray-400">Aim for 150 minutes of moderate activity weekly with 2 strength sessions.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-3xl mb-2">🧘</div>
                  <h4 className="font-bold text-white text-sm mb-1">Manage Stress</h4>
                  <p className="text-xs text-gray-400">Practice 10-minute daily meditation and stay hydrated.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}