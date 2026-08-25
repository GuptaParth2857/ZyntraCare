'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  FiActivity, FiAlertTriangle, FiCheckCircle, FiX, FiDroplet, FiGitMerge,
  FiHeart, FiShield, FiCpu, FiDatabase, FiTrendingUp, FiClock, FiDownload,
  FiUpload, FiRefreshCw, FiInfo, FiZap, FiTarget, FiArrowLeft, FiChevronRight,
  FiGlobe
} from 'react-icons/fi';

const DNAUltra3D = dynamic(() => import('@/components/DNAUltra3D'), { ssr: false });

interface GeneVariant {
  gene: string;
  variant: string;
  genotype: string;
  phenotype: string;
  effect: 'normal' | 'reduced' | 'increased' | 'poor';
  drugResponse: string;
  recommendation: string;
}

interface DrugRecommendation {
  drug: string;
  category: string;
  suitability: 'optimal' | 'acceptable' | 'avoid';
  reason: string;
  dosage: string;
}

interface HealthRisk {
  condition: string;
  risk: 'low' | 'moderate' | 'high';
  score: number;
  genes: string[];
}

const defaultGeneVariants: GeneVariant[] = [
  { gene: 'CYP2C9', variant: '*2', genotype: 'AA', phenotype: 'Normal Metabolizer', effect: 'normal', drugResponse: 'Warfarin: Normal sensitivity', recommendation: 'Standard dosing' },
  { gene: 'CYP2C19', variant: '*2', genotype: 'AA', phenotype: 'Normal Metabolizer', effect: 'normal', drugResponse: 'Clopidogrel: Normal activation', recommendation: 'Standard dosing' },
  { gene: 'CYP2D6', variant: '*10', genotype: 'CT', phenotype: 'Intermediate Metabolizer', effect: 'reduced', drugResponse: 'Codeine: Reduced conversion to morphine', recommendation: 'Use alternative pain reliever' },
  { gene: 'SLCO1B1', variant: '521T>C', genotype: 'TT', phenotype: 'Normal Function', effect: 'normal', drugResponse: 'Statins: Normal risk', recommendation: 'Standard statin therapy' },
  { gene: 'VKORC1', variant: '-1639G>A', genotype: 'GG', phenotype: 'Normal Expression', effect: 'normal', drugResponse: 'Warfarin: Standard sensitivity', recommendation: 'Standard dosing' },
  { gene: 'TPMT', variant: '*3A', genotype: 'GG', phenotype: 'Normal Activity', effect: 'normal', drugResponse: 'Thiopurines: Normal metabolism', recommendation: 'Standard dosing' },
  { gene: 'DPYD', variant: '*2A', genotype: 'AA', phenotype: 'Normal Function', effect: 'normal', drugResponse: 'Fluoropyrimidines: Normal metabolism', recommendation: 'Standard dosing' },
  { gene: 'ABCB1', variant: '3435C>T', genotype: 'CC', phenotype: 'Normal Transport', effect: 'normal', drugResponse: 'P-gp substrates: Normal transport', recommendation: 'Standard dosing' },
];

const defaultDrugRecommendations: DrugRecommendation[] = [
  { drug: 'Paracetamol', category: 'Pain/Fever', suitability: 'optimal', reason: 'Safe for CYP2D6 intermediate metabolizers', dosage: '500-1000mg every 6 hours' },
  { drug: 'Ibuprofen', category: 'Pain/Anti-inflammatory', suitability: 'optimal', reason: 'No known gene-drug interactions', dosage: '400mg every 6-8 hours' },
  { drug: 'Codeine', category: 'Pain', suitability: 'avoid', reason: 'Reduced conversion to active morphine - ineffective', dosage: 'Not recommended' },
  { drug: 'Metoprolol', category: 'Beta-blocker', suitability: 'acceptable', reason: 'Slightly increased sensitivity', dosage: 'Start with half dose' },
  { drug: 'Simvastatin', category: 'Statin', suitability: 'optimal', reason: 'Normal SLCO1B1 function - low myopathy risk', dosage: '20-40mg daily' },
  { drug: 'Warfarin', category: 'Anticoagulant', suitability: 'acceptable', reason: 'Requires careful INR monitoring', dosage: 'Initial 2-5mg, adjust per INR' },
];

const defaultHealthRisks: HealthRisk[] = [
  { condition: 'Type 2 Diabetes', risk: 'moderate', score: 35, genes: ['TCF7L2', 'PPARG', 'KCNJ11'] },
  { condition: 'Cardiovascular Disease', risk: 'low', score: 22, genes: ['9p21', 'APOE', 'LDLR'] },
  { condition: 'Breast Cancer', risk: 'low', score: 18, genes: ['BRCA1', 'BRCA2', 'PALB2'] },
  { condition: 'Thrombosis Risk', risk: 'low', score: 12, genes: ['F2', 'F5', 'MTHFR'] },
  { condition: 'Alzheimers Risk', risk: 'moderate', score: 42, genes: ['APOE', 'TREM2', 'CLU'] },
];

