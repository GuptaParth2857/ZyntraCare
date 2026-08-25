'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiSearch, FiFilter, FiMapPin, FiClock, FiCheck, FiArrowLeft, FiChevronDown, FiChevronUp, FiHeart, FiUser, FiCalendar, FiAlertCircle, FiPhone, FiMail, FiExternalLink, FiBookmark, FiBookmark as FiBookmarkFill, FiActivity, FiShield, FiInfo, FiX, FiSend } from 'react-icons/fi';

interface PatientProfile {
  age: string;
  gender: string;
  conditions: string[];
  medications: string[];
  location: string;
}

interface Trial {
  id: string;
  name: string;
  phase: string;
  status: string;
  condition: string;
  sponsor: string;
  location: string;
  distance: string;
  spotsAvailable: number;
  totalSpots: number;
  matchPercentage: number;
  eligibilityCriteria: string[];
  whatInvolved: string[];
  risksBenefits: string[];
  timeline: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  nearbyLocations: string[];
  saved: boolean;
  applied: boolean;
}

const COMMON_CONDITIONS = ['Diabetes Type 2', 'Hypertension', 'Asthma', 'COPD', 'Rheumatoid Arthritis', 'Psoriasis', 'Chronic Kidney Disease', 'Heart Failure', 'Migraine', 'Depression', 'Breast Cancer', 'Lung Cancer', 'Alzheimer\'s', 'Parkinson\'s', 'Epilepsy', 'Obesity', 'PCOS', 'IBD', 'Tuberculosis', 'HIV/AIDS'];

const COMMON_MEDICATIONS = ['Metformin', 'Amlodipine', 'Atorvastatin', 'Omeprazole', 'Levothyroxine', 'Metoprolol', 'Losartan', 'Aspirin', 'Paracetamol', 'Ibuprofen', 'Insulin', 'Salbutamol', 'Pantoprazole', 'Azithromycin', 'Dolo 650'];

