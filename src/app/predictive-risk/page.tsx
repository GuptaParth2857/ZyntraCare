'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertCircle, FiTrendingUp, FiShield } from 'react-icons/fi';
import { FaBrain, FaChartLine } from 'react-icons/fa';

interface RiskResult {
  predictiveScore: number;
  riskLevel: string;
  diseaseRisks: { name: string; probability: number; reason: string }[];
  trajectory: string;
  insights: string[];
  recommendations: string[];
}

export default function PredictiveRiskPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || 'demo-user';
  const [form, setForm] = useState({ age: 35, bmi: 22, smoking: 'no', alcohol: 'no', stress: 'low', sleep: 7, familyHistory: 'no', exercise: 'regular' });
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const assess = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/predictive-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile: form }),
      });
      const data = await res.json();
      if (data.success) setResult(data.result);
      else setError(data.error || 'Assessment failed. Please try again.');
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const scoreColor = (s: number, l: string) =>
    l === 'very_high' ? 'from-red-500 to-orange-500' : l === 'high' ? 'from-orange-500 to-amber-500' : l === 'medium' ? 'from-amber-500 to-yellow-500' : 'from-emerald-500 to-teal-500';

  const levelLabel = (l: string) => l.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-violet-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-6">
            <FaBrain size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Predictive Risk</span>
            {' '}Assessment
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI forecasts future lifestyle-disease risk by combining your profile with longitudinal vitals trends.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FiShield className="text-indigo-400" /> Risk Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Age</label>
                  <input type="number" value={form.age} onChange={e => setForm({ ...form, age: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">BMI</label>
                  <input type="number" value={form.bmi} onChange={e => setForm({ ...form, bmi: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Smoking</label>
                  <select value={form.smoking} onChange={e => setForm({ ...form, smoking: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1">
                    <option value="no">No</option><option value="occasional">Occasional</option><option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Alcohol</label>
                  <select value={form.alcohol} onChange={e => setForm({ ...form, alcohol: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1">
                    <option value="no">No</option><option value="occasional">Occasional</option><option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Stress</label>
                  <select value={form.stress} onChange={e => setForm({ ...form, stress: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Sleep (hrs)</label>
                  <input type="number" value={form.sleep} onChange={e => setForm({ ...form, sleep: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Exercise</label>
                  <select value={form.exercise} onChange={e => setForm({ ...form, exercise: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1">
                    <option value="never">Never</option><option value="rarely">Rarely</option><option value="regular">Regular</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Family History</label>
                  <select value={form.familyHistory} onChange={e => setForm({ ...form, familyHistory: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1">
                    <option value="no">No</option><option value="partial">Partial</option><option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <button onClick={assess} disabled={loading} className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50">
                {loading ? 'Assessing future risk...' : 'Run Predictive Assessment'}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {result ? (
              <>
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
                  <h3 className="font-bold text-lg mb-3">Predictive Health Score</h3>
                  <div className="relative inline-block">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
                      <circle cx="90" cy="90" r="74" fill="none" strokeWidth="16" strokeLinecap="round"
                        strokeDasharray={`${result.predictiveScore * 4.64} ${464 - result.predictiveScore * 4.64}`}
                        className={`stroke-gradient`} transform="rotate(-90 90 90)"
                        style={{ stroke: result.predictiveScore >= 60 ? '#f87171' : result.predictiveScore >= 35 ? '#fbbf24' : '#34d399' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black">{result.predictiveScore}</span>
                      <span className="text-xs text-gray-500">/ 100</span>
                    </div>
                  </div>
                  <p className={`mt-2 font-bold bg-gradient-to-r bg-clip-text text-transparent ${scoreColor(result.predictiveScore, result.riskLevel)}`}>
                    {levelLabel(result.riskLevel)} risk
                  </p>
                  <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1 capitalize"><FiTrendingUp /> Trajectory: {result.trajectory}</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><FiAlertCircle className="text-orange-400" /> Disease Risk Forecast</h3>
                  <div className="space-y-3">
                    {result.diseaseRisks.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-xs text-gray-500">{d.reason}</p>
                        </div>
                        <span className="text-sm font-bold">{d.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><FaChartLine className="text-indigo-400" /> Insights</h3>
                  <ul className="space-y-2">
                    {result.insights.map((ins, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-indigo-400 mt-1">•</span>{ins}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <FiActivity size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Complete your risk profile to forecast future health risks</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