export default function GenomicDashboardPage() {
  const [geneVariants, setGeneVariants] = useState<GeneVariant[]>([]);
  const [drugRecommendations, setDrugRecommendations] = useState<DrugRecommendation[]>([]);
  const [healthRisks, setHealthRisks] = useState<HealthRisk[]>([]);
  const [selectedGene, setSelectedGene] = useState<GeneVariant | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'risks'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenomicData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/genomic-data');
        if (res.ok) {
          const data = await res.json();
          setGeneVariants(data.geneVariants || defaultGeneVariants);
          setDrugRecommendations(data.drugRecommendations || defaultDrugRecommendations);
          setHealthRisks(data.healthRisks || defaultHealthRisks);
        } else {
          setGeneVariants(defaultGeneVariants);
          setDrugRecommendations(defaultDrugRecommendations);
          setHealthRisks(defaultHealthRisks);
        }
      } catch (err) {
        setError('Failed to load genomic data');
        console.error(err);
        setGeneVariants(defaultGeneVariants);
        setDrugRecommendations(defaultDrugRecommendations);
        setHealthRisks(defaultHealthRisks);
      }
      setLoading(false);
    };
    fetchGenomicData();
  }, []);

  const getSuitabilityColor = (suitability: DrugRecommendation['suitability']) => {
    switch (suitability) {
      case 'optimal': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25', glow: 'shadow-green-500/10', icon: <FiCheckCircle /> };
      case 'acceptable': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', glow: 'shadow-amber-500/10', icon: <FiAlertTriangle /> };
      case 'avoid': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', glow: 'shadow-red-500/10', icon: <FiX /> };
    }
  };

  const getEffectBadge = (effect: GeneVariant['effect']) => {
    switch (effect) {
      case 'normal': return { text: 'text-green-300', bg: 'bg-green-500/15', border: 'border-green-500/20', label: 'Normal' };
      case 'reduced': return { text: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/20', label: 'Reduced' };
      case 'increased': return { text: 'text-purple-300', bg: 'bg-purple-500/15', border: 'border-purple-500/20', label: 'Increased' };
      case 'poor': return { text: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/20', label: 'Poor' };
    }
  };

  const getRiskStyle = (risk: HealthRisk['risk']) => {
    switch (risk) {
      case 'low': return { text: 'text-green-400', bar: 'bg-gradient-to-r from-green-400 to-green-500', tag: 'bg-green-500/15 text-green-300 border-green-500/20' };
      case 'moderate': return { text: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-400 to-amber-500', tag: 'bg-amber-500/15 text-amber-300 border-amber-500/20' };
      case 'high': return { text: 'text-red-400', bar: 'bg-gradient-to-r from-red-400 to-red-500', tag: 'bg-red-500/15 text-red-300 border-red-500/20' };
    }
  };

  const tabs = [
    { key: 'overview' as const, label: 'Gene Overview', icon: <FiCpu size={16} /> },
    { key: 'drugs' as const, label: 'Drug Recommendations', icon: <FiShield size={16} /> },
    { key: 'risks' as const, label: 'Health Risks', icon: <FiActivity size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <FiGitMerge className="text-2xl text-cyan-300" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Genomic Pharmacogenomics
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-1.5">
                  <FiGlobe size={12} className="text-cyan-400" />
                  DNA-Based Personalized Medicine Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center gap-2 shadow-lg shadow-green-500/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-300 text-sm font-medium">Profile Loaded</span>
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-cyan-500/20">
                <FiUpload size={14} />
                Upload DNA Data
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20"
            >
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiDroplet className="text-red-400" />
                  3D DNA Helix Visualization
                </h2>
                <span className="text-xs text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full">Live</span>
              </div>
              <div className="h-80 relative overflow-hidden bg-gradient-to-b from-[#05080f] to-[#0a0f1a]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_70%)]" />
                <DNAUltra3D height={320} />
              </div>
            </motion.div>

            <div className="flex gap-2 p-1 backdrop-blur-xl bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20"
                >
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FiCpu className="text-purple-400" />
                      Gene Analysis Results
                    </h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {geneVariants.map((gene, idx) => {
                      const badge = getEffectBadge(gene.effect);
                      const isSelected = selectedGene?.gene === gene.gene;
                      return (
                        <motion.div
                          key={gene.gene}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => setSelectedGene(gene)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-white/20'}`} />
                              <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-white/80'}`}>{gene.gene}</span>
                            </div>
                            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${badge.bg} ${badge.text} ${badge.border} border`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-500 mb-2.5 font-mono">
                            <span>Variant: <span className="text-slate-300">{gene.variant}</span></span>
                            <span>GT: <span className="text-slate-300">{gene.genotype}</span></span>
                          </div>
                          <div className="text-xs text-slate-400 leading-relaxed">{gene.drugResponse}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'drugs' && (
                <motion.div
                  key="drugs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20"
                >
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FiShield className="text-green-400" />
                      Personalized Drug Recommendations
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {drugRecommendations.map((drug, idx) => {
                      const colors = getSuitabilityColor(drug.suitability);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className={`p-4 rounded-xl border ${colors.bg} ${colors.border} ${colors.glow} shadow-sm transition-all hover:translate-x-0.5`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <span className="font-bold text-[15px] text-white/90">{drug.drug}</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/[0.06]">
                                  {drug.category}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400 mb-2">{drug.reason}</div>
                              <div className="text-xs font-mono text-slate-500">
                                Dosage: <span className="text-slate-300">{drug.dosage}</span>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 text-sm font-bold uppercase whitespace-nowrap ${colors.text} ${colors.bg} px-3 py-1.5 rounded-lg border ${colors.border}`}>
                              {colors.icon}
                              <span>{drug.suitability}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'risks' && (
                <motion.div
                  key="risks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20"
                >
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FiActivity className="text-amber-400" />
                      Genetic Health Risk Assessment
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    {healthRisks.map((risk, idx) => {
                      const style = getRiskStyle(risk.risk);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-[15px] text-white/85">{risk.condition}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${style.tag}`}>
                              {risk.risk.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${risk.score}%` }}
                                transition={{ delay: idx * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${style.bar}`}
                              />
                            </div>
                            <span className="font-mono text-sm font-bold text-white/60 w-10 text-right">{risk.score}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-500 mr-1">Associated genes:</span>
                            {risk.genes.map((gene, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-slate-400 font-mono">
                                {gene}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 shadow-xl shadow-black/20"
            >
              <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
                <FiTarget className="text-cyan-400" />
                Pharmacogenomic Profile
              </h2>
              <div className="space-y-3.5">
                {[
                  { label: 'Metabolizer Status', value: 'Intermediate', color: 'text-amber-400' },
                  { label: 'Genes Tested', value: '8', color: 'text-white font-mono' },
                  { label: 'Drug-Gene Interactions', value: '12', color: 'text-white font-mono' },
                  { label: 'Actionable Variants', value: '3', color: 'text-green-400 font-mono' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 shadow-xl shadow-black/20"
            >
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <FiAlertTriangle className="text-amber-400" />
                Important Warnings
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 bg-red-500/8 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-red-300 font-bold text-sm">Codeine — Avoid</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">Your CYP2D6 genotype means codeine may not work effectively</p>
                </div>
                <div className="p-3.5 bg-amber-500/8 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-amber-300 font-bold text-sm">Metoprolol — Caution</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">Consider starting with half the standard dose</p>
                </div>
                <div className="p-3.5 bg-green-500/8 border border-green-500/20 rounded-xl hover:bg-green-500/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-green-300 font-bold text-sm">Statins — Approved</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">Normal SLCO1B1 function — standard statin therapy safe</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5 shadow-xl shadow-cyan-500/5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <FiZap className="text-cyan-400" size={16} />
                </div>
                <span className="font-bold text-cyan-300">Why Pharmacogenomics?</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg font-black leading-none mt-0.5">•</span>
                  <p className="text-sm text-slate-300"><span className="text-white font-bold">40%</span> of patients don't respond to standard medications</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg font-black leading-none mt-0.5">•</span>
                  <p className="text-sm text-slate-300"><span className="text-white font-bold">99%</span> of people have at least one actionable gene variant</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg font-black leading-none mt-0.5">•</span>
                  <p className="text-sm text-slate-300">Prevents <span className="text-white font-bold">adverse drug reactions</span> before they happen</p>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {selectedGene && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="backdrop-blur-xl bg-white/[0.04] border border-cyan-500/25 rounded-2xl p-5 shadow-xl shadow-cyan-500/5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <FiInfo className="text-cyan-400" size={16} />
                    </div>
                    <h2 className="font-bold text-cyan-300">{selectedGene.gene} Details</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Variant', value: selectedGene.variant, color: 'text-white font-mono' },
                      { label: 'Genotype', value: selectedGene.genotype, color: 'text-white font-mono' },
                      { label: 'Phenotype', value: selectedGene.phenotype, color: 'text-amber-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <span className="text-sm text-slate-400">{item.label}</span>
                        <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <span className="text-xs text-slate-500">Drug Response:</span>
                      <p className="text-sm text-white/80 mt-0.5">{selectedGene.drugResponse}</p>
                    </div>
                    <div className="p-3 bg-green-500/8 border border-green-500/15 rounded-lg">
                      <span className="text-xs text-green-400 font-semibold">Recommendation</span>
                      <p className="text-sm text-green-200/80 mt-0.5">{selectedGene.recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