const ALL_TRIALS: Trial[] = [
  {
    id: 't1', name: 'DIASTUDY-2026: Novel SGLT2 Inhibitor for Type 2 Diabetes', phase: 'Phase 3', status: 'Recruiting',
    condition: 'Diabetes Type 2', sponsor: 'Sun Pharmaceutical Industries', location: 'AIIMS New Delhi', distance: '3.2 km',
    spotsAvailable: 45, totalSpots: 200, matchPercentage: 92,
    eligibilityCriteria: ['Age 30-65', 'HbA1c between 7.5%-10%', 'BMI 25-40', 'On Metformin for at least 3 months', 'No history of DKA in last 6 months', 'eGFR > 45 ml/min'],
    whatInvolved: ['Monthly hospital visits for 12 months', 'Blood sugar monitoring (CGM provided)', 'Blood tests every 4 weeks', 'Weekly teleconsultation', 'Medication provided free of cost'],
    risksBenefits: ['Potential risk of genital infections', 'Risk of hypoglycemia (rare with this class)', 'Free medication & monitoring worth ₹2 lakhs', 'Contribution to diabetes research', 'Access to cutting-edge treatment'],
    timeline: '12 months total: 2-month screening + 10-month treatment phase',
    contactName: 'Dr. Priya Sharma (PI)', contactPhone: '+91-11-2658-8500', contactEmail: 'diastudy@aiims.ac.in',
    nearbyLocations: ['AIIMS New Delhi', 'Safdarjung Hospital', 'Ram Manohar Lohia Hospital'], saved: false, applied: false,
  },
  {
    id: 't2', name: 'CARDIO-RESIST: Hypertension Management in South Asians', phase: 'Phase 2', status: 'Recruiting',
    condition: 'Hypertension', sponsor: 'Cipla Ltd.', location: 'Fortis Escorts Heart Institute', distance: '8.5 km',
    spotsAvailable: 28, totalSpots: 150, matchPercentage: 78,
    eligibilityCriteria: ['Age 25-70', 'Systolic BP > 140 or Diastolic BP > 90', 'On at least 2 antihypertensives', 'No secondary hypertension', 'No prior MI or stroke in 6 months'],
    whatInvolved: ['24-hour ambulatory BP monitoring', 'Monthly visits for 8 months', 'Blood work every 2 months', 'ECG at each visit', 'Free medication supply'],
    risksBenefits: ['Potential drop in BP requiring dose adjustment', 'Free comprehensive cardiac monitoring', 'Access to new combination therapy', 'Contributing to India-specific hypertension data'],
    timeline: '8 months: 1-month screening + 7-month treatment',
    contactName: 'Dr. Rajesh Gupta', contactPhone: '+91-11-4713-5000', contactEmail: 'cardioresist@fortis.in',
    nearbyLocations: ['Fortis Escorts Heart Institute', 'Medanta Medicity', 'Apollo Hospital Delhi'], saved: false, applied: false,
  },
  {
    id: 't3', name: 'BREATHE-EASY: Biologics for Severe Asthma in Indians', phase: 'Phase 3', status: 'Recruiting',
    condition: 'Asthma', sponsor: 'Lupin Pharmaceuticals', location: 'CMC Vellore', distance: '142 km',
    spotsAvailable: 15, totalSpots: 100, matchPercentage: 65,
    eligibilityCriteria: ['Age 18-60', 'Severe persistent asthma > 2 years', 'On high-dose ICS + LABA', 'FEV1 < 80% predicted', '≥2 exacerbations in past year'],
    whatInvolved: ['Subcutaneous injection every 4 weeks', 'Lung function tests monthly', 'Asthma control questionnaires', 'Eosinophil count monitoring', '24-week treatment period'],
    risksBenefits: ['Risk of injection site reactions', 'Risk of rare anaphylaxis', 'Potential reduction in exacerbations', 'Free biologic treatment worth ₹4+ lakhs'],
    timeline: '6 months: screening + 24-week active treatment',
    contactName: 'Dr. Arjun Singh', contactPhone: '+91-416-228-1000', contactEmail: 'breatheeasy@cmcvellore.ac.in',
    nearbyLocations: ['CMC Vellore', 'Apollo Hospital Chennai', 'Sri Ramachandra Hospital Chennai'], saved: false, applied: false,
  },
  {
    id: 't4', name: 'NEUROSHIELD: Early Alzheimer\'s Intervention Study', phase: 'Phase 1', status: 'Recruiting',
    condition: 'Alzheimer\'s', sponsor: 'Dr. Reddy\'s Laboratories', location: 'NIMHANS Bangalore', distance: '210 km',
    spotsAvailable: 8, totalSpots: 50, matchPercentage: 42,
    eligibilityCriteria: ['Age 55-80', 'Mild cognitive impairment or early AD', 'MMSE score 20-26', 'Positive amyloid PET scan', 'Stable medications for 3 months'],
    whatInvolved: ['Monthly MRI scans', 'Neurocognitive assessments every 2 weeks', 'Oral medication daily', 'PET scans at baseline and 6 months', 'CSF analysis (optional)'],
    risksBenefits: ['Risk of headaches and nausea', 'Experimental drug with unknown long-term effects', 'Cutting-edge early detection', 'Free comprehensive neurological care'],
    timeline: '18 months: intensive monitoring phase',
    contactName: 'Dr. Anita Desai', contactPhone: '+91-80-2699-5000', contactEmail: 'neuroshield@nimhans.ac.in',
    nearbyLocations: ['NIMHANS Bangalore', 'Manipal Hospital Bangalore', 'Apollo Hospital Bangalore'], saved: false, applied: false,
  },
  {
    id: 't5', name: 'ONCOCARE-BR: Immunotherapy in HER2+ Breast Cancer', phase: 'Phase 2', status: 'Active',
    condition: 'Breast Cancer', sponsor: 'Biocon Ltd.', location: 'Tata Memorial Hospital Mumbai', distance: '340 km',
    spotsAvailable: 22, totalSpots: 120, matchPercentage: 55,
    eligibilityCriteria: ['Age 30-70', 'Stage II-III HER2+ breast cancer', 'Post neoadjuvant chemotherapy', 'ECOG performance status 0-1', 'Adequate organ function'],
    whatInvolved: ['IV infusion every 3 weeks', 'Tumor biopsies at weeks 0, 6, 12', 'CT scans every 9 weeks', 'Quality of life assessments', '18-month follow-up'],
    risksBenefits: ['Risk of immune-related adverse events', 'Risk of infusion reactions', 'Potential improved pathological complete response', 'Free immunotherapy worth ₹15+ lakhs', 'World-class oncology care'],
    timeline: '18 months: treatment + follow-up',
    contactName: 'Dr. Kavita Reddy', contactPhone: '+91-22-2417-7000', contactEmail: 'oncocabr@tmc.gov.in',
    nearbyLocations: ['Tata Memorial Hospital Mumbai', 'Fortis Hospital Mumbai', 'Kokilaben Hospital Mumbai'], saved: false, applied: false,
  },
  {
    id: 't6', name: 'SKIN-GENESIS: JAK Inhibitor for Refractory Psoriasis', phase: 'Phase 2', status: 'Recruiting',
    condition: 'Psoriasis', sponsor: 'Zydus Cadila', location: 'AIIMS New Delhi', distance: '3.2 km',
    spotsAvailable: 35, totalSpots: 80, matchPercentage: 88,
    eligibilityCriteria: ['Age 18-55', 'Chronic plaque psoriasis > 6 months', 'PASI score > 12', 'Failed ≥1 systemic therapy', 'BSA > 10%'],
    whatInvolved: ['Oral medication daily for 16 weeks', 'Dermatology assessments biweekly', 'Skin biopsies at weeks 0, 8, 16', 'Photography documentation', 'Quality of life questionnaires'],
    risksBenefits: ['Risk of infections', 'Potential liver enzyme elevation', 'Significant PASI improvement expected', 'Free treatment worth ₹80,000+'],
    timeline: '20 weeks: 4-week screening + 16-week treatment',
    contactName: 'Dr. Meera Nair', contactPhone: '+91-11-2658-8500', contactEmail: 'skingenesis@aiims.ac.in',
    nearbyLocations: ['AIIMS New Delhi', 'Safdarjung Hospital', 'Max Hospital Saket'], saved: false, applied: false,
  },
  {
    id: 't7', name: 'KIDNEY-CARE: SGLT2 Inhibitor in CKD Stage 3-4', phase: 'Phase 3', status: 'Recruiting',
    condition: 'Chronic Kidney Disease', sponsor: 'Torrent Pharmaceuticals', location: 'Apollo Hospital Chennai', distance: '45 km',
    spotsAvailable: 50, totalSpots: 300, matchPercentage: 71,
    eligibilityCriteria: ['Age 30-75', 'CKD Stage 3b or 4 (eGFR 15-44)', 'On stable RAAS blockade', 'UACR > 300 mg/g', 'No dialysis'],
    whatInvolved: ['Daily oral medication', 'eGFR monitoring monthly', 'Urine albumin tests every 4 weeks', 'Cardiac monitoring', '36-month study duration'],
    risksBenefits: ['Risk of volume depletion', 'Potential DKA (rare)', 'Free comprehensive kidney monitoring', 'Potential to slow CKD progression', 'Contribution to kidney research'],
    timeline: '36 months: screening + long-term treatment',
    contactName: 'Dr. Suresh Patel', contactPhone: '+91-44-2829-3333', contactEmail: 'kidneycare@apollo.in',
    nearbyLocations: ['Apollo Hospital Chennai', 'MIOT Hospital Chennai', 'Sri Ramachandra Hospital'], saved: false, applied: false,
  },
  {
    id: 't8', name: 'MENTAL-EASE: Digital CBT for Treatment-Resistant Depression', phase: 'Phase 4', status: 'Active',
    condition: 'Depression', sponsor: 'Abbott Healthcare', location: 'NIMHANS Bangalore', distance: '210 km',
    spotsAvailable: 60, totalSpots: 200, matchPercentage: 58,
    eligibilityCriteria: ['Age 25-60', 'Major depressive disorder ≥ 2 years', 'Failed ≥1 adequate antidepressant trial', 'PHQ-9 score ≥ 15', 'Smartphone access'],
    whatInvolved: ['AI-powered CBT app (12-week program)', 'Weekly psychiatrist video calls', 'Mood tracking daily', 'PHQ-9 assessments biweekly', 'Blood cortisol levels at 0, 6, 12 weeks'],
    risksBenefits: ['Risk of increased anxiety during initial CBT', 'No pharmacological risk', 'Free digital therapy program', 'Access to personalized AI therapy', 'Potential to avoid adding medications'],
    timeline: '12 weeks active + 12-week follow-up',
    contactName: 'Dr. Vikram Joshi', contactPhone: '+91-80-2699-5000', contactEmail: 'mentalease@nimhans.ac.in',
    nearbyLocations: ['NIMHANS Bangalore', 'Narayana Health Bangalore', 'Manipal Hospital Bangalore'], saved: false, applied: false,
  },
  {
    id: 't9', name: 'GI-HEAL: FMT for Ulcerative Colitis', phase: 'Phase 2', status: 'Recruiting',
    condition: 'IBD', sponsor: 'CureFunc Therapeutics', location: 'AIIMS New Delhi', distance: '3.2 km',
    spotsAvailable: 18, totalSpots: 60, matchPercentage: 74,
    eligibilityCriteria: ['Age 20-50', 'Moderate UC (partial Mayo 5-9)', 'Failed ≥1 biologic', 'No C. difficile infection', 'Colonoscopy within 3 months'],
    whatInvolved: ['Fecal Microbiota Transplant (capsule form)', 'Colonoscopy at weeks 0, 12', 'Stool sample collection weekly', 'Inflammatory markers every 2 weeks', 'GI symptom diary'],
    risksBenefits: ['Risk of bloating, transient fever', 'Rare risk of infection', 'Potential to achieve drug-free remission', 'Novel microbiome-based therapy', 'Free treatment'],
    timeline: '24 weeks: treatment + assessment',
    contactName: 'Dr. Suresh Patel', contactPhone: '+91-11-2658-8500', contactEmail: 'giheal@aiims.ac.in',
    nearbyLocations: ['AIIMS New Delhi', 'Gangaram Hospital', 'Apollo Hospital Delhi'], saved: false, applied: false,
  },
  {
    id: 't10', name: 'THYROID-BALANCE: Levothyroxine + Selenium in Hypothyroidism', phase: 'Phase 4', status: 'Recruiting',
    condition: 'Hypothyroidism', sponsor: 'Abbott India', location: 'Fortis Hospital Mumbai', distance: '18 km',
    spotsAvailable: 80, totalSpots: 250, matchPercentage: 83,
    eligibilityCriteria: ['Age 20-55', 'Hashimoto\'s thyroiditis', 'On stable levothyroxine dose > 3 months', 'TSH 5-15 mIU/L', 'No pregnancy planned'],
    whatInvolved: ['Daily supplementation', 'TSH/T3/T4 testing every 6 weeks', 'Anti-TPO antibody levels', 'Quality of life surveys', '6-month duration'],
    risksBenefits: ['Risk of selenium excess (rare)', 'Free supplements and monitoring', 'Potential improvement in TSH levels', 'Evidence-based nutritional approach'],
    timeline: '6 months',
    contactName: 'Dr. Vikram Joshi', contactPhone: '+91-22-4014-0000', contactEmail: 'thyroidbalance@fortis.in',
    nearbyLocations: ['Fortis Hospital Mumbai', 'Breach Candy Hospital', 'Hinduja Hospital Mumbai'], saved: false, applied: false,
  },
];

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  Recruiting: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Phase 2': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Phase 3': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Phase 4': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export default function ClinicalTrialsPage() {
  const [step, setStep] = useState<'profile' | 'results'>('profile');
  const [profile, setProfile] = useState<PatientProfile>({ age: '', gender: '', conditions: [], medications: [], location: '' });
  const [conditionInput, setConditionInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [expandedTrial, setExpandedTrial] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingTrial, setApplyingTrial] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);
  const [trials, setTrials] = useState<Trial[]>(ALL_TRIALS);

  const filteredConditions = COMMON_CONDITIONS.filter(c => c.toLowerCase().includes(conditionInput.toLowerCase()) && !profile.conditions.includes(c));
  const filteredMeds = COMMON_MEDICATIONS.filter(m => m.toLowerCase().includes(medInput.toLowerCase()) && !profile.medications.includes(m));

  const matchingTrials = useMemo(() => {
    return trials.filter(t => {
      if (filterPhase !== 'All' && t.phase !== filterPhase) return false;
      if (filterCondition !== 'All' && t.condition !== filterCondition) return false;
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.condition.toLowerCase().includes(searchQuery.toLowerCase()) && !t.sponsor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [trials, filterPhase, filterCondition, filterStatus, searchQuery]);

  const savedTrials = trials.filter(t => t.saved);
  const appliedTrials = trials.filter(t => t.applied);

  const handleFindTrials = () => {
    if (!profile.age || !profile.gender || profile.conditions.length === 0 || !profile.location) return;
    setStep('results');
  };

  const toggleSave = (trialId: string) => {
    setTrials(trials.map(t => t.id === trialId ? { ...t, saved: !t.saved } : t));
  };

  const handleApply = (trialId: string) => {
    setApplyingTrial(trialId);
    setTimeout(() => {
      setTrials(trials.map(t => t.id === trialId ? { ...t, applied: true } : t));
      setApplyingTrial(null);
      setAppliedSuccess(trialId);
      setTimeout(() => setAppliedSuccess(null), 3000);
    }, 1500);
  };

  const uniqueConditions = Array.from(new Set(trials.map(t => t.condition)));

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white py-12 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-blue-600/18 rounded-full blur-[175px]" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-600/14 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to ZyntraCare
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiActivity size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Clinical Trial Matching</h1>
          <p className="text-gray-400 text-lg">Find clinical trials that match your profile from India&apos;s top research institutions</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${step === 'profile' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
            <FiUser size={14} /> Patient Profile
          </div>
          <FiChevronDown className="rotate-[-90deg] text-gray-600" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${step === 'results' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
            <FiSearch size={14} /> Matching Trials
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <GlassCard className="p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FiUser size={20} className="text-blue-400" /> Your Patient Profile</h2>
                <p className="text-gray-400 text-sm mb-6">We use this information to match you with the most relevant clinical trials. Your data is kept confidential.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Age *</label>
                    <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} placeholder="e.g. 45" min="1" max="120" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Gender *</label>
                    <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer">
                      <option value="" className="bg-slate-900">Select gender</option>
                      <option value="Male" className="bg-slate-900">Male</option>
                      <option value="Female" className="bg-slate-900">Female</option>
                      <option value="Other" className="bg-slate-900">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Location *</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="City (e.g. New Delhi, Mumbai, Chennai)" className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Medical Conditions * (select or type)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.conditions.map(c => (
                        <span key={c} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          {c}
                          <button onClick={() => setProfile({ ...profile, conditions: profile.conditions.filter(x => x !== c) })} className="hover:text-blue-200"><FiX size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input value={conditionInput} onChange={e => setConditionInput(e.target.value)} placeholder="Type to search conditions..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                      {conditionInput && filteredConditions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-20 max-h-40 overflow-y-auto">
                          {filteredConditions.slice(0, 6).map(c => (
                            <button key={c} type="button" onClick={() => { setProfile({ ...profile, conditions: [...profile.conditions, c] }); setConditionInput(''); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition">{c}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {COMMON_CONDITIONS.filter(c => !profile.conditions.includes(c)).slice(0, 10).map(c => (
                        <button key={c} type="button" onClick={() => setProfile({ ...profile, conditions: [...profile.conditions, c] })} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[11px] text-gray-500 hover:bg-white/10 hover:text-gray-300 transition">+ {c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-gray-300 font-semibold text-sm block mb-2">Current Medications (optional)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.medications.map(m => (
                        <span key={m} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          {m}
                          <button onClick={() => setProfile({ ...profile, medications: profile.medications.filter(x => x !== m) })} className="hover:text-emerald-200"><FiX size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input value={medInput} onChange={e => setMedInput(e.target.value)} placeholder="Type to search medications..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                      {medInput && filteredMeds.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-20 max-h-40 overflow-y-auto">
                          {filteredMeds.slice(0, 6).map(m => (
                            <button key={m} type="button" onClick={() => { setProfile({ ...profile, medications: [...profile.medications, m] }); setMedInput(''); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition">{m}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFindTrials} disabled={!profile.age || !profile.gender || profile.conditions.length === 0 || !profile.location} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                  <FiSearch /> Find Matching Trials
                </motion.button>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              {/* Saved & Applied Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <GlassCard className="p-4 text-center">
                  <div className="text-2xl font-black text-blue-400">{matchingTrials.length}</div>
                  <div className="text-xs text-gray-400">Matching Trials</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <div className="text-2xl font-black text-amber-400">{savedTrials.length}</div>
                  <div className="text-xs text-gray-400">Saved Trials</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <div className="text-2xl font-black text-emerald-400">{appliedTrials.length}</div>
                  <div className="text-xs text-gray-400">Applied</div>
                </GlassCard>
              </div>

              {/* Filters */}
              <GlassCard className="p-5 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search trials, conditions, sponsors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition text-sm" />
                  </div>
                  <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option value="All" className="bg-slate-900">All Phases</option>
                    <option value="Phase 1" className="bg-slate-900">Phase 1</option>
                    <option value="Phase 2" className="bg-slate-900">Phase 2</option>
                    <option value="Phase 3" className="bg-slate-900">Phase 3</option>
                    <option value="Phase 4" className="bg-slate-900">Phase 4</option>
                  </select>
                  <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option value="All" className="bg-slate-900">All Conditions</option>
                    {uniqueConditions.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option value="All" className="bg-slate-900">All Status</option>
                    <option value="Recruiting" className="bg-slate-900">Recruiting</option>
                    <option value="Active" className="bg-slate-900">Active</option>
                  </select>
                </div>
              </GlassCard>

              {/* Trial List */}
              <div className="space-y-4">
                {matchingTrials.map((trial, i) => {
                  const isExpanded = expandedTrial === trial.id;
                  return (
                    <motion.div key={trial.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                      <GlassCard className={`p-0 overflow-hidden transition-all duration-300 ${appliedSuccess === trial.id ? 'border-emerald-500/40' : ''}`}>
                        {/* Main Card */}
                        <div className="p-5 cursor-pointer" onClick={() => setExpandedTrial(isExpanded ? null : trial.id)}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${PHASE_COLORS[trial.phase] || ''}`}>{trial.phase}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_COLORS[trial.status] || ''}`}>{trial.status}</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trial.matchPercentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' : trial.matchPercentage >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  {trial.matchPercentage}% Match
                                </span>
                              </div>
                              <h3 className="font-bold text-white text-sm mb-1.5 leading-snug">{trial.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1"><FiActivity size={11} /> {trial.condition}</span>
                                <span className="flex items-center gap-1"><FiMapPin size={11} /> {trial.location} ({trial.distance})</span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Sponsor: {trial.sponsor}</span>
                                <span className={trial.spotsAvailable < 20 ? 'text-amber-400' : 'text-emerald-400'}>{trial.spotsAvailable} spots left of {trial.totalSpots}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <motion.button whileTap={{ scale: 0.85 }} onClick={e => { e.stopPropagation(); toggleSave(trial.id); }} className={`p-2 rounded-xl transition ${trial.saved ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                                {trial.saved ? <FiBookmarkFill size={16} /> : <FiBookmark size={16} />}
                              </motion.button>
                              <motion.button whileTap={{ scale: 0.85 }} className={`p-2 rounded-xl bg-white/5 text-gray-500 hover:bg-white/10 transition ${isExpanded ? 'rotate-180' : ''}`}>
                                <FiChevronDown size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  {/* Eligibility */}
                                  <div>
                                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5"><FiShield size={14} className="text-blue-400" /> Eligibility Criteria</h4>
                                    <ul className="space-y-1.5">
                                      {trial.eligibilityCriteria.map((c, j) => (
                                        <li key={j} className="text-xs text-gray-300 flex items-start gap-2"><FiCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" /> {c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {/* What's Involved */}
                                  <div>
                                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5"><FiInfo size={14} className="text-cyan-400" /> What the Trial Involves</h4>
                                    <ul className="space-y-1.5">
                                      {trial.whatInvolved.map((w, j) => (
                                        <li key={j} className="text-xs text-gray-300 flex items-start gap-2"><FiCheck size={12} className="text-cyan-400 mt-0.5 shrink-0" /> {w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {/* Risks & Benefits */}
                                  <div>
                                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5"><FiAlertCircle size={14} className="text-amber-400" /> Risks & Benefits</h4>
                                    <ul className="space-y-1.5">
                                      {trial.risksBenefits.map((r, j) => (
                                        <li key={j} className="text-xs text-gray-300 flex items-start gap-2"><FiAlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" /> {r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {/* Timeline & Locations */}
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5"><FiCalendar size={14} className="text-violet-400" /> Timeline</h4>
                                      <p className="text-xs text-gray-300">{trial.timeline}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5"><FiMapPin size={14} className="text-rose-400" /> Nearby Locations</h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {trial.nearbyLocations.map((loc, j) => (
                                          <span key={j} className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded-lg">{loc}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                  <h4 className="font-bold text-white text-sm mb-2">Contact Information</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                                    <span className="flex items-center gap-1.5"><FiUser size={12} className="text-blue-400" /> {trial.contactName}</span>
                                    <span className="flex items-center gap-1.5"><FiPhone size={12} className="text-emerald-400" /> {trial.contactPhone}</span>
                                    <span className="flex items-center gap-1.5"><FiMail size={12} className="text-violet-400" /> {trial.contactEmail}</span>
                                  </div>
                                </div>

                                {/* Apply Button */}
                                <div className="flex justify-end">
                                  {trial.applied ? (
                                    <div className="px-6 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm flex items-center gap-2">
                                      <FiCheck size={16} /> Application Submitted
                                    </div>
                                  ) : applyingTrial === trial.id ? (
                                    <div className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl font-bold text-sm flex items-center gap-2">
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" /> Applying...
                                    </div>
                                  ) : (
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleApply(trial.id)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2">
                                      <FiSend size={14} /> Apply for Trial
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    </motion.div>
                  );
                })}

                {matchingTrials.length === 0 && (
                  <div className="text-center text-gray-500 py-20">
                    <FiSearch size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No trials match your current filters</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>

              {/* Saved Trials Section */}
              {savedTrials.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FiBookmark size={18} className="text-amber-400" /> Saved Trials ({savedTrials.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedTrials.map(trial => (
                      <GlassCard key={trial.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${PHASE_COLORS[trial.phase] || ''}`}>{trial.phase}</span>
                          <button onClick={() => toggleSave(trial.id)} className="text-amber-400 hover:text-amber-300"><FiBookmarkFill size={14} /></button>
                        </div>
                        <h4 className="font-bold text-white text-xs mb-1 line-clamp-1">{trial.name}</h4>
                        <p className="text-[11px] text-gray-400">{trial.condition} • {trial.location}</p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <button onClick={() => setStep('profile')} className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl font-semibold text-sm transition">
                  Edit Profile &amp; Re-match
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
