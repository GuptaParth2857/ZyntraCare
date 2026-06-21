'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiAlertCircle } from 'react-icons/fi';
import { FaWater } from 'react-icons/fa';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'heavy', label: 'Heavy', desc: 'Heavy exercise 6-7 days/week' },
];

export default function WaterIntakePage() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('sedentary');
  const [result, setResult] = useState<{ liters: number; glasses: number } | null>(null);

  const calculateWater = () => {
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (!w || !a || w <= 0 || a <= 0) return;

    const baseWater = w * 0.033;
    const activityMultipliers: Record<string, number> = {
      sedentary: 1,
      light: 1.1,
      moderate: 1.2,
      heavy: 1.4,
    };
    const liters = Math.round(baseWater * activityMultipliers[activity] * 100) / 100;
    const glasses = Math.round(liters / 0.25);

    setResult({ liters, glasses });
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-cyan-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
            <FaWater size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Water Intake
            </span>
            {' '}Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your daily hydration needs based on your body and activity level.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-3 block">Activity Level</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setActivity(level.value)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    activity === level.value
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold">{level.label}</p>
                  <p className="text-xs mt-1 opacity-70">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculateWater}
            disabled={!age || !weight}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg disabled:opacity-50 hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            Calculate Water Intake
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                <p className="text-sm text-gray-400 mb-4">Your Daily Water Requirement</p>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <FiDroplet size={40} className="text-blue-400 mx-auto mb-2" />
                    <p className="text-5xl font-black text-blue-400">{result.liters}</p>
                    <p className="text-gray-400 mt-1">Liters</p>
                  </div>
                  <div className="text-4xl text-gray-600">|</div>
                  <div>
                    <FaWater size={40} className="text-cyan-400 mx-auto mb-2" />
                    <p className="text-5xl font-black text-cyan-400">{result.glasses}</p>
                    <p className="text-gray-400 mt-1">Glasses (250ml)</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 flex items-start gap-3">
                <FiAlertCircle className="text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-blue-300 text-sm">
                  This is a general guideline. Your actual water needs may vary based on climate,
                  health conditions, and pregnancy. Listen to your body and drink when thirsty.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
