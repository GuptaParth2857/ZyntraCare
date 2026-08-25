'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiActivity, FiTrendingUp, FiBarChart2, FiArrowRight } from 'react-icons/fi';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <FiBarChart2 size={14} /> Data Analytics
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Health{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Track your health metrics, view trends, and get AI-powered insights.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/predictive-analytics', icon: '🔮', label: 'AI Predictions', desc: 'ML-based health forecasting', color: 'from-cyan-500 to-blue-500' },
            { href: '/beds', icon: '🛏️', label: 'Bed Tracker', desc: 'ICU & bed availability', color: 'from-amber-500 to-orange-500' },
            { href: '/health-tracker', icon: '📈', label: 'Health Tracker', desc: 'Monitor your vitals', color: 'from-emerald-500 to-teal-500' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group p-5 bg-white/[0.03] border border-white/10 rounded-xl hover:border-cyan-500/40 transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-3`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-white mb-1 group-hover:text-cyan-300 transition-colors">{item.label}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiActivity className="text-cyan-400" size={20} /> Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '24/7', label: 'Monitoring', color: 'from-cyan-500 to-blue-500' },
              { value: 'Real-time', label: 'Data Sync', color: 'from-teal-500 to-emerald-500' },
              { value: 'AI-Powered', label: 'Insights', color: 'from-purple-500 to-pink-500' },
              { value: 'Secure', label: 'Encrypted', color: 'from-rose-500 to-red-500' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center">
                <p className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
