'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import {
  FiActivity, FiClock, FiTrendingUp, FiZap, FiHeart, FiMoon,
  FiAward, FiCheckCircle, FiChevronLeft, FiCheck, FiRefreshCw,
} from 'react-icons/fi';

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */
interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  duration: string;
  icon: string;
  streak: number;
  completed: boolean;
  completedAt: string | null;
}

interface RewardEntry {
  id: string;
  points: number;
  source: string;
  description: string;
  createdAt: string;
}

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
  oxygenLevel?: number | null;
  steps?: number | null;
  calories?: number | null;
  sleepHours?: number | null;
  recordedAt: string;
}

interface Insight {
  text: string;
  tone: 'good' | 'warn' | 'info';
  icon: 'zap' | 'moon' | 'heart' | 'droplet' | 'trend';
}

const CATEGORY: Record<string, { label: string; chip: string; bar: string; dot: string }> = {
  exercise: { label: 'Exercise', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', bar: 'bg-emerald-400', dot: '#34d399' },
  mental: { label: 'Mental', chip: 'bg-violet-500/15 text-violet-300 border-violet-500/30', bar: 'bg-violet-400', dot: '#a78bfa' },
  nutrition: { label: 'Nutrition', chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30', bar: 'bg-amber-400', dot: '#fbbf24' },
  sleep: { label: 'Sleep', chip: 'bg-sky-500/15 text-sky-300 border-sky-500/30', bar: 'bg-sky-400', dot: '#38bdf8' },
  social: { label: 'Social', chip: 'bg-rose-500/15 text-rose-300 border-rose-500/30', bar: 'bg-rose-400', dot: '#fb7185' },
};

const TONE = {
  good: { chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25', bar: 'bg-emerald-400' },
  warn: { chip: 'bg-amber-500/10 text-amber-300 border-amber-500/25', bar: 'bg-amber-400' },
  info: { chip: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25', bar: 'bg-cyan-400' },
};

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                          */
/* -------------------------------------------------------------------------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

/* -------------------------------------------------------------------------- */
/*  Animated helpers                                                         */
/* -------------------------------------------------------------------------- */
function Counter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 800;
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

function Ring({ pct, sub }: { pct: number; sub: string }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#fbbf24"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-amber-300 font-display">{Math.round(pct)}%</span>
        <span className="text-xs text-slate-400 mt-0.5">{sub}</span>
      </div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Derived logic (all computed from real data)                               */
/* -------------------------------------------------------------------------- */
function levelFor(points: number) {
  if (points >= 10000) return { name: 'Platinum', color: 'text-slate-200' };
  if (points >= 5000) return { name: 'Gold', color: 'text-yellow-300' };
  if (points >= 2500) return { name: 'Silver', color: 'text-slate-300' };
  if (points >= 1000) return { name: 'Bronze', color: 'text-orange-300' };
  return { name: 'Starter', color: 'text-slate-300' };
}

function goalPct(g: Goal) {
  const t = g.targetValue ?? 0;
  if (t <= 0) return 0;
  if (g.type === 'weight') return g.currentValue <= t ? 100 : 0;
  return Math.min(100, (g.currentValue / t) * 100);
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                */
/* -------------------------------------------------------------------------- */
export default function WellnessPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const authenticated = status === 'authenticated' && !!userId;

  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [points, setPoints] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [w, setW] = useState<Wearable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [lastEarned, setLastEarned] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    if (!authenticated || !userId) {
      setMissions([]);
      setRewards([]);
      setPoints(0);
      setGoals([]);
      setW(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [m, r, g, wear] = await Promise.all([
        fetch(`/api/wellness-missions?userId=${userId}`).then(r => r.json()).catch(() => ({ missions: [] })),
        fetch(`/api/rewards?userId=${userId}`).then(r => r.json()).catch(() => ({ rewards: [], totalPoints: 0 })),
        fetch(`/api/health-goals?userId=${userId}`).then(r => r.json()).catch(() => ({ goals: [] })),
        fetch(`/api/wearables?userId=${userId}`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setMissions(m.missions ?? []);
      setRewards(r.rewards ?? []);
      setPoints(r.totalPoints ?? 0);
      setGoals(g.goals ?? []);
      const wdata = wear.data ?? [];
      setW(wdata.length > 0 ? wdata[0] : null);
      setError('');
    } catch {
      setError('Failed to load your wellness data.');
    }
    setLoading(false);
  }, [userId, authenticated]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ----- loading / sign-in gates ----- */
  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading your wellness…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-10"
        >
          <motion.div
            className="mx-auto w-16 h-16 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-2xl flex items-center justify-center"
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          >
            <FiActivity className="text-3xl" />
          </motion.div>
          <h1 className="text-2xl font-black text-white mt-5">Wellness & Diet</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Missions, points, goals and insights are personal — sign in to see your own real data. No demo or sample data is shown to visitors.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
          >
            Sign in to continue
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ----- real daily stats ----- */
  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const level = levelFor(points);

  /* ----- real, data-driven insights ----- */
  const insights: Insight[] = [];
  if (w) {
    const goalsByType = Object.fromEntries(goals.map(g => [g.type, g]));
    const sleepGoal = goalsByType['sleep'];
    const stepsGoal = goalsByType['steps'];
    const waterGoal = goalsByType['water'];

    if (w.sleepHours != null) {
      if ((sleepGoal && goalPct(sleepGoal) >= 100) || w.sleepHours >= 8) {
        insights.push({ text: `Great sleep — ${w.sleepHours}h logged. Recovery is on track.`, tone: 'good', icon: 'moon' });
      } else {
        insights.push({ text: `You logged ${w.sleepHours}h of sleep. Aim for 8h to improve recovery.`, tone: 'warn', icon: 'moon' });
      }
    }
    if (w.steps != null) {
      if (w.steps >= 10000) {
        insights.push({ text: `${w.steps.toLocaleString('en-IN')} steps today — daily step goal crushed!`, tone: 'good', icon: 'trend' });
      } else {
        insights.push({ text: `${(10000 - w.steps).toLocaleString('en-IN')} more steps to hit your 10K target.`, tone: 'info', icon: 'trend' });
      }
    }
    if (w.heartRate != null) {
      if (w.heartRate >= 60 && w.heartRate <= 100) {
        insights.push({ text: `Resting heart rate ${w.heartRate} bpm — normal and healthy range.`, tone: 'good', icon: 'heart' });
      } else {
        insights.push({ text: `Resting heart rate ${w.heartRate} bpm — keep an eye on it and stay hydrated.`, tone: 'warn', icon: 'heart' });
      }
    }
    if (waterGoal && goalPct(waterGoal) < 100) {
      const left = Math.max(0, (waterGoal.targetValue ?? 0) - waterGoal.currentValue);
      insights.push({ text: `Hydration goal at ${Math.round(goalPct(waterGoal))}% — ${left.toFixed(1)}L to go today.`, tone: 'info', icon: 'droplet' });
    }
  } else if (goals.length > 0) {
    const first = goals[0];
    insights.push({ text: `Connect a wearable or log metrics to unlock live wellness insights. Meanwhile, "${first.title}" is your active goal.`, tone: 'info', icon: 'zap' });
  }

  /* ----- real, derived achievements ----- */
  const achievements = [
    { icon: '👟', name: 'Stepper', desc: '10,000 steps today', earned: (w?.steps ?? 0) >= 10000 },
    { icon: '😴', name: 'Sleep Well', desc: '8h sleep logged', earned: (w?.sleepHours ?? 0) >= 8 },
    { icon: '💧', name: 'Hydration Hero', desc: 'Water goal 100%', earned: goals.some(g => g.type === 'water' && goalPct(g) >= 100) },
    { icon: '🧘', name: 'Zen Master', desc: 'Mental mission done', earned: missions.some(m => m.category === 'mental' && m.completed) },
    { icon: '🥗', name: 'Clean Eater', desc: 'Nutrition mission done', earned: missions.some(m => m.category === 'nutrition' && m.completed) },
    { icon: '❤️', name: 'Steady Heart', desc: 'Resting HR 60–100', earned: (w?.heartRate ?? 0) >= 60 && (w?.heartRate ?? 0) <= 100 },
    { icon: '🎯', name: 'Goal Getter', desc: 'Any goal complete', earned: goals.some(g => goalPct(g) >= 100) },
    { icon: '🌙', name: 'All Rounder', desc: 'All missions done', earned: allDone },
  ];
  const earnedCount = achievements.filter(a => a.earned).length;

  const completeMission = async (m: Mission) => {
    if (completingId === m.id) return;
    setCompletingId(m.id);
    try {
      const res = await fetch('/api/wellness-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: m.id, userId, completed: true }),
      });
      if (res.ok) {
        setMissions(prev => prev.map(x => (x.id === m.id ? { ...x, completed: true, completedAt: new Date().toISOString(), streak: (x.streak || 0) + 1 } : x)));
        setLastEarned(m.points);
        const rr = await fetch(`/api/rewards?userId=${userId}`).then(r => r.json()).catch(() => ({}));
        if (rr?.rewards) setRewards(rr.rewards);
        if (rr?.totalPoints !== undefined) setPoints(rr.totalPoints);
        setTimeout(() => setLastEarned(null), 2000);
      }
    } catch {
      /* silent */
    }
    setCompletingId(null);
  };

  const trendingUpWeek = rewards.filter(r => r.source === 'mission');

  return (
    <div className="min-h-screen text-slate-100">
      {/* ------------------------- Header ------------------------- */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-8 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <FiChevronLeft size={18} /> Dashboard
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-16 h-16 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-2xl flex items-center justify-center"
                  initial={{ rotate: -8, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                >
                  <FiActivity className="text-3xl" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white">Wellness & Diet</h1>
                  <p className="text-slate-400">Daily missions · real points · live insights</p>
                </div>
              </div>

              <AnimatePresence>
                {lastEarned !== null && (
                  <motion.div
                    className="bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25"
                    initial={{ opacity: 0, scale: 0.5, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    +{lastEarned} pts 🎉
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <motion.div variants={item} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="text-2xl font-black text-white">
                <Counter value={completedCount} /> <span className="text-lg text-slate-400">/ {totalCount}</span>
              </p>
            </motion.div>
            <motion.div variants={item} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400">Points earned</p>
              <p className="text-2xl font-black text-white"><Counter value={points} /></p>
            </motion.div>
            <motion.div variants={item} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400">Level</p>
              <p className={`text-2xl font-black ${level.color}`}>{level.name}</p>
            </motion.div>
            <motion.div variants={item} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400">Achievements</p>
              <p className="text-2xl font-black text-white"><Counter value={earnedCount} /> <span className="text-lg text-slate-400">/ {achievements.length}</span></p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6 pb-16">
        {/* -------------------- Daily progress ring -------------------- */}
        <motion.div variants={container} initial="hidden" animate="show" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden">
          <motion.div variants={item} className="flex items-center gap-6 p-6 flex-wrap">
            <Ring pct={pct} sub="daily progress" />
            <div className="flex-1 min-w-[220px]">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FiClock className="text-amber-400" /> Today&apos;s progress
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {allDone
                  ? 'All missions complete — outstanding! 🎉'
                  : `${totalCount - completedCount} mission${totalCount - completedCount === 1 ? '' : 's'} remaining today. Points are added to your wallet in real time.`}
              </p>
              <div className="mt-4">
                <Bar pct={pct} color="bg-gradient-to-r from-amber-400 to-orange-500" />
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <FiMoon className="text-sky-400" /> Sleep {w?.sleepHours != null ? `${w.sleepHours}h` : '—'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <FiTrendingUp className="text-emerald-400" /> Steps {w?.steps != null ? w.steps.toLocaleString('en-IN') : '—'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <FiHeart className="text-rose-400" /> HR {w?.heartRate != null ? `${w.heartRate} bpm` : '—'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* -------------------- Insights (real, derived) -------------------- */}
        <motion.section variants={container} initial="hidden" animate="show">
          <motion.h2 variants={item} className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiZap className="text-amber-400" /> Your Health Insights
            <span className="text-[10px] font-medium text-slate-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wide">computed from your live readings</span>
          </motion.h2>
          {insights.length === 0 ? (
            <motion.div variants={item} className="bg-white/5 border border-dashed border-white/15 rounded-2xl p-6 text-center text-sm text-slate-400">
              No readings yet. Log metrics in <Link href="/health-tracker" className="text-amber-400 underline">Health Tracker</Link> to unlock insights.
            </motion.div>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => {
                const tone = TONE[ins.tone];
                return (
                  <motion.div key={i} variants={item} className={`flex items-start gap-3 p-4 rounded-2xl border ${tone.chip}`}>
                    <span className="text-xl mt-0.5">
                      {ins.icon === 'moon' ? '🌙' : ins.icon === 'heart' ? '❤️' : ins.icon === 'droplet' ? '💧' : ins.icon === 'trend' ? '📈' : '⚡'}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">{ins.text}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* -------------------- Today's missions -------------------- */}
        <motion.section variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" /> Today&apos;s Missions
            </h2>
            <motion.button
              onClick={fetchAll}
              whileTap={{ scale: 0.92 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-full px-3 py-1.5 hover:bg-amber-500/20 transition-colors"
            >
              <FiRefreshCw size={13} /> Refresh
            </motion.button>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading missions…</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-rose-500/10 border border-rose-500/25 rounded-2xl">
              <p className="text-rose-300 font-medium">{error}</p>
              <button onClick={fetchAll} className="mt-3 text-sm text-amber-300 underline">Retry</button>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-10 bg-white/5 border border-dashed border-white/15 rounded-2xl">
              <p className="text-slate-400">No missions available for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.map((m, i) => {
                const cat = CATEGORY[m.category] ?? CATEGORY.exercise;
                return (
                  <motion.div
                    key={m.id}
                    variants={item}
                    whileHover={{ y: -2 }}
                    className={`group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-colors ${
                      m.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                          m.completed ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/8 border-white/10'
                        }`}
                        whileHover={{ rotate: 6, scale: 1.05 }}
                      >
                        {m.icon}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold ${m.completed ? 'text-emerald-200' : 'text-slate-100'}`}>{m.title}</h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-0.5 ${cat.chip}`}>{cat.label}</span>
                          {m.completed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                            >
                              <FiCheck size={10} /> Done
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5 truncate">{m.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="font-semibold text-amber-400">+{m.points} pts</span>
                          {m.completedAt && (
                            <span className="text-slate-500">completed {formatDistanceToNow(new Date(m.completedAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      </div>

                      {m.completed ? (
                        <motion.div
                          className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          <FiCheck size={18} />
                        </motion.div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => completeMission(m)}
                          disabled={completingId === m.id}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow disabled:opacity-60 shrink-0"
                        >
                          {completingId === m.id ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <FiCheck size={16} /> Mark done
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* -------------------- Goals (real progress) -------------------- */}
        <motion.section variants={container} initial="hidden" animate="show">
          <motion.h2 variants={item} className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiActivity className="text-cyan-400" /> Active Goals
            <Link href="/health-tracker" className="ml-auto text-xs font-semibold text-amber-300 hover:text-amber-200">Manage in tracker →</Link>
          </motion.h2>
          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No active goals. Create one in <Link href="/health-tracker" className="text-amber-400 underline">Health Tracker</Link>.
              </p>
            ) : (
              <div className="space-y-5">
                {goals.slice(0, 5).map(g => {
                  const p = goalPct(g);
                  const color = p >= 100 ? 'bg-emerald-400' : g.type === 'sleep' ? 'bg-sky-400' : g.type === 'water' ? 'bg-cyan-400' : 'bg-amber-400';
                  const icon = g.type === 'sleep' ? '😴' : g.type === 'water' ? '💧' : g.type === 'steps' ? '👟' : g.type === 'weight' ? '⚖️' : '🎯';
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <p className="font-medium text-slate-200 flex items-center gap-2">
                          <span>{icon}</span> {g.title}
                        </p>
                        <p className="text-slate-400">
                          <span className="text-slate-100 font-semibold">{g.currentValue}</span> / {g.targetValue} {g.unit}
                        </p>
                      </div>
                      <Bar pct={p} color={color} />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* -------------------- Achievements -------------------- */}
        <motion.section variants={container} initial="hidden" animate="show">
          <motion.h2 variants={item} className="font-bold text-lg mb-1 flex items-center gap-2">
            <FiAward className="text-amber-400" /> Achievements
          </motion.h2>
          <motion.p variants={item} className="text-xs text-slate-500 mb-4">
            {earnedCount} of {achievements.length} earned — unlocked automatically from your real data.
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((a, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -3 }}
                className={`relative rounded-2xl border p-4 text-center backdrop-blur-xl ${
                  a.earned ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                {a.earned && (
                  <motion.span
                    className="absolute top-2 right-2 text-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <FiCheckCircle size={14} />
                  </motion.span>
                )}
                <span className={`text-3xl ${a.earned ? '' : 'opacity-30 grayscale'}`}>{a.icon}</span>
                <p className={`text-xs font-bold mt-1.5 ${a.earned ? 'text-amber-200' : 'text-slate-500'}`}>{a.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* -------------------- Points activity -------------------- */}
        <motion.section variants={container} initial="hidden" animate="show">
          <motion.h2 variants={item} className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiAward className="text-orange-400" /> Points Activity
          </motion.h2>
          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 backdrop-blur-xl">
            {rewards.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No points yet — complete missions to start earning.</p>
            ) : (
              rewards.slice(0, 8).map(r => (
                <motion.div key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0">
                    {r.source === 'mission' ? '🎯' : '⭐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 truncate">{r.description}</p>
                    <p className="text-[11px] text-slate-500">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className="font-bold text-emerald-400">+{r.points}</span>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.section>

        {/* -------------------- Snapshot of recent mission points -------------------- */}
        {trendingUpWeek.length >= 3 && (
          <motion.p variants={item} initial="hidden" animate="show" className="text-center text-[11px] text-slate-600">
            Points are real and stored per user — earned from completed missions, appointments and more.
          </motion.p>
        )}
      </div>
    </div>
  );
}