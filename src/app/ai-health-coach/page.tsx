'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiSend, FiActivity, FiHeart, FiZap, FiAlertTriangle, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: string;
}

interface HealthMetric {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}

const HEALTH_METRICS: HealthMetric[] = [
  { label: 'Heart Rate', value: '72 bpm', status: 'normal', icon: '❤️' },
  { label: 'Blood Pressure', value: '120/80', status: 'normal', icon: '🩺' },
  { label: 'Blood Sugar', value: '95 mg/dL', status: 'normal', icon: '🩸' },
  { label: 'Sleep', value: '7.5 hrs', status: 'normal', icon: '😴' },
  { label: 'Steps', value: '8,432', status: 'normal', icon: '👟' },
];

const SUGGESTIONS = [
  { keyword: 'heart', response: 'Your heart rate isnormal (72 bpm). For a healthy heart, aim for 150 minutes of moderate exercise per week. Would you like me to create an exercise plan?' },
  { keyword: 'sleep', response: 'You slept 7.5 hours last night - great! Aim to maintain 7-9 hours of sleep for optimal recovery. Avoid screens 1 hour before bed.' },
  { keyword: 'stress', response: 'I notice your stress indicators are slightly elevated. Consider a 5-minute breathing exercise: Inhale for 4 seconds, hold for 4, exhale for 4. Want me to guide you through it?' },
  { keyword: 'exercise', response: 'Great question! For your age group, I recommend: 30 min brisk walk, 3x/week. Start slow and gradually increase intensity. Want me to set reminders?' },
  { keyword: 'diet', response: 'Based on your health data, focus on: more protein, less sugar, stay hydrated (8 glasses/day). Want meal suggestions?' },
  { keyword: 'default', response: "I'm here to help! Ask me about your health metrics, get exercise tips, or advice on diet and lifestyle. You can also say 'Let's talk' to chat naturally." },
];

export default function AIHealthCoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', type: 'ai', message: "Hello! I'm your AI Health Coach. I monitor your health metrics and provide personalized advice. How can I help you today?", timestamp: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [metrics] = useState<HealthMetric[]>(HEALTH_METRICS);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const keyword = input.toLowerCase();
      const match = SUGGESTIONS.find(s => keyword.includes(s.keyword));
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: match?.response || SUGGESTIONS[SUGGESTIONS.length - 1].response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Health Coach</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Online 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Health Metrics Strip */}
        <div className="p-3 bg-white/5 border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto">
            {metrics.map((metric, i) => (
              <div key={i} className="flex-shrink-0 bg-white/5 rounded-lg px-3 py-2 text-center">
                <span className="text-lg">{metric.icon}</span>
                <p className="text-xs font-medium mt-1">{metric.label}</p>
                <p className={`text-sm font-bold ${
                  metric.status === 'normal' ? 'text-emerald-400' :
                  metric.status === 'warning' ? 'text-amber-400' :
                  'text-red-400'
                }`}>{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-white/10 border border-white/10'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-50 mt-1">{msg.timestamp}</p>
              </div>
            </motion.div>
          ))}
          
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-2 border-t border-white/10 flex gap-2 overflow-x-auto">
          {['Heart health', 'Sleep tips', 'Reduce stress', 'Exercise plan', 'Diet advice'].map(action => (
            <button
              key={action}
              onClick={() => { setInput(action); setTimeout(sendMessage, 100); }}
              className="flex-shrink-0 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about your health..."
              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl disabled:opacity-50"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}