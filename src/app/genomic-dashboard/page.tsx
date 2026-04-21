'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, FiAlertTriangle, FiCheckCircle, FiX, FiDroplet, FiGitMerge,
  FiHeart, FiShield, FiCpu, FiDatabase, FiTrendingUp, FiClock, FiDownload,
  FiUpload, FiRefreshCw, FiInfo, FiZap, FiTarget
} from 'react-icons/fi';

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

const GENE_VARIANTS: GeneVariant[] = [
  { gene: 'CYP2C9', variant: '*2', genotype: 'AA', phenotype: 'Normal Metabolizer', effect: 'normal', drugResponse: 'Warfarin: Normal sensitivity', recommendation: 'Standard dosing' },
  { gene: 'CYP2C19', variant: '*2', genotype: 'AA', phenotype: 'Normal Metabolizer', effect: 'normal', drugResponse: 'Clopidogrel: Normal activation', recommendation: 'Standard dosing' },
  { gene: 'CYP2D6', variant: '*10', genotype: 'CT', phenotype: 'Intermediate Metabolizer', effect: 'reduced', drugResponse: 'Codeine: Reduced conversion to morphine', recommendation: 'Use alternative pain reliever' },
  { gene: 'SLCO1B1', variant: '521T>C', genotype: 'TT', phenotype: 'Normal Function', effect: 'normal', drugResponse: 'Statins: Normal risk', recommendation: 'Standard statin therapy' },
  { gene: 'VKORC1', variant: '-1639G>A', genotype: 'GG', phenotype: 'Normal Expression', effect: 'normal', drugResponse: 'Warfarin: Standard sensitivity', recommendation: 'Standard dosing' },
  { gene: 'TPMT', variant: '*3A', genotype: 'GG', phenotype: 'Normal Activity', effect: 'normal', drugResponse: 'Thiopurines: Normal metabolism', recommendation: 'Standard dosing' },
  { gene: 'DPYD', variant: '*2A', genotype: 'AA', phenotype: 'Normal Function', effect: 'normal', drugResponse: 'Fluoropyrimidines: Normal metabolism', recommendation: 'Standard dosing' },
  { gene: 'ABCB1', variant: '3435C>T', genotype: 'CC', phenotype: 'Normal Transport', effect: 'normal', drugResponse: 'P-gp substrates: Normal transport', recommendation: 'Standard dosing' },
];

const DRUG_RECOMMENDATIONS: DrugRecommendation[] = [
  { drug: 'Paracetamol', category: 'Pain/Fever', suitability: 'optimal', reason: 'Safe for CYP2D6 intermediate metabolizers', dosage: '500-1000mg every 6 hours' },
  { drug: 'Ibuprofen', category: 'Pain/Anti-inflammatory', suitability: 'optimal', reason: 'No known gene-drug interactions', dosage: '400mg every 6-8 hours' },
  { drug: 'Codeine', category: 'Pain', suitability: 'avoid', reason: 'Reduced conversion to active morphine - ineffective', dosage: 'Not recommended' },
  { drug: 'Metoprolol', category: 'Beta-blocker', suitability: 'acceptable', reason: 'Slightly increased sensitivity', dosage: 'Start with half dose' },
  { drug: 'Simvastatin', category: 'Statin', suitability: 'optimal', reason: 'Normal SLCO1B1 function - low myopathy risk', dosage: '20-40mg daily' },
  { drug: 'Warfarin', category: 'Anticoagulant', suitability: 'acceptable', reason: 'Requires careful INR monitoring', dosage: 'Initial 2-5mg, adjust per INR' },
];

const HEALTH_RISKS: HealthRisk[] = [
  { condition: 'Type 2 Diabetes', risk: 'moderate', score: 35, genes: ['TCF7L2', 'PPARG', 'KCNJ11'] },
  { condition: 'Cardiovascular Disease', risk: 'low', score: 22, genes: ['9p21', 'APOE', 'LDLR'] },
  { condition: 'Breast Cancer', risk: 'low', score: 18, genes: ['BRCA1', 'BRCA2', 'PALB2'] },
  { condition: 'Thrombosis Risk', risk: 'low', score: 12, genes: ['F2', 'F5', 'MTHFR'] },
  { condition: 'Alzheimers Risk', risk: 'moderate', score: 42, genes: ['APOE', 'TREM2', 'CLU'] },
];

