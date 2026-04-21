'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiTarget, FiCode, FiCheckCircle, FiSend, FiShield,
  FiCpu, FiBarChart2, FiDatabase, FiMail, FiLock, FiAlertTriangle,
  FiMonitor, FiGlobe, FiZap, FiTool, FiRefreshCw, FiActivity
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stages = [
  { id: 1, name: 'Discover Market', icon: FiSearch, color: 'from-blue-500 to-cyan-500', progress: 100 },
  { id: 2, name: 'Auto-Plan Features', icon: FiTarget, color: 'from-purple-500 to-pink-500', progress: 100 },
  { id: 3, name: 'Database & Security', icon: FiDatabase, color: 'from-orange-500 to-red-500', progress: 85 },
  { id: 4, name: 'Build APIs', icon: FiCode, color: 'from-green-500 to-emerald-500', progress: 70 },
  { id: 5, name: 'Frontend UI', icon: FiCpu, color: 'from-sky-500 to-blue-500', progress: 60 },
  { id: 6, name: 'Testing', icon: FiActivity, color: 'from-amber-500 to-yellow-500', progress: 45 },
  { id: 7, name: 'Quality Gate', icon: FiShield, color: 'from-red-500 to-rose-500', progress: 30 },
];

const aiAgents = [
  { name: 'Market Analyst', desc: 'Find real market size data', icon: FiBarChart2 },
  { name: 'Competitor Hunter', desc: 'Find & verify competitors', icon: FiTarget },
  { name: 'Pricing Engineer', desc: 'Reverse-engineer pricing models', icon: FiCpu },
  { name: 'Tool Scout', desc: 'Best APIs for your build', icon: FiCode },
  { name: 'Social Proof Finder', desc: 'Find revenue-generating businesses', icon: FiZap },
  { name: 'SEO Researcher', desc: 'Real search volume keywords', icon: FiGlobe },
  { name: 'Build Fixer', desc: 'Auto-resolve build errors', icon: FiTool },
  { name: 'Security Scanner', desc: 'Vulnerability detection', icon: FiShield },
];

const postLaunchCommands = [
  { cmd: '/security', desc: 'Scan vulnerabilities', icon: FiShield },
  { cmd: '/pentest', desc: 'Run attack simulations', icon: FiAlertTriangle },
  { cmd: '/audit', desc: 'Full security audit', icon: FiLock },
  { cmd: '/performance', desc: 'Optimize speed', icon: FiZap },
  { cmd: '/seo', desc: 'Search rankings', icon: FiGlobe },
  { cmd: '/monitor', desc: 'App monitoring', icon: FiMonitor },
  { cmd: '/enhance', desc: 'Add features', icon: FiCpu },
  { cmd: '/spec', desc: 'Update specs', icon: FiTarget },
  { cmd: '/design', desc: 'UI improvements', icon: FiCode },
  { cmd: '/emails', desc: 'Lifecycle emails', icon: FiMail },
  { cmd: '/sentry', desc: 'Error tracking', icon: FiAlertTriangle },
  { cmd: '/domain', desc: 'Domain setup', icon: FiGlobe },
  { cmd: '/logo', desc: 'Branding', icon: FiTarget },
  { cmd: '/maintain', desc: 'Auto-maintenance', icon: FiRefreshCw },
];

