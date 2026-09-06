'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiShoppingCart, FiPackage, FiTrendingUp, FiZap, FiBell, FiRefreshCw } from 'react-icons/fi';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  remainingDoses: number;
  totalDoses: number;
  adherenceRate: number;
  autoReorder: boolean;
  reorderThreshold: number;
  stockLevel: number;
  nextRefill: string;
}

interface AdherenceHistory {
  week: string;
  adherenceRate: number;
  taken: number;
  missed: number;
}

interface InteractionAlert {
  id: string;
  medicineA: string;
  medicineB: string;
  severity: 'severe' | 'moderate' | 'mild';
  message: string;
}

export default function MedicationAdherencePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<AdherenceHistory[]>([]);
  const [interactions, setInteractions] = useState<InteractionAlert[]>([]);
  const [overallScore, setOverallScore] = useState(92);
  const [streak, setStreak] = useState(15);
  const [alertLevel, setAlertLevel] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    setMedicines([
      {
        id: '1', name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily',
        times: ['08:00', '20:00'], startDate: '2026-06-01', endDate: '2026-12-01',
        remainingDoses: 42, totalDoses: 60, adherenceRate: 95, autoReorder: true,
        reorderThreshold: 15, stockLevel: 42, nextRefill: 'In 12 days',
      },
      {
        id: '2', name: 'Atorvastatin 10mg', dosage: '1 tablet', frequency: 'Once daily at night',
        times: ['21:00'], startDate: '2026-05-01', endDate: '2027-05-01',
        remainingDoses: 88, totalDoses: 90, adherenceRate: 97, autoReorder: true,
        reorderThreshold: 10, stockLevel: 88, nextRefill: 'In 28 days',
      },
      {
        id: '3', name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily morning',
        times: ['07:00'], startDate: '2026-07-01', endDate: '2026-10-01',
        remainingDoses: 35, totalDoses: 45, adherenceRate: 88, autoReorder: false,
        reorderThreshold: 10, stockLevel: 35, nextRefill: 'In 8 days',
      },
      {
        id: '4', name: 'Vitamin D3 60K', dosage: '1 capsule', frequency: 'Weekly',
        times: ['09:00'], startDate: '2026-08-01', endDate: '2027-02-01',
        remainingDoses: 18, totalDoses: 26, adherenceRate: 90, autoReorder: true,
        reorderThreshold: 5, stockLevel: 18, nextRefill: 'In 32 days',
      },
    ]);

    setHistory([
      { week: 'Week 1', adherenceRate: 92, taken: 23, missed: 2 },
      { week: 'Week 2', adherenceRate: 96, taken: 24, missed: 1 },
      { week: 'Week 3', adherenceRate: 88, taken: 22, missed: 3 },
      { week: 'Week 4', adherenceRate: 95, taken: 24, missed: 1 },
      { week: 'Week 5', adherenceRate: 90, taken: 23, missed: 2 },
      { week: 'Week 6', adherenceRate: 94, taken: 24, missed: 1 },
    ]);

    setInteractions([
      {
        id: '1', medicineA: 'Metformin 500mg', medicineB: 'Atorvastatin 10mg',
        severity: 'moderate',
        message: 'Potential moderate interaction. Monitor blood sugar levels closely.',
      },
      {
        id: '2', medicineA: 'Vitamin D3 60K', medicineB: 'Amlodipine 5mg',
        severity: 'mild',
        message: 'Minor interaction. No significant clinical concern detected.',
      },
    ]);
  }, []);

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 80) return '#f59e0b';
    return '#ef4444';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <FiAlertTriangle className="text-red-400" />;
      case 'moderate': return <FiClock className="text-amber-400" />;
      default: return <FiCheckCircle className="text-emerald-400" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'moderate': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
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
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Medication Management</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track adherence, detect interactions, auto-reorder refills, and build healthy medication habits.
          </p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Overall Adherence Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="65%" outerRadius="90%" data={[{ value: overallScore }]} startAngle={0} endAngle={360}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} fill={getAdherenceColor(overallScore)} cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: getAdherenceColor(overallScore) }}>{overallScore}%</span>
                  <span className="text-[10px] text-gray-500">Adherence</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Overall Adherence Score</h3>
              <p className="text-xs text-gray-400 mb-3">Last 30 days</p>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                overallScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {overallScore >= 90 ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}
              </div>
            </div>
          </motion.div>

          {/* Today's Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiZap className="text-amber-400" /> Today's Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Doses Taken</p>
                    <p className="text-xs text-gray-400">12 of 13 scheduled</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FiAlertTriangle className="text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Missed Doses</p>
                    <p className="text-xs text-gray-400">1 missed today</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold">-8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Current Streak</p>
                    <p className="text-xs text-gray-400">{streak} days</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">{streak}d</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FiBell className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Next Dose</p>
                    <p className="text-xs text-gray-400">Metformin at 8:00 PM</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">2h</span>
              </div>
            </div>
          </motion.div>

          {/* Auto-Reorder Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiShoppingCart className="text-sky-400" /> Auto-Reorder Updates
            </h3>
            <div className="space-y-3">
              {medicines.filter(m => m.autoReorder && m.stockLevel <= m.reorderThreshold + 5).map(med => (
                <div key={med.id} className="flex items-center gap-3 p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl">
                  <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                    <FiPackage className="text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{med.name}</p>
                    <p className="text-xs text-gray-400">{med.remainingDoses} doses left · {med.nextRefill}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-400 transition">
                    Reorder
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <FiRefreshCw className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Auto-Reorder Active</p>
                  <p className="text-xs text-gray-400">Low stock detected · Reorder in progress</p>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">ON</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Medicine List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiPackage className="text-emerald-400" /> Your Medications
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Medicine</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Dosage</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Frequency</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Adherence</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Stock</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-medium">Auto-Reorder</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {medicines.map(med => (
                  <tr key={med.id} className="border-b border-white/5">
                    <td className="py-4 font-bold text-white">{med.name}</td>
                    <td className="py-4 text-gray-400">{med.dosage}</td>
                    <td className="py-4 text-gray-400">{med.frequency}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${med.adherenceRate}%`, backgroundColor: getAdherenceColor(med.adherenceRate) }} />
                        </div>
                        <span className="font-bold" style={{ color: getAdherenceColor(med.adherenceRate) }}>{med.adherenceRate}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">{med.remainingDoses} doses</td>
                    <td className="py-4">
                      <button className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        med.autoReorder ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        {med.autoReorder ? 'Active' : 'Off'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Adherence Trend */}
          <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" /> Adherence Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="#888" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="adherenceRate" name="Adherence %" stroke="#10b981" fill="rgba(16,185,129,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interaction Alerts */}
          <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-400" /> Drug Interaction Alerts
            </h3>
            <div className="space-y-3">
              {interactions.map(interaction => (
                <div key={interaction.id} className={`p-4 rounded-xl border ${getAlertColor(interaction.severity)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getAlertIcon(interaction.severity)}
                    <div>
                      <p className="font-bold text-sm">
                        {interaction.medicineA} + {interaction.medicineB}
                      </p>
                      <p className="text-xs opacity-70">{interaction.severity.toUpperCase()} INTERACTION</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{interaction.message}</p>
                </div>
              ))}
              {interactions.length === 0 && (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <FiCheckCircle className="text-emerald-400 mx-auto mb-2" size={28} />
                  <p className="text-gray-400 text-sm">No interactions detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Link href="/medicine-reminder" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
            <div className="text-4xl mb-3">💊</div>
            <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">Medicine Reminders</h3>
            <p className="text-sm text-gray-400">Set up reminders and never miss a dose</p>
          </Link>
          <Link href="/medicine-interactions" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">Interaction Checker</h3>
            <p className="text-sm text-gray-400">Check drug interactions before taking</p>
          </Link>
          <Link href="/rewards" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition group">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-white group-hover:text-emerald-400 transition mb-1">Earn Rewards</h3>
            <p className="text-sm text-gray-400">Earn health coins for consistent medication</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
