'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiUsers, FiAward, FiZap, FiHeart, FiActivity, FiClock, FiStar, FiCheckCircle, FiPlus, FiChevronRight, FiTrendingUp, FiCalendar, FiShield, FiUser, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'steps' | 'hydration' | 'sleep' | 'meditation' | 'workout' | 'nutrition';
  icon: string;
  duration: number;
  daysRemaining: number;
  totalDays: number;
  dailyGoal: string;
  participants: number;
  progress: number;
  completedDays: number;
  dailyPoints: number;
  color: string;
  active: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: string;
  avatar: string;
  streak: number;
  challengesCompleted: number;
  isUser?: boolean;
}

interface ChallengeHistory {
  id: string;
  name: string;
  completedDate: string;
  result: 'won' | 'partially' | 'missed';
  pointsEarned: number;
  participants: number;
  rank: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ChallengeTemplate {
  id: string;
  name: string;
  type: Challenge['type'];
  icon: string;
  description: string;
  defaultDuration: number;
  dailyPoints: number;
  color: string;
}

const ACTIVE_CHALLENGES: Challenge[] = [
  { id: '1', name: '10K Step Challenge', description: 'Walk 10,000 steps every day for 7 days', type: 'steps', icon: '👟', duration: 7, daysRemaining: 3, totalDays: 7, dailyGoal: '10,000 steps', participants: 2341, progress: 57, completedDays: 4, dailyPoints: 100, color: 'from-blue-500 to-cyan-400', active: true },
  { id: '2', name: 'Hydration Hero', description: 'Drink 8 glasses of water daily for 7 days', type: 'hydration', icon: '💧', duration: 7, daysRemaining: 5, totalDays: 7, dailyGoal: '8 glasses', participants: 3120, progress: 29, completedDays: 2, dailyPoints: 50, color: 'from-cyan-500 to-teal-400', active: true },
  { id: '3', name: 'Sleep Champion', description: 'Get 8 hours of sleep for 5 nights', type: 'sleep', icon: '😴', duration: 5, daysRemaining: 2, totalDays: 5, dailyGoal: '8 hours sleep', participants: 1856, progress: 60, completedDays: 3, dailyPoints: 75, color: 'from-purple-500 to-indigo-400', active: true },
  { id: '4', name: 'Mindful Minutes', description: 'Meditate for 10 minutes daily for 7 days', type: 'meditation', icon: '🧘', duration: 7, daysRemaining: 1, totalDays: 7, dailyGoal: '10 min meditation', participants: 1542, progress: 86, completedDays: 6, dailyPoints: 60, color: 'from-amber-500 to-orange-400', active: true },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Priya Malhotra', points: 15420, level: 'Diamond', avatar: 'P', streak: 28, challengesCompleted: 42 },
  { rank: 2, name: 'Rahul Verma', points: 14850, level: 'Diamond', avatar: 'R', streak: 25, challengesCompleted: 38 },
  { rank: 3, name: 'Ananya Singh', points: 12200, level: 'Platinum', avatar: 'A', streak: 21, challengesCompleted: 35 },
  { rank: 4, name: 'You', points: 8750, level: 'Gold', avatar: 'Y', streak: 14, challengesCompleted: 28, isUser: true },
  { rank: 5, name: 'Vikram Desai', points: 7320, level: 'Gold', avatar: 'V', streak: 12, challengesCompleted: 24 },
  { rank: 6, name: 'Sneha Patel', points: 6890, level: 'Gold', avatar: 'S', streak: 10, challengesCompleted: 22 },
  { rank: 7, name: 'Arjun Reddy', points: 5450, level: 'Silver', avatar: 'A', streak: 8, challengesCompleted: 18 },
  { rank: 8, name: 'Kavya Nair', points: 4200, level: 'Silver', avatar: 'K', streak: 6, challengesCompleted: 15 },
];

const CHALLENGE_HISTORY: ChallengeHistory[] = [
  { id: '1', name: '30-Day Yoga Challenge', completedDate: '2026-08-01', result: 'won', pointsEarned: 1500, participants: 4520, rank: 127 },
  { id: '2', name: '10K Step Challenge', completedDate: '2026-07-15', result: 'won', pointsEarned: 700, participants: 2100, rank: 89 },
  { id: '3', name: 'Hydration Hero', completedDate: '2026-07-01', result: 'won', pointsEarned: 350, participants: 1800, rank: 342 },
  { id: '4', name: 'Workout Warrior', completedDate: '2026-06-20', result: 'partially', pointsEarned: 200, participants: 1500, rank: 645 },
  { id: '5', name: 'Digital Detox', completedDate: '2026-06-01', result: 'missed', pointsEarned: 0, participants: 980, rank: 801 },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete your first challenge', icon: '👟', unlocked: true, rarity: 'common' },
  { id: '2', name: 'Hydration Hero', description: 'Complete 5 hydration challenges', icon: '💧', unlocked: true, rarity: 'rare' },
  { id: '3', name: 'Sleep Master', description: '14-day sleep streak', icon: '😴', unlocked: true, rarity: 'rare' },
  { id: '4', name: 'Zen Master', description: '30-day meditation streak', icon: '🧘', unlocked: false, rarity: 'epic' },
  { id: '5', name: 'Step King', description: 'Walk 100,000 steps in challenges', icon: '👑', unlocked: true, rarity: 'epic' },
  { id: '6', name: 'Iron Will', description: 'Complete 10 challenges in a row', icon: '💪', unlocked: false, rarity: 'epic' },
  { id: '7', name: 'Unstoppable', description: '30-day active streak', icon: '🔥', unlocked: false, rarity: 'legendary' },
  { id: '8', name: 'Community Star', description: 'Invite 20 friends to challenges', icon: '⭐', unlocked: false, rarity: 'legendary' },
  { id: '9', name: 'Wellness Warrior', description: 'Complete all challenge types', icon: '🛡️', unlocked: true, rarity: 'rare' },
  { id: '10', name: 'Health Champion', description: 'Reach Diamond level', icon: '🏆', unlocked: false, rarity: 'legendary' },
  { id: '11', name: 'Early Bird', description: 'Complete a challenge before everyone else', icon: '🐦', unlocked: true, rarity: 'common' },
  { id: '12', name: 'Team Player', description: 'Join 5 group challenges', icon: '🤝', unlocked: false, rarity: 'common' },
];

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  { id: '1', name: 'Step Challenge', type: 'steps', icon: '👟', description: 'Walk a target number of steps daily', defaultDuration: 7, dailyPoints: 100, color: 'from-blue-500 to-cyan-400' },
  { id: '2', name: 'Hydration Challenge', type: 'hydration', icon: '💧', description: 'Drink 8+ glasses of water daily', defaultDuration: 7, dailyPoints: 50, color: 'from-cyan-500 to-teal-400' },
  { id: '3', name: 'Sleep Challenge', type: 'sleep', icon: '😴', description: 'Get 8 hours of sleep every night', defaultDuration: 7, dailyPoints: 75, color: 'from-purple-500 to-indigo-400' },
  { id: '4', name: 'Meditation Challenge', type: 'meditation', icon: '🧘', description: 'Meditate for 10+ minutes daily', defaultDuration: 7, dailyPoints: 60, color: 'from-amber-500 to-orange-400' },
  { id: '5', name: 'Workout Challenge', type: 'workout', icon: '💪', description: 'Exercise for 30+ minutes daily', defaultDuration: 14, dailyPoints: 120, color: 'from-red-500 to-pink-400' },
  { id: '6', name: 'Nutrition Challenge', type: 'nutrition', icon: '🥗', description: 'Eat 5+ fruits/vegetables daily', defaultDuration: 14, dailyPoints: 80, color: 'from-green-500 to-emerald-400' },
];

