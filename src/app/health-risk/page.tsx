'use client';

import { useState } from 'react';
import { FiActivity, FiHeart, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaStethoscope, FaVirus } from 'react-icons/fa';

interface RiskResult {
  overallRisk: string;
  overallScore: number;
  maxScore: number;
  riskPercent: number;
  factors: { category: string; score: number; maxScore: number; risk: string }[];
  recommendations: string[];
  diseases: { name: string; probability: number; category: string }[];
}

export default function HealthRiskPage() {
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'very_high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Moderate Risk';
      case 'high': return 'High Risk';
      case 'very_high': return 'Very High Risk';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden font-inter pb-24 text-white">
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
            AI-powered early detection of lifestyle disease risks based on your health parameters.
          </p>
        </motion.div>

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

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl font-bold text-white hover:opacity-90 transition"
            >
              {loading ? 'Analyzing...' : 'Analyze Health Risks'}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {result ? (
              <>
                <div className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 ${getRiskColor(result.overallRisk)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Overall Risk Level</h3>
                    <span className={`px-4 py-2 rounded-full font-bold ${getRiskColor(result.overallRisk)}`}>
                      {getRiskLabel(result.overallRisk)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-1000"
                        style={{ width: `${result.riskPercent}%` }}
                      />
                    </div>
                    <span className="text-2xl font-black">{result.riskPercent}%</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-orange-400" /> Disease Probability
                  </h3>
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
                <p className="text-gray-400">Enter your health parameters to get AI-powered risk assessment</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}