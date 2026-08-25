'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaWeight } from 'react-icons/fa';

interface BmiResult {
  value: number;
  category: string;
  color: string;
  risk: string;
}

export default function BmiPage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<BmiResult | null>(null);

  const calculateBmi = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = w / ((h / 100) * (h / 100));
    const rounded = Math.round(bmi * 10) / 10;

    let category: string;
    let color: string;
    let risk: string;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-400';
      risk = 'You may be at risk of nutritional deficiencies and weakened immune system. Consider consulting a nutritionist.';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-400';
      risk = 'You have a healthy body weight. Maintain your current lifestyle with balanced diet and regular exercise.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-400';
      risk = 'You are at moderate risk for heart disease, diabetes, and other health issues. Consider a balanced diet and exercise.';
    } else {
      category = 'Obese';
      color = 'text-red-400';
      risk = 'You are at high risk for serious health conditions including heart disease, diabetes, and joint problems. Please consult a doctor.';
    }

    setResult({ value: rounded, category, color, risk });
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-emerald-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6">
            <FaWeight size={32} className="text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              BMI Calculator
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your Body Mass Index to assess your health category.
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
              <label className="text-sm text-gray-400 mb-2 block">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            onClick={calculateBmi}
            disabled={!height || !weight}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl font-bold text-lg disabled:opacity-50 hover:from-teal-500 hover:to-emerald-500 transition-all"
          >
            Calculate BMI
          </button>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              <p className="text-sm text-gray-400 mb-2">Your BMI</p>
              <p className="text-6xl font-black mb-2">{result.value}</p>
              <p className={`text-2xl font-bold ${result.color}`}>{result.category}</p>

              <div className="mt-6 bg-white/5 rounded-2xl p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className="h-full w-[18.5%] bg-blue-500" />
                  <div className="h-full w-[6.5%] bg-green-500" />
                  <div className="h-full w-[5%] bg-yellow-500" />
                  <div className="h-full w-[70%] bg-red-500" />
                </div>
                <div
                  className="mt-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"
                  style={{
                    marginLeft: `${
                      result.value < 18.5
                        ? `${(result.value / 40) * 100}%`
                        : result.value < 25
                        ? `${(result.value / 40) * 100}%`
                        : result.value < 30
                        ? `${(result.value / 40) * 100}%`
                        : `${Math.min((result.value / 40) * 100, 95)}%`
                    }`,
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiAlertCircle className="text-teal-400" /> Health Risk Assessment
              </h3>
              <p className="text-gray-300">{result.risk}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>BMI is a screening tool. Consult your doctor for a complete health assessment.</p>
        </div>
      </div>
    </div>
  );
}
