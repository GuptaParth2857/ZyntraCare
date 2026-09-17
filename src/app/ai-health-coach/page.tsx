'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FiSend, FiMessageCircle, FiActivity, FiAlertTriangle, FiLogIn, FiRefreshCw, FiShield, FiZap, FiTrash2 } from 'react-icons/fi';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: string;
  sources?: string[];
  suggestions?: string[];
  isEmergency?: boolean;
}

interface HealthMetric {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
  hint?: string;
}

const QUICK_ACTIONS = [
  { label: '🤒 Fever + headache', text: 'I have a fever and headache since yesterday' },
  { label: '💊 Fever medicine', text: 'What medicine helps for fever?' },
  { label: '🩹 Burn first aid', text: 'First aid for a minor burn' },
  { label: '❤️ Heart tips', text: 'Heart health tips' },
  { label: '🧘 Reduce stress', text: 'How do I reduce stress and anxiety?' },
  { label: '🍽️ Diet advice', text: 'Give me a healthy daily diet plan' },
];

const METRIC_STATUS_COLORS: Record<HealthMetric['status'], string> = {
  normal: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
};

export default function AIHealthCoachPage() {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Hello! I'm your AI Health Coach. I use a medical knowledge base to answer questions about symptoms, first aid, medicines and everyday health. Ask me anything — try a suggestion below.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMetrics = async () => {
    if (!isLoggedIn) return;
    setMetricsLoading(true);
    setMetricsError('');
    try {
      const res = await fetch('/api/ai-health-coach');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setMetrics(data.metrics || []);
    } catch {
      setMetricsError('Could not load your live metrics');
      setMetrics([]);
    }
    setMetricsLoading(false);
  };

  useEffect(() => {
    if (status !== 'loading') fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (overrideInput?: string) => {
    const text = (overrideInput || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      type: 'user',
      message: text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/ai-health-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) throw new Error('failed');
      const result = await res.json();
      const aiMsg: ChatMessage = {
        id: `a${Date.now() + 1}`,
        type: 'ai',
        message: result.response,
        timestamp: new Date().toLocaleTimeString(),
        sources: result.sources || [],
        suggestions: result.suggestions || [],
        isEmergency: result.isEmergency,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = {
        id: `a${Date.now() + 1}`,
        type: 'ai',
        message: "I'm having trouble processing that right now. Please try again, or consult a healthcare professional for medical advice.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-cyan-950/10" />
        <div className="absolute top-[6%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiZap size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            AI Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Coach</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Instant answers from a medical knowledge engine — symptoms, first aid, medicines and everyday health.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[calc(100vh-320px)] min-h-[520px]"
          >
            {/* Chat header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shrink-0">
                <FiMessageCircle className="text-white" />
              </div>
              <div>
                <h2 className="font-bold">AI Health Coach</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {isLoggedIn ? 'Personalized with your latest readings' : 'Medical knowledge engine — instant answers'}
                </p>
              </div>
              <button
                onClick={() => setMessages([
                  {
                    id: '1',
                    type: 'ai',
                    message: "Hello! I'm your AI Health Coach. I use a medical knowledge base to answer questions about symptoms, first aid, medicines and everyday health. Ask me anything — try a suggestion below.",
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ])}
                className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition"
                aria-label="Clear chat"
              >
                <FiTrash2 /> Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.type === 'ai' && msg.isEmergency && (
                    <div className="mb-2 max-w-[85%] bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-2.5 text-xs text-red-300 font-bold flex items-center gap-2">
                      <FiAlertTriangle className="shrink-0" /> Possible emergency — call 108 immediately, then keep reading below.
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-[1.25rem] p-3.5 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : msg.isEmergency
                        ? 'bg-slate-900 border border-red-500/50'
                        : 'bg-white/5 border border-white/10'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message.split('**').join('')}</p>
                    {msg.type === 'ai' && msg.sources && msg.sources.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-2">From: {msg.sources.join(' · ')}</p>
                    )}
                    <p className={`text-[11px] mt-1.5 ${msg.type === 'user' ? 'text-white/60' : 'text-gray-500'}`}>{msg.timestamp}</p>
                  </div>
                  {msg.type === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-[1.25rem] p-3.5 flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Ask about symptoms, medicine, first aid..."
                  autoFocus
                  className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl font-bold disabled:opacity-50 transition"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold flex items-center gap-2">
                  <FiActivity className="text-emerald-400" /> Live Health Metrics
                </h2>
                {isLoggedIn && (
                  <button onClick={fetchMetrics} className="text-gray-400 hover:text-white transition" aria-label="Refresh metrics">
                    <FiRefreshCw className={metricsLoading ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="text-center py-6">
                  <FiLogIn className="mx-auto text-emerald-400 mb-3" size={32} />
                  <p className="font-bold text-sm">Sign in for your live metrics</p>
                  <p className="text-gray-500 text-xs mt-1 mb-4">Chat works without login — metrics are private to you.</p>
                  <Link
                    href="/auth/signin?callbackUrl=/ai-health-coach"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
                  >
                    <FiLogIn /> Sign In
                  </Link>
                </div>
              ) : metricsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : metricsError ? (
                <div className="text-center py-6">
                  <FiAlertTriangle className="text-amber-400 mx-auto mb-3" size={28} />
                  <p className="font-bold text-sm mb-1">{metricsError}</p>
                  <button
                    onClick={fetchMetrics}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-bold hover:bg-emerald-500/25 transition"
                  >
                    Try again
                  </button>
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-6">
                  <p className="font-bold text-sm mb-1">No health data yet</p>
                  <p className="text-gray-500 text-xs mb-4">Track your vitals to get a live health score and coaching context.</p>
                  <Link href="/health-tracker" className="text-emerald-400 text-sm font-bold hover:underline">
                    Open Health Tracker →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.map((m, i) => (
                    <div key={`${m.label}-${i}`} className="flex items-center gap-3 bg-slate-900/60 border border-white/5 rounded-2xl px-4 py-3">
                      <span className="text-lg">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">{m.label}</p>
                        {m.hint && <p className="text-[10px] text-gray-600 truncate">{m.hint}</p>}
                      </div>
                      <span className={`font-black text-sm whitespace-nowrap ${METRIC_STATUS_COLORS[m.status]}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
            >
              <h2 className="font-bold mb-4">Try asking</h2>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.label}
                    onClick={() => sendMessage(a.text)}
                    className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-200 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
            >
              <h2 className="font-bold flex items-center gap-2 mb-2">
                <FiShield className="text-amber-400" /> Please note
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                This coach provides general health information and is <b className="text-gray-300">not a medical diagnosis</b>.
                Always consult a qualified doctor for medical advice. In an emergency, call{' '}
                <b className="text-red-400">108</b> (ambulance) or <b className="text-red-400">112</b> (all-India emergency).
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}