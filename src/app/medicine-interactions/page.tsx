'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiShare2, FiShield, FiActivity, FiCopy, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  dosage: string;
  manufacturer: string;
  price: number;
  requiresPrescription: boolean;
}

interface Interaction {
  med1: string;
  med2: string;
  severity: 'safe' | 'mild' | 'moderate' | 'severe' | 'contraindicated';
  description: string;
  whatToWatch: string;
  alternatives: string[];
}

const SEVERITY_CONFIG = {
  safe: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: FiCheckCircle },
  mild: { label: 'Mild', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: FiInfo },
  moderate: { label: 'Moderate', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: FiAlertTriangle },
  severe: { label: 'Severe', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: FiAlertTriangle },
  contraindicated: { label: 'Contraindicated', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: FiAlertTriangle },
};

export default function MedicineInteractionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [dangerousCombinations, setDangerousCombinations] = useState<Interaction[]>([]);
  const [searchError, setSearchError] = useState('');
  const [checkError, setCheckError] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/medicine-interactions')
      .then(res => res.json())
      .then(data => setDangerousCombinations((data.dangerousCombinations || data.interactions || []).filter((i: Interaction) => i.severity === 'severe' || i.severity === 'contraindicated').slice(0, 6)))
      .catch(() => setDangerousCombinations([]));
  }, []);

  const fetchSearchResults = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    fetch(`/api/medicine-interactions?medicine=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(data => {
        const meds = (data.medicines || data.results || data || []);
        const filtered = (Array.isArray(meds) ? meds : [])
          .filter((m: MedicineInfo) => !selectedMedicines.some(s => s.id === m.id))
          .slice(0, 8);
        setSearchResults(filtered);
        setSearchError('');
      })
      .catch((err: any) => {
        setSearchResults([]);
        setSearchError(err.message || 'Failed to search medicines');
      })
      .finally(() => setSearching(false));
  }, [selectedMedicines]);

  const filteredMedicines = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  const addMedicine = (med: MedicineInfo) => {
    setSelectedMedicines(prev => [...prev, med]);
    setSearchQuery('');
    setShowResults(false);
  };

  const removeMedicine = (id: string) => {
    setSelectedMedicines(prev => prev.filter(m => m.id !== id));
    setShowResults(false);
    setInteractions([]);
  };

  const checkInteractions = () => {
    const medsParam = selectedMedicines.map(m => encodeURIComponent(m.name)).join(',');
    fetch(`/api/medicine-interactions?medicine=${medsParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to check interactions');
        return res.json();
      })
      .then(data => {
        setInteractions(data.interactions || []);
        setCheckError('');
      })
      .catch((err: any) => {
        setInteractions([]);
        setCheckError(err.message || 'Failed to check interactions');
      });
    setShowResults(true);
  };

  const getOverallSafety = () => {
    if (interactions.length === 0) return { score: 100, label: 'Excellent', color: 'text-green-400' };
    const severityScores = { safe: 100, mild: 75, moderate: 50, severe: 20, contraindicated: 0 };
    const avg = interactions.reduce((sum, i) => sum + severityScores[i.severity], 0) / interactions.length;
    if (avg >= 80) return { score: avg, label: 'Good', color: 'text-green-400' };
    if (avg >= 50) return { score: avg, label: 'Caution', color: 'text-yellow-400' };
    if (avg >= 25) return { score: avg, label: 'Warning', color: 'text-orange-400' };
    return { score: avg, label: 'Danger', color: 'text-red-400' };
  };

  const generateSummary = () => {
    const safety = getOverallSafety();
    let text = `ZyntraCare Medicine Interaction Report\n${'='.repeat(40)}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    text += `MEDICINES (${selectedMedicines.length}):\n`;
    selectedMedicines.forEach(m => { text += `• ${m.name} (${m.genericName}) - ${m.category}\n`; });
    text += `\nINTERACTIONS FOUND: ${interactions.length}\n`;
    text += `Overall Safety: ${safety.label} (${Math.round(safety.score)}%)\n\n`;
    if (interactions.length > 0) {
      interactions.forEach((inter, i) => {
        text += `${i + 1}. [${SEVERITY_CONFIG[inter.severity].label}] ${inter.med1} + ${inter.med2}\n`;
        text += `   ${inter.description}\n`;
        text += `   Watch: ${inter.whatToWatch}\n\n`;
      });
    } else {
      text += 'No significant interactions found.\n';
    }
    text += '\nDisclaimer: This is an AI-generated report. Always consult your doctor.';
    return text;
  };

  const shareWithDoctor = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const safety = showResults ? getOverallSafety() : null;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Interaction Checker</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Check for dangerous interactions between your medicines. Search from 50+ common Indian medicines.
          </p>
        </motion.div>

        {/* Search & Add */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiSearch className="text-purple-400" /> Add Medicines
          </h2>

          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setShowResults(true);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                searchTimerRef.current = setTimeout(() => fetchSearchResults(val), 300);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search by name, generic name, or category (e.g., Paracetamol, NSAID, Diabetes)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition text-lg"
            />

            <AnimatePresence>
              {(showResults && (filteredMedicines.length > 0 || searching || searchError)) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {searchError ? (
                    <div className="px-5 py-4 text-center">
                      <FiAlertCircle className="text-red-400 mx-auto mb-2" size={20} />
                      <p className="text-sm text-red-400 font-bold">Search failed</p>
                      <p className="text-xs text-gray-500 mt-1">{searchError}</p>
                      <button onClick={() => setSearchError('')} className="mt-2 text-xs text-purple-400 hover:text-purple-300">Dismiss</button>
                    </div>
                  ) : searching ? (
                    <div className="px-5 py-4 text-center">
                      <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Searching medicines...</p>
                    </div>
                  ) : filteredMedicines.map(med => (
                    <button
                      key={med.id}
                      onClick={() => addMedicine(med)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/10 transition text-left border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="font-bold">{med.name}</p>
                        <p className="text-sm text-gray-400">{med.genericName} • {med.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {med.requiresPrescription && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Rx</span>
                        )}
                        <FiPlus className="text-purple-400" size={20} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedMedicines.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">{selectedMedicines.length} medicine{selectedMedicines.length !== 1 ? 's' : ''} selected</p>
              <div className="flex flex-wrap gap-2">
                {selectedMedicines.map(med => (
                  <motion.div key={med.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2">
                    <span className="font-medium">{med.name}</span>
                    <button onClick={() => removeMedicine(med.id)} className="text-gray-400 hover:text-red-400 transition">
                      <FiX size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {selectedMedicines.length >= 2 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={checkInteractions}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition flex items-center gap-2"
                >
                  <FiShield size={18} /> Check Interactions
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {checkError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                  <FiAlertCircle className="text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 text-sm font-bold">Couldn&apos;t check interactions</p>
                    <p className="text-red-400/70 text-xs">{checkError}</p>
                  </div>
                  <button onClick={() => { setCheckError(''); checkInteractions(); }} className="ml-auto px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Retry</button>
                </div>
              )}
              {/* Safety Score */}
              {safety && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="50" fill="none"
                            stroke={safety.score >= 75 ? '#4ade80' : safety.score >= 50 ? '#facc15' : safety.score >= 25 ? '#fb923c' : '#ef4444'}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${(safety.score / 100) * 314} 314`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-black ${safety.color}`}>{Math.round(safety.score)}%</span>
                          <span className="text-xs text-gray-400">Safe</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-2">Overall Safety: <span className={safety.color}>{safety.label}</span></h3>
                      <p className="text-gray-400">
                        {interactions.length === 0
                          ? 'No interactions found between your selected medicines.'
                          : `Found ${interactions.length} interaction${interactions.length !== 1 ? 's' : ''} between your medicines.`
                        }
                      </p>
                      {interactions.length > 0 && (
                        <div className="flex gap-3 mt-4 flex-wrap">
                          {['severe', 'moderate', 'mild', 'safe'].map(sev => {
                            const count = interactions.filter(i => i.severity === sev).length;
                            if (count === 0) return null;
                            const cfg = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG];
                            return (
                              <span key={sev} className={`text-sm px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}: {count}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button onClick={shareWithDoctor}
                      className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap">
                      {copied ? <FiCheck size={18} className="text-green-400" /> : <FiShare2 size={18} />}
                      {copied ? 'Copied!' : 'Share with Doctor'}
                    </button>
                  </div>
                </div>
              )}

              {/* Interaction Cards */}
              {interactions.length > 0 && (
                <div className="space-y-4 mb-8">
                  {interactions.sort((a, b) => {
                    const order = { contraindicated: 0, severe: 1, moderate: 2, mild: 3, safe: 4 };
                    return order[a.severity] - order[b.severity];
                  }).map((inter, idx) => {
                    const cfg = SEVERITY_CONFIG[inter.severity];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                            <Icon size={24} className={cfg.color} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              <h3 className="font-bold text-lg">{inter.med1} + {inter.med2}</h3>
                            </div>
                            <p className="text-gray-300 mb-3">{inter.description}</p>
                            <div className="bg-black/20 rounded-xl p-4 mb-3">
                              <p className="text-sm font-bold text-yellow-400 mb-1">What to Watch For:</p>
                              <p className="text-sm text-gray-300">{inter.whatToWatch}</p>
                            </div>
                            {inter.alternatives.length > 0 && (
                              <div>
                                <p className="text-sm font-bold text-purple-400 mb-1">Suggested Alternatives:</p>
                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                  {inter.alternatives.map((alt, ai) => <li key={ai}>{alt}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Medicine Info Cards */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiInfo className="text-purple-400" /> Medicine Information
                </h2>
                <div className="space-y-3">
                  {selectedMedicines.map(med => (
                    <div key={med.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-lg">💊</span>
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{med.name}</p>
                            <p className="text-sm text-gray-400">{med.genericName} • {med.manufacturer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">₹{med.price}</span>
                          {med.requiresPrescription && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Rx Required</span>
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedMed === med.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden border-t border-white/10">
                            <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-bold text-purple-400 mb-1">Uses</p>
                                <div className="flex flex-wrap gap-1">
                                  {med.uses.map((use, i) => (
                                    <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">{use}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-blue-400 mb-1">Dosage</p>
                                <p className="text-sm text-gray-300">{med.dosage}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-yellow-400 mb-1">Side Effects</p>
                                <p className="text-sm text-gray-300">{med.sideEffects.join(', ')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-red-400 mb-1">Warnings</p>
                                <p className="text-sm text-gray-300">{med.warnings.join(', ')}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Common Combinations Quick Info */}
        {!showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400" /> Common Dangerous Combinations in India
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {dangerousCombinations.map((inter, idx) => {
                const cfg = SEVERITY_CONFIG[inter.severity];
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-bold text-sm">{inter.med1}</p>
                    <p className="text-gray-400 text-xs">+</p>
                    <p className="font-bold text-sm">{inter.med2}</p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{inter.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
