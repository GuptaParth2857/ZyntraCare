'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheckCircle, FiClock, FiTarget, FiActivity, FiCalendar } from 'react-icons/fi';
import { FaHeartbeat, FaTint, FaLungs, FaShieldAlt } from 'react-icons/fa';

interface Goal { text: string; target: string; unit: string; }
interface ScheduleItem { day: string; time: string; task: string; }
interface CarePlan {
  id: string;
  condition: string;
  title: string;
  description: string;
  goals: Goal[];
  schedule: ScheduleItem[];
  status: string;
  startDate: string;
}

const CONDITION_META: Record<string, { icon: any; label: string; color: string }> = {
  diabetes: { icon: FaTint, label: 'Diabetes', color: 'from-blue-500 to-blue-700' },
  hypertension: { icon: FaHeartbeat, label: 'Hypertension', color: 'from-rose-500 to-red-700' },
  thyroid: { icon: FaShieldAlt, label: 'Thyroid', color: 'from-violet-500 to-purple-700' },
  cardiac: { icon: FaHeartbeat, label: 'Cardiac', color: 'from-pink-500 to-rose-700' },
  asthma: { icon: FaLungs, label: 'Asthma', color: 'from-teal-500 to-emerald-700' },
  other: { icon: FiActivity, label: 'General', color: 'from-amber-500 to-orange-700' },
};

const DEFAULT_GOALS: Record<string, Goal[]> = {
  diabetes: [{ text: 'Maintain fasting blood sugar', target: '100', unit: 'mg/dL' }, { text: 'Daily 30-min walk', target: '30', unit: 'min' }, { text: 'HbA1c control', target: '7', unit: '%' }],
  hypertension: [{ text: 'Keep systolic BP under', target: '130', unit: 'mmHg' }, { text: 'Reduce sodium intake', target: '2', unit: 'g/day' }, { text: 'Stress management sessions', target: '3', unit: '/week' }],
  thyroid: [{ text: 'Medication adherence', target: '100', unit: '%' }, { text: 'TSH check frequency', target: '3', unit: 'months' }, { text: 'Weight management', target: 'BMI 25', unit: 'BMI' }],
  cardiac: [{ text: 'Cholesterol levels', target: '180', unit: 'mg/dL' }, { text: 'Daily cardiac walking', target: '30', unit: 'min' }, { text: 'Smoke-free days', target: '7', unit: '/week' }],
  asthma: [{ text: 'Peak flow monitoring', target: '80', unit: '%' }, { text: 'Inhaler usage tracking', target: '2', unit: '/day' }, { text: 'Avoid triggers', target: '7', unit: '/week' }],
  other: [{ text: 'Regular checkup', target: '3', unit: 'months' }, { text: 'Daily physical activity', target: '30', unit: 'min' }, { text: 'Balanced diet', target: '7', unit: '/week' }],
};

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { day: 'Morning', time: '08:00', task: 'Take medications & log vitals' },
  { day: 'Noon', time: '13:00', task: 'Lunch & hydration check' },
  { day: 'Evening', time: '19:00', task: 'Walk & glucose monitoring' },
];

export default function ChronicCarePage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    condition: 'diabetes',
    title: 'Diabetes Care Plan',
    description: 'Personalized care plan for managing diabetes.',
  });

  const userId = (session?.user as any)?.id || 'demo-user';

  useEffect(() => {
    fetch(`/api/chronic-care?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.plans) {
          setPlans(data.plans.map((p: any) => ({
            ...p,
            goals: typeof p.goals === 'string' ? (p.goals ? JSON.parse(p.goals) : []) : p.goals,
            schedule: typeof p.schedule === 'string' ? (p.schedule ? JSON.parse(p.schedule) : []) : p.schedule,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleCreate = async () => {
    setError('');
    try {
      const res = await fetch('/api/chronic-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          condition: form.condition,
          title: form.title,
          description: form.description,
          goals: DEFAULT_GOALS[form.condition],
          schedule: DEFAULT_SCHEDULE,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlans(prev => [{
          ...data.plan,
          goals: DEFAULT_GOALS[data.plan.condition as string],
          schedule: DEFAULT_SCHEDULE,
        }, ...prev]);
        setShowForm(false);
      }
    } catch (err) {
      setError('Failed to create care plan');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/chronic-care?id=${id}`, { method: 'DELETE' });
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-emerald-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Chronic Care</span>
            {' '}Management
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Structured, disease-specific care plans with daily goals, monitoring schedules, and milestone tracking.
          </p>
          <button
            onClick={() => setShowForm(v => !v)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold inline-flex items-center gap-2 hover:opacity-90 transition"
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Create Care Plan'}
          </button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">New Care Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => {
                    const c = e.target.value;
                    setForm({ ...form, condition: c, title: `${CONDITION_META[c].label} Care Plan` });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                >
                  {Object.entries(CONDITION_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Plan Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  rows={3}
                />
              </div>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <button onClick={handleCreate} className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold hover:opacity-90 transition">
                Create Plan
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your care plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <FiActivity className="text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-bold">No care plans yet</p>
            <p className="text-gray-500 text-sm mt-1">Create a personalized care plan for a chronic condition</p>
          </div>
        ) : (
          <div className="space-y-6">
            {plans.map(plan => {
              const meta = CONDITION_META[plan.condition] || CONDITION_META.other;
              const Icon = meta.icon;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                        <Icon className="text-white" size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{plan.title}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <FiCalendar size={12} /> Started {plan.startDate}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {plan.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-500 hover:text-red-400 transition" title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>

                  {plan.description && <p className="text-gray-300 text-sm mb-4">{plan.description}</p>}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-blue-300"><FiTarget /> Goals</h4>
                      <div className="space-y-2">
                        {plan.goals.map((goal, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                            <span className="text-sm text-gray-300">{goal.text}</span>
                            <span className="text-sm font-bold text-blue-400">{goal.target} {goal.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-300"><FiClock /> Monitoring Schedule</h4>
                      <div className="space-y-2">
                        {plan.schedule.map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{item.task}</p>
                              <p className="text-xs text-gray-500">{item.day} • {item.time}</p>
                            </div>
                            <FiCheckCircle className="text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
