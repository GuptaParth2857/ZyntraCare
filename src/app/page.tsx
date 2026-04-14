'use client';

import Link from 'next/link';
import { FiArrowRight, FiShield, FiHeart, FiMapPin, FiPhone, FiActivity, FiUsers, FiAward, FiZap, FiCpu, FiStar, FiTrendingUp, FiCheckCircle, FiBookOpen, FiCalendar, FiClock, FiEye, FiLock, FiPlay, FiMessageCircle, FiSend, FiCode } from 'react-icons/fi';
import { FaHeartbeat, FaBrain, FaBone, FaBaby, FaSpa, FaEye, FaTooth, FaStethoscope, FaLungs, FaRibbon, FaHeart, FaDna, FaUserMd } from 'react-icons/fa';
import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { hospitals, doctors, specialties } from '@/data/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';

import { AnimatedGradientText, MorphingBlob, FloatingIcon, PulseRing } from '@/components/PremiumAnimations';
import ClientOnly from '@/components/ClientOnly';

const SearchBar = dynamic(() => import('@/components/SearchBar'), { ssr: false, loading: () => <div className="h-14 bg-white/5 animate-pulse rounded-2xl" /> });
const HospitalCard = dynamic(() => import('@/components/HospitalCard'), { ssr: false });
const DoctorCard = dynamic(() => import('@/components/DoctorCard'), { ssr: false });
const NearbyHospitalsMap = dynamic(() => import('@/components/NearbyHospitalsMap'), { ssr: false, loading: () => <div className="h-full bg-slate-900 animate-pulse rounded-2xl" /> });
const Real3DScene = dynamic(() => import('@/components/Real3DScene'), { ssr: false, loading: () => null });
const DNARotate3D = dynamic(() => import('@/components/DNARotate3D'), { ssr: false, loading: () => null });
const Hero3DParticles = dynamic(() => import('@/components/Hero3DParticles'), { ssr: false, loading: () => null });
const AIBrain3D = dynamic(() => import('@/components/AIBrain3D'), { ssr: false, loading: () => null });
const HolographicHeart = dynamic(() => import('@/components/HolographicHeart'), { ssr: false, loading: () => null });
const DNAHelix3DPro = dynamic(() => import('@/components/DNAHelix3DPro'), { ssr: false, loading: () => null });
const Globe3D = dynamic(() => import('@/components/Globe3D'), { ssr: false, loading: () => null });
const MedicalCore3D = dynamic(() => import('@/components/MedicalCore3D'), { ssr: false, loading: () => null });

