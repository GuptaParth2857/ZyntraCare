'use client';

import { useState, useEffect } from 'react';
import { FiGift, FiStar, FiTrendingUp, FiCheckCircle, FiClock, FiAward, FiTarget, FiActivity, FiHeart, FiZap, FiUsers, FiShield, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface HealthCoin {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  coinsRequired: number;
  category: string;
  discount?: string;
  icon: string;
}

export default function RewardsPage() {
  const [userStats, setUserStats] = useState({ totalCoins: 0, streakDays: 0, level: 0, rank: '', stepsToday: 0, stepsGoal: 10000, nextRewardCoins: 0 });
  const [recentTransactions, setRecentTransactions] = useState<HealthCoin[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch('/api/rewards')
      .then(r => r.json())
      .then(data => {
        setUserStats(data.userStats || { totalCoins: 0, streakDays: 0, level: 0, rank: '', stepsToday: 0, stepsGoal: 10000, nextRewardCoins: 0 });
        setRecentTransactions(data.recentTransactions || []);
        setRewards(data.rewards || []);
        setDailyTasks(data.dailyTasks || []);
        setLeaderboard(data.leaderboard || []);
        setLevels(data.levels || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
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

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
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
                      {userStats.streakDays} days
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Level {userStats.level} - {userStats.rank}</span>
                    <span className="text-amber-400 text-sm font-bold">{userStats.nextRewardCoins} coins to next reward</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      transition={{ duration: 1, delay: 0.5 }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 h-full">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiTarget className="text-amber-400" /> Today's Tasks
              </h3>
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${task.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                      {task.completed ? <FiCheckCircle size={16} /> : task.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? 'text-emerald-400' : 'text-white'}`}>{task.title}</p>
                      <p className="text-xs text-gray-400">+{task.coins} coins</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiClock className="text-amber-400" /> Recent Transactions
              </h3>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
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
                      {tx.type === 'earned' ? '+' : ''}{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiAward className="text-amber-400" /> Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.map((user) => (
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
                      <p className={`text-sm font-medium ${user.isUser ? 'text-amber-400' : 'text-white'}`}>{user.name}</p>
                      <p className="text-xs text-gray-500">{user.level}</p>
                    </div>
                    <p className="text-amber-400 font-bold">{user.coins.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-2xl mb-6 text-center">Redeem Your Coins</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{reward.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-amber-400 transition">{reward.title}</h4>
                    <p className="text-sm text-gray-400">{reward.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">{reward.coinsRequired} coins</span>
                  <button 
                    disabled={userStats.totalCoins < reward.coinsRequired}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                      userStats.totalCoins >= reward.coinsRequired
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
