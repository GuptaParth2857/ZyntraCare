'use client';

import { useState } from 'react';
import { FiHeart, FiCalendar, FiActivity, FiClock, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiDroplet, FiShield, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal';
type PregnancyWeek = number | null;

interface PeriodLog {
  id: string;
  date: string;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
}

const cyclePhases = [
  { phase: 'period', name: 'Period', color: 'from-red-500 to-rose-500', days: 'Day 1-5', description: 'Menstruation phase' },
  { phase: 'follicular', name: 'Follicular', color: 'from-green-500 to-emerald-500', days: 'Day 6-14', description: 'Estrogen rising' },
  { phase: 'ovulation', name: 'Ovulation', color: 'from-yellow-500 to-amber-500', days: 'Day 15', description: 'Fertile window' },
  { phase: 'luteal', name: 'Luteal', color: 'from-purple-500 to-pink-500', days: 'Day 16-28', description: 'Progesterone peak' },
];

const tips = {
  period: [
    'Stay hydrated - drink 8+ glasses of water',
    'Light exercise can help reduce cramps',
    'Eat iron-rich foods like spinach and lentils',
    'Get adequate rest',
  ],
  follicular: [
    'Great time to start new fitness routines',
    'Energy levels are typically higher',
    'Focus on protein-rich diet',
  ],
  ovulation: [
    'Stay hydrated during fertile window',
    'Track ovulation for family planning',
    'Mood swings are common',
  ],
  luteal: [
    'PMS symptoms may appear',
    'Self-care is especially important',
    'Watch for food cravings',
  ],
};

const pregnancyWeeks = [
  { week: 1, title: 'Week 1', size: 'Not pregnant yet' },
  { week: 4, title: 'Month 1', size: 'Poppy seed' },
  { week: 8, title: 'Month 2', size: 'Raspberry' },
  { week: 12, title: 'Month 3', size: 'Plum' },
  { week: 16, title: 'Month 4', size: 'Avocado' },
  { week: 20, title: 'Month 5', size: 'Banana' },
  { week: 24, title: 'Month 6', size: 'Papaya' },
  { week: 28, title: 'Month 7', size: 'Eggplant' },
  { week: 32, title: 'Month 8', size: 'Squash' },
  { week: 36, title: 'Month 9', size: 'Watermelon' },
];

export default function WomensHealthPage() {
  const [activeTab, setActiveTab] = useState<'cycle' | 'pregnancy'>('cycle');
  const [cycleDay, setCycleDay] = useState(12);
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-03-05');
  const [pregnancyWeek, setPregnancyWeek] = useState<PregnancyWeek>(12);
  const [showTipModal, setShowTipModal] = useState(false);

  const currentPhase = cyclePhases.find((_, idx) => {
    const periods = [5, 14, 15, 28];
    return cycleDay <= periods[0] ? 0 : 
           cycleDay <= periods[1] ? 1 : 
           cycleDay <= periods[2] ? 2 : 3;
  }) || cyclePhases[0];

  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
  const daysUntilPeriod = Math.ceil((nextPeriodDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl mb-6">
            <FiHeart size={32} className="text-pink-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Women's <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Health</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track your menstrual cycle, pregnancy journey, and get personalized health insights.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`px-8 py-3 rounded-2xl font-bold transition ${
              activeTab === 'cycle' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <FiCalendar className="inline mr-2" /> Period Tracker
          </button>
          <button
            onClick={() => setActiveTab('pregnancy')}
            className={`px-8 py-3 rounded-2xl font-bold transition ${
              activeTab === 'pregnancy' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <FiActivity className="inline mr-2" /> Pregnancy
          </button>
        </div>

        {activeTab === 'cycle' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 mb-6"
              >
                <div className="text-center mb-8">
                  <p className="text-gray-400 text-sm mb-2">Day {cycleDay} of {cycleLength}</p>
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${currentPhase.color} mb-4`}>
                    <FiHeart size={48} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white">{currentPhase.name} Phase</h3>
                  <p className="text-gray-400">{currentPhase.description}</p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  {cyclePhases.map((p) => (
                    <div key={p.phase} className={`flex flex-col items-center p-2 rounded-xl ${p.phase === currentPhase.phase ? 'bg-white/10' : ''}`}>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${p.color}`} />
                      <span className="text-xs mt-1 text-gray-400">{p.name}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold">Next Period In</h4>
                    <button onClick={() => setShowTipModal(true)} className="text-pink-400 text-sm hover:text-pink-300">View Tips</button>
                  </div>
                  <p className="text-5xl font-black text-white">{daysUntilPeriod > 0 ? daysUntilPeriod : 0} <span className="text-lg font-normal text-gray-400">days</span></p>
                  <p className="text-gray-400 text-sm mt-2">Expected: {nextPeriodDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              </motion.div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Log Your Cycle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Last Period Date</label>
                    <input 
                      type="date" 
                      value={lastPeriodDate}
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Cycle Length (days)</label>
                    <input 
                      type="number" 
                      value={cycleLength}
                      onChange={(e) => setCycleLength(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Current Day of Cycle</label>
                    <input 
                      type="number" 
                      value={cycleDay}
                      onChange={(e) => setCycleDay(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-bold transition">
                    Save Log
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-pink-400" /> Cycle Insights
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Average Cycle</p>
                    <p className="text-xl font-bold text-white">{cycleLength} days</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Fertile Window</p>
                    <p className="text-xl font-bold text-white">Day 10-16</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Period Length</p>
                    <p className="text-xl font-bold text-white">5 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-3">PCOD/PCOS Support</h3>
                <p className="text-gray-400 text-sm mb-4">Get personalized tips and connect with experts.</p>
                <Link href="/ai-health-coach" className="block w-full bg-pink-500 hover:bg-pink-400 text-white py-3 rounded-xl font-bold text-center transition">
                  AI Health Coach
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pregnancy' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-rose-500/20 border border-pink-500/30 rounded-[2rem] p-8 mb-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                    <FiActivity size={64} className="text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white">Week {pregnancyWeek || 12}</h3>
                  <p className="text-pink-400 font-bold">Month {Math.ceil((pregnancyWeek || 12) / 4)}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold mb-3">Baby Size</h4>
                  <p className="text-2xl font-black text-white">{pregnancyWeeks.find(w => w.week === pregnancyWeek)?.size || 'Plum'}</p>
                </div>

                <div>
                  <h4 className="font-bold mb-3">This Week's Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <FiCheckCircle className="text-emerald-400" />
                      <span className="text-sm">Facial features developing</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <FiCheckCircle className="text-emerald-400" />
                      <span className="text-sm">Reflexes forming</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <FiClock className="text-amber-400" />
                      <span className="text-sm">Fingers and toes separating</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Track Your Pregnancy</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[4, 8, 12, 16, 20, 24, 28, 32, 36].map((week) => (
                    <button
                      key={week}
                      onClick={() => setPregnancyWeek(week)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                        pregnancyWeek === week 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      Week {week}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiDroplet className="text-pink-400" /> Nutrition
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium text-white">Folic Acid</p>
                    <p className="text-xs text-gray-400">400-600 mcg daily</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium text-white">Iron</p>
                    <p className="text-xs text-gray-400">27 mg daily</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium text-white">Calcium</p>
                    <p className="text-xs text-gray-400">1000 mg daily</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/booking" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiCalendar className="text-pink-400" />
                    <span className="text-sm">Book Scan</span>
                  </Link>
                  <Link href="/telehealth" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiMessageCircle className="text-pink-400" />
                    <span className="text-sm">Consult Doctor</span>
                  </Link>
                  <Link href="/medications" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiShield className="text-pink-400" />
                    <span className="text-sm">Supplements</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
