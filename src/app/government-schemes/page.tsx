'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiExternalLink, FiSearch, FiHeart, FiAward, FiUsers, FiCpu, FiFileText, FiAlertCircle } from 'react-icons/fi';

interface GovtScheme {
  id: string;
  name: string;
  ministry: string;
  category: string;
  coverage: string;
  benefit: string;
  eligibility: string;
  documents: string[];
  applyUrl: string;
  premium: string;
  coverageAmount: string;
  familiesCovered: string;
  priority: 'ayushman' | 'pmjay' | 'state' | 'other';
}

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState<GovtScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [eligibleSchemes, setEligibleSchemes] = useState<GovtScheme[]>([]);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [eligibilityData, setEligibilityData] = useState({
    annualIncome: 'below-5lakh',
    hasRationCard: false,
    familySize: 4,
    isBpl: false,
    state: 'Delhi',
  });

  useEffect(() => {
    fetch('/api/government-schemes')
      .then(r => r.json())
      .then(data => {
        setSchemes(data.schemes || []);
        setLoading(false);
      })
      .catch(() => {
        setSchemes([
          {
            id: '1',
            name: 'Ayushman Bharat - PM-JAY',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Health Insurance',
            coverage: '₹5,00,000 per family per year',
            benefit: 'Cashless hospitalization coverage up to ₹5 lakh per family per year',
            eligibility: 'Beneficiaries identified by SECC database. Over 10.74 crore poor and vulnerable families covered.',
            documents: ['Aadhaar Card', 'Ration Card', 'Voter ID', 'SECC Document'],
            applyUrl: 'https://pmjay.gov.in/',
            premium: 'Free (Government Funded)',
            coverageAmount: '₹5,00,000',
            familiesCovered: '100+ million families',
            priority: 'ayushman',
          },
          {
            id: '2',
            name: 'Central Government Health Scheme (CGHS)',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Health Insurance',
            coverage: 'Comprehensive out-patient and in-patient',
            benefit: 'Comprehensive medical care for government employees and pensioners',
            eligibility: 'Central Government employees, pensioners, and their dependents',
            documents: ['Aadhaar Card', 'Service Certificate', 'Pension Document'],
            applyUrl: 'https://cghs.gov.in/',
            premium: 'Monthly contribution based on pay',
            coverageAmount: 'Full coverage',
            familiesCovered: 'Millions of beneficiaries',
            priority: 'other',
          },
          {
            id: '3',
            name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Maternal Health',
            coverage: 'Free antenatal care and checkups',
            benefit: 'Free antenatal checkups, supplements, and consultations on 9th of every month',
            eligibility: 'All pregnant women across India',
            documents: ['Aadhaar Card', 'Pregnancy Card'],
            applyUrl: 'https://pmsma.nhp.gov.in/',
            premium: 'Free',
            coverageAmount: 'Free checkups',
            familiesCovered: 'All pregnant women',
            priority: 'state',
          },
          {
            id: '4',
            name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
            ministry: 'Ministry of Finance',
            category: 'Accident Insurance',
            coverage: '₹2,00,000 on accidental death',
            benefit: 'Accident insurance coverage of ₹2 lakh with ₹12 annual premium',
            eligibility: 'All bank account holders aged 18-70 years',
            documents: ['Aadhaar Card', 'Bank Account', 'Mobile Number'],
            applyUrl: 'https://jansuraksha.gov.in/',
            premium: '₹12/year',
            coverageAmount: '₹2,00,000',
            familiesCovered: 'Millions of citizens',
            priority: 'other',
          },
          {
            id: '5',
            name: 'Janani Shishu Suraksha Karyakram (JSSK)',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Maternal & Child Health',
            coverage: 'Free delivery and treatment',
            benefit: 'Free delivery, C-section, medicines, and diet for pregnant women',
            eligibility: 'All pregnant women delivering in government health facilities',
            documents: ['Aadhaar Card', 'Pregnancy Card'],
            applyUrl: 'https://nhm.gov.in/',
            premium: 'Free',
            coverageAmount: 'Fully free',
            familiesCovered: 'All eligible mothers',
            priority: 'state',
          },
          {
            id: '6',
            name: 'Ayushman Bharat Health and Wellness Centers',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Primary Healthcare',
            coverage: 'Free primary healthcare',
            benefit: 'Free primary healthcare services including screening, medicines, and telemedicine',
            eligibility: 'All citizens living near designated centers',
            documents: ['Aadhaar Card'],
            applyUrl: 'https://ab-hwc.nhp.gov.in/',
            premium: 'Free',
            coverageAmount: 'Fully free',
            familiesCovered: '1.5 lakh+ centers',
            priority: 'ayushman',
          },
          {
            id: '7',
            name: 'Pradhan Mantri Garib Kalyan Package',
            ministry: 'Ministry of Health',
            category: 'COVID Relief',
            coverage: 'Free healthcare during emergencies',
            benefit: 'Special package for free healthcare for beneficiaries during COVID-19',
            eligibility: 'PM-JAY beneficiaries',
            documents: ['Aadhaar Card', 'PM-JAY Card'],
            applyUrl: 'https://pmjay.gov.in/',
            premium: 'Free',
            coverageAmount: '₹5,00,000',
            familiesCovered: '100+ million families',
            priority: 'pmjay',
          },
          {
            id: '8',
            name: 'National AMRIT Pharmacies',
            ministry: 'Ministry of Health & Family Welfare',
            category: 'Medicine',
            coverage: 'Discounted medicines for cancer & cardiac',
            benefit: 'Generic medicines at 50-95% discount on cancer and cardiac drugs',
            eligibility: 'All citizens with valid prescription',
            documents: ['Prescription', 'Medical Report'],
            applyUrl: 'https://amritpharmacy.in/',
            premium: 'No premium',
            coverageAmount: 'Up to 95% discount',
            familiesCovered: 'All citizens',
            priority: 'other',
          },
          {
            id: '9',
            name: 'Senior Citizen Health Insurance',
            ministry: 'Various State Health Departments',
            category: 'Senior Citizen',
            coverage: 'Hospitalization for seniors',
            benefit: 'Health insurance coverage for senior citizens aged 60+',
            eligibility: 'Citizens aged 60 years and above',
            documents: ['Aadhaar Card', 'Age Proof'],
            applyUrl: '#',
            premium: 'Low premium',
            coverageAmount: 'Varies by state',
            familiesCovered: 'Senior citizens',
            priority: 'state',
          },
          {
            id: '10',
            name: 'PMJAY - Kedar Grameen Scheme',
            ministry: 'National Health Authority',
            category: 'Health Insurance',
            coverage: 'Expanded PMJAY coverage',
            benefit: 'Extended coverage for more beneficiaries through state-specific PMJAY variants',
            eligibility: 'As per state eligibility criteria',
            documents: ['Aadhaar Card', 'State Documents'],
            applyUrl: 'https://pmjay.gov.in/',
            premium: 'Free',
            coverageAmount: '₹5,00,000',
            familiesCovered: 'Varies by state',
            priority: 'pmjay',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = schemes.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ministry.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || s.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const checkEligibility = () => {
    const eligible = schemes.filter(s => {
      if (s.priority === 'ayushman' || s.priority === 'pmjay') {
        if (eligibilityData.annualIncome === 'below-5lakh' || eligibilityData.isBpl || eligibilityData.hasRationCard) {
          return true;
        }
      }
      if (s.category === 'Maternal & Child Health' || s.category === 'Maternal Health') {
        return true;
      }
      if (s.category === 'Primary Healthcare') {
        return true;
      }
      return false;
    });
    setEligibleSchemes(eligible);
    setShowEligibilityCheck(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'ayushman': return <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold">Ayushman Bharat</span>;
      case 'pmjay': return <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold">PM-JAY</span>;
      case 'state': return <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs font-bold">State Scheme</span>;
      default: return <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs font-bold">Central Scheme</span>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-br from-green-900 via-slate-900 to-slate-900 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <FiShield className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Government Health Schemes</h1>
              <p className="text-green-300">Ayushman Bharat, PM-JAY & More</p>
            </div>
          </div>

          {/* Eligibility Checker */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEligibilityCheck(true)}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
          >
            <FiCpu size={20} /> Check Your AI Eligibility
          </motion.button>

          <div className="relative mt-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {['all', 'Health Insurance', 'Maternal Health', 'Maternal & Child Health', 'Accident Insurance', 'Primary Healthcare', 'Medicine', 'Senior Citizen', 'COVID Relief'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  category === cat ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Highlighted Schemes */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiHeart className="text-red-400" /> Ayushman Bharat & PM-JAY
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.filter(s => s.priority === 'ayushman' || s.priority === 'pmjay').map(scheme => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200" 
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{scheme.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{scheme.ministry}</p>
                  </div>
                  {getPriorityBadge(scheme.priority)}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-emerald-600 font-semibold">{scheme.coverage}</p>
                  <p className="text-sm text-slate-600 mt-2">{scheme.benefit}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Annual Coverage</p>
                    <p className="font-bold text-green-700">{scheme.coverageAmount}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Cost</p>
                    <p className="font-bold text-emerald-700">{scheme.premium}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 mb-2">Required Documents</p>
                  <div className="flex flex-wrap gap-1">
                    {scheme.documents.map(doc => (
                      <span key={doc} className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">{doc}</span>
                    ))}
                  </div>
                </div>

                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  Apply Now <FiExternalLink size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Schemes */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">All Government Schemes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.filter(s => s.priority !== 'ayushman' && s.priority !== 'pmjay').map(scheme => (
              <div key={scheme.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                    <p className="text-xs text-slate-500">{scheme.ministry}</p>
                  </div>
                  {getPriorityBadge(scheme.priority)}
                </div>
                <p className="text-sm text-emerald-600 mb-2 font-medium">{scheme.coverage}</p>
                <p className="text-sm text-slate-600 mb-3">{scheme.benefit}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{scheme.premium}</span>
                  <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 text-sm font-medium flex items-center gap-1 hover:text-green-700">
                    Learn More <FiExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ABHA Section */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiUsers size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl">Create Your ABHA Number</h3>
              <p className="text-sm text-green-100">Ayushman Bharat Health Account - Your Digital Health ID</p>
            </div>
          </div>
          <p className="text-sm text-green-50 mb-4">
            Link your ABHA number to ZyntraCare for seamless health record access, government scheme eligibility, and cashless hospitalization.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-green-700 rounded-xl font-bold hover:bg-green-50 transition">
              Create ABHA Number
            </button>
            <button className="px-6 py-3 bg-white/20 border border-white/30 rounded-xl font-bold hover:bg-white/30 transition">
              Link Existing ABHA
            </button>
          </div>
        </div>
      </div>

      {/* Eligibility Check Modal */}
      {showEligibilityCheck && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={() => setShowEligibilityCheck(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Check Scheme Eligibility</h2>
              <button onClick={() => setShowEligibilityCheck(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Annual Household Income</label>
                <select
                  value={eligibilityData.annualIncome}
                  onChange={(e) => setEligibilityData({ ...eligibilityData, annualIncome: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-green-500"
                >
                  <option value="below-5lakh">Below ₹5,00,000</option>
                  <option value="5-10lakh">₹5,00,000 - ₹10,00,000</option>
                  <option value="above-10lakh">Above ₹10,00,000</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">State</label>
                <select
                  value={eligibilityData.state}
                  onChange={(e) => setEligibilityData({ ...eligibilityData, state: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-green-500"
                >
                  {['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Haryana'].map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibilityData.hasRationCard}
                    onChange={(e) => setEligibilityData({ ...eligibilityData, hasRationCard: e.target.checked })}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span className="text-sm text-slate-700">Has Ration Card</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibilityData.isBpl}
                    onChange={(e) => setEligibilityData({ ...eligibilityData, isBpl: e.target.checked })}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span className="text-sm text-slate-700">Below Poverty Line (BPL)</span>
                </label>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Family Size</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={eligibilityData.familySize}
                  onChange={(e) => setEligibilityData({ ...eligibilityData, familySize: parseInt(e.target.value) || 1 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <button
              onClick={checkEligibility}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
            >
              Check My Eligibility
            </button>

            {eligibleSchemes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" /> You may be eligible for:
                </h3>
                <div className="space-y-3">
                  {eligibleSchemes.map(s => (
                    <div key={s.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                      <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{s.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
