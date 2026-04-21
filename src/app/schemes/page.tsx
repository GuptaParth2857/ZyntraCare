'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiExternalLink, FiSearch, FiHeart, FiAward } from 'react-icons/fi';

interface Scheme {
  id: string;
  name: string;
  provider: string;
  category: string;
  benefit: string;
  eligibility: string;
  applyUrl: string;
  matched: boolean;
}

const SCHEMES: Scheme[] = [
  { id: '1', name: 'Ayushman Bharat PM-JAY', provider: 'Government of India', category: 'Health Insurance', benefit: '₹5L coverage per family', eligibility: 'SECC identified families', applyUrl: '#', matched: true },
  { id: '2', name: 'Rashtriya Swasthya Bima Yojana', provider: 'Government of India', category: 'Health Insurance', benefit: '₹30K coverage', eligibility: 'BPL families', applyUrl: '#', matched: true },
  { id: '3', name: 'Employees State Insurance', provider: 'ESIC', category: 'Health Insurance', benefit: 'Full medical coverage', eligibility: 'Formal sector employees', applyUrl: '#', matched: false },
  { id: '4', name: 'Central Government Health', provider: 'CGHS', category: 'Health Insurance', benefit: 'Full medical coverage', eligibility: 'Govt employees', applyUrl: '#', matched: false },
  { id: '5', name: 'Mahatma Jana Aarogya', provider: 'Karnataka Govt', category: 'Health Insurance', benefit: '₹10L coverage', eligibility: 'Karnataka residents', applyUrl: '#', matched: true },
];

const INSURANCES = [
  { id: '1', name: 'Zyntra Care Plus', premium: '₹299/mo', coverage: '₹10L', features: ['Hospitalization', 'Day care', 'Telehealth'] },
  { id: '2', name: 'Zyntra Premium', premium: '₹599/mo', coverage: '₹25L', features: ['All Plus', 'Dental', 'Vision', 'Mental health'] },
  { id: '3', name: 'Zyntra Family', premium: '₹899/mo', coverage: '₹50L', features: ['All Premium', 'Maternity', 'Child care', 'Parent coverage'] },
];

export default function SchemesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = SCHEMES.filter(s => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <FiShield className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Govt Schemes & Insurance</h1>
              <p className="text-blue-300">Find financial aid & coverage</p>
            </div>
          </div>

          <div className="relative">
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
            {['all', 'Health Insurance', 'Life Insurance', 'Disability'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  category === cat ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Matched Schemes */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiHeart className="text-red-400" /> Recommended for You
          </h2>
          <div className="space-y-3">
            {SCHEMES.filter(s => s.matched).map(scheme => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-4 border border-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Matched</span>
                    </div>
                    <p className="text-sm text-slate-500">{scheme.provider}</p>
                  </div>
                  <button className="text-blue-500 text-sm font-medium flex items-center gap-1">
                    Apply <FiExternalLink />
                  </button>
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Benefit</p>
                    <p className="font-medium text-emerald-600">{scheme.benefit}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Eligible</p>
                    <p className="font-medium">{scheme.eligibility}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Schemes */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">Government Schemes</h2>
          <div className="space-y-3">
            {filtered.filter(s => !s.matched).map(scheme => (
              <div key={scheme.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                    <p className="text-sm text-slate-500">{scheme.provider}</p>
                  </div>
                  <button className="text-blue-500 text-sm font-medium flex items-center gap-1">
                    Apply <FiExternalLink />
                  </button>
                </div>
                <p className="text-sm text-emerald-600 mt-2">{scheme.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Private Insurance */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiAward className="text-amber-400" /> ZyntraCare Plans
          </h2>
          <div className="grid gap-4">
            {INSURANCES.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-2xl font-black text-blue-600">{plan.premium}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{plan.coverage} coverage</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {plan.features.map(f => (
                    <span key={f} className="text-xs bg-slate-100 px-2 py-1 rounded-full">{f}</span>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium">Buy Now</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}