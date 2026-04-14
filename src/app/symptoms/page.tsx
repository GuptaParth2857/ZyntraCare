'use client';

import { useState } from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiSearch, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaStethoscope, FaHeartbeat, FaLungs, FaBrain, FaBone, FaAllergies } from 'react-icons/fa';

interface SymptomResult {
  symptoms: string[];
  possibleConditions: { name: string; probability: number; severity: string; category: string; recommendation: string }[];
  urgencyLevel: string;
  redFlags: string[];
  suggestedTests: string[];
}

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Chest pain', 'Stomach pain', 'Fatigue',
  'Joint pain', 'Skin rash', 'Dizziness', 'Nausea', 'Shortness of breath',
  'Back pain', 'Sore throat', 'Runny nose', 'Eye pain', 'Ear pain'
];

const BODY_AREAS = [
  { name: 'Head & Brain', icon: <FaBrain />, symptoms: ['Headache', 'Dizziness', 'Vision changes'] },
  { name: 'Heart & Chest', icon: <FaHeartbeat />, symptoms: ['Chest pain', 'Palpitations', 'Shortness of breath'] },
  { name: 'Lungs', icon: <FaLungs />, symptoms: ['Cough', 'Breathing difficulty', 'Wheezing'] },
  { name: 'Bones & Joints', icon: <FaBone />, symptoms: ['Joint pain', 'Back pain', 'Swelling'] },
  { name: 'Skin', icon: <FaAllergies />, symptoms: ['Rash', 'Itching', 'Bumps'] },
];

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('few-days');
  const [severity, setSeverity] = useState('moderate');
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: selectedSymptoms, 
          duration, 
          severity 
        })
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

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'consult-doctor': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'emergency': return '🚨 Emergency - Seek Immediate Care';
      case 'consult-doctor': return '⚠️ Consult Doctor Soon';
      default: return '✅ Self-Care - Monitor Symptoms';
    }
  };

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-blue-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6">
            <FaStethoscope size={32} className="text-teal-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
              Symptom
            </span>
            {' '}Checker
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered symptom analysis to help understand your health condition and urgency level.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiList className="text-teal-400" /> Select Your Symptoms
              </h2>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search symptoms..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {filteredSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-teal-600 text-white'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="text-sm text-teal-400">
                  Selected: {selectedSymptoms.join(', ')}
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">Additional Details</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-sm">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="few-hours">Few Hours</option>
                    <option value="few-days">Few Days</option>
                    <option value="1-week">1 Week</option>
                    <option value="2-weeks">2 Weeks</option>
                    <option value="more">More than 2 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || selectedSymptoms.length === 0}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {result ? (
              <>
                <div className={`p-6 rounded-3xl border ${getUrgencyColor(result.urgencyLevel)}`}>
                  <h3 className="text-lg font-bold mb-2">{getUrgencyLabel(result.urgencyLevel)}</h3>
                  {result.urgencyLevel === 'emergency' && (
                    <p className="text-sm mt-2">⚠️ Call emergency services or go to nearest hospital immediately.</p>
                  )}
                </div>

                {result.redFlags.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FiAlertTriangle className="text-red-400" /> Red Flag Symptoms
                    </h3>
                    <ul className="space-y-2">
                      {result.redFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-red-300">
                          <span>⚠️</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4">Possible Conditions</h3>
                  <div className="space-y-3">
                    {result.possibleConditions.map((cond, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{cond.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            cond.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            cond.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {cond.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500"
                              style={{ width: `${cond.probability}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{cond.probability}%</span>
                        </div>
                        <p className="text-xs text-gray-400">{cond.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.suggestedTests.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FiActivity className="text-blue-400" /> Suggested Tests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedTests.map((test) => (
                        <span key={test} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <FiActivity size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select your symptoms and click "Analyze" to get AI-powered health insights</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}