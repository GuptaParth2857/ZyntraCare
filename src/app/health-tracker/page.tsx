'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiCalendar, FiCheck, FiClock, FiBell, FiActivity, FiHeart, FiCoffee, FiMoon, FiDroplet, FiShield } from 'react-icons/fi';

const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), { ssr: false });

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
  icon: string;
  color: string;
}

const VACCINES: Vaccine[] = [
  { id: '1', name: 'COVID-19 Booster', dueDate: '2024-04-15', status: 'upcoming', ageGroup: 'Adults', description: 'Precautionary dose' },
  { id: '2', name: 'Influenza (Flu)', dueDate: '2024-01-01', status: 'completed', ageGroup: 'All', description: 'Annual flu shot' },
  { id: '3', name: 'Tetanus (TT)', dueDate: '2023-06-15', status: 'completed', ageGroup: 'Adults', description: 'Booster every 10 years' },
  { id: '4', name: 'Hepatitis B', dueDate: '2025-01-01', status: 'upcoming', ageGroup: 'Adults', description: '3-dose series' },
  { id: '5', name: 'Pneumonia (PCV)', dueDate: '2024-03-01', status: 'overdue', ageGroup: '65+', description: 'One-time dose' },
];

export default function VaccinationPage() {
  const [goals] = useState<HealthGoal[]>([
    { id: '1', name: 'Steps', type: 'fitness', target: '10000', current: 7234, icon: '👟', color: 'blue' },
    { id: '2', name: 'Water', type: 'nutrition', target: '8 glasses', current: 5, icon: '💧', color: 'cyan' },
    { id: '3', name: 'Sleep', type: 'sleep', target: '8 hours', current: 6.5, icon: '😴', color: 'purple' },
    { id: '4', name: 'Meditation', type: 'mental', target: '15 min', current: 10, icon: '🧘', color: 'amber' },
    { id: '5', name: 'Heart Rate', type: 'fitness', target: '<100 bpm', current: 72, icon: '❤️', color: 'red' },
    { id: '6', name: 'Calories', type: 'nutrition', target: '2000', current: 1850, icon: '🔥', color: 'orange' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <AnimatedBackground theme="purple" />
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💉</span>
            </div>
            <div>
              <h1 className="text-3xl font-black">Health Tracker</h1>
              <p className="text-purple-200">Vaccinations & Daily Goals</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{VACCINES.filter(v => v.status === 'completed').length}</p>
              <p className="text-xs text-purple-200">Completed</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{VACCINES.filter(v => v.status === 'upcoming').length}</p>
              <p className="text-xs text-purple-200">Upcoming</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-400">{VACCINES.filter(v => v.status === 'overdue').length}</p>
              <p className="text-xs text-purple-200">Overdue</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Health Goals */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiActivity className="text-blue-500" /> Daily Goals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {goals.map(goal => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="font-medium text-slate-900">{goal.name}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full bg-${goal.color}-500`}
                    style={{ width: `${Math.min(100, (goal.current / parseInt(goal.target)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{goal.current} / {goal.target}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vaccination Records */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiShield className="text-emerald-500" /> Vaccination Records
          </h2>
          <div className="space-y-3">
            {VACCINES.map(vaccine => (
              <motion.div
                key={vaccine.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  vaccine.status === 'completed' ? 'border-emerald-500' :
                  vaccine.status === 'upcoming' ? 'border-blue-500' :
                  'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{vaccine.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        vaccine.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        vaccine.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vaccine.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{vaccine.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{vaccine.dueDate}</p>
                    <p className="text-xs text-slate-500">{vaccine.ageGroup}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiBell className="text-amber-500" /> Upcoming Reminders
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {[
              { title: 'COVID-19 Booster', time: 'in 5 days', icon: '💉' },
              { title: 'Annual Flu Shot', time: 'in 2 weeks', icon: '🤒' },
              { title: 'Health Checkup', time: 'in 1 month', icon: '🩺' },
            ].map((reminder, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{reminder.icon}</span>
                  <span className="font-medium">{reminder.title}</span>
                </div>
                <span className="text-sm text-slate-500">{reminder.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}