'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiAlertCircle, FiCalendar, FiUsers, FiHeart, FiThermometer, FiDroplet, FiShield } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface Prediction {
  day: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  action: string;
}

export default function PredictiveAnalyticsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockPredictions: Prediction[] = Array.from({ length: timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i - (timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30));
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          predicted: Math.floor(40 + Math.random() * 30),
          actual: i < 3 ? Math.floor(35 + Math.random() * 25) : undefined,
          confidence: Math.floor(85 + Math.random() * 12),
        };
      });
      
      const mockAlerts: Alert[] = [
        { id: '1', type: 'warning', message: 'Dengue cases expected to spike next week', action: 'Stock 50+ ORS packets' },
        { id: '2', type: 'critical', message: ' Oxygen demand surge predicted forWeek 3', action: 'Contact supplier now' },
        { id: '3', type: 'info', message: 'Seasonal flu expected to decrease', action: 'Normal operations' },
      ];
      
      setPredictions(mockPredictions);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1500);
  }, [timeRange]);

  const sampleData = [
    { name: 'Mon', admissions: 45, discharges: 38, emergencies: 12 },
    { name: 'Tue', admissions: 52, discharges: 45, emergencies: 15 },
    { name: 'Wed', admissions: 48, discharges: 42, emergencies: 10 },
    { name: 'Thu', admissions: 55, discharges: 48, emergencies: 18 },
    { name: 'Fri', admissions: 62, discharges: 55, emergencies: 20 },
    { name: 'Sat', admissions: 58, discharges: 50, emergencies: 16 },
    { name: 'Sun', admissions: 42, discharges: 35, emergencies: 14 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FiTrendingUp className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Predictive Analytics</h1>
              <p className="text-violet-300">Gemini-powered demand forecasting</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mb-6">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium ${
                  timeRange === range
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiUsers className="text-blue-400" />
                <span className="text-gray-400 text-sm">Avg Daily Admissions</span>
              </div>
              <p className="text-3xl font-black text-blue-400">52</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <FiTrendingUp /> +12% vs last week
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiActivity className="text-red-400" />
                <span className="text-gray-400 text-sm">Emergency Cases</span>
              </div>
              <p className="text-3xl font-black text-red-400">15</p>
              <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                <FiAlertCircle /> +5% seasonal spike
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiDroplet className="text-pink-400" />
                <span className="text-gray-400 text-sm">Bed Occupancy</span>
              </div>
              <p className="text-3xl font-black text-pink-400">78%</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <FiTrendingUp /> +3% capacity
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="text-emerald-400" />
                <span className="text-gray-400 text-sm">AI Confidence</span>
              </div>
              <p className="text-3xl font-black text-emerald-400">94%</p>
              <p className="text-xs text-gray-400 mt-1">
                Model accuracy
              </p>
            </motion.div>
          </div>

          {/* Main Prediction Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiActivity /> Patient Inflow Prediction
              </h3>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={predictions}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #333', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorPred)"
                      name="Predicted"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      name="Actual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-violet-500 rounded-full" />
                  <span className="text-gray-400">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-gray-400">Actual</span>
                </div>
              </div>
            </div>

            {/* Sidebar - Alerts & Insights */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-400" /> AI Insights
                </h3>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border ${
                        alert.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/30'
                          : alert.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">→ {alert.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FiCalendar /> Seasonal Trends
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Dengue Risk</span>
                    <span className="text-red-400 font-bold">HIGH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Flu Season</span>
                    <span className="text-amber-400 font-bold">MEDIUM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Heat-related</span>
                    <span className="text-emerald-400 font-bold">LOW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Comparison */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4">Weekly Admissions vs Discharges</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Bar dataKey="admissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Admissions" />
                <Bar dataKey="discharges" fill="#10b981" radius={[4, 4, 0, 0]} name="Discharges" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Disclaimer */}
          <p className="text-xs text-gray-500 text-center mt-8">
            ⚠️ AI predictions are for planning purposes only. Always consult official health guidelines.
          </p>
        </motion.div>
      </div>
    </div>
  );
}