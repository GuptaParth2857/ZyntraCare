'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FiHeart, FiDroplet, FiActivity, FiThermometer, FiTrendingUp,
  FiBarChart2, FiMoon, FiZap, FiPlus, FiTrash2, FiClock, FiTarget,
  FiRefreshCw, FiLogIn, FiLayout,
} from 'react-icons/fi';

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */
interface Goal {
  id: string;
  title: string;
  type: string;
  targetValue: number | null;
  currentValue: number;
  unit: string;
  status: string;
}

interface Wearable {
  id: string;
  heartRate?: number | null;
  bloodPressure?: string | null;
  bloodSugar?: number | null;
  oxygenLevel?: number | null;
  temperature?: number | null;
  steps?: number | null;
  calories?: number | null;
  sleepHours?: number | null;
  recordedAt: string;
}

interface Metric {
  id: string;
  bloodPressure: string;
  heartRate?: number | null;
  bloodSugar?: number | null;
  weight?: number | null;
  height?: number | null;
  temperature?: number | null;
  oxygenLevel?: number | null;
  notes: string;
  date: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                          */
/* -------------------------------------------------------------------------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

/* -------------------------------------------------------------------------- */
/*  Small animated helpers                                                   */
/* -------------------------------------------------------------------------- */
function Counter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{display.toLocaleString('en-IN')}</span>;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mini SVG trends                                                          */
/* -------------------------------------------------------------------------- */
function StepsAreaChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 320, H = 84, P = 8;
  const max = Math.max(1, ...data.map(d => d.value));
  const pts = data.map((d, i) => ({
    x: P + (i * (W - P * 2)) / Math.max(1, data.length - 1),
    y: H - P - (d.value / max) * (H - P * 2),
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0]?.x ?? 0},${H - P} L ${line} L ${pts[pts.length - 1]?.x ?? W},${H - P} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="stepsArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#stepsArea)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {pts.length > 1 && (
        <motion.polyline
          points={line}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      )}
    </svg>
  );
}

function HeartLineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 320, H = 84, P = 8;
  const max = Math.max(1, ...data.map(d => d.value));
  const pts = data.map((d, i) => ({
    x: P + (i * (W - P * 2)) / Math.max(1, data.length - 1),
    y: H - P - (d.value / max) * (H - P * 2),
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      <motion.polyline
        points={line}
        fill="none"
        stroke="#fb7185"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: 'easeInOut' }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill="#fb7185"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + i * 0.06 }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                */
/* -------------------------------------------------------------------------- */
export default function HealthTrackerPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [wearables, setWearables] = useState<Wearable[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showLogMetric, setShowLogMetric] = useState(false);

  const [newGoal, setNewGoal] = useState({ title: '', type: 'steps', targetValue: '', unit: 'steps' });
  const [newMetric, setNewMetric] = useState({ heartRate: '', bloodPressure: '', bloodSugar: '', weight: '', temperature: '', oxygenLevel: '', notes: '' });

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [g, w, m] = await Promise.all([
      fetch(`/api/health-goals?userId=${userId}`).then(r => r.json()).catch(() => ({ goals: [] })),
      fetch(`/api/wearables?userId=${userId}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`/api/health-metrics?userId=${userId}`).then(r => r.json()).catch(() => ({ metrics: [] })),
    ]);
    setGoals((g as any).goals ?? []);
    setWearables((w as any).data ?? []);
    setMetrics((m as any).metrics ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (status === 'authenticated' && userId) fetchAll();
    else if (status !== 'loading') setLoading(false);
  }, [status, userId, fetchAll]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const latest = wearables[0];

  const vitals = [
    { label: 'Heart Rate', value: latest?.heartRate, unit: 'bpm', icon: FiHeart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Blood Pressure', value: latest?.bloodPressure, unit: 'mmHg', icon: FiDroplet, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Blood Sugar', value: latest?.bloodSugar, unit: 'mg/dL', icon: FiZap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'SpO₂', value: latest?.oxygenLevel, unit: '%', icon: FiActivity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Temperature', value: latest?.temperature, unit: '°C', icon: FiThermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const stepFor = (type: string) =>
    type === 'steps' ? 500 : type === 'calories' ? 100 : type === 'meditation' ? 5 : type === 'weight' ? 0.5 : 1;

  const adjustGoal = async (goal: Goal, dir: 1 | -1) => {
    const next = Math.max(0, Math.round((goal.currentValue + dir * stepFor(goal.type)) * 10) / 10);
    setGoals(prev => prev.map(g => (g.id === goal.id ? { ...g, currentValue: next } : g)));
    try {
      await fetch('/api/health-goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goal.id, currentValue: next, userId }),
      });
    } catch { /* silent */ }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) return;
    const res = await fetch('/api/health-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: newGoal.title.trim(),
        type: newGoal.type,
        targetValue: parseFloat(newGoal.targetValue) || 0,
        unit: newGoal.unit,
        startDate: new Date().toISOString().split('T')[0],
      }),
    });
    if (res.ok) {
      setNewGoal({ title: '', type: 'steps', targetValue: '', unit: 'steps' });
      setShowAddGoal(false);
      refresh();
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await fetch(`/api/health-goals?id=${id}&userId=${userId}`, { method: 'DELETE' });
    } catch { /* silent */ }
  };

  const logMetric = async () => {
    const hasValue = Object.values(newMetric).some(v => v && v.trim() !== '');
    if (!hasValue) return;
    await fetch('/api/health-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heartRate: newMetric.heartRate ? parseFloat(newMetric.heartRate) : null,
        bloodPressure: newMetric.bloodPressure,
        bloodSugar: newMetric.bloodSugar ? parseFloat(newMetric.bloodSugar) : null,
        weight: newMetric.weight ? parseFloat(newMetric.weight) : null,
        temperature: newMetric.temperature ? parseFloat(newMetric.temperature) : null,
        oxygenLevel: newMetric.oxygenLevel ? parseFloat(newMetric.oxygenLevel) : null,
        notes: newMetric.notes,
      }),
    });
    setNewMetric({ heartRate: '', bloodPressure: '', bloodSugar: '', weight: '', temperature: '', oxygenLevel: '', notes: '' });
    setShowLogMetric(false);
    refresh();
  };

  const trendSeries = (mapper: (w: Wearable) => number | null | undefined) =>
    wearables.slice(0, 7).reverse().map((w) => {
      const v = mapper(w);
      return { label: new Date(w.recordedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value: v ?? 0 };
    });

  /* ---- Auth gate / loading ---- */
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full text-center border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-5">
            <FiLayout size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Health Tracker</h1>
          <p className="text-gray-400 text-sm mb-6">
            Track your vitals, daily goals and health logs. Sign in to see your real health data.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-violet-600/30"
          >
            <FiLogIn size={16} /> Sign in to continue
          </Link>
        </motion.div>
      </div>
    );
  }

  const initial = 'hidden';
  const animate = 'show';

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-4 py-10 text-white">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 mb-8 shadow-2xl shadow-black/40 relative"
        >
          <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                <FiActivity className="text-white" size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black">Health Tracker</h1>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/80 bg-black/20 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-0.5">Your real vitals, goals & health logs</p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            {[
              { label: 'Steps Today', value: latest?.steps ?? 0, unit: 'steps', icon: <FiTrendingUp size={16} /> },
              { label: 'Calories', value: latest?.calories ?? 0, unit: 'kcal', icon: <FiBarChart2 size={16} /> },
              { label: 'Sleep', value: latest?.sleepHours ?? 0, unit: 'hrs', icon: <FiMoon size={16} /> },
              { label: 'Heart Rate', value: latest?.heartRate ?? 0, unit: 'bpm', icon: <FiHeart size={16} /> },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">
                  {s.icon} {s.label}
                </div>
                <div className="flex items-end gap-1">
                  <Counter value={s.value} className="text-2xl font-black" />
                  <span className="text-[11px] text-white/60 mb-1">{s.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div variants={container} initial={initial} animate={animate} className="space-y-8">
            {/* Live vitals */}
            <section>
              <motion.div variants={item} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiActivity className="text-rose-400" /> Live Vitals
                  <span className="text-xs font-medium text-gray-500">latest wearable sync</span>
                </h2>
              </motion.div>
              <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {vitals.map(v => (
                  <div key={v.label} className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-4 hover:border-white/25 transition group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-semibold uppercase tracking-wide text-gray-400`}>{v.label}</span>
                      <div className={`p-2 rounded-lg ${v.bg}`}><v.icon size={14} className={v.color} /></div>
                    </div>
                    <p className="text-xl font-black">
                      {typeof v.value === 'number' ? (
                        <>
                          <Counter value={v.value} />
                          {v.unit && v.unit !== 'mmHg' && <span className="text-xs text-gray-400 font-medium ml-1">{v.unit}</span>}
                        </>
                      ) : v.value ? (
                        <>{v.value} <span className="text-xs text-gray-400 font-medium ml-1">{v.unit}</span></>
                      ) : (
                        <span className="text-gray-600 text-base font-medium">—</span>
                      )}
                    </p>
                  </div>
                ))}
              </motion.div>
              {wearables.length === 0 && (
                <motion.p variants={item} className="text-sm text-gray-500 mt-3 border border-dashed border-white/15 rounded-xl p-4 text-center">
                  No wearable sync yet — add a reading below to get started.
                </motion.p>
              )}
            </section>

            {/* Daily goals */}
            <section>
              <motion.div variants={item} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiTarget className="text-emerald-400" /> Daily Goals
                </h2>
                <button
                  onClick={() => setShowAddGoal(v => !v)}
                  className="flex items-center gap-1 text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-500/25 transition"
                >
                  <FiPlus size={14} /> Add Goal
                </button>
              </motion.div>

              <AnimatePresence>
                {showAddGoal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <input
                        value={newGoal.title}
                        onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                        placeholder="Goal name (e.g. Steps)"
                        className="col-span-2 md:col-span-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <select
                        value={newGoal.type}
                        onChange={e => setNewGoal(p => ({ ...p, type: e.target.value, unit: e.target.value === 'water' ? 'L' : e.target.value === 'sleep' ? 'hrs' : e.target.value }))}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="steps" className="text-slate-900">Steps</option>
                        <option value="calories" className="text-slate-900">Calories</option>
                        <option value="sleep" className="text-slate-900">Sleep</option>
                        <option value="water" className="text-slate-900">Water</option>
                        <option value="meditation" className="text-slate-900">Meditation</option>
                        <option value="weight" className="text-slate-900">Weight</option>
                      </select>
                      <input
                        type="number"
                        value={newGoal.targetValue}
                        onChange={e => setNewGoal(p => ({ ...p, targetValue: e.target.value }))}
                        placeholder="Target"
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <input
                        value={newGoal.unit}
                        onChange={e => setNewGoal(p => ({ ...p, unit: e.target.value }))}
                        placeholder="Unit"
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={createGoal}
                        className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-emerald-400 transition"
                      >
                        Create
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {goals.length === 0 ? (
                <motion.div variants={item} className="border border-dashed border-white/15 rounded-2xl p-8 text-center text-gray-500">
                  No goals yet — set your first daily goal above.
                </motion.div>
              ) : (
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goals.filter(g => g.status !== 'cancelled').map((goal, i) => {
                    const pct = goal.targetValue ? (goal.currentValue / goal.targetValue) * 100 : 0;
                    const done = pct >= 100;
                    const colors = [
                      'bg-gradient-to-r from-emerald-400 to-teal-400',
                      'bg-gradient-to-r from-sky-400 to-cyan-400',
                      'bg-gradient-to-r from-amber-400 to-orange-400',
                      'bg-gradient-to-r from-violet-400 to-fuchsia-400',
                      'bg-gradient-to-r from-rose-400 to-red-400',
                    ];
                    const barColor = colors[i % colors.length];
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-5 hover:border-white/25 transition group ${done ? 'border-emerald-500/40' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">{goal.title}</span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="text-gray-600 hover:text-red-400 transition"
                            aria-label={`Delete ${goal.title}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                        <Bar pct={pct} color={barColor} />
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-gray-400">
                            <span className="font-black text-white">{goal.currentValue}</span> / {goal.targetValue} {goal.unit}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adjustGoal(goal, -1)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 transition"
                            >
                              −
                            </button>
                            <button
                              onClick={() => adjustGoal(goal, 1)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex items-center justify-center text-emerald-400 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {done && <p className="text-[11px] text-emerald-400 mt-2 font-semibold">✅ Goal achieved!</p>}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>

            {/* Trends */}
            <section>
              <motion.div variants={item} className="flex items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiTrendingUp className="text-cyan-400" /> 7-Day Trends
                </h2>
              </motion.div>
              {wearables.length >= 2 ? (
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-5">
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><FiTrendingUp className="text-cyan-400" /> Steps</p>
                    <StepsAreaChart data={trendSeries(w => w.steps)} />
                    <p className="text-xs text-gray-600 mt-2 flex justify-between">
                      <span>{trendSeries(w => w.steps)[0]?.label}</span>
                      <span>{trendSeries(w => w.steps).slice(-1)[0]?.label}</span>
                    </p>
                  </div>
                  <div className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-5">
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><FiHeart className="text-rose-400" /> Heart Rate</p>
                    <HeartLineChart data={trendSeries(w => w.heartRate)} />
                    <p className="text-xs text-gray-600 mt-2 flex justify-between">
                      <span>{trendSeries(w => w.heartRate)[0]?.label}</span>
                      <span>{trendSeries(w => w.heartRate).slice(-1)[0]?.label}</span>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={item} className="border border-dashed border-white/15 rounded-2xl p-6 text-center text-gray-500 text-sm">
                  Trends appear after at least 2 wearable syncs.
                </motion.div>
              )}
            </section>

            {/* Health log */}
            <section>
              <motion.div variants={item} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiClock className="text-amber-400" /> Health Log
                </h2>
                <button
                  onClick={() => setShowLogMetric(v => !v)}
                  className="flex items-center gap-1 text-sm bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-500/25 transition"
                >
                  <FiPlus size={14} /> Log Reading
                </button>
              </motion.div>

              <AnimatePresence>
                {showLogMetric && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-2xl p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <input type="number" placeholder="Heart Rate (bpm)" value={newMetric.heartRate} onChange={e => setNewMetric(p => ({ ...p, heartRate: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="text" placeholder="Blood Pressure (120/80)" value={newMetric.bloodPressure} onChange={e => setNewMetric(p => ({ ...p, bloodPressure: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="number" placeholder="Blood Sugar (mg/dL)" value={newMetric.bloodSugar} onChange={e => setNewMetric(p => ({ ...p, bloodSugar: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="number" placeholder="Weight (kg)" value={newMetric.weight} onChange={e => setNewMetric(p => ({ ...p, weight: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="number" placeholder="Temperature (°C)" value={newMetric.temperature} onChange={e => setNewMetric(p => ({ ...p, temperature: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="number" placeholder="SpO₂ (%)" value={newMetric.oxygenLevel} onChange={e => setNewMetric(p => ({ ...p, oxygenLevel: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                        <input type="text" placeholder="Note (optional)" value={newMetric.notes} onChange={e => setNewMetric(p => ({ ...p, notes: e.target.value }))} className="col-span-2 md:col-span-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50" />
                      </div>
                      <button onClick={logMetric} className="mt-3 px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition">
                        Save Reading
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {metrics.length === 0 ? (
                <motion.div variants={item} className="border border-dashed border-white/15 rounded-2xl p-8 text-center text-gray-500">
                  No health entries yet — log your first reading above.
                </motion.div>
              ) : (
                <motion.div variants={item} className="space-y-2">
                  {metrics.slice(-6).reverse().map(m => {
                    const parts = [
                      m.heartRate ? `HR ${m.heartRate} bpm` : null,
                      m.bloodPressure ? `BP ${m.bloodPressure}` : null,
                      m.bloodSugar != null ? `Sugar ${m.bloodSugar}` : null,
                      m.weight != null ? `Weight ${m.weight} kg` : null,
                      m.temperature != null ? `Temp ${m.temperature}°C` : null,
                      m.oxygenLevel != null ? `SpO₂ ${m.oxygenLevel}%` : null,
                    ].filter(Boolean);
                    return (
                      <div key={m.id} className="border border-white/10 bg-slate-900/60 backdrop-blur rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 hover:border-white/25 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                            <FiClock className="text-amber-400" size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{parts.length ? parts.join(' · ') : 'Health entry'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {m.notes && <p className="text-sm text-gray-400 italic">“{m.notes}”</p>}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
}