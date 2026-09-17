'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiShield, FiDatabase } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaHeartbeat, FaStethoscope } from 'react-icons/fa';

interface RiskFactor {
  category: string;
  score: number;
  maxScore: number;
  risk: 'low' | 'medium' | 'high';
}

interface RiskResult {
  overallRisk: string;
  overallScore: number;
  maxScore: number;
  riskPercent: number;
  factors: RiskFactor[];
  recommendations: string[];
  diseases: { name: string; probability: number; category: string }[];
}

interface HistoryItem {
  id: string;
  overallRisk: string;
  riskPercent: number;
  createdAt: string;
  diseases: { name: string; probability: number }[];
}

const RISK_BADGE: Record<string, string> = {
  low: 'text-green-400 bg-green-500/20 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  high: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  very_high: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const RISK_LABEL: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Moderate Risk',
  high: 'High Risk',
  very_high: 'Very High Risk',
};

const BAR_COLOR: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  very_high: 'bg-red-500',
};

export default function HealthRiskPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    age: 30,
    gender: 'male',
    bmi: 22,
    bloodPressure: 120,
    bloodSugar: 90,
    cholesterol: 180,
    smoking: 'no',
    alcohol: 'no',
    exercise: 'regular',
    stress: 'low',
    sleep: 7,
    diet: 'balanced',
    familyHistory: 'no'
  });

  const [result, setResult] = useState<RiskResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prefill, setPrefill] = useState<{ hasData: boolean; prefill: Record<string, number | string>; sources: Record<string, string> } | null>(null);
  const [prefillStatus, setPrefillStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  const historyQuery = useCallback(() => {
    fetch(`/api/health-risk${demoMode ? '?userId=demo-user' : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setHistory(data.history || []);
      })
      .catch(() => {});
  }, [demoMode]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch(`/api/health-risk/prefill${demoMode ? '?userId=demo-user' : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPrefill(data);
          if (data.hasData) {
            setFormData(prev => ({ ...prev, ...data.prefill }));
          }
        }
        setPrefillStatus('loaded');
      })
      .catch(() => {
        setPrefillStatus('error');
      });

    historyQuery();
  }, [isAuthenticated, demoMode, historyQuery]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/health-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setSaved(!!data.saved);
        if (data.saved) historyQuery();
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 via-transparent to-orange-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-rose-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
              Health Risk
            </span>
            {' '}Assessment
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Evidence-based screening of lifestyle disease risks from your health parameters.
          </p>
        </motion.div>

        {isAuthenticated && prefillStatus === 'loaded' && (
          <div className={`max-w-3xl mx-auto mb-6 px-4 py-3 rounded-2xl border text-sm font-bold flex items-center gap-2 ${prefill?.hasData ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/[0.03] border-white/10 text-white/40'}`}>
            {prefill?.hasData ? <FiDatabase size={16} className="flex-shrink-0" /> : <FiShield size={16} className="flex-shrink-0" />}
            {prefill?.hasData
              ? `Prefilled from your health data (${Object.keys(prefill.sources).join(', ')}) — adjust if needed.`
              : 'No saved readings found — enter your values manually.'}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaStethoscope className="text-rose-400" /> Health Parameters
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">BMI</label>
                  <input
                    type="number"
                    value={formData.bmi}
                    onChange={(e) => setFormData({...formData, bmi: parseFloat(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Blood Pressure (systolic)</label>
                  <input
                    type="number"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Blood Sugar (fasting)</label>
                  <input
                    type="number"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({...formData, bloodSugar: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    value={formData.cholesterol}
                    onChange={(e) => setFormData({...formData, cholesterol: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Smoking</label>
                  <select
                    value={formData.smoking}
                    onChange={(e) => setFormData({...formData, smoking: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="no">No</option>
                    <option value="occasional">Occasional</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Alcohol</label>
                  <select
                    value={formData.alcohol}
                    onChange={(e) => setFormData({...formData, alcohol: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="no">No</option>
                    <option value="occasional">Occasional</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Exercise</label>
                  <select
                    value={formData.exercise}
                    onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="never">Never</option>
                    <option value="rarely">Rarely</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Stress Level</label>
                  <select
                    value={formData.stress}
                    onChange={(e) => setFormData({...formData, stress: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Sleep (hours)</label>
                  <input
                    type="number"
                    value={formData.sleep}
                    onChange={(e) => setFormData({...formData, sleep: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Family History</label>
                <select
                  value={formData.familyHistory}
                  onChange={(e) => setFormData({...formData, familyHistory: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                >
                  <option value="no">No</option>
                  <option value="partial">Partial</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mt-4">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Analyzing Risks...
                </span>
              ) : 'Analyze Health Risks'}
            </button>

            {saved && result && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-bold flex items-center gap-2">
                <FiCheckCircle size={16} className="flex-shrink-0" />
                Saved to your account — see history below.
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              This is a screening estimate based on standard clinical risk rules — not a medical diagnosis. For medical advice, consult a qualified doctor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {result ? (
              <>
                <div className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 ${RISK_BADGE[result.overallRisk]}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Overall Risk Level</h3>
                    <span className={`px-4 py-2 rounded-full font-bold ${RISK_BADGE[result.overallRisk]}`}>
                      {RISK_LABEL[result.overallRisk]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${BAR_COLOR[result.overallRisk]} transition-all duration-1000`}
                        style={{ width: `${result.riskPercent}%` }}
                      />
                    </div>
                    <span className="text-2xl font-black">{result.riskPercent}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Score {result.overallScore} / {result.maxScore} across lifestyle, vitals and history.</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-rose-400" /> Factor Breakdown
                  </h3>
                  <div className="space-y-3">
                    {result.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm w-36 truncate">{factor.category}</span>
                        <div className="flex-1 mx-3 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${factor.risk === 'high' ? 'bg-orange-500' : factor.risk === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.round((factor.score / factor.maxScore) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-20 text-right">{factor.score}/{factor.maxScore}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-orange-400" /> Disease Probability
                  </h3>
                  {result.diseases.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FiCheckCircle className="text-green-400" /> No elevated disease markers detected in your inputs.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.diseases.map((disease, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-gray-300">{disease.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${disease.probability > 60 ? 'bg-red-500' : disease.probability > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${disease.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">{disease.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-green-400" /> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <FaHeartbeat size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Enter your health parameters to get a risk assessment</p>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiDatabase className="text-emerald-400" /> Previous Assessments
                </h3>
                <div className="space-y-3">
                  {history.slice(0, 6).map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                      <div className="min-w-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${RISK_BADGE[item.overallRisk]}`}>
                          {RISK_LABEL[item.overallRisk]}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">{formatDate(item.createdAt)}</span>
                        {item.diseases && item.diseases.length > 0 && (
                          <p className="text-gray-400 text-xs mt-1 truncate flex-1">
                            {item.diseases.slice(0, 3).map(d => d.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-black ml-3 whitespace-nowrap">{item.riskPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-3">Sign in to auto-fill from your health data and save your assessment history.</p>
                <Link href="/auth/signin" className="inline-block px-5 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl font-bold text-white text-sm hover:opacity-90 transition">
                  Sign In
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}