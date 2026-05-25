'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as TesseractJS from 'tesseract.js';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const quickActions = [
  '🏥 Find nearest hospital',
  '📅 Book appointment', 
  '🚨 Emergency help',
  '👨‍⚕️ Find specialist',
  '💊 Symptom analysis',
  '🛏️ Bed availability',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', content: 'Namaste! 🙏 I\'m ZyntraCare AI Assistant. How can I help you today?\n\nYou can also upload medical reports/images for OCR scanning!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const { data: { text } } = await TesseractJS.recognize(file, 'eng');
      setExtractedText(text || 'No text found in image');
    } catch {
      setExtractedText('Failed to extract text. Please try a clearer image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSend = async (text?: string) => {
    let msg = text ?? input;
    
    if (extractedText) {
      msg = msg ? `${msg}\n\n📄 Extracted from image:\n${extractedText}` : `📄 Extracted from image:\n${extractedText}`;
    }
    
    if (!msg.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setExtractedText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, I couldn\'t process that. Please try again.';
      
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', content: 'Connection error. Please check your internet.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition">← Back</Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h1 className="text-xl font-bold text-white">ZyntraCare AI</h1>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg flex items-center gap-1.5"
            >
              {ocrLoading ? '⏳ Scanning...' : '📷 Upload Report'}
            </button>
          </div>
        </div>
      </div>

      {/* OCR Preview */}
      {extractedText && (
        <div className="container mx-auto px-4 pt-4 max-w-3xl">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📄</span>
              <span className="text-sm text-blue-300">Text extracted from image</span>
            </div>
            <button onClick={() => setExtractedText('')} className="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto container mx-auto px-4 py-6 max-w-3xl">
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-slate-200 border border-white/10'
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                <div className="flex gap-1">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-sky-400 rounded-full"
                      animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mt-6">
            <p className="text-xs text-slate-500 text-center mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action)}
                  className="text-sm px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-4 mt-auto">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Describe your symptoms or ask anything..."
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() && !extractedText || isTyping}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50 hover:scale-105 transition-transform"
            >
              Send
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            AI analysis is informational only. Always consult a licensed doctor.
          </p>
        </div>
      </div>
    </div>
  );
}