function usePerformanceMode() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMqChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onMqChange);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    const conn = (navigator as any).connection;
    if (conn) {
      setIsSlowConnection(conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g');
    }

    return () => {
      // Proper cleanup — removes the exact same function reference (fixes memory leak)
      mq.removeEventListener('change', onMqChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const shouldUse3D = useMemo(() => {
    if (prefersReducedMotion) return false;
    if (isSlowConnection) return false;
    if (isMobile) return false; // Skip heavy 3D on mobile for smoothness
    return true;
  }, [prefersReducedMotion, isSlowConnection, isMobile]);

  return { prefersReducedMotion, isMobile, isSlowConnection, shouldUse3D };
}

const getSpecialtyIcon = (specialty: string) => {
  const s = specialty.toLowerCase();
  if (s.includes('cardio')) return <FaHeartbeat />;
  if (s.includes('neuro')) return <FaBrain />;
  if (s.includes('ortho')) return <FaBone />;
  if (s.includes('pediatr')) return <FaBaby />;
  if (s.includes('dermat')) return <FaSpa />;
  if (s.includes('ophthalm')) return <FaEye />;
  if (s.includes('dent')) return <FaTooth />;
  if (s.includes('pulmon')) return <FaLungs />;
  if (s.includes('oncol')) return <FaRibbon />;
  if (s.includes('general') || s.includes('medicine')) return <FaStethoscope />;
  return <FiActivity />;
};

function StatCard({ value, label, icon: Icon, idx }: { value: string; label: string; icon: any; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.7 + idx * 0.1 }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="relative group"
    >
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-sky-500/40 transition-all duration-500 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div
          className="relative z-10 w-14 h-14 mx-auto bg-gradient-to-br from-sky-500/20 to-teal-500/20 border border-sky-500/30 rounded-2xl flex items-center justify-center mb-4 text-sky-400 group-hover:from-sky-500/40 group-hover:to-teal-500/40 group-hover:text-sky-300 transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.2)]"
        >
          <Icon size={24} />
        </motion.div>
        <p className="relative z-10 text-3xl font-black text-white mb-1">{value}</p>
        <p className="relative z-10 text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

const MemoizedStatCard = memo(StatCard);

const chatMessages = [
  { role: 'ai', text: "Hello! I'm your AI Medical Assistant powered by Gemini. Describe your symptoms and I'll help guide you." },
  { role: 'user', text: "I've been having chest tightness and shortness of breath after climbing stairs." },
  { role: 'ai', text: "These symptoms can indicate a cardiac concern. How long have you been experiencing this? Any family history of heart disease?" },
  { role: 'user', text: "Started 2 weeks ago. Yes, my father had a heart attack at 55." },
  { role: 'ai', text: "Given your symptoms and family history, I strongly recommend an urgent consultation with a Cardiologist. Let me connect you.", isDiagnosis: true, specialist: 'Cardiologist', confidence: 92 },
];

function AIChatSection() {
  const [visibleCount, setVisibleCount] = useState(2);
  const [inputVal, setInputVal] = useState('');
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [videoMasterclasses, setVideoMasterclasses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        setBlogPosts(data.blogs || []);
        setVideoMasterclasses(data.videos || []);
      })
      .catch(() => {});
  }, []);
  const { shouldUse3D } = usePerformanceMode();

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleCount(c => {
        if (c >= chatMessages.length) { clearInterval(id); return c; }
        return c + 1;
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 border border-purple-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-700/10 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-700/10 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
            style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(168,85,247,0.07) 50%, transparent 70%)' }} />

          <div className="relative z-10 grid lg:grid-cols-2 gap-0">
            {/* Left — text content */}
            <div className="p-10 md:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
              {/* 3D Neural network brain animation background */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {shouldUse3D && <AIBrain3D />}
              </div>
              <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 text-purple-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 w-fit">
                <FiCpu size={13} className="animate-pulse" /> Powered by Gemini AI
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                AI Symptom<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Analysis</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                Describe your symptoms to our Gemini-powered medical AI. Get instant guidance, specialist recommendations, and nearby hospital matches — all in one conversation.
              </p>
              <div className="space-y-3 mb-10">
                {[
                  { icon: FiCheckCircle, text: 'Cross-references 15,000+ conditions' },
                  { icon: FiCheckCircle, text: 'Real-time specialist matching' },
                  { icon: FiCheckCircle, text: 'HIPAA-compliant private conversations' },
                  { icon: FiCheckCircle, text: 'Available 24/7 in Hindi & English' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <f.icon className="text-purple-400 flex-shrink-0" size={16} />
                    <span className="text-slate-300 text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  aria-label="Start free AI consultation"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                  <FiZap size={18} aria-hidden="true" /> Start Free Consultation
                </motion.button>
                <Link href="/blogs" aria-label="Learn more about health insights" className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/12 text-slate-300 hover:text-white px-6 py-3.5 rounded-2xl font-semibold transition-all text-sm">
                  Learn More <FiArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right — chat panel */}
            <div className="p-6 md:p-8 flex flex-col relative">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <FiCpu className="text-white" size={11} />
                  </div>
                  <span className="text-xs text-white font-semibold">ZyntraCare Gemini AI</span>
                  <span className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-mono">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                  </span>
                </div>
              </div>

              {/* 3D AI Brain visual — compact */}
              <div className="relative h-24 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border border-purple-500/15 flex items-center justify-center">
                <div className="absolute inset-0 pointer-events-none">
                  {shouldUse3D && <AIBrain3D />}
                </div>
                <div className="relative z-10 flex items-center gap-2.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-purple-500/20">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  <span className="text-xs font-bold text-purple-300">Neural Analysis Active</span>
                  <span className="text-xs text-slate-400 font-mono ml-1">92% confidence</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin mb-4">
                {chatMessages.slice(0, visibleCount).map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <FiCpu className="text-white" size={13} />
                      </div>
                    )}
                    <div className={`max-w-[82%] rounded-2xl p-3.5 text-sm leading-relaxed ${ 
                      msg.role === 'user' 
                        ? 'bg-indigo-700/70 border border-indigo-600/30 text-white rounded-tr-sm' 
                        : (msg as any).isDiagnosis
                          ? 'bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/25 text-slate-200 rounded-tl-sm'
                          : 'bg-white/6 border border-white/10 text-slate-300 rounded-tl-sm'
                    }`}>
                      {(msg as any).isDiagnosis ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-purple-300 mb-2 text-xs font-bold uppercase tracking-wide">
                            <FiZap size={11} className="text-amber-400" /> AI Diagnosis Match — {(msg as any).confidence}% confidence
                          </div>
                          <p className="mb-3">{msg.text}</p>
                          <div className="bg-white/8 border border-white/12 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center"><FaHeartbeat size={13} /></div>
                              <span className="text-xs font-bold text-white">Book {(msg as any).specialist}</span>
                            </div>
                            <button className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg font-bold transition" aria-label="Book appointment">Book Now</button>
                          </div>
                        </div>
                      ) : msg.text}
                    </div>
                  </motion.div>
                ))}
                {visibleCount < chatMessages.length && (
                  <div className="flex items-center gap-2 ml-9">
                    <div className="bg-white/6 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1.5">
                      {[0, 0.2, 0.4].map(d => (
                        <motion.span key={d} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                          className="w-2 h-2 bg-slate-400 rounded-full inline-block" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 hover:border-purple-500/30 transition-colors">
                <label htmlFor="hero-chat-input" className="sr-only">Describe your symptoms</label>
                <input
                  id="hero-chat-input"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none px-2"
                />
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white w-9 h-9 rounded-xl flex items-center justify-center transition flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]" aria-label="Send message">
                  <FiSend size={15} aria-hidden="true" />
                </button>
              </div>
              <p className="text-center text-slate-600 text-xs mt-2">AI responses are for guidance only — not a medical diagnosis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const tagColors: Record<string, string> = {
  'Must Read': 'bg-red-500/15 text-red-400 border-red-500/25',
  'Trending': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Seasonal': 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  'In-Depth': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Awareness': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Behind The Scenes': 'bg-teal-500/15 text-teal-400 border-teal-500/25',
};

const catColors: Record<string, string> = {
  'Cardiology': 'text-red-400', 'Technology': 'text-purple-400',
  'Public Health': 'text-emerald-400', 'Endocrinology': 'text-amber-400',
  'Mental Health': 'text-pink-400', 'Innovation': 'text-sky-400',
};

interface BlogPost {
  id: string | number;
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  tag: string;
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
          <div>
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-2">Knowledge Hub</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
              Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Insights</span> & Blog
            </h2>
            <p className="text-slate-400 text-lg">Expert articles from India's top medical professionals.</p>
          </div>
          <Link href="/blogs" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/40 px-6 py-2.5 rounded-xl transition-all group flex-shrink-0">
            All Articles <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="lg:col-span-1 group">
            <Link href="/blogs" className="block h-full bg-slate-900/70 border border-white/8 rounded-[1.8rem] overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <Image src={posts[0].image} alt={posts[0].title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                <span className={`absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${tagColors[posts[0].tag]}`}>{posts[0].tag}</span>
              </div>
              <div className="p-6">
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${catColors[posts[0].category]}`}>{posts[0].category}</p>
                <h3 className="font-black text-white text-lg leading-snug mb-3 group-hover:text-emerald-300 transition-colors">{posts[0].title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{posts[0].excerpt}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">{posts[0].author.split(' ')[1]?.[0]}</div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{posts[0].author}</p>
                    <p className="text-slate-500 text-xs">{posts[0].date} · {posts[0].readTime}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {posts.slice(1, 5).map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group">
                <Link href="/blogs" className="block h-full bg-slate-900/70 border border-white/8 rounded-[1.5rem] overflow-hidden hover:border-emerald-500/25 hover:shadow-[0_0_25px_rgba(16,185,129,0.07)] transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-36 overflow-hidden">
                    <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    <span className={`absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${tagColors[post.tag]}`}>{post.tag}</span>
                  </div>
                  <div className="p-4">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${catColors[post.category]}`}>{post.category}</p>
                    <h3 className="font-black text-white text-sm leading-snug mb-2 group-hover:text-emerald-300 transition-colors line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <FiClock className="text-slate-500" size={11} />
                      <span className="text-slate-500 text-xs">{post.readTime}</span>
                      <span className="text-slate-700 ml-auto text-xs">{post.date.split(' ').slice(0,2).join(' ')}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoSection({ videos }: { videos: VideoMasterclass[] }) {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-rose-900/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
          <div>
            <p className="text-rose-400 font-bold tracking-widest uppercase text-sm mb-2">ZyntraCare Studio</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
              Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Masterclasses</span>
            </h2>
            <p className="text-slate-400 text-lg">Free expert sessions from India's top doctors & researchers.</p>
          </div>
          <Link href="/blogs" className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/40 px-6 py-2.5 rounded-xl transition-all group flex-shrink-0">
            All Videos <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 5).map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`group ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              <div className="bg-slate-900/70 border border-white/8 rounded-[1.8rem] overflow-hidden hover:border-rose-500/25 hover:shadow-[0_0_35px_rgba(244,63,94,0.08)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <Image src={video.thumbnail} alt={video.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {video.isLive && (
                      <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.6)]">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                      </span>
                    )}
                    {video.scheduledDate && !video.isLive && (
                      <span className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                        <FiCalendar size={10} /> Coming Soon
                      </span>
                    )}
                    {video.isPremium && (
                      <span className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                        <FiStar size={10} /> Premium
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div whileHover={{ scale: 1.12 }} className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border shadow-2xl transition-all duration-300 ${
                      video.isLive ? 'bg-red-600/80 border-red-400/50 group-hover:bg-red-500/90' :
                      video.isPremium ? 'bg-amber-500/30 border-amber-400/40 group-hover:bg-amber-500/50' :
                      'bg-white/15 border-white/25 group-hover:bg-white/25'
                    }`}>
                      <FiPlay className="text-white ml-1" size={22} />
                    </motion.div>
                  </div>

                  {!video.isLive && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {video.duration}
                    </div>
                  )}
                  {video.viewCount && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                      <FiEye size={11} /> {video.viewCount} views
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">{video.category}</p>
                  <h3 className="text-white font-black text-sm leading-snug mb-2 group-hover:text-rose-300 transition-colors line-clamp-2 flex-1">{video.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{video.description}</p>
                  {video.scheduledDate && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-3">
                      <FiCalendar size={12} /> {video.scheduledDate}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-white/5 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                      {video.host.split(' ')[1]?.[0] || 'H'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold truncate">{video.host}</p>
                      <p className="text-slate-500 text-xs truncate">{video.hostRole.split(',')[0]}</p>
                    </div>
                    {video.isPremium && <FiLock className="text-amber-400 ml-auto flex-shrink-0" size={14} />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { shouldUse3D } = usePerformanceMode();

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {shouldUse3D && <Real3DScene />}

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        {/* CSS animations — GPU compositor thread, zero JS blocking */}
        <div
          className="absolute -top-32 left-1/4 w-[750px] h-[750px] bg-sky-600/18 rounded-full blur-[180px]"
          style={{ animation: 'blob-breathe-1 6s ease-in-out infinite', willChange: 'transform, opacity' }}
        />
        <div
          className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-teal-600/14 rounded-full blur-[140px]"
          style={{ animation: 'blob-breathe-2 8s ease-in-out infinite 2s', willChange: 'transform, opacity' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-blue-600/12 rounded-full blur-[160px]"
          style={{ animation: 'blob-breathe-3 10s ease-in-out infinite 4s', willChange: 'transform, opacity' }}
        />
        
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <section className="relative pt-28 pb-24 z-10" style={{ isolation: 'isolate' }}>
        {/* 3D floating particles layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <ClientOnly>
            {shouldUse3D && <Hero3DParticles />}
          </ClientOnly>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none opacity-10">
          <motion.svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="none">
            <motion.path
              d="M0,30 L180,30 L220,5 L260,55 L300,15 L340,45 L380,30 L560,30 L600,5 L640,55 L680,15 L720,45 L760,30 L940,30 L980,5 L1020,55 L1060,15 L1100,45 L1200,30"
              fill="none" stroke="#38bdf8" strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.8 }}
            />
          </motion.svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10">

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="flex justify-center mb-10"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative inline-flex items-center gap-2.5 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                />
                Live Hospital Data • Updated Real-time
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-8 relative"
          >
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] pointer-events-none" />
            
            <motion.div
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.1), transparent)',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
            
            <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6 pt-8 px-4">
              <span className="text-slate-300 font-light">Your Health,</span>
              <br />
              <span className="relative inline-block">
                Our{' '}
                <AnimatedGradientText className="bg-gradient-to-r from-sky-400 via-blue-400 to-teal-400">
                  Priority
                </AnimatedGradientText>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-400 to-teal-400 rounded-full opacity-60"
                />
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-6 pb-8"
            >
              Find the best hospitals, expert specialists, and emergency services across India.
              Book appointments instantly and track live bed availability.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-14 relative"
          >
            <div className="relative flex flex-wrap items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <Link
                href="/hospitals"
                className="group flex items-center gap-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:-translate-y-0.5 active:scale-95"
              >
                Find Hospitals
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/emergency"
                className="flex items-center gap-2.5 bg-red-600/15 border border-red-500/30 hover:bg-red-600/25 hover:border-red-400/50 text-red-400 hover:text-red-300 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Emergency
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mb-20 max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/30 via-blue-500/20 to-teal-500/30 blur-xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] hover:border-white/15 transition-colors duration-300 shadow-2xl shadow-black/30">
              <SearchBar variant="hero" />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiShield, label: t('verifiedHospitals'), value: '500+', idx: 0 },
              { icon: FiUsers,  label: t('expertDoctors'),     value: '2,000+', idx: 1 },
              { icon: FiHeart,  label: t('happyPatients'),     value: '1M+', idx: 2 },
              { icon: FiAward,  label: t('yearsService'),      value: '15+', idx: 3 },
            ].map(stat => (
              <MemoizedStatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-sky-400 font-bold tracking-widest uppercase text-sm mb-3">Medical Excellence</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Top <AnimatedGradientText className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400">Specialties</AnimatedGradientText>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Consult with India's leading medical experts in every category.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {specialties.slice(0, 10).map((specialty, idx) => (
              <motion.div
                key={specialty}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06, type: 'spring', stiffness: 120 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href={`/specialists?specialty=${specialty}`}
                  className="group flex flex-col items-center justify-center p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.8rem] hover:border-teal-500/40 hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]"
                >
                  <div className="absolute inset-0 rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, transparent 50%, rgba(6,182,212,0.15) 100%)' }} />
                  {/* CSS spin — only visible on hover (opacity-0 group-hover:opacity-30), runs on GPU */}
                  <div
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] rounded-full pointer-events-none opacity-0 group-hover:opacity-30 animate-spin-slow"
                    style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)', willChange: 'transform' }}
                  />
                  {/* CSS pulse — replaces Framer Motion repeat:Infinity */}
                  <div
                    className="absolute inset-0 rounded-[1.8rem] pointer-events-none specialty-pulse"
                  />
                  {/* CSS shimmer — replaces Framer Motion translateX repeat:Infinity */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.8rem]">
                    <div
                      className="absolute top-0 left-0 w-full h-full specialty-shimmer"
                      style={{
                        background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                      }}
                    />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-teal-500/15 to-sky-500/15 border border-teal-500/20 flex items-center justify-center text-3xl text-teal-400 group-hover:from-teal-500/30 group-hover:to-sky-500/30 group-hover:text-teal-300 group-hover:border-teal-400/40 group-hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] transition-all duration-300"
                  >
                    {getSpecialtyIcon(specialty)}
                  </motion.div>
                  <h3 className="relative z-10 font-bold text-slate-300 group-hover:text-white transition-colors text-center text-xs tracking-wide leading-tight">{specialty}</h3>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/specialists"
              className="group inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-bold transition-all bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 hover:border-teal-500/40 px-8 py-3 rounded-xl"
            >
              {t('viewAll')} Specialties
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-red-950/60 to-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] p-10 md:p-14 overflow-hidden shadow-2xl shadow-red-900/10">

            <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-600/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-rose-700/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/25 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  24/7 Response Active
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                  Medical Emergency?{' '}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Don't Wait.</span>
                </h2>
                <p className="text-slate-300/80 text-lg mb-8 leading-relaxed max-w-md">
                  Our critical response network is live. Instantly find the nearest hospital with available ICU beds, or dispatch an ambulance directly to your location.
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    href="tel:102"
                    className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
                  >
                    <FiPhone size={22} className="animate-pulse" />
                    Call Ambulance: 102
                  </motion.a>
                  <Link
                    href="/emergency"
                    className="flex items-center gap-3 bg-white/8 hover:bg-white/12 text-white border border-white/15 hover:border-white/25 px-8 py-4 rounded-2xl font-bold text-lg transition hover:-translate-y-0.5"
                  >
                    <FiMapPin size={20} />
                    Locate Nearest ER
                  </Link>
                </div>
              </div>

              <div className="h-[380px] bg-slate-900/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 relative">
                <NearbyHospitalsMap />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold text-emerald-400">Live Map</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <p className="text-sky-400 font-bold tracking-widest uppercase text-sm mb-2">World-Class Infrastructure</p>
              <h2 className="text-4xl font-black text-white mb-2">
                Top Rated <AnimatedGradientText className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">Hospitals</AnimatedGradientText>
              </h2>
              <p className="text-slate-400 text-lg">Integrated healthcare networks with cutting-edge facilities.</p>
            </div>
            <Link href="/hospitals" className="hidden md:flex items-center gap-2 text-sky-400 hover:text-sky-300 font-bold bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 hover:border-sky-500/40 px-6 py-2.5 rounded-xl transition-all group">
              Explore All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {hospitals.slice(0, 3).map((hospital, idx) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <div className="bg-slate-900/80 backdrop-blur-sm border border-white/8 rounded-[1.8rem] overflow-hidden hover:border-sky-500/25 hover:shadow-[0_0_40px_rgba(14,165,233,0.08)] transition-all duration-300 h-full flex flex-col">
                  <div className="flex-1">
                    <HospitalCard hospital={hospital} variant="dark" />
                  </div>
                  <div className="px-5 pb-5 pt-1">
                    <Link href="/hospitals" className="w-full flex items-center justify-center gap-2 bg-sky-600/15 hover:bg-sky-600/25 text-sky-400 hover:text-sky-300 border border-sky-500/20 hover:border-sky-500/40 py-3 rounded-xl font-bold transition-all">
                      View Facilities <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/5 mb-24" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <p className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-2">Trusted & Verified</p>
              <h2 className="text-4xl font-black text-white mb-2">
                Expert <AnimatedGradientText className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Specialists</AnimatedGradientText>
              </h2>
              <p className="text-slate-400 text-lg">Book instant appointments with highly vetted doctors.</p>
            </div>
            <Link href="/specialists" className="hidden md:flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/40 px-6 py-2.5 rounded-xl transition-all group">
              View Directory <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {doctors.slice(0, 4).map((doctor, idx) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <div className="bg-slate-900/80 backdrop-blur-sm border border-white/8 rounded-[1.8rem] overflow-hidden hover:border-purple-500/25 hover:shadow-[0_0_30px_rgba(168,85,247,0.08)] transition-all duration-300 h-full flex flex-col">
                  <div className="flex-1">
                    <DoctorCard doctor={doctor} variant="dark" />
                  </div>
                  <div className="px-4 pb-4 pt-1">
                    <Link
                      href="/specialists"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-[0_4px_15px_rgba(168,85,247,0.2)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.35)] hover:-translate-y-0.5"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40vw] h-[40vw] bg-teal-600/8 blur-[150px] rounded-full" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[40vw] h-[40vw] bg-blue-600/8 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="w-full md:w-1/2 h-[480px] bg-transparent relative flex items-center justify-center p-4"
          >
            {/* Holographic DNA */}
            <div className="absolute inset-0 drop-shadow-[0_0_50px_rgba(20,184,166,0.3)]">
              {shouldUse3D && <DNAHelix3DPro />}
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-teal-500/20 rounded-full px-6 py-2 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
              <span className="font-mono text-xs font-bold text-teal-300 uppercase tracking-widest">Genetic Profiling Active</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="w-full md:w-1/2"
          >
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
              <FiTrendingUp size={14} />
              Next-Gen Medicine
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">Precision Medicine</span>
            </h2>
            <p className="text-slate-300/80 text-lg mb-8 leading-relaxed">
              We are moving beyond generalized treatments. Integrated genomics profiling ensures that the medications and care plans prescribed through ZyntraCare are specifically tailored to your unique biological DNA structure.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { label: 'DNA-Based Health Insights', color: 'teal' },
                { label: 'Personalized Nutrition & Care', color: 'sky' },
                { label: 'Predictive Disease Modeling', color: 'blue' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 bg-white/4 border border-white/8 p-4 rounded-2xl group hover:border-teal-500/25 hover:bg-white/6 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/25 group-hover:text-teal-300 transition-all">
                    <FiCheckCircle size={18} />
                  </div>
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{feature.label}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(20,184,166,0.25)] hover:shadow-[0_0_45px_rgba(20,184,166,0.45)] group"
            >
              Learn About Genomics
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <BlogSection posts={blogPosts} />
      <VideoSection videos={videoMasterclasses} />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-4">Leadership</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-10">
              Meet Our <AnimatedGradientText className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">Founder & Team</AnimatedGradientText>
            </h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-4xl mx-auto"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-teal-500/20 rounded-[3rem] blur-xl"
                style={{ animation: 'founder-glow 4s ease-in-out infinite', willChange: 'transform, opacity' }}
              />
              
              <div className="relative bg-slate-900/80 border border-white/10 p-10 md:p-16 rounded-[3rem] backdrop-blur-xl shadow-2xl group overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-teal-500/5"
                  style={{ animation: 'founder-inner-glow 3s ease-in-out infinite' }}
                />
                
                <div className="relative flex flex-col items-center gap-10">
                  <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-md"
                        style={{ animation: 'avatar-glow 3s ease-in-out infinite' }}
                      />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                        <Image 
                          src="/images/Futuristic Zenvyx logo design.png" 
                          alt="Zenvyx Team Logo" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <PulseRing size={180} color="purple" />
                      <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-purple-400 font-bold whitespace-nowrap">Team Zenvyx</p>
                    </div>
                    
                    <FloatingIcon delay={0.3}>
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 blur-md"
                          style={{ animation: 'avatar-glow 3s ease-in-out infinite 0.5s' }}
                        />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-sky-500/50 shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                          <Image 
                            src="/images/publiczyntracare-logo.png" 
                            alt="ZyntraCare Logo" 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <PulseRing size={180} color="sky" />
                      </div>
                    </FloatingIcon>
                    
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 blur-md"
                        style={{ animation: 'avatar-glow 3s ease-in-out infinite 1s' }}
                      />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-teal-500/50 shadow-[0_0_35px_rgba(20,184,166,0.4)]">
                        <Image 
                          src="/images/founder.jpg" 
                          alt="Parth Gupta - Founder" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <PulseRing size={180} color="teal" />
                      <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-teal-400 font-bold whitespace-nowrap">Parth Gupta</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <div className="text-center">
                      <motion.h3 
                        className="text-2xl font-black text-white mb-1"
                        animate={{ textShadow: ['0 0 10px rgba(168,85,247,0.3)', '0 0 20px rgba(168,85,247,0.5)', '0 0 10px rgba(168,85,247,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Team Zenvyx
                      </motion.h3>
                      <div className="text-purple-400 font-bold flex items-center justify-center gap-2">
                        <FloatingIcon delay={0.2}>
                          <FiAward size={16} />
                        </FloatingIcon>
                        Vision & Innovation
                      </div>
                    </div>
                    <div className="text-center">
                      <motion.h3 
                        className="text-2xl font-black text-white mb-1"
                        animate={{ textShadow: ['0 0 10px rgba(56,189,248,0.3)', '0 0 20px rgba(56,189,248,0.5)', '0 0 10px rgba(56,189,248,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Parth Gupta
                      </motion.h3>
                      <div className="text-sky-400 font-bold flex items-center justify-center gap-2">
                        <FloatingIcon delay={0.3}>
                          <FiAward size={16} />
                        </FloatingIcon>
                        Founder & Lead Developer
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className="w-full max-w-2xl h-px rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-sky-500 to-teal-500 team-line-scan"
                      style={{ width: '50%' }}
                    />
                  </div>
                  
                  <motion.div 
                    className="text-center max-w-3xl space-y-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <p
                      className="text-white text-lg md:text-xl font-medium leading-relaxed team-text-pulse"
                    >
                      "We are Team <span className="text-purple-400 font-bold">Zenvyx</span>."
                    </p>
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed italic">
                      "A team that combines calm intelligence with <span className="text-sky-400 font-semibold">futuristic innovation</span>. Zenvyx represents a balance between clarity of thought and advanced innovation, reflecting a team that builds <span className="text-teal-400 font-semibold">smart and impactful solutions</span>."
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Driven by a vision to revolutionize healthcare accessibility in India, <span className="text-sky-400 font-semibold">ZyntraCare</span> bridges the gap between patients and premium medical services through transparent, reliable, and high-performance technology.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-sky-950/60 to-slate-900/80 backdrop-blur-xl border border-sky-500/15 rounded-[2.5rem] p-12 md:p-16 text-center overflow-hidden"
          >
            {/* 3D Globe background animation */}
            <div className="absolute inset-0 pointer-events-none opacity-65">
              {shouldUse3D && <Globe3D />}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-sky-600/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-sky-400 font-bold tracking-widest uppercase text-sm mb-4">India's Most Trusted Platform</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Healthcare Reimagined.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">For Everyone.</span>
              </h2>
              <p className="text-slate-300/80 text-lg max-w-2xl mx-auto mb-10">
                Join over 1 million patients who trust ZyntraCare for their healthcare needs across India.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/hospitals"
                  className="group flex items-center gap-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] hover:-translate-y-0.5"
                >
                  Get Started Free
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/subscription"
                  className="flex items-center gap-2.5 bg-white/8 hover:bg-white/12 text-white border border-white/15 hover:border-white/25 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5"
                >
                  <FiStar className="text-amber-400" />
                  View Premium Plans
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
