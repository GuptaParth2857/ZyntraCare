'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiStar, FiZap, FiAward, FiArrowRight } from 'react-icons/fi';
import { GiWaterDrop, GiWalk } from 'react-icons/gi';

interface Mission {
  id: string;
  title: string;
  desc: string;
  points: number;
  progress: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
}

export default function WellnessMissions() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Hydration Target',
      desc: 'Drink 2.5L of water today',
      points: 50,
      progress: 1.8,
      target: 2.5,
      unit: 'L',
      icon: <GiWaterDrop size={20} />,
      color: 'from-blue-500 to-cyan-500',
      completed: false,
    },
    {
      id: 'm2',
      title: 'Active Walk',
      desc: 'Complete your step goal',
      points: 100,
      progress: 4200,
      target: 6000,
      unit: 'steps',
      icon: <GiWalk size={20} />,
      color: 'from-emerald-500 to-teal-500',
      completed: false,
    },
    {
      id: 'm3',
      title: 'Vital Logging',
      desc: 'Log your BP and Pulse',
      points: 40,
      progress: 0,
      target: 1,
      unit: 'log',
      icon: <FiZap size={20} />,
      color: 'from-orange-500 to-red-500',
      completed: false,
    }
  ]);

  const [totalPoints, setTotalPoints] = useState(1250);
  const [showReward, setShowReward] = useState(false);

  const handleComplete = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.completed) {
        setTotalPoints(p => p + m.points);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
        return { ...m, progress: m.target, completed: true };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Stat */}
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Wellness Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalPoints}</span>
            <span className="text-blue-400 font-bold text-sm">ZyntraCoins</span>
          </div>
        </div>
        <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FiAward size={32} className="text-white" />
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missions.map((mission, idx) => {
          const pct = Math.round((mission.progress / mission.target) * 100);
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-slate-900/50 border rounded-3xl p-5 overflow-hidden group transition ${
                mission.completed ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${mission.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center text-white`}>
                  {mission.icon}
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-black">Points</span>
                  <p className="text-white font-bold">+{mission.points}</p>
                </div>
              </div>

              <h3 className="text-white font-bold mb-1">{mission.title}</h3>
              <p className="text-gray-500 text-xs mb-4">{mission.desc}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{mission.progress} / {mission.target} {mission.unit}</span>
                  <span className={mission.completed ? 'text-emerald-400' : 'text-blue-400'}>{pct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${mission.color}`}
                  />
                </div>
              </div>

              <button
                disabled={mission.completed}
                onClick={() => handleComplete(mission.id)}
                className={`w-full mt-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  mission.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {mission.completed ? (
                  <><FiCheckCircle /> Completed</>
                ) : (
                  <>Update Progress <FiArrowRight /></>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl"
          >
            <FiZap size={24} className="animate-bounce" />
            <div className="text-center">
              <p className="font-black">Mission Accomplished!</p>
              <p className="text-white/70 text-xs">ZyntraCoins added to your wallet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
