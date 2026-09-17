'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { FiActivity, FiHeart, FiTrendingUp, FiLock, FiActivity as FiPulse, FiInfo } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';

interface Benchmark { metric: string; value: number; unit: string; matchPercent: number; status: string; ideal: string; }
interface TrendPoint { date: string; heartRate: number | null; oxygenLevel: number | null; bloodSugar: number | null; }

export default function HealthPulsePage() {
  const { data: session, status } = useSession();
  const [score, setScore] = useState(0);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetch(`/api/health-pulse${demoMode ? '?userId=demo-user' : ''}`)
      .then(async r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Session expired — please sign in again' : 'Failed to load health pulse');
        return r.json();
      })
      .then(data => {
        setScore(data.healthScore || 0);
        setBenchmarks(data.benchmarks || []);
        setTrend(data.trend || []);
        if (!data.hasData && !data.benchmarks?.length) setError('');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to compute health pulse');
        setLoading(false);
      });
  }, [isAuthenticated, demoMode]);

  const statusColor = (s: string) =>
    s === 'good' ? 'text-emerald-400' : s === 'warning' ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-fuchsia-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-violet-500/10 border border-violet-500/30 rounded-2xl mb-6">
            <FaHeartbeat size={32} className="text-violet-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Health</span>
            {' '}Pulse
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A wellness score comparing your latest vitals against healthy adult reference ranges, with longitudinal trends.
          </p>
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-violet-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Your health score is computed from your logged vitals. Sign in to see your pulse.</p>
            <Link href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm hover:from-violet-500 hover:to-fuchsia-500 transition">
              Sign In
            </Link>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/health-pulse?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' || loading ? (
          <div className="text-center py-16 text-gray-400">Computing your health pulse...</div>
        ) : error ? (
          <div className="max-w-lg mx-auto text-center py-16 bg-white/[0.03] border border-red-500/30 rounded-[2rem]">
            <p className="text-red-400 font-bold text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/20 transition">Retry</button>
          </div>
        ) : benchmarks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center py-16 bg-white/[0.02] border border-white/10 rounded-[2rem]">
            {demoMode && (
              <div className="mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold mx-6">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset — sign in to see your own.
              </div>
            )}
            <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiPulse className="text-violet-400" size={28} />
            </div>
            <p className="text-xl font-black mb-2">No readings yet</p>
            <p className="text-white/40 text-sm mb-8">Log your vitals in the Health Tracker and your Health Pulse score appears here.</p>
            <Link href="/health-tracker" className="inline-flex px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm hover:from-violet-500 hover:to-fuchsia-500 transition">
              Go to Health Tracker
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {demoMode && (
              <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to see your own health pulse.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><FiActivity className="text-violet-400" /> Health Score</h3>
                <ResponsiveContainer width={220} height={220}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={18} data={[{ name: 'score', value: score }]} startAngle={220} endAngle={-40}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.08)' }} dataKey="value" cornerRadius={20}
                      fill={score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'} angleAxisId={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className={`text-4xl font-black mt-2 ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p>
                <p className="text-gray-500 text-xs mt-1">vs. healthy reference range</p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FiHeart className="text-fuchsia-400" /> Metric Benchmarks</h3>
                <div className="space-y-3">
                  {benchmarks.map((b, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{b.metric.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`font-bold ${statusColor(b.status)}`}>{b.value} {b.unit}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${b.status === 'good' ? 'bg-emerald-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${b.matchPercent}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{b.matchPercent}% match</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Ideal: {b.ideal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FiTrendingUp className="text-violet-400" /> Vitals Trend</h3>
              {trend.length < 2 ? (
                <p className="text-gray-500 text-sm">Track at least two health metrics over time to view your trend.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#a78bfa" strokeWidth={2} />
                    <Line type="monotone" dataKey="bloodSugar" name="Blood Sugar" stroke="#34d399" strokeWidth={2} />
                    <Line type="monotone" dataKey="oxygenLevel" name="O2 %" stroke="#fbbf24" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}