export default function GenomicDashboardPage() {
  const [dnaRotation, setDnaRotation] = useState(0);
  const [selectedGene, setSelectedGene] = useState<GeneVariant | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'risks'>('overview');
  const [dnaLoaded, setDnaLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDnaRotation(prev => (prev + 1) % 360);
    }, 50);
    setTimeout(() => setDnaLoaded(true), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSuitabilityColor = (suitability: DrugRecommendation['suitability']) => {
    switch (suitability) {
      case 'optimal': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'acceptable': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'avoid': return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getEffectColor = (effect: GeneVariant['effect']) => {
    switch (effect) {
      case 'normal': return 'text-green-400';
      case 'reduced': return 'text-amber-400';
      case 'increased': return 'text-purple-400';
      case 'poor': return 'text-red-400';
    }
  };

  const getRiskColor = (risk: HealthRisk['risk']) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-amber-400';
      case 'high': return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <FiGitMerge className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Genomic Pharmacogenomics
              </h1>
              <p className="text-slate-400 text-sm">DNA-Based Personalized Medicine Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              <span className="text-green-400 text-sm">Profile Loaded</span>
            </div>
            <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 flex items-center gap-2">
              <FiUpload className="text-sm" />
              Upload DNA Data
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiDroplet className="text-red-400" />
                3D DNA Helix Visualization
              </h2>
            </div>
            <div className="h-80 relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#0f172a]">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ rotateY: dnaRotation }}
                  className="relative w-32 h-72"
                  style={{ perspective: '1000px' }}
                >
                  {[...Array(20)].map((_, i) => {
                    const y = i * 18 - 180;
                    const phase = (i * 36 + dnaRotation) * (Math.PI / 180);
                    const x1 = Math.cos(phase) * 60;
                    const z1 = Math.sin(phase) * 40;
                    const x2 = -x1;
                    const z2 = -z1;
                    const opacity = Math.abs(Math.sin(phase)) * 0.8 + 0.2;
                    
                    return (
                      <div key={i} className="absolute w-full" style={{ top: '50%', transform: `translateY(${y}px)` }}>
                        <motion.div
                          animate={{ 
                            x: x1,
                            opacity: opacity,
                            scaleX: 1 + Math.sin(phase) * 0.3
                          }}
                          className="absolute left-1/2 w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                          style={{ 
                            boxShadow: `0 0 ${10 + Math.sin(phase) * 10}px rgba(6,182,212,${opacity})`
                          }}
                        />
                        <motion.div
                          animate={{ 
                            x: x2,
                            opacity: opacity,
                            scaleX: 1 + Math.sin(phase + Math.PI) * 0.3
                          }}
                          className="absolute left-1/2 w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                          style={{ 
                            boxShadow: `0 0 ${10 + Math.sin(phase + Math.PI) * 10}px rgba(236,72,153,${opacity})`
                          }}
                        />
                        <div 
                          className="absolute left-1/2 h-0.5 bg-gradient-to-r from-cyan-500/30 via-white/50 to-pink-500/30"
                          style={{ 
                            width: `${Math.abs(x1 - x2)}px`,
                            transform: 'translateX(-50%)'
                          }} 
                        />
                      </div>
                    );
                  })}
                </motion.div>
              </div>
              
              <div className="absolute top-4 left-4 text-xs font-mono text-cyan-400/70">
                ROTATING DNA HELIX<br/>
                GENOME: 23 CHROMOSOMES<br/>
                GENES ANALYZED: 8
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-mono text-purple-400/70 text-right">
                CYP2D6: *10/CT<br/>
                CYP2C9: *2/AA<br/>
                SLCO1B1: 521TT
              </div>
            </div>
          </motion.div>

          <div className="flex gap-2 mb-4">
            {(['overview', 'drugs', 'risks'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {tab === 'overview' && 'Gene Overview'}
                {tab === 'drugs' && 'Drug Recommendations'}
                {tab === 'risks' && 'Health Risks'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiCpu className="text-purple-400" />
                  Gene Analysis Results
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {GENE_VARIANTS.map((gene, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedGene(gene)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                      selectedGene?.gene === gene.gene 
                        ? 'bg-cyan-500/20 border-cyan-500/50' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-cyan-400">{gene.gene}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getEffectColor(gene.effect)} bg-white/10`}>
                        {gene.phenotype}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">Variant: {gene.variant} | Genotype: {gene.genotype}</div>
                    <div className="text-xs text-slate-300">{gene.drugResponse}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'drugs' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiShield className="text-green-400" />
                  Personalized Drug Recommendations
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {DRUG_RECOMMENDATIONS.map((drug, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border ${getSuitabilityColor(drug.suitability)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{drug.drug}</span>
                        <span className="text-xs px-2 py-1 rounded bg-white/10">{drug.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {drug.suitability === 'optimal' && <FiCheckCircle />}
                        {drug.suitability === 'acceptable' && <FiAlertTriangle />}
                        {drug.suitability === 'avoid' && <FiX />}
                        <span className="font-bold uppercase text-sm">{drug.suitability}</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">{drug.reason}</div>
                    <div className="text-xs text-slate-400 font-mono">Dosage: {drug.dosage}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'risks' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiActivity className="text-amber-400" />
                  Genetic Health Risk Assessment
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {HEALTH_RISKS.map((risk, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{risk.condition}</span>
                      <span className={`font-mono font-bold ${getRiskColor(risk.risk)}`}>
                        {risk.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${risk.score}%` }}
                          transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            risk.score < 25 ? 'bg-green-500' : risk.score < 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-sm w-12 text-right">{risk.score}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {risk.genes.map((gene, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded text-slate-400">
                          {gene}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FiTarget className="text-cyan-400" />
              Pharmacogenomic Profile
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Metabolizer Status</span>
                <span className="text-amber-400 font-semibold">Intermediate</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Genes Tested</span>
                <span className="text-white font-mono">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Drug-Gene Interactions</span>
                <span className="text-white font-mono">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Actionable Variants</span>
                <span className="text-green-400 font-mono">3</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FiAlertTriangle className="text-amber-400" />
              Important Warnings
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="text-red-400 font-bold text-sm mb-1">Codeine Avoid</div>
                <p className="text-xs text-slate-300">Your CYP2D6 genotype means codeine may not work effectively</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-amber-400 font-bold text-sm mb-1">Metoprolol Caution</div>
                <p className="text-xs text-slate-300">Consider starting with half the standard dose</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-green-400 font-bold text-sm mb-1">Statins Approved</div>
                <p className="text-xs text-slate-300">Normal SLCO1B1 function - standard statin therapy safe</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="text-cyan-400" />
              <span className="font-bold text-cyan-400">Why Pharmacogenomics?</span>
            </div>
            <div className="text-sm text-slate-300 space-y-2">
              <p>• <span className="text-white font-semibold">40%</span> of patients don't respond to standard medications</p>
              <p>• <span className="text-white font-semibold">99%</span> of people have at least one actionable gene variant</p>
              <p>• Prevents <span className="text-white font-semibold">adverse drug reactions</span> before they happen</p>
            </div>
          </motion.div>

          {selectedGene && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4"
            >
              <h2 className="text-lg font-bold text-cyan-400 mb-3">{selectedGene.gene} Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Variant</span>
                  <span className="text-white font-mono">{selectedGene.variant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Genotype</span>
                  <span className="text-white font-mono">{selectedGene.genotype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phenotype</span>
                  <span className="text-amber-400">{selectedGene.phenotype}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-slate-400 text-xs">Drug Response:</span>
                  <p className="text-sm">{selectedGene.drugResponse}</p>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 text-xs">Recommendation:</span>
                  <p className="text-sm text-green-400">{selectedGene.recommendation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}