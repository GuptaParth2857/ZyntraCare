'use client';

import { useState, useRef, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { ChatMessage } from '@/types';
import {
  FiSend, FiMic, FiMicOff, FiMinimize2, FiTrash2,
  FiVolume2, FiVolumeX, FiZap, FiChevronDown,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, availableLanguages } from '@/context/LanguageContext';

const quickActions = [
  { en: '🏥 Find nearest hospital', hi: '🏥 नज़दीकी अस्पताल खोजें' },
  { en: '📅 Book appointment', hi: '📅 अपॉइंटमेंट बुक करें' },
  { en: '🚨 Emergency help', hi: '🚨 आपातकालीन मदद' },
  { en: '👨‍⚕️ Find specialist', hi: '👨‍⚕️ विशेषज्ञ खोजें' },
  { en: '💊 Symptom analysis', hi: '💊 लक्षण विश्लेषण' },
  { en: '🛏️ Bed availability', hi: '🛏️ बेड उपलब्धता जांचें' },
];

/* ── Animated AI Brain Logo ── */
function AiBrain({ size = 24 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <path d="M12 2C9.5 2 7.5 3.8 7 6c-.7.3-1.3.8-1.7 1.5C4.1 8 3.5 9.5 4 11c-.8.7-1 1.8-.8 2.8.3 1.4 1.4 2.4 2.8 2.5V17c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4v-.7c1.4-.1 2.5-1.1 2.8-2.5.2-1-.1-2.1-.8-2.8.5-1.5-.1-3-.8-3.5-.3-1.2-1.4-2.3-2.7-2.5C15.7 3.3 14 2 12 2z" stroke="url(#g)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 12c.5.5 1.5 1 3 1s2.5-.5 3-1" stroke="url(#g2)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 9.5v1M14.5 9.5v1" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="g" x1="4" y1="2" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="g2" x1="9" y1="12" x2="15" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div className="flex items-end gap-1 h-4">
      {[0, 0.15, 0.3].map((d, i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-400"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: d }}
        />
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function Chatbot() {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1', role: 'bot', timestamp: new Date(),
      content: 'Namaste! 🙏 I\'m **ZyntraCare AI** — your intelligent medical assistant.\n\nAsk me about symptoms, hospitals, doctors, or emergency help. I\'m powered by Gemini AI and analyze medical data in real-time.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const history = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date(), language: lang };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsTyping(true);
    history.current.push({ role: 'user', content: msg });
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language: lang, history: history.current.slice(-10) }),
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, I could not process that. Please try again.';
      history.current.push({ role: 'assistant', content: reply });
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', content: reply, timestamp: new Date() }]);
      if ('speechSynthesis' in window && !isMuted) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = ({ en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN' } as any)[lang] || 'en-US';
        window.speechSynthesis.speak(u);
      }
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', content: 'Connection error. Check your internet and retry.', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  const clearChat = () => {
    history.current = [];
    setMessages([{ id: '1', role: 'bot', content: 'Chat cleared! How can I help you?', timestamp: new Date() }]);
  };

  const toggleVoice = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice input only supported in Chrome / Edge.'); return; }
    const r = new SR();
    r.lang = ({ en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN' } as any)[lang] || 'en-US';
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
  };

  /* Minimized pill */
  if (isMinimized) return (
    <motion.button
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      onClick={() => setIsMinimized(false)}
      className="fixed bottom-[30px] right-6 z-[8000] flex items-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-2xl border border-white/10 transition-all hover:-translate-y-1"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', backdropFilter: 'blur(16px)' }}
    >
      <AiBrain size={18} />
      <span>ZyntraCare AI</span>
      {messages.length > 1 && <span className="w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">{messages.length - 1}</span>}
    </motion.button>
  );

  return (
    <>
      {/* ── FAB trigger ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-[30px] right-6 z-[8000]"
          >
            {/* Pulsing halo */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }}
            />
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="relative w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
              aria-label="Open AI Health Assistant"
            >
              <AiBrain size={26} />
            </motion.button>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-800 border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl pointer-events-none"
            >
              Ask me anything 💬
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-4 border-transparent border-l-slate-800" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="fixed bottom-[110px] right-6 z-[8000] w-[380px] sm:w-[400px] h-[600px] max-h-[82vh] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0d1117 0%, #0f172a 40%, #0c0f1e 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Ambient glow blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-4 relative z-10 shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(29,78,216,0.25) 0%, rgba(124,58,237,0.15) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                >
                  <AiBrain size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm tracking-wide">ZyntraCare AI</h3>
                    <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Powered by Gemini AI · Medical Grade</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => setIsMuted(m => { if (!m) window.speechSynthesis.cancel(); return !m; })}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                </button>
                <button onClick={clearChat} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition" aria-label="Clear chat">
                  <FiTrash2 size={16} />
                </button>
                <button onClick={() => setIsMinimized(true)} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition" aria-label="Minimize chat">
                  <FiMinimize2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition" aria-label="Close chat">
                  <IoMdClose size={18} />
                </button>
              </div>
            </div>

            {/* ── Language bar ── */}
            <div
              className="px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 relative z-10"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              {availableLanguages.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap font-semibold transition-all ${
                    lang === l.code
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {l.flag} {l.name}
                </button>
              ))}
            </div>

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot avatar */}
                    {msg.role === 'bot' && (
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                      >
                        <AiBrain size={14} />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'rounded-br-sm text-white'
                          : 'rounded-bl-sm text-slate-200'
                      }`}
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                              boxShadow: '0 4px 20px rgba(29,78,216,0.25)',
                              border: '1px solid rgba(99,102,241,0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                            }
                      }
                    >
                      {msg.content}
                      <div className={`text-[10px] mt-1.5 font-medium ${msg.role === 'user' ? 'text-blue-200/60' : 'text-slate-600'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* User avatar */}
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10 flex items-center justify-center shrink-0 mb-0.5 text-white text-xs font-bold">
                        U
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="flex items-end gap-2"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                    >
                      <AiBrain size={14} />
                    </div>
                    <div
                      className="px-4 py-3 rounded-2xl rounded-bl-sm"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="space-y-2.5"
                >
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold text-center">Quick Actions</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map(a => (
                      <button
                        key={a.en}
                        onClick={() => handleSend(lang === 'hi' ? a.hi : a.en)}
                        className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
                      >
                        {lang === 'hi' ? a.hi : a.en}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <div
              className="px-4 py-3 shrink-0 relative z-10"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
            >
              <div
                className="flex items-center gap-4 rounded-2xl px-4 py-2.5 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={() => {}}
              >
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-xl shrink-0 transition-all ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : 'text-slate-500 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label="Voice input"
                >
                  {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
                </button>

                <label htmlFor="chat-input" className="sr-only">Type your message</label>
                <input
                  id="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Describe your symptoms or ask anything…"
                  className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-[15px] focus:outline-none px-1"
                />

                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  whileHover={input.trim() ? { scale: 1.05 } : {}}
                  whileTap={input.trim() ? { scale: 0.95 } : {}}
                  className="p-2.5 rounded-xl shrink-0 transition-all disabled:opacity-30"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg, #1d4ed8, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    boxShadow: input.trim() ? '0 0 16px rgba(29,78,216,0.4)' : 'none',
                  }}
                  aria-label="Send message"
                >
                  <FiZap size={18} className="text-white" />
                </motion.button>
              </div>
              <p className="text-center text-slate-600 text-[10px] mt-2 font-medium">
                AI analysis is informational only. Always consult a licensed doctor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}