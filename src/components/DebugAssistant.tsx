'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiCode, FiCopy, FiTerminal } from 'react-icons/fi';

interface DebugResult {
  success: boolean;
  diagnosis: string;
  causes: string[];
  solutions: string[];
  examples?: { before: string; after: string; language?: string }[];
  quickFix?: string;
  isCritical?: boolean;
}

export default function DebugAssistant() {
  const [errorInput, setErrorInput] = useState('');
  const [result, setResult] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDebug = async () => {
    if (!errorInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorMessage: errorInput })
      });
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Debug error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonErrors = [
    { label: 'TypeError', query: 'TypeError: undefined is not a function' },
    { label: 'React Child', query: 'Objects are not valid as a React child' },
    { label: 'Window Undefined', query: 'window is not defined' },
    { label: 'Hydration', query: 'Hydration failed because UI does not match server' },
    { label: 'Too Many Renders', query: 'Too many re-renders. React limits the number' },
    { label: 'Map Container', query: 'Map container is already initialized' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl px-6 py-3 mb-4">
            <FiTerminal className="text-red-400 text-2xl" />
            <span className="text-2xl font-black">ZyntraCare Debug Assistant</span>
          </div>
          <p className="text-slate-400">Paste any error message and I'll diagnose and fix it for you</p>
        </motion.div>

        {/* Error Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-6"
        >
          <label className="block text-sm font-bold text-slate-300 mb-2">
            <FiAlertTriangle className="inline mr-2 text-red-400" />
            Paste Error Message
          </label>
          <textarea
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            placeholder="Paste your error message or stack trace here..."
            className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-mono text-sm"
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-500">
              Common errors: TypeError, Hydration failed, window is not defined
            </span>
            <button
              onClick={handleDebug}
              disabled={!errorInput.trim() || loading}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                errorInput.trim() && !loading
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FiCode />
              {loading ? 'Analyzing...' : 'Debug'}
            </button>
          </div>
        </motion.div>

        {/* Quick Test Buttons */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-2">Quick test with common errors:</p>
          <div className="flex flex-wrap gap-2">
            {commonErrors.map((err) => (
              <button
                key={err.label}
                onClick={() => setErrorInput(err.query)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 transition"
              >
                {err.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Diagnosis Header */}
            <div className={`bg-slate-800/50 border rounded-2xl p-6 ${
              result.isCritical ? 'border-red-500/50' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.success ? (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FiAlertTriangle className="text-red-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                    <FiAlertTriangle className="text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {result.success ? 'Error Identified' : 'Diagnosis Complete'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {result.isCritical ? '⚠️ Critical - Fix immediately' : 'Analysis complete'}
                  </p>
                </div>
              </div>

              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-xl overflow-x-auto">
                {result.diagnosis}
              </pre>
            </div>

            {/* Causes */}
            {result.causes && result.causes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6"
              >
                <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                  ⚠️ Possible Causes
                </h3>
                <ul className="space-y-2">
                  {result.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-orange-400 font-bold">{i + 1}.</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Solutions */}
            {result.solutions && result.solutions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6"
              >
                <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <FiCheckCircle /> Solutions
                </h3>
                <ul className="space-y-2">
                  {result.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">{i + 1}.</span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Code Examples */}
            {result.examples && result.examples.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="font-bold text-sky-400 mb-4 flex items-center gap-2">
                  💻 Code Examples
                </h3>
                <div className="space-y-4">
                  {result.examples.map((ex, i) => (
                    <div key={i} className="space-y-2">
                      {ex.before && (
                        <div>
                          <p className="text-xs text-red-400 mb-1">❌ Before:</p>
                          <pre className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm overflow-x-auto">
                            <code className="text-slate-300">{ex.before}</code>
                          </pre>
                        </div>
                      )}
                      {ex.after && (
                        <div>
                          <p className="text-xs text-emerald-400 mb-1">✅ After:</p>
                          <pre className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm overflow-x-auto">
                            <code className="text-slate-300">{ex.after}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Fix */}
            {result.quickFix && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-purple-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-purple-400 flex items-center gap-2">
                    ⚡ Quick Fix
                  </h3>
                  <button
                    onClick={() => copyToClipboard(result.quickFix!)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-slate-300 flex items-center gap-1 transition"
                  >
                    <FiCopy /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-4 text-sm overflow-x-auto">
                  <code className="text-slate-300">{result.quickFix}</code>
                </pre>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Built by Team Zenvyx • Powered by Healthcare AI & Debug Intelligence
        </div>
      </div>
    </div>
  );
}