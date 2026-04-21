'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiClock, FiTrendingUp, FiStar, FiZap, FiHeart, FiMoon, FiCoffee, FiAward, FiCheckCircle } from 'react-icons/fi';

interface DailyMission {
  id: string;
  name: string;
  type: 'fitness' | 'mental' | 'nutrition' | 'sleep';
  target: string;
  progress: number;
  completed: boolean;
  reward: number;
  icon: string;
}

export default function WellnessPage() {
  const [missions] = useState<DailyMission[]>([
    { id: '1', name: 'Morning Walk', type: 'fitness', target: '30 min', progress: 25, completed: false, reward: 50, icon: '🚶' },
    { id: '2', name: 'Meditation', type: 'mental', target: '15 min', progress: 15, completed: true, reward: 30, icon: '🧘' },
    { id: '3', name: 'Drink Water', type: 'nutrition', target: '8 glasses', progress: 6, completed: false, reward: 20, icon: '💧' },
    { id: '4', name: 'Sleep Early', type: 'sleep', target: '10 PM', progress: 0, completed: false, reward: 40, icon: '😴' },
    { id: '5', name: 'Healthy Breakfast', type: 'nutrition', target: '1 meal', progress: 1, completed: true, reward: 25, icon: '🥗' },
    { id: '6', name: 'Gratitude Journal', type: 'mental', target: '3 entries', progress: 0, completed: false, reward: 35, icon: '📝' },
  ]);

  const [streak, setStreak] = useState(12);
  const [points, setPoints] = useState(2450);
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <FiActivity className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Wellness & Diet</h1>
                <p className="text-amber-200">Daily Health Missions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-200 text-sm">Streak</p>
              <p className="text-3xl font-black flex items-center gap-1">
                🔥 {streak}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{completedCount}/{missions.length}</p>
              <p className="text-xs text-amber-200">Completed</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{points}</p>
              <p className="text-xs text-amber-200">Points</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-yellow-300">★ 4.8</p>
              <p className="text-xs text-amber-200">Level</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-black/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${(completedCount / missions.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-amber-200">
            {completedCount === missions.length ? 'All complete! 🎉' : `${missions.length - completedCount} missions remaining`}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 space-y-6">
        {/* AI Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold">AI Health Recommendations</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <FiZap className="text-blue-500 mt-0.5" />
              <p>Based on your sleep data, try going to bed 30 mins earlier for better recovery.</p>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <FiCoffee className="text-green-500 mt-0.5" />
              <p>Your water intake is good! Keep staying hydrated throughout the day.</p>
            </div>
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
              <FiHeart className="text-purple-500 mt-0.5" />
              <p>Heart rate variability is improving. Great job on the meditation practice!</p>
            </div>
          </div>
        </div>

        {/* Missions */}
        <div>
          <h2 className="font-bold text-lg mb-4">Today's Missions</h2>
          <div className="space-y-3">
            {missions.map(mission => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-sm p-4 border-2 ${
                  mission.completed ? 'border-emerald-500 bg-emerald-50' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                    {mission.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{mission.name}</h4>
                      {mission.completed && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FiCheckCircle size={10} /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">Target: {mission.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">+{mission.reward} pts</p>
                  </div>
                </div>
                {!mission.completed && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: mission.progress > 0 ? '50%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiAward className="text-amber-500" /> Achievements
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '🔥', name: '7 Day Streak', earned: true },
              { icon: '💧', name: 'Hydration Hero', earned: true },
              { icon: '🧘', name: 'Zen Master', earned: false },
              { icon: '🏃', name: 'Marathon', earned: false },
              { icon: '😴', name: 'Sleep Well', earned: true },
              { icon: '🥗', name: 'Clean Eat', earned: false },
              { icon: '❤️', name: 'Heart Hero', earned: true },
              { icon: '⭐', name: 'Wellness Pro', earned: false },
            ].map((badge, i) => (
              <div key={i} className={`p-3 rounded-xl text-center ${badge.earned ? 'bg-amber-100' : 'bg-slate-100 opacity-50'}`}>
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-[10px] font-medium mt-1">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}