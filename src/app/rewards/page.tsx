'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiGift, FiStar, FiTrendingUp, FiCheckCircle, FiClock, FiAward, FiTarget, FiActivity, FiZap, FiUsers, FiLock, FiInfo, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface UserStats {
  totalCoins: number;
  streakDays: number;
  level: number;
  rank: string;
  nextRewardCoins: number;
  levelProgress: number;
  stepsToday: number;
  stepsGoal: number;
}

interface HealthCoin {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  coinsRequired: number;
  category: string;
  icon: string;
  discount?: string | null;
  redeemed: boolean;
  code?: string | null;
}

interface DailyTask {
  id: string;
  title: string;
  coins: number;
  icon: string;
  completed: boolean;
}

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  coins: number;
  level: string;
  isUser: boolean;
}

const CATEGORIES = ['all', 'labs', 'pharmacy', 'consultation', 'diagnostics', 'wellness'];
const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Rewards',
  labs: 'Lab Tests',
  pharmacy: 'Pharmacy',
  consultation: 'Consultations',
  diagnostics: 'Diagnostics',
  wellness: 'Wellness',
};

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState<UserStats>({ totalCoins: 0, streakDays: 0, level: 1, rank: 'Bronze', nextRewardCoins: 0, levelProgress: 0, stepsToday: 0, stepsGoal: 10000 });
  const [transactions, setTransactions] = useState<HealthCoin[]>([]);
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [taskBusyId, setTaskBusyId] = useState('');
  const [toast, setToast] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rewards${demoMode ? '?userId=demo-user' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load rewards');
      if (data.userStats) setUserStats(data.userStats);
      setTransactions(data.recentTransactions || []);
      setCatalog(data.rewardCatalog || []);
      setTasks(data.dailyTasks || []);
      setLeaderboard(data.leaderboard || []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, demoMode]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const handleRedeem = async (item: RewardItem) => {
    if (busyId || item.redeemed || userStats.totalCoins < item.coinsRequired) return;
    setBusyId(item.id);
    setError('');
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', itemId: item.id, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not redeem');
      setUserStats(s => ({ ...s, totalCoins: data.balance }));
      await load();
      showToast(`Redeemed! Use code ${data.redemption.code}`);
    } catch (e: any) {
      setError(e.message || 'Could not redeem this reward');
    } finally {
      setBusyId('');
    }
  };

  const handleToggleTask = async (task: DailyTask) => {
    if (taskBusyId) return;
    setTaskBusyId(task.id);
    setError('');
    try {
      const res = await fetch('/api/wellness-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: task.id, userId, completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Could not update task');
      if (!task.completed) showToast(`+${task.coins} coins earned!`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Could not update this task');
    } finally {
      setTaskBusyId('');
    }
  };

  const filteredCatalog = catFilter === 'all' ? catalog : catalog.filter(r => r.category === catFilter);
  const stepsPct = userStats.stepsGoal > 0 ? Math.min(100, Math.round((userStats.stepsToday / userStats.stepsGoal) * 100)) : 0;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <FiGift size={32} className="text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Rewards</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Earn Health Coins for healthy habits. Redeem for discounts on labs, pharmacies, and more!
          </p>
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-amber-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Your rewards balance and redemption history are tied to your account. Sign in to continue.</p>
            <Link href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-black text-sm hover:from-amber-500 hover:to-orange-500 transition">
              Sign In
            </Link>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/rewards?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-amber-400" size={32} />
            <p className="text-white/40 text-sm">Loading…</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {demoMode && (
              <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to manage your own rewards.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                <FiAlertCircle className="text-red-400 flex-shrink-0" />
                <p className="text-red-400/90 text-sm font-medium flex-1">{error}</p>
                <button onClick={() => setError('')} className="px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Dismiss</button>
              </div>
            )}

            {toast && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <FiCheckCircle className="text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 text-sm font-bold flex-1">{toast}</p>
              </motion.div>
            )}

            {loading && catalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <FiLoader className="animate-spin text-amber-400" size={28} />
                <p className="text-white/40 text-sm">Loading your rewards…</p>
              </div>
            ) : (
              <>
                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20 border border-amber-500/30 rounded-[2rem] p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Your Balance</p>
                            <p className="text-5xl font-black text-white flex items-center gap-3">
                              <FiStar className="text-amber-400" />
                              {userStats.totalCoins.toLocaleString()}
                              <span className="text-lg font-bold text-amber-400/70">coins</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Streak</p>
                            <p className="text-3xl font-black text-white flex items-center gap-2">
                              <span className="text-orange-400">🔥</span>
                              {userStats.streakDays} {userStats.streakDays === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-2xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">{userStats.rank} · Level {userStats.level}</span>
                            <span className="text-amber-400 text-sm font-bold">
                              {userStats.nextRewardCoins > 0 ? `${userStats.nextRewardCoins} coins to next reward` : 'Top level reached 🎉'}
                            </span>
                          </div>
                          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${userStats.levelProgress}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link href="/wearables" className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold text-center transition flex items-center justify-center gap-2">
                            <FiActivity /> Sync Steps
                          </Link>
                          <Link href="/medications" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-xl font-bold text-center transition flex items-center justify-center gap-2">
                            <FiClock /> Log Medicine
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 h-full">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FiTarget className="text-amber-400" /> Today's Tasks
                      </h3>
                      <div className="mb-4 p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Steps today</span>
                          <span className="text-amber-400 font-bold">{userStats.stepsToday.toLocaleString()} / {userStats.stepsGoal.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: `${stepsPct}%` }} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {tasks.length === 0 ? (
                          <div className="text-center py-8 bg-white/5 rounded-xl">
                            <FiTarget className="text-amber-400/40 mx-auto mb-2" size={28} />
                            <p className="text-gray-500 text-sm">No tasks today</p>
                          </div>
                        ) : tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => handleToggleTask(task)}
                            disabled={taskBusyId === task.id}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                              task.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                              {taskBusyId === task.id ? <FiLoader size={14} className="animate-spin" /> : task.completed ? <FiCheckCircle size={16} /> : <span className="text-sm">{task.icon}</span>}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${task.completed ? 'text-emerald-400' : 'text-white'}`}>{task.title}</p>
                              <p className="text-xs text-gray-400">+{task.coins} coins{task.completed ? ' · tap to undo' : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-10">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiClock className="text-amber-400" /> Recent Transactions
                      </h3>
                      <div className="space-y-3">
                        {transactions.length === 0 ? (
                          <div className="text-center py-8 bg-white/5 rounded-xl">
                            <FiClock className="text-gray-500/40 mx-auto mb-2" size={28} />
                            <p className="text-gray-500 text-sm">No transactions yet — complete tasks to earn coins.</p>
                          </div>
                        ) : transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earned' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {tx.type === 'earned' ? <FiZap size={18} /> : <FiGift size={18} />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{tx.description}</p>
                                <p className="text-xs text-gray-500">{tx.date}</p>
                              </div>
                            </div>
                            <p className={`font-bold ${tx.type === 'earned' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {tx.type === 'earned' ? '+' : '−'}{tx.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 h-full">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiAward className="text-amber-400" /> Leaderboard
                      </h3>
                      <div className="space-y-2">
                        {leaderboard.length === 0 ? (
                          <div className="text-center py-8 bg-white/5 rounded-xl">
                            <FiUsers className="text-gray-500/40 mx-auto mb-2" size={28} />
                            <p className="text-gray-500 text-sm">No leaderboard data yet</p>
                          </div>
                        ) : leaderboard.map((user) => (
                          <div key={user.rank} className={`flex items-center gap-3 p-3 rounded-xl ${user.isUser ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              user.rank === 1 ? 'bg-yellow-500 text-black' :
                              user.rank === 2 ? 'bg-gray-400 text-black' :
                              user.rank === 3 ? 'bg-amber-600 text-white' :
                              'bg-white/10 text-white'
                            }`}>
                              {user.rank}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center font-bold">
                              {user.avatar}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${user.isUser ? 'text-amber-400' : 'text-white'}`}>{user.name}{user.isUser ? ' (you)' : ''}</p>
                              <p className="text-xs text-gray-500">{user.level}</p>
                            </div>
                            <p className="text-amber-400 font-bold">{user.coins.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h3 className="font-bold text-2xl mb-4 text-center">Redeem Your Coins</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCatFilter(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                          catFilter === cat ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalog.length === 0 ? (
                      <div className="md:col-span-3 text-center py-16 bg-slate-900/60 border border-white/10 rounded-[2rem]">
                        <FiGift className="text-amber-400/40 mx-auto mb-3" size={40} />
                        <p className="text-white font-bold text-lg mb-1">No rewards in this category</p>
                        <p className="text-gray-500 text-sm">Check the other categories or come back later</p>
                      </div>
                    ) : filteredCatalog.map((reward) => {
                      const affordable = userStats.totalCoins >= reward.coinsRequired;
                      return (
                        <div key={reward.id} className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition group">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="text-4xl leading-none">{reward.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white group-hover:text-amber-400 transition">{reward.title}</h4>
                              <p className="text-sm text-gray-400 mt-0.5">{reward.description}</p>
                              {reward.discount && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold">
                                  {reward.discount}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400 font-bold">{reward.coinsRequired} coins</span>
                            {reward.redeemed ? (
                              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                                <FiCheck size={14} /> Redeemed {reward.code ? `· ${reward.code}` : ''}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRedeem(reward)}
                                disabled={!affordable || busyId === reward.id}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                                  affordable && busyId !== reward.id
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {busyId === reward.id ? <FiLoader size={14} className="animate-spin mx-auto" /> : affordable ? 'Redeem' : 'Locked'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}