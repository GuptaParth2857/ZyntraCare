'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiUpload, FiActivity, FiHeart, FiAlertCircle, FiCheckCircle, FiEye, FiClock, FiTrash2 } from 'react-icons/fi';

interface ScanResult {
  condition: string;
  confidence: number;
  severity: 'normal' | 'warning' | 'critical';
  description: string;
}

interface ScanHistory {
  id: string;
  date: string;
  scanType: string;
  results: ScanResult[];
}

export default function AIVisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [imageError, setImageError] = useState('');
  const [scanType, setScanType] = useState<'skin' | 'xray' | 'mri' | 'retinal'>('skin');
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_scan_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file (JPG/PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image exceeds the 10MB limit.');
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResults(null);
    setAnalysisError('');

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, scanType }),
      });

      const data = await response.json();

      const rawResults: ScanResult[] | undefined = data.results;
      const hasRealFindings = Array.isArray(rawResults) && rawResults.length > 0 && rawResults.some(r => (r.confidence ?? 0) > 0);

      if (hasRealFindings) {
        setResults(rawResults);
        const historyEntry: ScanHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          scanType,
          results: rawResults,
        };
        const newHistory = [historyEntry, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('zyntracare_scan_history', JSON.stringify(newHistory));
      } else {
        setAnalysisError(data.error || 'AI analysis failed. Please try a clearer image or try again later.');
      }
    } catch (err) {
      console.error('Vision analysis failed:', err);
      setAnalysisError('AI analysis failed. Please try again later.');
    }
    setAnalyzing(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('zyntracare_scan_history');
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Vision Diagnosis</h1>
              <p className="text-violet-300">Upload medical images for AI-powered analysis</p>
            </div>
          </div>

          {/* Scan Type */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'skin', icon: '🩺', label: 'Skin & Rash' },
              { id: 'xray', icon: '🫁', label: 'X-Ray' },
              { id: 'mri', icon: '🧠', label: 'MRI Scan' },
              { id: 'retinal', icon: '👁️', label: 'Retinal Scan' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setScanType(type.id as 'skin' | 'xray' | 'mri' | 'retinal')}
                className={`flex-1 p-4 rounded-xl border text-center ${
                  scanType === type.id
                    ? 'bg-violet-500 border-violet-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-2xl block mb-1">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {scanType === 'retinal' && (
            <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
              <p className="text-sm text-violet-300 flex items-center gap-2">
                <FiEye className="flex-shrink-0" />
                Retinal scan screening for diabetic retinopathy, glaucoma, and retinal detachment
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-white/20 rounded-3xl p-12 text-center cursor-pointer hover:border-violet-500 transition"
          >
            {image ? (
              <img src={image} alt="Uploaded" className="max-h-80 mx-auto rounded-xl" />
            ) : (
              <>
                <FiUpload className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-xl font-bold">Tap to upload {scanType} image</p>
                <p className="text-gray-400 mt-2">Supports JPG, PNG up to 10MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </div>

          {imageError && (
            <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
              <FiAlertCircle /> {imageError}
            </p>
          )}

          {analysisError && (
            <p className="mt-3 text-sm text-amber-400 flex items-center gap-2">
              <FiAlertCircle /> {analysisError}
            </p>
          )}

          {image && !results && (
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="w-full mt-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Running AI analysis...
                </>
              ) : 'Run AI Analysis'}
            </button>
          )}

          {/* Results */}
          {results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FiCheckCircle className="text-emerald-400" />
                <h3 className="font-bold text-lg">Analysis Complete</h3>
              </div>
              
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    result.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : result.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{result.condition}</h4>
                    <span className="text-sm font-medium">{result.confidence}% match</span>
                  </div>
                  <p className="text-sm text-gray-300">{result.description}</p>
                </div>
              ))}

              <button
                onClick={() => { setResults(null); setImage(null); }}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-300 hover:bg-white/10 transition"
              >
                Scan Another Image
              </button>
            </motion.div>
          )}

          {/* Scan History */}
          {history.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FiClock className="text-violet-400" /> Scan History
                </h3>
                <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
                  <FiTrash2 size={12} /> Clear
                </button>
              </div>
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setResults(entry.results);
                      setScanType(entry.scanType as any);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/30 transition"
                  >
                    <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-lg">
                      {entry.scanType === 'retinal' ? '👁️' : entry.scanType === 'xray' ? '🫁' : entry.scanType === 'mri' ? '🧠' : '🩺'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm capitalize">{entry.scanType} Scan</p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        • {entry.results.length} findings
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {entry.results.slice(0, 2).map((r, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded ${
                          r.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          r.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {r.condition.slice(0, 25)}...
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-8 text-center">
            ⚠️ This is AI-assisted analysis only. Always consult a qualified doctor for medical advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
