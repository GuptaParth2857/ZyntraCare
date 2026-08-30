'use client';

import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import {
  FiSearch, FiTarget, FiCode, FiCheckCircle, FiSend, FiShield,
  FiCpu, FiBarChart2, FiDatabase, FiLock, FiAlertTriangle,
  FiMonitor, FiGlobe, FiZap, FiTool, FiRefreshCw, FiActivity, FiHeart
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FEATURE_ICONS: Record<string, IconType> = {
  target: FiTarget,
  bed: FiMonitor,
  alert: FiAlertTriangle,
  ambulance: FiActivity,
  video: FiCpu,
  brain: FiZap,
  database: FiDatabase,
  pill: FiTool,
  lab: FiCode,
};

interface Stage {
  name: string;
  icon: string;
  progress: number;
  status: string;
}

interface LiveStats {
  users: number;
  hospitals: number;
  doctors: number;
  appointments: number;
  healthRecords: number;
  ambulances: number;
  drones: number;
  beds: number;
  emergencies: number;
}

interface PipelineData {
  project: string;
  repo: string;
  framework: string;
  deployTarget: string;
  stages: Stage[];
  liveStats: LiveStats;
  updatedAt: string;
}

export default function BuildPipelinePage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [data, setData] = useState<PipelineData | null>(null);

  useEffect(() => {
    fetch('/api/build-pipeline')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const stages = data?.stages || [];
  const stats = data?.liveStats;

  const processCards = [
    {
      title: lang === 'hi' ? '1. स्वास्थ्य डेटा इंजन' : '1. Health Data Engine',
      desc: lang === 'hi'
        ? 'हेल्थ रिकॉर्ड्स, मेट्रिक्स और वियरेबल्स का वास्तविक समय एकीकरण।'
        : 'Real-time integration of health records, metrics, and wearables.',
      icon: FiDatabase,
    },
    {
      title: lang === 'hi' ? '2. एआई कोर' : '2. AI Core',
      desc: lang === 'hi'
        ? 'जेमिनी-आधारित सिम्पटम चेकर, जोखिम भविष्यवाणी और अस्पताल सिफारिशें।'
        : 'Gemini-powered symptom checker, risk prediction, and hospital recommendations.',
      icon: FiCpu,
    },
    {
      title: lang === 'hi' ? '3. रीयल-टाइम इन्फ्रा' : '3. Real-Time Infra',
      desc: lang === 'hi'
        ? 'SSE अपडेट, बेड ट्रैकिंग और एम्बुलेंस समन्वय।'
        : 'SSE updates, bed tracking, and ambulance coordination.',
      icon: FiActivity,
    },
    {
      title: lang === 'hi' ? '4. डिप्लॉयमेंट' : '4. Deployment',
      desc: lang === 'hi'
        ? `Docker + Vercel/Cloud Run पर लाइव - ${data?.deployTarget || ''}`
        : `Live on ${data?.deployTarget || 'Docker + Vercel/Cloud Run'}`,
      icon: FiSend,
    },
    {
      title: lang === 'hi' ? '5. सुरक्षा' : '5. Security',
      desc: lang === 'hi'
        ? 'एंड-टू-एंड एन्क्रिप्शन और ब्लॉकचेन-आधारित रिकॉर्ड सुरक्षा।'
        : 'End-to-end encryption and blockchain-based record security.',
      icon: FiShield,
    },
    {
      title: lang === 'hi' ? 'लाइव उत्पादन' : 'Live in Production',
      desc: lang === 'hi'
        ? `${stats ? stats.users.toLocaleString() : '—'} उपयोगकर्ता, ${stats ? stats.hospitals.toLocaleString() : '—'} अस्पताल जुड़े हुए हैं।`
        : `${stats ? stats.users.toLocaleString() : '—'} users, ${stats ? stats.hospitals.toLocaleString() : '—'} hospitals connected.`,
      icon: FiHeart,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-2 rounded-full mb-4">
              <FiSend className="text-blue-400" size={16} />
              <span className="text-blue-400 text-sm font-medium">
                {data ? `${data.project} Build & Deployment Pipeline` : 'Build & Deployment Pipeline'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {lang === 'hi' ? 'ज़िंत्रा केयर डिप्लॉयमेंट' : 'ZyntraCare Deployment'}
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              {lang === 'hi'
                ? 'वास्तविक समय फीचर स्थिति और लाइव मेट्रिक्स।'
                : 'Real-time feature status and live platform metrics.'}
            </p>
            {data && (
              <p className="text-xs text-gray-500 mt-3 font-mono">
                {data.repo} · {data.framework}
              </p>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'pipeline', label: lang === 'hi' ? 'पाइपलाइन' : 'Pipeline' },
              { id: 'metrics', label: lang === 'hi' ? 'लाइव मेट्रिक्स' : 'Live Metrics' },
              { id: 'process', label: lang === 'hi' ? 'प्रक्रिया' : 'Process' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pipeline View */}
          {activeTab === 'pipeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiCode className="text-sky-400" />
                  {lang === 'hi' ? 'फीचर बिल्ड स्थिति' : 'Feature Build Status'}
                </h2>

                {stages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Loading pipeline data...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stages.map((stage, idx) => {
                      const Icon: IconType = FEATURE_ICONS[stage.icon] || FiTarget;
                      const color =
                        stage.status === 'live'
                          ? 'from-green-500 to-emerald-500'
                          : stage.status === 'stable'
                          ? 'from-sky-500 to-blue-500'
                          : 'from-amber-500 to-orange-500';
                      return (
                        <motion.div
                          key={stage.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                <Icon className="text-white" size={18} />
                              </div>
                              <h3 className="text-white font-semibold text-sm">{stage.name}</h3>
                            </div>
                            {stage.status === 'live' && (
                              <FiCheckCircle className="text-green-400" size={16} />
                            )}
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${color} h-2 rounded-full`}
                              style={{ width: `${stage.progress}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs mt-1">
                            {stage.progress}% · {stage.status}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Live Metrics */}
          {activeTab === 'metrics' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiBarChart2 className="text-blue-400" />
                  {lang === 'hi' ? 'लाइव प्लेटफॉर्म मेट्रिक्स' : 'Live Platform Metrics'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.users, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Hospitals', value: stats.hospitals, color: 'from-rose-500 to-red-500' },
                    { label: 'Doctors', value: stats.doctors, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Health Records', value: stats.healthRecords, color: 'from-amber-500 to-orange-500' },
                    { label: 'Appointments', value: stats.appointments, color: 'from-purple-500 to-pink-500' },
                    { label: 'Ambulances', value: stats.ambulances, color: 'from-sky-500 to-blue-500' },
                    { label: 'Beds Tracked', value: stats.beds, color: 'from-teal-500 to-emerald-500' },
                    { label: 'Emergencies', value: stats.emergencies, color: 'from-red-500 to-rose-500' },
                  ].map((m, idx) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
                    >
                      <p className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${m.color}`}>
                        {m.value.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{m.label}</p>
                    </motion.div>
                  ))}
                </div>
                {data?.updatedAt && (
                  <p className="text-[10px] text-gray-600 mt-6 text-center font-mono">
                    Last sync: {new Date(data.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Process */}
          {activeTab === 'process' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiTarget className="text-purple-400" />
                  {lang === 'hi' ? 'निर्माण प्रक्रिया' : 'Build Process'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processCards.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                        <item.icon className="text-white" size={20} />
                      </div>
                      <h3 className="text-white font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-3">
                {lang === 'hi' ? 'एक साथ स्वास्थ्य सेवा बनाएं' : 'Building Healthcare Together'}
              </h3>
              <p className="text-gray-400 mb-6">
                {lang === 'hi'
                  ? 'ज़िंत्रा केयर एक निरंतर विकसित होने वाला, उत्पादन-तैयार प्लेटफॉर्म है।'
                  : 'ZyntraCare is a continuously evolving, production-ready platform.'}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-8 py-3 rounded-full font-bold transition"
              >
                <FiSend size={20} />
                {lang === 'hi' ? 'संपर्क करें' : 'Get in Touch'}
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
