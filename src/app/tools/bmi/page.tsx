'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import { FaWeight } from 'react-icons/fa';

interface BmiResult {
  value: number;
  category: string;
  color: string;
  risk: string;
}

interface BmiRecord {
  id: string;
  height: number;
  weight: number;
  bmi: number;
  category: string;
  date: string;
}

const categoryInfo: Record<string, { color: string; bg: string; risk: string }> = {
  Underweight: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', risk: 'You may be at risk of nutritional deficiencies and weakened immune system. Consider consulting a nutritionist.' },
  Normal: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', risk: 'You have a healthy body weight. Maintain your current lifestyle with balanced diet and regular exercise.' },
  Overweight: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', risk: 'You are at moderate risk for heart disease, diabetes, and other health issues. Consider a balanced diet and exercise.' },
  Obese: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', risk: 'You are at high risk for serious health conditions including heart disease, diabetes, and joint problems. Please consult a doctor.' },
};

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export default function BmiPage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<BmiResult | null>(null);
  const [history, setHistory] = useState<BmiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/health-metrics?userId=demo-user');
      if (res.ok) {
        const data = await res.json();
        const bmiRecords = (data.metrics || [])
          .filter((m: any) => m.weight && m.height)
          .map((m: any) => {
            const bmi = m.weight / ((m.height / 100) * (m.height / 100));
            return {
              id: m.id,
              height: m.height,
              weight: m.weight,
              bmi: Math.round(bmi * 10) / 10,
              category: getBmiCategory(bmi),
              date: m.date || m.createdAt,
            };
          })
          .sort((a: BmiRecord, b: BmiRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(bmiRecords);
      }
    } catch (e) {
      console.error('Failed to fetch BMI history:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const calculateBmi = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = w / ((h / 100) * (h / 100));
    const rounded = Math.round(bmi * 10) / 10;
    const category = getBmiCategory(bmi);
    const info = categoryInfo[category];

    setResult({ value: rounded, category, color: info.color, risk: info.risk });

    setSaving(true);
    try {
      await fetch('/api/health-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          height: h,
          weight: w,
          notes: `BMI: ${rounded} (${category})`,
        }),
      });
      await fetchHistory();
    } catch (e) {
      console.error('Failed to save BMI:', e);
    } finally {
      setSaving(false);
    }
  };

  const latest = history[0];
  const trend = history.length >= 2 ? history[0].bmi - history[1].bmi : 0;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-emerald-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6">
            <FaWeight size={32} className="text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">BMI Calculator</span>
          </h1>
          <p className="text-gray-400 text-lg">Calculate your Body Mass Index and track your progress over time.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <button onClick={calculateBmi} disabled={!height || !weight || saving}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl font-bold text-lg disabled:opacity-50 hover:from-teal-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : 'Calculate BMI'}
          </button>
        </motion.div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              <p className="text-sm text-gray-400 mb-2">Your BMI</p>
              <p className="text-6xl font-black mb-2">{result.value}</p>
              <p className={`text-2xl font-bold ${result.color}`}>{result.category}</p>
              {trend !== 0 && (
                <div className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm font-medium ${trend < 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  <FiTrendingUp className={trend > 0 ? '' : 'rotate-180'} />
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)} from last
                </div>
              )}
              <div className="mt-6 bg-white/5 rounded-2xl p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className="h-full w-[18.5%] bg-blue-500" />
                  <div className="h-full w-[6.5%] bg-green-500" />
                  <div className="h-full w-[5%] bg-yellow-500" />
                  <div className="h-full w-[70%] bg-red-500" />
                </div>
                <div className="mt-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"
                  style={{ marginLeft: `${Math.min((result.value / 40) * 100, 95)}%` }} />
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

        {latest && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiActivity className="text-teal-400" /> Latest Reading
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Height</p>
                <p className="text-xl font-bold text-white">{latest.height} cm</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Weight</p>
                <p className="text-xl font-bold text-white">{latest.weight} kg</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">BMI</p>
                <p className={`text-xl font-bold ${categoryInfo[latest.category]?.color || 'text-white'}`}>{latest.bmi}</p>
              </div>
            </div>
          </motion.div>
        )}

        {history.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiClock className="text-teal-400" /> BMI History
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
              {history.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${categoryInfo[record.category]?.bg || 'bg-white/10'} border flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${categoryInfo[record.category]?.color || 'text-white'}`}>{record.bmi}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{record.category}</p>
                      <p className="text-xs text-gray-400">{record.weight}kg / {record.height}cm</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {history.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-900/40 border border-white/5 rounded-2xl p-6 text-center">
            <FiClock className="text-gray-600 mx-auto mb-3" size={32} />
            <p className="text-gray-500 text-sm">No BMI history yet. Calculate your first BMI above!</p>
          </motion.div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>BMI is a screening tool. Consult your doctor for a complete health assessment.</p>
        </div>
      </div>
    </div>
  );
}
