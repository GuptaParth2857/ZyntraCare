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

const userStats = {
  totalCoins: 2450,
  streakDays: 12,
  level: 5,
  rank: 'Diamond',
  stepsToday: 8542,
  stepsGoal: 10000,
  nextRewardCoins: 500,
};

const recentTransactions: HealthCoin[] = [
  { id: '1', type: 'earned', amount: 100, description: 'Completed 10,000 steps', date: 'Today' },
  { id: '2', type: 'earned', amount: 50, description: 'Medicine taken on time', date: 'Today' },
  { id: '3', type: 'earned', amount: 200, description: 'Weekly health goal achieved', date: 'Yesterday' },
  { id: '4', type: 'redeemed', amount: -500, description: 'Lab test discount', date: 'Yesterday' },
  { id: '5', type: 'earned', amount: 150, description: 'Blood donation completed', date: '2 days ago' },
];

const rewards: Reward[] = [
  { id: '1', title: 'Apollo Lab Blood Test', description: 'Complete Blood Count (CBC)', coinsRequired: 300, category: 'Lab', discount: '20% off', icon: '🧪' },
  { id: '2', title: 'MedPlus Pharmacy', description: 'Flat ₹100 off on medicines', coinsRequired: 200, category: 'Pharmacy', discount: '₹100 off', icon: '💊' },
  { id: '3', title: 'Health Checkup Package', description: 'Full body checkup', coinsRequired: 1000, category: 'Lab', discount: '30% off', icon: '🏥' },
  { id: '4', title: 'Telehealth Consultation', description: 'Free video consult', coinsRequired: 500, category: 'Consult', discount: 'Free', icon: '📹' },
  { id: '5', title: 'Premium Subscription', description: '1 month free', coinsRequired: 2000, category: 'Premium', discount: 'Free', icon: '⭐' },
  { id: '6', title: 'Fitness Band', description: 'Track your health', coinsRequired: 5000, category: 'Gadget', discount: '₹500 off', icon: '⌚' },
];

const dailyTasks = [
  { id: '1', title: 'Complete 10,000 steps', coins: 100, completed: true, icon: <FiActivity /> },
  { id: '2', title: 'Take medicine on time', coins: 50, completed: true, icon: <FiShield /> },
  { id: '3', title: 'Log your health data', coins: 25, completed: true, icon: <FiTrendingUp /> },
  { id: '4', title: 'Read health article', coins: 25, completed: false, icon: <FiAward /> },
  { id: '5', title: 'Share health tip', coins: 50, completed: false, icon: <FiUsers /> },
];

const leaderboard = [
  { rank: 1, name: 'Rahul S.', coins: 15420, avatar: 'R', level: 'Platinum' },
  { rank: 2, name: 'Priya M.', coins: 12850, avatar: 'P', level: 'Diamond' },
  { rank: 3, name: 'Amit K.', coins: 11200, avatar: 'A', level: 'Diamond' },
  { rank: 4, name: 'You', coins: 2450, avatar: 'Y', level: 'Diamond', isUser: true },
  { rank: 5, name: 'Sneha R.', coins: 2100, avatar: 'S', level: 'Gold' },
];

const levels = [
  { level: 1, name: 'Bronze', minCoins: 0, color: 'from-amber-700 to-amber-600' },
  { level: 2, name: 'Silver', minCoins: 500, color: 'from-gray-400 to-gray-300' },
  { level: 3, name: 'Gold', minCoins: 2000, color: 'from-yellow-500 to-amber-400' },
  { level: 4, name: 'Diamond', minCoins: 5000, color: 'from-cyan-400 to-blue-500' },
  { level: 5, name: 'Platinum', minCoins: 10000, color: 'from-purple-500 to-pink-500' },
];

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState('overview');

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
