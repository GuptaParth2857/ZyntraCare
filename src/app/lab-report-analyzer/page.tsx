'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiActivity, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { FaFlask, FaStethoscope } from 'react-icons/fa';

interface Param { name: string; label: string; value: string; unit: string; }
interface Analysis {
  overall: string;
  summary: string;
  flags: string[];
  recommendations: string[];
  analyzed: (Param & { status: string; range: string })[];
}

const COMMON_TESTS: Record<string, string> = {
  hemoglobin: 'Hemoglobin (g/dL)',
  fastingGlucose: 'Fasting Glucose (mg/dL)',
  hba1c: 'HbA1c (%)',
  totalCholesterol: 'Total Cholesterol (mg/dL)',
  ldl: 'LDL Cholesterol (mg/dL)',
  hdl: 'HDL Cholesterol (mg/dL)',
  triglycerides: 'Triglycerides (mg/dL)',
  wbcCount: 'WBC Count (thousand/µL)',
  rbcCount: 'RBC Count (million/µL)',
  platelets: 'Platelets (thousand/µL)',
  creatinine: 'Creatinine (mg/dL)',
  bun: 'BUN (mg/dL)',
  alt: 'ALT (U/L)',
  ast: 'AST (U/L)',
  tsh: 'TSH (µIU/mL)',
};

export default function LabReportAnalyzerPage() {
  const [parameters, setParameters] = useState<Param[]>([
    { name: 'hemoglobin', label: COMMON_TESTS.hemoglobin, value: '', unit: 'g/dL' },
    { name: 'fastingGlucose', label: COMMON_TESTS.fastingGlucose, value: '', unit: 'mg/dL' },
    { name: 'totalCholesterol', label: COMMON_TESTS.totalCholesterol, value: '', unit: 'mg/dL' },
  ]);
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addParam = () => {
    const emptyKey = Object.keys(COMMON_TESTS).find(k => !parameters.some(p => p.name === k));
    if (!emptyKey) return;
    setParameters([...parameters, { name: emptyKey, label: COMMON_TESTS[emptyKey], value: '', unit: '' }]);
  };

  const changeParam = (idx: number, key: keyof Param, val: string) => {
    const next = [...parameters];
    next[idx] = { ...next[idx], [key]: val };
    if (key === 'name') {
      next[idx].label = COMMON_TESTS[val] || next[idx].label;
      next[idx].unit = '';
    }
    setParameters(next);
  };

  const analyze = async () => {
    setLoading(true);
    setError('');
    const filled = parameters.filter(p => p.value.trim() !== '');
    if (filled.length === 0) {
      setError('Enter at least one lab value to analyze.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/lab-report-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: filled }),
      });
      const data = await res.json();
      if (data.success) setResult(data.result);
      else setError(data.error || 'Analysis failed. Please try again.');
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const statusStyle = (s: string) =>
    s === 'high' ? 'text-red-400 bg-red-500/20 border-red-500/30' :
    s === 'low' ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' :
    s === 'normal' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
    'text-gray-400 bg-gray-500/20 border-gray-500/30';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-teal-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FaFlask size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">AI Lab Report</span>
            {' '}Analyzer
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Enter lab report values to flag abnormal results, get a plain-language summary, and actionable recommendations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaStethoscope className="text-cyan-400" /> Lab Parameters</h2>
            <div className="space-y-3">
              {parameters.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={p.name}
                    onChange={(e) => changeParam(idx, 'name', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                  >
                    {Object.entries(COMMON_TESTS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="value"
                    value={p.value}
                    onChange={(e) => changeParam(idx, 'value', e.target.value)}
                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                  />
                  <button onClick={() => setParameters(parameters.filter((_, i) => i !== idx))} className="p-2 text-gray-500 hover:text-red-400" title="Remove">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addParam} className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
              <FiPlus /> Add parameter
            </button>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mt-4">{error}</div>}

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Report'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {result ? (
              <>
                <div className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 ${result.overall === 'normal' ? 'border-emerald-500/30' : result.overall === 'warning' ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.overall === 'normal' ? <FiCheckCircle className="text-emerald-400" /> : <FiAlertCircle className={result.overall === 'warning' ? 'text-amber-400' : 'text-red-400'} />}
                    <h3 className="font-bold capitalize">Overall: {result.overall}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{result.summary}</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold mb-3">Parameter Results</h3>
                  <div className="space-y-2">
                    {result.analyzed.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                        <span className="text-sm">{a.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-bold">{a.value} {a.unit}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyle(a.status)}`}>{a.status}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><FiInfo className="text-cyan-400" /> Recommendations</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-cyan-400 mt-1">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <FiActivity size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Enter your lab parameters to get an AI-powered analysis</p>
              </div>
            )}
          </motion.div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">⚠️ AI-assisted interpretation only. Always consult a qualified doctor for medical advice.</p>
      </div>
    </div>
  );
}
