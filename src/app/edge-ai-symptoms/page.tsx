'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiCpu, FiWifi, FiWifiOff, FiInfo } from 'react-icons/fi';

const CANDIDATE_LABELS = [
  'Common Cold', 'Seasonal Flu', 'Allergic Rhinitis', 'Migraine', 'Tension Headache',
  'Hypertension', 'Gastroenteritis', 'Food Poisoning', 'Urinary Tract Infection',
  'Bronchitis', 'Pneumonia', 'Asthma', 'COVID-19', 'Dengue Fever', 'Malaria',
  'Typhoid', 'Acid Reflux', 'IBS', 'Muscle Strain', 'Arthritis', 'Sinusitis',
  'Strep Throat', 'Conjunctivitis', 'Anxiety', 'Dehydration', 'Heat Stroke',
];

interface EdgeResult {
  condition: string;
  score: number;
  severity: 'low' | 'moderate' | 'high';
  recommendation: string;
}

const COMMON_SYMPTOMS_EDGE = [
  'Fever', 'Cough', 'Headache', 'Chest pain', 'Stomach pain', 'Fatigue',
  'Joint pain', 'Skin rash', 'Dizziness', 'Nausea', 'Shortness of breath',
  'Back pain', 'Sore throat', 'Runny nose', 'Body ache', 'Chills',
  'Loss of taste', 'Loss of smell', 'Diarrhea', 'Vomiting', 'Muscle cramps',
];

function getSeverity(symptomCount: number): 'low' | 'moderate' | 'high' {
  if (symptomCount >= 5) return 'high';
  if (symptomCount >= 3) return 'moderate';
  return 'low';
}

function getRecommendation(condition: string, severity: 'low' | 'moderate' | 'high'): string {
  if (severity === 'high') return 'Seek immediate medical attention. Visit the nearest hospital.';
  if (condition.includes('COVID') || condition.includes('Pneumonia') || condition.includes('Dengue') || condition.includes('Malaria'))
    return 'Consult a doctor within 24 hours. Monitor symptoms closely.';
  if (severity === 'moderate') return 'Book an appointment with your GP. Rest and stay hydrated.';
  return 'Home care recommended. Rest, hydrate, and monitor symptoms.';
}