const LEVELS = [
  { name: 'Bronze', minPoints: 0, color: 'from-amber-700 to-amber-600', icon: '🥉' },
  { name: 'Silver', minPoints: 3000, color: 'from-gray-400 to-gray-300', icon: '🥈' },
  { name: 'Gold', minPoints: 7500, color: 'from-yellow-500 to-amber-400', icon: '🥇' },
  { name: 'Platinum', minPoints: 12000, color: 'from-purple-500 to-pink-500', icon: '💎' },
  { name: 'Diamond', minPoints: 20000, color: 'from-cyan-400 to-blue-500', icon: '💠' },
];

const FRIEND_COMPARISONS = [
  { name: 'Priya M.', steps: 9200, water: 7, sleep: 8.5, meditation: 15, stepsGoal: 10000, waterGoal: 8, sleepGoal: 8, meditationGoal: 10 },
  { name: 'Rahul V.', steps: 11200, water: 9, sleep: 7.5, meditation: 0, stepsGoal: 10000, waterGoal: 8, sleepGoal: 8, meditationGoal: 10 },
];

export default function HealthChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'history' | 'badges' | 'create'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>(ACTIVE_CHALLENGES);
  const [selectedDuration, setSelectedDuration] = useState<7 | 14 | 30>(7);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinChallengeId, setJoinChallengeId] = useState<string | null>(null);
  const [showCreated, setShowCreated] = useState(false);
  const [userPoints] = useState(8750);
  const [totalChallengesCompleted] = useState(28);
  const [currentStreak] = useState(14);

  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (userPoints >= LEVELS[i].minPoints) return LEVELS[i];
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    for (let i = 0; i < LEVELS.length; i++) {
      if (userPoints < LEVELS[i].minPoints) return LEVELS[i];
    }
    return null;
  };

  const handleJoinChallenge = (id: string) => {
    setJoinChallengeId(id);
    setShowJoinModal(true);
  };

  const confirmJoin = () => {
    setShowJoinModal(false);
    setJoinChallengeId(null);
  };

  const handleCreateChallenge = () => {
    if (!selectedTemplate) return;
    setShowCreated(true);
    setTimeout(() => setShowCreated(false), 3000);
    setSelectedTemplate(null);
  };

  const tabs = [
    { id: 'challenges' as const, label: 'Active', icon: <FiTarget /> },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: <FiAward /> },
    { id: 'history' as const, label: 'History', icon: <FiClock /> },
    { id: 'badges' as const, label: 'Badges', icon: <FiAward /> },
    { id: 'create' as const, label: 'Create', icon: <FiPlus /> },
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/30 bg-gray-400/5';
      case 'rare': return 'border-blue-400/30 bg-blue-400/5';
      case 'epic': return 'border-purple-400/30 bg-purple-400/5';
      case 'legendary': return 'border-amber-400/30 bg-amber-400/5';
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
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <FiAward size={32} className="text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Challenges</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete, earn points, climb the leaderboard. Join challenges with friends and build healthy habits together.
          </p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#levelGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(userPoints / (getNextLevel()?.minPoints || 20000)) * 264} 264`} />
                  <defs>
                    <linearGradient id="levelGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                  {getCurrentLevel().icon}
                </div>
              </div>
              <p className="text-sm font-bold text-white">{getCurrentLevel().name}</p>
              <p className="text-[10px] text-gray-500">{userPoints.toLocaleString()} pts</p>
            </div>
            {[
              { label: 'Completed', value: totalChallengesCompleted, icon: <FiCheckCircle />, color: 'text-emerald-400' },
              { label: 'Current Streak', value: `${currentStreak}d`, icon: <FiZap />, color: 'text-amber-400' },
              { label: 'Total Points', value: userPoints.toLocaleString(), icon: <FiStar />, color: 'text-cyan-400' },
              { label: 'Active Challenges', value: challenges.filter(c => c.active).length, icon: <FiTarget />, color: 'text-purple-400' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Level Progress */}
          <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{getCurrentLevel().name} Level</span>
              {getNextLevel() && (
                <span className="text-xs text-amber-400">{(getNextLevel()!.minPoints - userPoints).toLocaleString()} pts to {getNextLevel()!.name}</span>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userPoints / (getNextLevel()?.minPoints || 20000)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              {LEVELS.map((level, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs">{level.icon}</span>
                  <span className={`text-[9px] ${userPoints >= level.minPoints ? 'text-amber-400' : 'text-gray-600'}`}>{level.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Join Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
              onClick={() => setShowJoinModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-black text-white mb-2">Join Challenge?</h3>
                <p className="text-sm text-gray-400 mb-6">You&apos;ll receive daily reminders and earn points for each completed day.</p>
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenges.find(c => c.id === joinChallengeId)?.icon}</span>
                    <div>
                      <p className="font-bold text-white">{challenges.find(c => c.id === joinChallengeId)?.name}</p>
                      <p className="text-xs text-gray-400">{challenges.find(c => c.id === joinChallengeId)?.dailyGoal} • {challenges.find(c => c.id === joinChallengeId)?.duration} days</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={confirmJoin}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold transition"
                  >
                    Join Now
                  </button>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showCreated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-3 flex items-center gap-2 backdrop-blur-xl"
          >
            <FiCheckCircle className="text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">Challenge created! Share with friends.</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Active Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {challenges.map((challenge, idx) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl hover:border-white/20 transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-2xl`}>
                          {challenge.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-amber-400 transition">{challenge.name}</h3>
                          <p className="text-xs text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">+{challenge.dailyPoints} pts/day</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Day {challenge.completedDays} of {challenge.totalDays}</span>
                        <span className="text-xs text-white font-bold">{challenge.progress}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                          className={`h-full bg-gradient-to-r ${challenge.color} rounded-full`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                        <FiClock className="text-gray-400 mx-auto mb-1" size={12} />
                        <p className="text-xs font-bold text-white">{challenge.daysRemaining}d left</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                        <FiUsers className="text-gray-400 mx-auto mb-1" size={12} />
                        <p className="text-xs font-bold text-white">{challenge.participants.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                        <FiTarget className="text-gray-400 mx-auto mb-1" size={12} />
                        <p className="text-xs font-bold text-white">{challenge.dailyGoal}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      <FiZap /> Track Progress
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Social Comparison */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiUsers className="text-amber-400" /> Friend vs You (Today)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs text-gray-400 pb-3 font-medium">Metric</th>
                        <th className="text-center text-xs text-amber-400 pb-3 font-bold">You</th>
                        {FRIEND_COMPARISONS.map((f, i) => (
                          <th key={i} className="text-center text-xs text-gray-400 pb-3 font-medium">{f.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { label: 'Steps', key: 'steps' as const, goal: 'stepsGoal' as const, unit: '' },
                        { label: 'Water', key: 'water' as const, goal: 'waterGoal' as const, unit: ' glasses' },
                        { label: 'Sleep', key: 'sleep' as const, goal: 'sleepGoal' as const, unit: ' hrs' },
                        { label: 'Meditation', key: 'meditation' as const, goal: 'meditationGoal' as const, unit: ' min' },
                      ].map((metric, idx) => {
                        const userVal = [8542, 6, 7.5, 12][idx];
                        const userGoal = [10000, 8, 8, 10][idx];
                        return (
                          <tr key={metric.key} className="border-b border-white/5">
                            <td className="py-3 text-gray-300 font-medium">{metric.label}</td>
                            <td className="py-3 text-center">
                              <span className={`font-bold ${userVal >= userGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {userVal.toLocaleString()}{metric.unit}
                              </span>
                              <span className="text-gray-600 text-xs">/{userGoal.toLocaleString()}{metric.unit}</span>
                            </td>
                            {FRIEND_COMPARISONS.map((friend, fIdx) => {
                              const val = friend[metric.key];
                              const goal = friend[metric.goal];
                              return (
                                <td key={fIdx} className="py-3 text-center">
                                  <span className={`font-bold ${val >= goal ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {val.toLocaleString()}{metric.unit}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Top 3 Podium */}
              <div className="flex items-end justify-center gap-4 mb-8">
                {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, idx) => {
                  const heights = ['h-24', 'h-32', 'h-20'];
                  const medals = ['🥈', '🥇', '🥉'];
                  return (
                    <div key={entry.rank} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl font-black text-white mb-2">
                        {entry.avatar}
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{entry.name.split(' ')[0]}</p>
                      <p className="text-xs text-amber-400 mb-2">{entry.points.toLocaleString()}</p>
                      <div className={`${heights[idx]} w-24 rounded-t-xl bg-gradient-to-t ${
                        idx === 1 ? 'from-amber-600 to-amber-400' :
                        idx === 0 ? 'from-gray-500 to-gray-400' :
                        'from-amber-700 to-amber-600'
                      } flex items-center justify-center`}>
                        <span className="text-3xl">{medals[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Leaderboard */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <div className="space-y-2">
                  {LEADERBOARD.map((entry, idx) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition ${
                        entry.isUser
                          ? 'bg-amber-500/10 border border-amber-500/30'
                          : 'bg-white/5 border border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.isUser ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' : 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white'
                      }`}>
                        {entry.avatar}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${entry.isUser ? 'text-amber-400' : 'text-white'}`}>{entry.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">{entry.level}</span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-500">🔥 {entry.streak}d streak</span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-500">{entry.challengesCompleted} completed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{entry.points.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">points</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FiClock className="text-amber-400" /> Challenge History
                </h3>
                <div className="space-y-4">
                  {CHALLENGE_HISTORY.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        item.result === 'won' ? 'bg-emerald-500/10 border-emerald-500/30' :
                        item.result === 'partially' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.result === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.result === 'partially' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {item.result === 'won' ? <FiAward size={20} /> : item.result === 'partially' ? <FiTarget size={20} /> : <FiXCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          Completed {new Date(item.completedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' • '}#{item.rank} of {item.participants.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.pointsEarned > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                          {item.pointsEarned > 0 ? `+${item.pointsEarned}` : '0'} pts
                        </p>
                        <span className={`text-[10px] uppercase font-bold ${
                          item.result === 'won' ? 'text-emerald-400' : item.result === 'partially' ? 'text-amber-400' : 'text-gray-500'
                        }`}>
                          {item.result}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((badge, idx) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative p-5 rounded-2xl border text-center transition ${
                      badge.unlocked
                        ? getRarityColor(badge.rarity)
                        : 'border-white/5 bg-white/[0.02] opacity-50'
                    }`}
                  >
                    <span className="text-4xl mb-3 block">{badge.unlocked ? badge.icon : '🔒'}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{badge.name}</h4>
                    <p className="text-[10px] text-gray-400 mb-2">{badge.description}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      badge.rarity === 'common' ? 'bg-gray-500/20 text-gray-400' :
                      badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {badge.rarity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FiPlus className="text-amber-400" /> Create a Challenge
                </h3>
                <p className="text-sm text-gray-400 mb-6">Choose a template, set duration, and invite friends.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {CHALLENGE_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-5 rounded-2xl border text-left transition ${
                        selectedTemplate === template.id
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-xl`}>
                          {template.icon}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${selectedTemplate === template.id ? 'text-amber-400' : 'text-white'}`}>{template.name}</p>
                          <p className="text-[10px] text-gray-400">+{template.dailyPoints} pts/day</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{template.description}</p>
                    </button>
                  ))}
                </div>

                {selectedTemplate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-6">
                      <label className="text-sm font-bold text-gray-300 mb-3 block">Duration</label>
                      <div className="flex gap-3">
                        {[7, 14, 30].map(dur => (
                          <button
                            key={dur}
                            onClick={() => setSelectedDuration(dur as 7 | 14 | 30)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${
                              selectedDuration === dur
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {dur} days
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-bold text-gray-300 mb-3 block">Invite Friends</label>
                      <div className="flex gap-3">
                        {['Priya M.', 'Rahul V.', 'Ananya S.'].map(name => (
                          <div key={name} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">{name[0]}</div>
                            <span className="text-xs text-gray-300">{name}</span>
                          </div>
                        ))}
                        <button className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-xs text-gray-400 font-bold">
                          + More
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateChallenge}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <FiZap /> Create &amp; Invite Friends
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
