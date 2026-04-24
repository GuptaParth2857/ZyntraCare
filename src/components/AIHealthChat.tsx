'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiAlertCircle, FiInfo, FiPhone } from 'react-icons/fi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEmergency?: boolean;
  suggestions?: string[];
  timestamp: Date;
}

interface AIHealthChatProps {
  className?: string;
  onEmergencyDetected?: () => void;
}

export default function AIHealthChat({ className = '', onEmergencyDetected }: AIHealthChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to ZyntraCare AI Assistant**

I'm here to help you with:
- 🩺 Symptom checking
- 💊 Medicine information
- 🩹 First aid guidance
- 🏥 Health condition details

**How can I help you today?**

Type your health question or describe your symptoms.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          isEmergency: data.isEmergency,
          suggestions: data.suggestions,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (data.isEmergency && onEmergencyDetected) {
          onEmergencyDetected();
        }
      } else {
        throw new Error(data.response || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error. Please try again or consult a healthcare professional directly.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickQuestions = [
    { label: 'Fever symptoms', query: 'I have fever and headache' },
    { label: 'First aid', query: 'How to treat a burn' },
    { label: 'Chest pain', query: 'I have chest pain' },
    { label: 'Medicine info', query: 'Paracetamol dosage' },
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-teal-600/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-white">ZyntraCare AI</h3>
            <p className="text-xs text-slate-400">Powered by Healthcare Knowledge</p>
          </div>
          <div className="ml-auto">
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                  : msg.isEmergency
                  ? 'bg-red-500/20 border border-red-500/40'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {msg.role === 'assistant' && msg.isEmergency && (
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <FiAlertCircle />
                  <span className="text-sm font-bold">Emergency Detected</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">
                {msg.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold my-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="ml-2">• {line.slice(2)}</p>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <p key={i} className="ml-2">{line}</p>;
                  }
                  return <p key={i} className="my-0.5">{line || ''}</p>;
                })}
              </div>
              
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400 mb-2">Suggested actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs text-slate-300 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-[10px] text-slate-500 mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <FiLoader className="animate-spin text-purple-400" />
                <span className="text-sm text-slate-400">Analyzing...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <FiAlertCircle className="text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <AnimatePresence>
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setInput(q.query)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-300 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask a question..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              rows={1}
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500'
                : 'bg-slate-700 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <FiLoader className="animate-spin text-white" />
            ) : (
              <FiSend className="text-white" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => setInput('I have chest pain - emergency')}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full text-xs text-red-400 transition"
          >
            <FiPhone /> Emergency
          </button>
          <span className="text-[10px] text-slate-500">
            For serious emergencies, call 108
          </span>
        </div>
      </form>
    </div>
  );
}