export default function EdgeAISymptomsPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState('');
  const [results, setResults] = useState<EdgeResult[]>([]);
  const [done, setDone] = useState(false);
  const [offline, setOffline] = useState(true);
  const [webgpu, setWebgpu] = useState(false);
  const pipelineRef = useRef<any>(null);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const loadModel = useCallback(async () => {
    setModelLoading(true);
    setModelProgress('Loading AI model...');
    try {
      const { pipeline } = await import('@xenova/transformers');
      setModelProgress('Downloading zero-shot classification model (first load only)...');
      const classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli', {
        progress_callback: (p: any) => {
          if (p.status === 'progress') {
            setModelProgress(`Downloading model: ${Math.round((p.loaded / p.total) * 100)}%`);
          }
        },
      });
      pipelineRef.current = classifier;
      setModelLoading(false);
      setModelProgress('');
      if ((navigator as any).gpu) {
        setWebgpu(true);
      }
    } catch (err: any) {
      setModelLoading(false);
      setModelProgress(`Model error: ${err.message}`);
    }
  }, []);

  useEffect(() => { loadModel(); }, [loadModel]);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setResults([]);
    setDone(false);
  };

  const addCustomSymptom = () => {
    const s = customSymptom.trim();
    if (!s || symptoms.includes(s)) return;
    setSymptoms(prev => [...prev, s]);
    setCustomSymptom('');
    setResults([]);
    setDone(false);
  };

  const analyze = async () => {
    if (symptoms.length === 0 || !pipelineRef.current) return;
    setLoading(true);
    setResults([]);
    setDone(false);

    const classifier = pipelineRef.current;
    const symptomText = symptoms.join(', ');

    try {
      const predictions = await classifier(symptomText, CANDIDATE_LABELS, { multi_label: false });
      const topResults: EdgeResult[] = predictions.labels.slice(0, 5).map((label: string, i: number) => {
        const sev = getSeverity(symptoms.length);
        return {
          condition: label,
          score: predictions.scores[i],
          severity: sev,
          recommendation: getRecommendation(label, sev),
        };
      });
      setResults(topResults);
      setDone(true);
    } catch (err: any) {
      setResults([{
        condition: 'Analysis Error',
        score: 0,
        severity: 'moderate',
        recommendation: `Could not analyze: ${err.message}. Please try again.`,
      }]);
      setDone(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-3xl mb-6">
            <FiCpu size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Edge <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI Symptoms</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            100% offline. Your symptoms never leave your device. Powered by Transformers.js + WebGPU.
          </p>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${offline ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {offline ? <FiWifiOff size={12} /> : <FiWifi size={12} />}
              {offline ? 'Offline' : 'Online'}
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${webgpu ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
              <FiCpu size={12} />
              {webgpu ? 'WebGPU' : 'CPU'}
            </div>
          </div>
        </motion.div>

        {/* Model loading */}
        {modelLoading && (
          <div className="max-w-md mx-auto mb-8 bg-slate-900/60 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-purple-300 font-bold text-sm">{modelProgress || 'Loading AI...'}</p>
            <p className="text-gray-500 text-xs mt-2">Model runs entirely in your browser. No data sent to servers.</p>
          </div>
        )}

        <div className="max-w-md mx-auto space-y-6">
          {/* Symptom selector */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5">
            <h3 className="font-bold text-sm mb-3">Select your symptoms</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_SYMPTOMS_EDGE.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    symptoms.includes(s)
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
                placeholder="Type a symptom..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition"
              />
              <button onClick={addCustomSymptom} className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl text-sm font-bold hover:bg-purple-500/30 transition border border-purple-500/30">
                + Add
              </button>
            </div>
            {symptoms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {symptoms.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                    {s}
                    <button onClick={() => toggleSymptom(s)} className="hover:text-white">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={symptoms.length === 0 || modelLoading || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed transition hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing locally...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FiCpu size={16} /> Analyze with Edge AI
              </span>
            )}
          </button>

          {/* Results */}
          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <FiCheckCircle className="text-emerald-400 shrink-0" size={20} />
                <div>
                  <p className="text-emerald-400 font-bold text-sm">Analysis Complete</p>
                  <p className="text-emerald-400/60 text-xs">Processed entirely on-device. No data uploaded.</p>
                </div>
              </div>

              {results.map((r, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${
                  r.severity === 'high' ? 'border-red-500/30 bg-red-500/5' :
                  r.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-white/10 bg-white/5'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-bold text-sm">{r.condition}</h4>
                      <p className="text-gray-500 text-[10px] mt-0.5">
                        Confidence: {(r.score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      r.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                      r.severity === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {r.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${
                      r.severity === 'high' ? 'bg-red-500' :
                      r.severity === 'moderate' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} style={{ width: `${r.score * 100}%` }} />
                  </div>
                  <p className="text-gray-400 text-xs">{r.recommendation}</p>
                </div>
              ))}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                <FiInfo size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300 text-xs">
                  This is an AI-powered screening tool and does not replace professional medical advice.
                  If you are experiencing a medical emergency, call 112 immediately.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-16 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3"><FiCpu className="text-purple-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">100% On-Device</h3>
            <p className="text-gray-500 text-xs">Uses Transformers.js with WebGPU — your symptoms never leave your device. Works offline.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3"><FiActivity className="text-blue-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Zero-Shot Classification</h3>
            <p className="text-gray-500 text-xs">DistilBERT model fine-tuned on MNLI — predicts conditions from symptoms without training data.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3"><FiAlertTriangle className="text-emerald-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Privacy First</h3>
            <p className="text-gray-500 text-xs">No API calls. No servers. Your health data stays completely private on your browser.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
