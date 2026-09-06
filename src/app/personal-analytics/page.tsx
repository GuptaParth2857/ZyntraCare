'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiTarget, FiHeart, FiActivity, FiZap, FiAlertCircle, FiSun, FiMoon, FiClock } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';

interface PersonalHealthData {
  date: string;
  sleep: number;
  steps: number;
  heartRate: number;
  bp: number;
  weight: number;
  energy: number;
}

interface ComparativeData {
  metric: string;
  yours: number;
  average: number;
  optimal: number;
  unit: string;
}

interface Insight {
  id: string;
  category: 'heart' | 'sleep' | 'activity' | 'nutrition' | 'stress' | 'risk';
  title: string;
  description: string;
  severity: 'positive' | 'warning' | 'critical' | 'info';
  recommendation: string;
}

export default function AdvancedAnalyticsPage() {
  const [personalData, setPersonalData] = useState<PersonalHealthData[]>([]);
  const [comparativeData, setComparativeData] = useState<ComparativeData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [ageGroup, setAgeGroup] = useState('25-34');
  const [gender, setGender] = useState('male');
  const [region, setRegion] = useState('north');

  useEffect(() => {
    setPersonalData([
      { date: 'Week 1', sleep: 7.2, steps: 7800, heartRate: 72, bp: 120, weight: 68, energy: 7 },
      { date: 'Week 2', sleep: 6.8, steps: 10200, heartRate: 74, bp: 118, weight: 67.5, energy: 6 },
      { date: 'Week 3', sleep: 7.5, steps: 9500, heartRate: 70, bp: 122, weight: 68, energy: 8 },
      { date: 'Week 4', sleep: 6.5, steps: 8900, heartRate: 76, bp: 121, weight: 67.2, energy: 5 },
      { date: 'Week 5', sleep: 7.8, steps: 11500, heartRate: 68, bp: 117, weight: 66.5, energy: 9 },
      { date: 'Week 6', sleep: 7.1, steps: 9900, heartRate: 71, bp: 119, weight: 66.8, energy: 7 },
    ]);

    setComparativeData([
      { metric: 'Sleep (hrs)', yours: 7.1, average: 6.5, optimal: 8, unit: 'hrs' },
      { metric: 'Steps', yours: 9900, average: 7200, optimal: 10000, unit: '' },
      { metric: 'Heart Rate', yours: 71, average: 75, optimal: 65, unit: 'bpm' },
      { metric: 'Blood Pressure', yours: 119, average: 126, optimal: 115, unit: 'mmHg' },
      { metric: 'Energy Level', yours: 7, average: 6.2, optimal: 9, unit: '/10' },
    ]);

    setInsights([
      {
        id: '1',
        category: 'sleep',
        title: 'Sleep Optimization Opportunity',
        description: 'Your sleep duration is above average but you have been getting inconsistent sleep. Your Sunday sleep averages 5.5 hours.',
        severity: 'warning',
        recommendation: 'Try to maintain a consistent sleep schedule, especially on weekends. Aim for 7-8 hours nightly.',
      },
      {
        id: '2',
        category: 'activity',
        title: 'Activity Level Trending Up',
        description: 'Your step count has increased by 27% over the past 6 weeks. You are 38% more active than the average person in your demographic.',
        severity: 'positive',
        recommendation: 'Keep up the great momentum. Consider adding strength training 2-3 times per week.',
      },
      {
        id: '3',
        category: 'heart',
        title: 'Heart Rate Within Optimal Range',
        description: 'Your resting heart rate of 71 bpm is in the healthy range for your age group. Your BP is trending slightly lower, which is positive.',
        severity: 'info',
        recommendation: 'Continue regular cardiovascular exercise to maintain heart health.',
      },
      {
        id: '4',
        category: 'stress',
        title: 'Possible Stress Indicators',
        description: 'Your heart rate variability and energy scores show patterns consistent with elevated stress levels during week 4.',
        severity: 'critical',
        recommendation: 'Practice mindfulness breathing exercises daily. Consider meditation sessions to reduce stress.',
      },
      {
        id: '5',
        category: 'risk',
        title: 'Low Risk Profile',
        description: 'Based on your health metrics, you have a lower-than-average risk for cardiovascular issues compared to your demographic.',
        severity: 'positive',
        recommendation: 'Maintain your current lifestyle habits and continue annual health checkups.',
      },
    ]);
  }, []);

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'heart': return <FiHeart />;
      case 'sleep': return <FiMoon />;
      case 'activity': return <FiActivity />;
      case 'stress': return <FiAlertCircle />;
      case 'risk': return <FiTarget />;
      default: return <FiTrendingUp />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
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
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FiTrendingUp size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Health Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Personal AI insights, compsmanship with your demographic, and predictive health trends.
          </p>
        </motion.div>

        {/* Demographic Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiUsers className="text-cyan-400" /> Comparative Demographics
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="18-24">18-24 years</option>
                <option value="25-34">25-34 years</option>
                <option value="35-44">35-44 years</option>
                <option value="45-54">45-54 years</option>
                <option value="55+">55+ years</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="north">North India</option>
                <option value="south">South India</option>
                <option value="east">East India</option>
                <option value="west">West India</option>
                <option value="central">Central India</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Personal Health Trends */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiActivity className="text-cyan-400" /> Sleep & Activity Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={personalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="sleep" name="Sleep (hrs)" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="energy" name="Energy" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiHeart className="text-cyan-400" /> Heart & Weight Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={personalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#ef4444" fill="rgba(239,68,68,0.1)" />
                <Area type="monotone" dataKey="bp" name="Blood Pressure" stroke="#f59e0b" fill="rgba(245,158,11,0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Comparative Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <FiUsers className="text-cyan-400" /> You vs. {ageGroup} {gender === 'male' ? 'Males' : gender === 'female' ? 'Females' : 'Peers'} in India
          </h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={comparativeData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="You" dataKey="yours" stroke="#06b6d4" fill="rgba(6,182,212,0.3)" />
                  <Radar name="Average" dataKey="average" stroke="#f59e0b" fill="rgba(245,158,11,0.2)" />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="space-y-3">
                {comparativeData.map((data, idx) => {
                  const diff = ((data.yours - data.average) / data.average) * 100;
                  const isPositive = diff >= 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-white">{data.metric}</p>
                        <p className="text-[10px] text-gray-500">{data.yours || data.yours === 0 ? `Your: ${data.yours} ${data.unit} | Avg: ${data.average} ${data.unit}` : 'No data'}</p>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${Math.min(100, (data.yours / (data.optimal || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{diff.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-sm text-cyan-200">
              <strong>Demographic Insight:</strong> Based on data from 128,000 users in your demographic, you're performing above average on 3/5 health metrics. Focus areas: consistent sleep and heart rate optimization.
            </p>
          </div>
        </motion.div>

        {/* Personal AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiZap className="text-amber-400" /> Personalized AI Insights
          </h3>
          <div className="space-y-4">
            {insights.map(insight => (
              <div key={insight.id} className={`p-5 rounded-2xl border ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getInsightIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{insight.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        insight.severity === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                        insight.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        insight.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{insight.description}</p>
                    <p className="text-xs mt-2 text-gray-400">
                      <strong className="text-gray-300">Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Next Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-[2rem] p-6"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiTarget className="text-cyan-400" /> Recommended Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl mb-2">😴</div>
              <h4 className="font-bold text-white text-sm mb-1">Improve Sleep</h4>
              <p className="text-xs text-gray-400">Target 8 hours of sleep. Reduce screen time 1 hour before bed.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl mb-2">🚶</div>
              <h4 className="font-bold text-white text-sm mb-1">Maintain Activity</h4>
              <p className="text-xs text-gray-400">You're on track! Aim for 10,000+ steps daily with 2 strength sessions weekly.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl mb-2">🧘</div>
              <h4 className="font-bold text-white text-sm mb-1">Stress Management</h4>
              <p className="text-xs text-gray-400">Practice 10-minute meditation to improve heart rate variability.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
