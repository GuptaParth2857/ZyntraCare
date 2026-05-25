'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiCheck, FiClock, FiBell, FiActivity, FiHeart, FiCoffee, FiMoon, FiDroplet, FiShield, FiTrendingUp, FiTarget, FiAward } from 'react-icons/fi';

interface Vaccine {
  id: string;
  name: string;
  dueDate: string;
  status: 'completed' | 'upcoming' | 'overdue';
  ageGroup: string;
  description: string;
}

interface HealthGoal {
  id: string;
  name: string;
  type: 'fitness' | 'nutrition' | 'sleep' | 'mental';
  target: string;
  current: number;
  icon: React.ReactNode;
  color: string;
  bgClass: string;
  barClass: string;
  unit: string;
}

const VACCINES: Vaccine[] = [
  { id: '1', name: 'COVID-19 Booster', dueDate: '2024-04-15', status: 'upcoming', ageGroup: 'Adults', description: 'Precautionary dose' },
  { id: '2', name: 'Influenza (Flu)', dueDate: '2024-01-01', status: 'completed', ageGroup: 'All', description: 'Annual flu shot' },
  { id: '3', name: 'Tetanus (TT)', dueDate: '2023-06-15', status: 'completed', ageGroup: 'Adults', description: 'Booster every 10 years' },
  { id: '4', name: 'Hepatitis B', dueDate: '2025-01-01', status: 'upcoming', ageGroup: 'Adults', description: '3-dose series' },
  { id: '5', name: 'Pneumonia (PCV)', dueDate: '2024-03-01', status: 'overdue', ageGroup: '65+', description: 'One-time dose' },
];

const GOAL_COLORS: Record<string, { bg: string; bar: string; glow: string }> = {
  blue:    { bg: 'bg-blue-500/10 border-blue-500/20', bar: 'bg-gradient-to-r from-blue-400 to-blue-600', glow: 'shadow-blue-500/20' },
  cyan:    { bg: 'bg-cyan-500/10 border-cyan-500/20', bar: 'bg-gradient-to-r from-cyan-400 to-cyan-600', glow: 'shadow-cyan-500/20' },
  purple:  { bg: 'bg-purple-500/10 border-purple-500/20', bar: 'bg-gradient-to-r from-purple-400 to-purple-600', glow: 'shadow-purple-500/20' },
  amber:   { bg: 'bg-amber-500/10 border-amber-500/20', bar: 'bg-gradient-to-r from-amber-400 to-amber-600', glow: 'shadow-amber-500/20' },
  red:     { bg: 'bg-red-500/10 border-red-500/20', bar: 'bg-gradient-to-r from-red-400 to-red-600', glow: 'shadow-red-500/20' },
  orange:  { bg: 'bg-orange-500/10 border-orange-500/20', bar: 'bg-gradient-to-r from-orange-400 to-orange-600', glow: 'shadow-orange-500/20' },
  emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600', glow: 'shadow-emerald-500/20' },
};

export default function HealthTrackerPage() {
  const [goals] = useState<HealthGoal[]>([
    { id: '1', name: 'Steps', type: 'fitness', target: '10000', current: 7234, icon: <FiTrendingUp size={22} />, color: 'blue', bgClass: '', barClass: '', unit: 'steps' },
    { id: '2', name: 'Water', type: 'nutrition', target: '8', current: 5, icon: <FiDroplet size={22} />, color: 'cyan', bgClass: '', barClass: '', unit: 'glasses' },
    { id: '3', name: 'Sleep', type: 'sleep', target: '8', current: 6.5, icon: <FiMoon size={22} />, color: 'purple', bgClass: '', barClass: '', unit: 'hours' },
    { id: '4', name: 'Meditation', type: 'mental', target: '15', current: 10, icon: <FiHeart size={22} />, color: 'amber', bgClass: '', barClass: '', unit: 'min' },
    { id: '5', name: 'Heart Rate', type: 'fitness', target: '100', current: 72, icon: <FiActivity size={22} />, color: 'red', bgClass: '', barClass: '', unit: 'bpm' },
    { id: '6', name: 'Calories', type: 'nutrition', target: '2000', current: 1850, icon: <FiCoffee size={22} />, color: 'orange', bgClass: '', barClass: '', unit: 'kcal' },
  ]);

  const getProgress = (goal: HealthGoal) => {
    const target = parseFloat(goal.target);
    if (goal.id === '5') return Math.min(100, (1 - goal.current / target) * 100);
    return Math.min(100, (goal.current / target) * 100);
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <FiActivity size={28} className="text-emerald-300" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Health Tracker</h1>
                <p className="text-emerald-200/80">Vaccinations & Daily Wellness Goals</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-black">{VACCINES.filter(v => v.status === 'completed').length}</p>
                <p className="text-xs text-emerald-200/70">Completed</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-black">{VACCINES.filter(v => v.status === 'upcoming').length}</p>
                <p className="text-xs text-emerald-200/70">Upcoming</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-black text-red-400">{VACCINES.filter(v => v.status === 'overdue').length}</p>
                <p className="text-xs text-emerald-200/70">Overdue</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-300">
              <FiTarget className="text-emerald-400" /> Daily Goals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal, idx) => {
                const colors = GOAL_COLORS[goal.color] || GOAL_COLORS.emerald;
                const progress = getProgress(goal);
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className={`${colors.bg} backdrop-blur-sm rounded-xl p-4 border ${colors.glow} hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.bar} text-white`}>
                          {goal.icon}
                        </div>
                        <span className="font-semibold text-white/90">{goal.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.bar.replace('from-', 'text-').split(' ')[0].replace('bg-gradient-to-r ', '')}`}>
                        {goal.type}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2.5 mb-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.2 + 0.05 * idx, ease: 'easeOut' }}
                        className={`h-full rounded-full ${colors.bar}`}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-white/60">{goal.current} / {goal.target} {goal.unit}</p>
                      <span className={`text-xs font-medium ${progress >= 80 ? 'text-emerald-400' : progress >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-300">
              <FiShield className="text-emerald-400" /> Vaccination Records
            </h2>
            <div className="space-y-3">
              {VACCINES.map((vaccine, idx) => (
                <motion.div
                  key={vaccine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className={`backdrop-blur-sm rounded-xl p-4 border-l-4 ${
                    vaccine.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500'
                      : vaccine.status === 'upcoming'
                      ? 'bg-blue-500/5 border-blue-500'
                      : 'bg-red-500/5 border-red-500'
                  } hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white/90">{vaccine.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          vaccine.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : vaccine.status === 'upcoming'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {vaccine.status === 'completed' && <FiCheck size={12} className="inline mr-1" />}
                          {vaccine.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/50">{vaccine.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white/80">{vaccine.dueDate}</p>
                      <p className="text-xs text-white/40">{vaccine.ageGroup}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-300">
              <FiBell className="text-emerald-400" /> Upcoming Reminders
            </h2>
            <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
              {[
                { title: 'COVID-19 Booster', time: 'in 5 days', icon: <FiShield size={18} />, color: 'text-blue-400' },
                { title: 'Annual Flu Shot', time: 'in 2 weeks', icon: <FiCalendar size={18} />, color: 'text-amber-400' },
                { title: 'Health Checkup', time: 'in 1 month', icon: <FiClock size={18} />, color: 'text-emerald-400' },
              ].map((reminder, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center ${reminder.color}`}>
                      {reminder.icon}
                    </div>
                    <span className="font-medium text-white/80">{reminder.title}</span>
                  </div>
                  <span className="text-sm text-white/50 bg-white/5 px-3 py-1 rounded-full">{reminder.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
