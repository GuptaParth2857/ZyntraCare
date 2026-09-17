'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheck, FiX, FiAward, FiUsers, FiShield } from 'react-icons/fi';
import { PLANS } from '@/lib/plans';

export default function MembershipPlansPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-emerald-900/10" />
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <FiAward size={32} className="text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">Membership</span>
            {' '}Plans
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compare Free, Premium Monthly and Premium Yearly — start free and upgrade anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, idx) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className={`relative bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 ${plan.popular ? 'border-amber-500/40 scale-105' : 'border-white/10'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-black rounded-full flex items-center gap-1">
                  <FiAward size={12} /> MOST POPULAR
                </div>
              )}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${plan.color} text-white text-sm font-bold mb-4`}>
                <FiAward size={14} /> {plan.name}
              </div>
              <p className="text-gray-400 text-sm mb-4">{plan.tagline}</p>
              <div className="mb-5">
                <span className="text-4xl font-black">₹{plan.priceDisplay}</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <p className="text-sm font-bold">{plan.period}</p>
                  <p className="text-[10px] text-gray-500">Billing</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <p className="text-sm font-bold">{plan.coverage}</p>
                  <p className="text-[10px] text-gray-500">Coverage</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <p className="text-sm font-bold">{plan.familyMembers || '—'}</p>
                  <p className="text-[10px] text-gray-500">Family profiles</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${f.included ? 'text-gray-300' : 'text-gray-600'}`}>
                    {f.included ? <FiCheck className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <FiX className="text-gray-600 mt-0.5 flex-shrink-0" />}
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === 0 ? '/health-risk' : '/subscription'}
                className={`block w-full py-3 rounded-xl font-bold text-center transition bg-gradient-to-r ${plan.color} hover:opacity-90`}
              >
                {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <FiShield className="text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold">Razorpay Checkout</p>
            <p className="text-xs text-gray-500">Plans are paid through Razorpay's order flow. Checkout currently runs in test/demo mode until live keys are configured.</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <FiUsers className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold">Family Coverage</p>
            <p className="text-xs text-gray-500">Premium plans add family member profiles — invite and manage the whole family from one dashboard.</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <FiCheck className="text-violet-400 mx-auto mb-2" />
            <p className="text-sm font-bold">Applied Instantly</p>
            <p className="text-xs text-gray-500">Your selected plan is saved to your account right after payment and shown on your dashboard.</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Plans listed here are the product catalog. Feature availability is subject to ongoing development; consult a doctor
          for medical advice. In an emergency, call 108.
        </p>
      </div>
    </div>
  );
}