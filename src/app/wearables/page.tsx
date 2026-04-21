'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiDroplet, FiWind, FiMoon, FiZap, FiSmartphone, FiWatch, FiRefreshCw, FiBell, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

interface Vitals {
  heartRate: number;
  bloodOxygen: number;
  respiratoryRate: number;
  bodyTemperature: number;
  sleepHours: number;
  steps: number;
  calories: number;
  stressLevel: number;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

const WEARABLE_DEVICES = [
  { id: 'apple', name: 'Apple Health', icon: '🍎', connected: true },
  { id: 'fitbit', name: 'Fitbit', icon: '⌚', connected: false },
  { id: 'garmin', name: 'Garmin', icon: '🏃', connected: false },
  { id: 'google', name: 'Google Fit', icon: '📱', connected: true },
  { id: 'samsung', name: 'Samsung Health', icon: '📲', connected: false },
  { id: 'amazfit', name: 'Amazfit', icon: '⌚', connected: false },
];

export default function WearableSyncPage() {
  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 72,
    bloodOxygen: 98,
    respiratoryRate: 16,
    bodyTemperature: 98.4,
    sleepHours: 7.2,
    steps: 8432,
    calories: 1850,
    stressLevel: 35,
  });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2 minutes ago');
  const [alerts] = useState<HealthAlert[]>([
    { id: '1', type: 'success', message: 'Heart rate recovered to normal range', time: '10 min ago' },
    { id: '2', type: 'info', message: 'Goal: 10,000 steps - 85% complete', time: '1 hour ago' },
    { id: '3', type: 'warning', message: 'Elevated stress detected - Try meditation', time: '3 hours ago' },
  ]);
  const [selectedDevice, setSelectedDevice] = useState('apple');

  const syncData = () => {
    setSyncing(true);
    setTimeout(() => {
      setVitals({
        heartRate: Math.floor(65 + Math.random() * 20),
        bloodOxygen: Math.floor(95 + Math.random() * 5),
        respiratoryRate: Math.floor(14 + Math.random() * 6),
        bodyTemperature: +(97.5 + Math.random() * 2).toFixed(1),
        sleepHours: +(5 + Math.random() * 4).toFixed(1),
        steps: Math.floor(5000 + Math.random() * 8000),
        calories: Math.floor(1200 + Math.random() * 1500),
        stressLevel: Math.floor(20 + Math.random() * 40),
      });
      setLastSync('Just now');
      setSyncing(false);
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: prev.heartRate + (Math.random() > 0.5 ? 1 : -1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHeartRateStatus = () => {
    if (vitals.heartRate < 60) return { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (vitals.heartRate > 100) return { label: 'Elevated', color: 'text-red-500', bg: 'bg-red-100' };
    return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-100' };
  };

  const getStressStatus = () => {
    if (vitals.stressLevel < 30) return { label: 'Low', color: 'text-emerald-500' };
    if (vitals.stressLevel < 60) return { label: 'Moderate', color: 'text-amber-500' };
    return { label: 'High', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <FiSmartphone className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Wearable Sync</h1>
                <p className="text-cyan-300">Real-time health data from your devices</p>
              </div>
            </div>
            <button
              onClick={syncData}
              disabled={syncing}
              className="px-4 py-2 bg-cyan-500 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Last Sync */}
          <div className="text-center text-sm text-gray-400 mb-6">
            Last synced: {lastSync}
          </div>

          {/* Connected Devices */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiWatch /> Connected Devices
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {WEARABLE_DEVICES.map(device => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`p-3 rounded-xl border text-center transition ${
                    device.connected
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl block mb-1">{device.icon}</span>
                  <span className="text-xs font-medium">{device.name}</span>
                  {device.connected && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Vitals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Heart Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <FiHeart className="text-red-500 text-xl" />
                <span className={`text-xs px-2 py-1 rounded-full ${getHeartRateStatus().bg} ${getHeartRateStatus().color}`}>
                  {getHeartRateStatus().label}
                </span>
              </div>
              <p className="text-4xl font-black">{vitals.heartRate}</p>
              <p className="text-sm text-gray-400">BPM</p>
            </motion.div>

            {/* Blood Oxygen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <FiDroplet className="text-cyan-500 text-xl" />
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-700">
                  {vitals.bloodOxygen >= 95 ? 'Normal' : 'Low'}
                </span>
              </div>
              <p className="text-4xl font-black">{vitals.bloodOxygen}%</p>
              <p className="text-sm text-gray-400">SpO2</p>
            </motion.div>

            {/* Sleep */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <FiMoon className="text-purple-500 text-xl" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  vitals.sleepHours >= 7 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {vitals.sleepHours >= 7 ? 'Good' : 'Low'}
                </span>
              </div>
              <p className="text-4xl font-black">{vitals.sleepHours}h</p>
              <p className="text-sm text-gray-400">Sleep</p>
            </motion.div>

            {/* Stress */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <FiZap className="text-amber-500 text-xl" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  vitals.stressLevel < 40 ? 'bg-emerald-100 text-emerald-700' :
                  vitals.stressLevel < 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {getStressStatus().label}
                </span>
              </div>
              <p className="text-4xl font-black">{vitals.stressLevel}%</p>
              <p className="text-sm text-gray-400">Stress</p>
            </motion.div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Steps Today</span>
                <span className="text-emerald-400 text-sm">
                  {vitals.steps >= 10000 ? 'Goal met!' : `${10000 - vitals.steps} to go`}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (vitals.steps / 10000) * 100)}%` }}
                />
              </div>
              <p className="text-2xl font-black">{vitals.steps.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Calories Burned</span>
              </div>
              <p className="text-2xl font-black">{vitals.calories}</p>
              <p className="text-sm text-gray-400">kcal today</p>
            </div>
          </div>

          {/* Health Alerts */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiBell /> Health Insights
            </h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl flex items-start gap-3 ${
                    alert.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                    alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-blue-500/10 border border-blue-500/30'
                  }`}
                >
                  {alert.type === 'success' ? (
                    <FiCheckCircle className="text-emerald-400 mt-0.5" />
                  ) : alert.type === 'warning' ? (
                    <FiAlertTriangle className="text-amber-400 mt-0.5" />
                  ) : (
                    <FiActivity className="text-blue-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              🤖 AI Recommendations
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Your heart rate variability is improving. Keep up the meditation practice!</p>
              <p>• You're 15% short of your daily step goal. A 15-minute walk would help.</p>
              <p>• Sleep quality has been good this week. Maintain your bedtime routine.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}