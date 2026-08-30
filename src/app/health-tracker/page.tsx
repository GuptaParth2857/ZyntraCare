'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiCalendar, FiCheck, FiClock, FiBell, FiActivity, FiHeart, FiCoffee, FiMoon, FiDroplet, FiShield, FiPlus, FiTrash2 } from 'react-icons/fi';

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

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  note?: string;
  createdAt: string;
}

const VACCINES: Vaccine[] = [
  { id: '1', name: 'COVID-19 Booster', dueDate: '2024-04-15', status: 'upcoming', ageGroup: 'Adults', description: 'Precautionary dose' },
  { id: '2', name: 'Influenza (Flu)', dueDate: '2024-01-01', status: 'completed', ageGroup: 'All', description: 'Annual flu shot' },
  { id: '3', name: 'Tetanus (TT)', dueDate: '2023-06-15', status: 'completed', ageGroup: 'Adults', description: 'Booster every 10 years' },
  { id: '4', name: 'Hepatitis B', dueDate: '2025-01-01', status: 'upcoming', ageGroup: 'Adults', description: '3-dose series' },
  { id: '5', name: 'Pneumonia (PCV)', dueDate: '2024-03-01', status: 'overdue', ageGroup: '65+', description: 'One-time dose' },
];

const DEFAULT_GOALS: HealthGoal[] = [
  { id: '1', name: 'Steps', type: 'fitness', target: '10000', current: 0, icon: '👟', color: 'bg-blue-500' },
  { id: '2', name: 'Water', type: 'nutrition', target: '8', current: 0, icon: '💧', color: 'bg-cyan-500' },
  { id: '3', name: 'Sleep', type: 'sleep', target: '8', current: 0, icon: '😴', color: 'bg-purple-500' },
  { id: '4', name: 'Meditation', type: 'mental', target: '15', current: 0, icon: '🧘', color: 'bg-amber-500' },
  { id: '5', name: 'Heart Rate', type: 'fitness', target: '100', current: 72, icon: '❤️', color: 'bg-red-500' },
  { id: '6', name: 'Calories', type: 'nutrition', target: '2000', current: 0, icon: '🔥', color: 'bg-orange-500' },
];

export default function VaccinationPage() {
  const [goals, setGoals] = useState<HealthGoal[]>(DEFAULT_GOALS);
  const [apiMetrics, setApiMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: 'steps', value: '', unit: 'count', note: '' });

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/health-metrics?userId=demo-user');
      const data = await res.json();
      if (data.metrics && Array.isArray(data.metrics)) {
        setApiMetrics(data.metrics);
        const stepsMetric = data.metrics.find((m: HealthMetric) => m.type === 'steps');
        const waterMetric = data.metrics.find((m: HealthMetric) => m.type === 'water');
        const sleepMetric = data.metrics.find((m: HealthMetric) => m.type === 'sleep');
        const meditationMetric = data.metrics.find((m: HealthMetric) => m.type === 'meditation');
        const caloriesMetric = data.metrics.find((m: HealthMetric) => m.type === 'calories');

        setGoals(prev => prev.map(g => {
          if (g.name === 'Steps' && stepsMetric) return { ...g, current: stepsMetric.value };
          if (g.name === 'Water' && waterMetric) return { ...g, current: waterMetric.value };
          if (g.name === 'Sleep' && sleepMetric) return { ...g, current: sleepMetric.value };
          if (g.name === 'Meditation' && meditationMetric) return { ...g, current: meditationMetric.value };
          if (g.name === 'Calories' && caloriesMetric) return { ...g, current: caloriesMetric.value };
          return g;
        }));
      }
    } catch (err) {
      console.error('Failed to fetch health metrics:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const saveMetric = async () => {
    if (!newMetric.value) return;
    try {
      await fetch('/api/health-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          type: newMetric.type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          note: newMetric.note,
        }),
      });
      setNewMetric({ type: 'steps', value: '', unit: 'count', note: '' });
      setShowAddMetric(false);
      fetchMetrics();
    } catch (err) {
      console.error('Failed to save metric:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <AnimatedBackground theme="purple" />
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FiActivity className="text-blue-500" /> Daily Goals
            </h2>
            <button
              onClick={() => setShowAddMetric(!showAddMetric)}
              className="flex items-center gap-1 text-sm bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-600 transition"
            >
              <FiPlus size={14} /> Log Metric
            </button>
          </div>

          {showAddMetric && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-violet-200"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={newMetric.type}
                  onChange={e => setNewMetric(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border rounded-lg text-sm text-slate-900"
                >
                  <option value="steps">Steps</option>
                  <option value="water">Water (glasses)</option>
                  <option value="sleep">Sleep (hours)</option>
                  <option value="meditation">Meditation (min)</option>
                  <option value="calories">Calories</option>
                  <option value="heart_rate">Heart Rate</option>
                </select>
                <input
                  type="number"
                  placeholder="Value"
                  value={newMetric.value}
                  onChange={e => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                  className="px-3 py-2 border rounded-lg text-sm text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={newMetric.note}
                  onChange={e => setNewMetric(prev => ({ ...prev, note: e.target.value }))}
                  className="px-3 py-2 border rounded-lg text-sm text-slate-900"
                />
                <button
                  onClick={saveMetric}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-semibold hover:bg-violet-600 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}

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
                    className={`h-2 rounded-full ${goal.color}`}
                    style={{ width: `${Math.min(100, (goal.current / parseInt(goal.target)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{goal.current} / {goal.target}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {apiMetrics.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiActivity className="text-emerald-500" /> Recent Logs
            </h2>
            <div className="space-y-2">
              {apiMetrics.slice(-5).reverse().map(metric => (
                <div key={metric.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-violet-500" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{metric.type}</p>
                      <p className="text-xs text-slate-500">{new Date(metric.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">{metric.value} {metric.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
