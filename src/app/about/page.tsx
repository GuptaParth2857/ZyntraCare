'use client';

import { motion } from 'framer-motion';
import { FiHeart, FiShield, FiUsers, FiGlobe, FiAward, FiTrendingUp, FiCheck } from 'react-icons/fi';

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '500+', label: 'Partner Hospitals' },
  { value: '1000+', label: 'Verified Doctors' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Emergency Support' },
  { value: '15+', label: 'Cities Covered' },
];

const values = [
  { icon: FiHeart, title: 'Patient First', desc: 'Every feature we build starts with a simple question: how does this help the patient?' },
  { icon: FiShield, title: 'Privacy & Security', desc: 'Your health data is encrypted end-to-end. We never share your information without explicit consent.' },
  { icon: FiUsers, title: 'Inclusive Access', desc: 'Healthcare should be accessible to everyone. We support Hindi, English, and more languages.' },
  { icon: FiGlobe, title: 'Pan-India Reach', desc: 'From metros to rural areas, we are building infrastructure for India\'s diverse healthcare needs.' },
  { icon: FiAward, title: 'Quality Care', desc: 'We partner only with verified healthcare providers and hospitals.' },
  { icon: FiTrendingUp, title: 'Innovation First', desc: 'AI-powered symptom analysis, blockchain health records, and real-time bed tracking.' },
];

const team = [
  { name: 'Parth Gupta', role: 'Founder & CEO', bio: 'Building India\'s most accessible healthcare platform.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-28">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
            <FiHeart className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">ZyntraCare</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            ZyntraCare is India&#39;s comprehensive healthcare platform — connecting patients with doctors, 
            hospitals, and emergency services through a single, intelligent interface.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-8 md:p-12 mb-16"
        >
          <h2 className="text-3xl font-black mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
            To make quality healthcare accessible to every Indian, regardless of where they live. 
            We combine cutting-edge technology — AI, blockchain, real-time tracking — with a deep 
            understanding of India&#39;s healthcare challenges to build a platform that serves patients, 
            doctors, and hospitals alike.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Story */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-black mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed max-w-4xl">
            <p>
              ZyntraCare was born from a simple observation: India&#39;s healthcare system is fragmented. 
              A patient might need to visit multiple apps to find a doctor, check hospital bed availability, 
              book a lab test, order medicines, and maintain health records. We set out to build one platform 
              that does it all.
            </p>
            <p>
              Since our launch, we have grown from a simple appointment booking service to a full-stack 
              healthcare platform featuring AI-powered symptom analysis, real-time hospital bed tracking, 
              blockchain-based health records, ambulance coordination, medicine delivery, and emergency services.
            </p>
            <p>
              Today, ZyntraCare serves users across 15+ Indian cities, with a network of 500+ hospitals 
              and 1000+ verified doctors. We are committed to expanding our reach to every corner of India.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-black mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <div key={v.title} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="text-white" size={22} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-black mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {team.map((m) => (
              <div key={m.name} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-white text-lg">{m.name}</h3>
                <p className="text-emerald-400 text-sm font-semibold mb-2">{m.role}</p>
                <p className="text-gray-400 text-sm">{m.bio}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-10"
        >
          <h2 className="text-3xl font-black mb-4">Join Us in Building Healthier India</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Whether you are a patient, doctor, or hospital, ZyntraCare is here to make healthcare simpler, faster, and more accessible.
          </p>
          <a href="/auth/signin" className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-600/30">
            Get Started Free
          </a>
        </motion.div>
      </div>
    </div>
  );
}