export default function BuildPipelinePage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('pipeline');

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
                {lang === 'hi' ? 'Build This Now Pipeline' : 'Build This Now Pipeline'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {lang === 'hi' ? 'AI-Powered SaaS बिल्डर' : 'AI-Powered SaaS Builder'}
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              {lang === 'hi'
                ? '18 AI एजेंट्स। 7-स्टेज बिल्ड पाइपलाइन। सप्ताहांत में प्रोडक्शन-रेडी SaaS।'
                : '18 AI agents. 7-stage build pipeline. Production-ready SaaS in a weekend.'}
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'pipeline', label: lang === 'hi' ? 'पाइपलाइन' : 'Pipeline' },
              { id: 'agents', label: lang === 'hi' ? 'AI एजेंट्स' : 'AI Agents' },
              { id: 'commands', label: lang === 'hi' ? 'पोस्ट-लॉन्च कमांड्स' : 'Post-Launch' },
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
              {/* 7 Stage Pipeline */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiCode className="text-sky-400" />
                  {lang === 'hi' ? '7-स्टेज बिल्ड प्रोसेस' : '7-Stage Build Process'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {stages.map((stage, idx) => (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-center"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center mx-auto mb-3`}>
                        <stage.icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{stage.name}</h3>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${stage.color} h-2 rounded-full`}
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs mt-1">{stage.progress}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Process Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    title: lang === 'hi' ? '1. मार्केट डिस्कवरी' : '1. Discover Market',
                    desc: lang === 'hi'
                      ? '6 रिसर्च एजेंट्स आपके आइडिया पर काम करते हैं - मार्केट साइज, कम्पिटिटर्स, प्राइसिंग, टूल्स।'
                      : '6 research agents work on your idea - market size, competitors, pricing, tools.',
                    icon: FiSearch 
                  },
                  { 
                    title: lang === 'hi' ? '2. ऑटो-प्लान' : '2. Auto-Plan',
                    desc: lang === 'hi'
                      ? 'हर फीचर के लिए स्पेसिफिकेशन - यूजर व्यू, बिजनेस लॉजिक, डेटाबेस, एपीआई।'
                      : 'Specifications for every feature - user view, business logic, database, API.',
                    icon: FiTarget 
                  },
                  { 
                    title: lang === 'hi' ? '3. बिल्ड' : '3. Build',
                    desc: lang === 'hi'
                      ? '7 स्टेज पाइपलाइन से हर फीचर बनता है - प्लान, डेटाबेस, एपीआई, यूआई, टेस्ट, क्वालिटी गेट।'
                      : 'Every feature through 7 stages - plan, DB, API, UI, test, quality gate.',
                    icon: FiCode 
                  },
                  { 
                    title: lang === 'hi' ? '4. लॉन्च' : '4. Launch',
                    desc: lang === 'hi'
                      ? 'Vercel पर डिप्लॉय करें (फ्री टियर) - स्टैंडर्ड Next.js कोडबेस।'
                      : 'Deploy to Vercel (free tier) - standard Next.js codebase.',
                    icon: FiSend 
                  },
                  { 
                    title: lang === 'hi' ? '5. स्टे अलाइव' : '5. Stay Alive',
                    desc: lang === 'hi'
                      ? '14 पोस्ट-लॉन्च कमांड्स - सिक्योरिटी, परफॉर्मेंस, एन्हांसमेंट, मेंटेनेंस।'
                      : '14 post-launch commands - security, performance, enhancement, maintenance.',
                    icon: FiShield 
                  },
                  { 
                    title: lang === 'hi' ? '395+ घंटे' : '395+ Hours Saved',
                    desc: lang === 'hi'
                      ? 'ऑथेंटिकेशन, पेमेंट्स, डेटाबेस, सिक्योरिटी - सब पहले से बना है।'
                      : 'Auth, payments, database, security - all pre-built.',
                    icon: FiZap 
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="text-white" size={20} />
                    </div>
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Agents */}
          {activeTab === 'agents' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiCpu className="text-purple-400" />
                  {lang === 'hi' ? '18 AI एजेंट्स' : '18 AI Agents'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {aiAgents.map((agent, idx) => (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-sky-500/50 transition"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                        <agent.icon className="text-white" size={18} />
                      </div>
                      <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                      <p className="text-gray-400 text-xs">{agent.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-white font-bold mb-3">
                    {lang === 'hi' ? 'आउटपुट: 7 डॉक्यूमेंट' : 'Output: 7 Documents'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      lang === 'hi' ? 'प्रोडक्ट स्पेक' : 'Product Spec',
                      lang === 'hi' ? 'मार्केट रिपोर्ट' : 'Market Report',
                      lang === 'hi' ? 'फीचर लिस्ट' : 'Feature List',
                      lang === 'hi' ? 'ब्रांड गाइड' : 'Brand Guide',
                      lang === 'hi' ? 'यूजर परसोना' : 'User Personas',
                      lang === 'hi' ? 'टूल रिकमेंडेशन' : 'Tool Recommendations',
                      lang === 'hi' ? 'यूआई पैटर्न्स' : 'UI Patterns',
                    ].map((doc) => (
                      <div key={doc} className="flex items-center gap-2 text-gray-300 text-sm">
                        <FiCheckCircle className="text-green-400" size={14} />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Post-Launch Commands */}
          {activeTab === 'commands' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiShield className="text-green-400" />
                  {lang === 'hi' ? '14 पोस्ट-लॉन्च कमांड्स' : '14 Post-Launch Commands'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postLaunchCommands.map((cmd, idx) => (
                    <motion.div
                      key={cmd.cmd}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:border-sky-500/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                          <cmd.icon className="text-sky-400" size={16} />
                        </div>
                        <div>
                          <code className="text-sky-400 font-mono text-sm">{cmd.cmd}</code>
                          <p className="text-gray-500 text-xs">{cmd.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                    <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                      <FiShield size={18} />
                      {lang === 'hi' ? 'सिक्योरिटी कमांड्स' : 'Security Commands'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {lang === 'hi'
                        ? '/security - वल्नरेबिलिटी स्कैन\n/pentest - अटैक सिमुलेशन\n/audit - फुल ऑडिट'
                        : '/security - Vulnerability scan\n/pentest - Attack simulation\n/audit - Full audit'}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                    <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                      <FiZap size={18} />
                      {lang === 'hi' ? 'परफॉर्मेंस कमांड्स' : 'Performance Commands'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {lang === 'hi'
                        ? '/performance - स्पीड ऑप्टिमाइज\n/seo - सर्च रैंकिंग\n/monitor - मॉनिटरिंग'
                        : '/performance - Speed optimize\n/seo - Search ranking\n/monitor - App monitoring'}
                    </p>
                  </div>
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
                {lang === 'hi' ? 'अभी शुरू करें' : 'Start Building Today'}
              </h3>
              <p className="text-gray-400 mb-6">
                {lang === 'hi'
                  ? 'वीकेंड में अपना SaaS बनाएं - ऑथ, पेमेंट, सिक्योरिटी सब तैयार।'
                  : 'Build your SaaS in a weekend - auth, payments, security all ready.'}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-8 py-3 rounded-full font-bold transition"
              >
                <FiSend size={20} />
                {lang === 'hi' ? 'अपना प्रोजेक्ट शुरू करें' : 'Start Your Project'}
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}