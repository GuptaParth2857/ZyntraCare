'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiBriefcase, FiGlobe, FiPhone, FiMail, FiUser, FiDollarSign, FiZap } from 'react-icons/fi';
import { MdHealthAndSafety, MdBusiness } from 'react-icons/md';

const PARTNERSHIP_TYPES = [
  { id: 'hospital', label: '🏥 Hospital Network', desc: 'List your hospital on our platform' },
  { id: 'pharma', label: '💊 Pharma / MedTech', desc: 'Product integration & sponsorship' },
  { id: 'insurance', label: '🛡️ Insurance Partner', desc: 'Health insurance tie-ups' },
  { id: 'startup', label: '🚀 Health Startup', desc: 'Co-marketing & integration' },
  { id: 'sponsor', label: '💰 Platform Sponsor', desc: 'Brand visibility & sponsorship' },
  { id: 'ngo', label: '🤝 NGO / Government', desc: 'Healthcare access initiatives' },
];

const BUDGET_RANGES = ['< ₹1 Lakh', '₹1L - ₹5L', '₹5L - ₹25L', '₹25L - ₹1Cr', '₹1Cr+', 'Flexible / Discuss'];

export default function SponsorPage() {
  const [partnerType, setPartnerType] = useState('');
  const [budget, setBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ orgName: '', contact: '', email: '', phone: '', website: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerType || !form.orgName || !form.email) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1600));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-amber-600/20 rounded-full blur-[160px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px]"
          />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center max-w-lg w-full bg-slate-900/80 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30">
            <FiCheck size={36} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-3">Application Received! 🎉</h2>
          <p className="text-gray-400 mb-2">Thank you for your interest in partnering with ZyntraCare.</p>
          <p className="text-gray-500 text-sm mb-8">Our partnerships team will reach out within <span className="text-amber-400 font-bold">24-48 hours</span> to discuss the opportunity further.</p>
          <Link href="/" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold transition hover:opacity-90 shadow-lg">
            Back to ZyntraCare
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white py-12 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-amber-600/20 rounded-full blur-[160px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to ZyntraCare
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <FiZap size={14} /> Partnership & Sponsorship Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Partner With <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">ZyntraCare</span></h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Join India's fastest-growing healthcare platform. Reach millions of patients, doctors, and hospitals.</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Monthly Active Users', value: '2.4M+' },
            { label: 'Hospital Partners', value: '1,200+' },
            { label: 'Cities Covered', value: '180+' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">

          {/* Partnership Type */}
          <div>
            <label className="text-gray-300 font-semibold text-sm block mb-3">Partnership Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PARTNERSHIP_TYPES.map(pt => (
                <button key={pt.id} type="button" onClick={() => setPartnerType(pt.id)}
                  className={`p-3 rounded-xl text-left border transition text-sm ${partnerType === pt.id
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                  <div className="font-bold">{pt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{pt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Org name + contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><MdBusiness size={14} /> Organization Name *</label>
              <input required value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })}
                placeholder="Apollo Healthcare Ltd."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition" />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiUser size={12} /> Contact Person *</label>
              <input required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                placeholder="Name & Designation"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiMail size={12} /> Business Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="business@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition" />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiPhone size={12} /> Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiGlobe size={12} /> Website</label>
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourcompany.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition" />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiDollarSign size={12} /> Estimated Budget</label>
              <select value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition appearance-none">
                <option value="" className="bg-slate-900">Select range...</option>
                {BUDGET_RANGES.map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiBriefcase size={12} /> Tell Us About Your Goals</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
              placeholder="Describe what you'd like to achieve through this partnership — patient reach, brand visibility, platform integration, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition resize-none" />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            disabled={submitting || !partnerType || !form.orgName || !form.email}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2">
            {submitting ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Sending...</>
            ) : (
              <><FiZap /> Submit Partnership Application</>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
