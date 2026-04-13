'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiClock, FiSearch, FiArrowRight, FiHeart, FiTrendingUp } from 'react-icons/fi';
import ClientOnly from '@/components/ClientOnly';
import { AnimatedGradientText, MorphingBlob } from '@/components/PremiumAnimations';

const BLOG_POSTS = [
  {
    id: 1,
    title: '10 Superfoods to Boost Your Immune System',
    category: 'Nutrition',
    date: 'March 28, 2026',
    readTime: '5 min read',
    excerpt: 'Discover the top 10 nutrient-dense foods that naturally enhance your immunity and protect against seasonal illnesses.',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    color: 'emerald',
    tag: 'Trending',
  },
  {
    id: 2,
    title: 'Understanding Anxiety vs. Daily Stress',
    category: 'Mental Health',
    date: 'March 25, 2026',
    readTime: '8 min read',
    excerpt: 'Learn exactly how to differentiate between normal daily stressors and clinical anxiety, and when to seek professional help.',
    img: 'https://images.unsplash.com/photo-1555627725-edffec728fd0?auto=format&fit=crop&q=80&w=800',
    color: 'purple',
    tag: 'Must Read',
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Better Sleep Hygiene',
    category: 'Wellness',
    date: 'March 20, 2026',
    readTime: '6 min read',
    excerpt: 'Struggling to sleep? Follow this science-backed routine to reset your circadian rhythm and wake up energized.',
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af28c5c00?auto=format&fit=crop&q=80&w=800',
    color: 'blue',
    tag: 'Trending',
  },
  {
    id: 4,
    title: 'Managing High Blood Pressure Naturally',
    category: 'Cardiology',
    date: 'March 15, 2026',
    readTime: '10 min read',
    excerpt: 'Effective lifestyle changes and dietary habits that can significantly lower your blood pressure readings.',
    img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
    color: 'rose',
    tag: 'In-Depth',
  },
  {
    id: 5,
    title: 'Digital Eye Strain in the Remote Work Era',
    category: 'Eye Care',
    date: 'March 10, 2026',
    readTime: '4 min read',
    excerpt: 'How to protect your vision using the 20-20-20 rule and optimize your screen settings for reduced fatigue.',
    img: 'https://images.unsplash.com/photo-1620803738555-502a06148386?auto=format&fit=crop&q=80&w=800',
    color: 'amber',
    tag: 'Awareness',
  },
  {
    id: 6,
    title: 'Post-Workout Recovery Myths Debunked',
    category: 'Fitness',
    date: 'March 5, 2026',
    readTime: '7 min read',
    excerpt: 'Ice baths vs. active recovery? We asked top sports medicine doctors to separate fact from fiction.',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    color: 'indigo',
    tag: 'Behind The Scenes',
  },
  {
    id: 7,
    title: 'Heart-Healthy Habits for Busy Professionals',
    category: 'Cardiology',
    date: 'Feb 28, 2026',
    readTime: '6 min read',
    excerpt: 'Quick and effective strategies to maintain cardiovascular health despite a demanding work schedule.',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&q=80&w=800',
    color: 'rose',
    tag: 'Trending',
  },
  {
    id: 8,
    title: 'The Science Behind Meditation and Stress Relief',
    category: 'Mental Health',
    date: 'Feb 22, 2026',
    readTime: '9 min read',
    excerpt: 'Explore the neurological mechanisms that make meditation an effective tool for stress management.',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    color: 'purple',
    tag: 'Must Read',
  },
  {
    id: 9,
    title: 'Preventive Healthcare: Why Regular Check-ups Matter',
    category: 'Public Health',
    date: 'Feb 15, 2026',
    readTime: '5 min read',
    excerpt: 'Understanding the importance of routine medical examinations in preventing serious health conditions.',
    img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    color: 'emerald',
    tag: 'Awareness',
  },
];

const tagColors: Record<string, string> = {
  'Must Read': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Trending': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'In-Depth': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Awareness': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Behind The Scenes': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

const categoryColors: Record<string, string> = {
  'Nutrition': 'text-emerald-400',
  'Mental Health': 'text-purple-400',
  'Wellness': 'text-blue-400',
  'Cardiology': 'text-rose-400',
  'Eye Care': 'text-amber-400',
  'Fitness': 'text-indigo-400',
  'Public Health': 'text-teal-400',
};

export default function BlogsPage() {
  const getCardColor = (color: string) => {
    switch (color) {
      case 'emerald': return { from: 'from-emerald-500/10', to: 'to-teal-500/10', border: 'hover:border-emerald-500/30', glow: 'hover:shadow-emerald-500/10' };
      case 'purple': return { from: 'from-purple-500/10', to: 'to-pink-500/10', border: 'hover:border-purple-500/30', glow: 'hover:shadow-purple-500/10' };
      case 'rose': return { from: 'from-rose-500/10', to: 'to-red-500/10', border: 'hover:border-rose-500/30', glow: 'hover:shadow-rose-500/10' };
      case 'amber': return { from: 'from-amber-500/10', to: 'to-orange-500/10', border: 'hover:border-amber-500/30', glow: 'hover:shadow-amber-500/10' };
      case 'indigo': return { from: 'from-indigo-500/10', to: 'to-purple-500/10', border: 'hover:border-indigo-500/30', glow: 'hover:shadow-indigo-500/10' };
      default: return { from: 'from-sky-500/10', to: 'to-blue-500/10', border: 'hover:border-sky-500/30', glow: 'hover:shadow-sky-500/10' };
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden font-inter">
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <MorphingBlob className="top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10" />
        <MorphingBlob className="bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/10" />
        <MorphingBlob className="top-[30%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/8" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition group mb-8">
              <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <FiArrowLeft />
              </motion.div>
              <span className="group-hover:-translate-x-1 transition-transform">Back to Home</span>
            </Link>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <FiTrendingUp size={14} />
              </motion.div>
              ZyntraCare Knowledge Hub
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Health Insights & <br />
              <AnimatedGradientText className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Expert Articles
              </AnimatedGradientText>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
            >
              Expert-backed health articles from India's leading medical professionals. Stay informed, stay healthy.
            </motion.p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            {/* Search Bar - Glass effect */}
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search health topics, nutrition advice, mental well-being..."
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition shadow-xl shadow-black/20"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'Nutrition', 'Mental Health', 'Wellness', 'Fitness', 'Cardiology'].map((tag, idx) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 rounded-xl whitespace-nowrap font-bold text-slate-300 hover:text-emerald-400 transition shadow-lg shadow-black/10"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto px-4 mb-12"
        >
          <div className="relative bg-gradient-to-br from-emerald-900/40 via-slate-900/80 to-teal-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
            {/* Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/10 blur-[120px] rounded-full" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    Must Read
                  </span>
                  <span className="text-emerald-400 text-sm font-bold">Cardiology</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors">
                  Managing High Blood Pressure Naturally: A Complete Guide
                </h2>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Effective lifestyle changes and dietary habits that can significantly lower your blood pressure readings without medication.
                </p>
                <div className="flex items-center gap-6 text-slate-400 text-sm">
                  <span>Dr. Priya Sharma</span>
                  <span className="flex items-center gap-1.5"><FiClock /> 10 min read</span>
                  <span>March 15, 2026</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Read featured article"
                  className="mt-8 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  Read Article <FiArrowRight aria-hidden="true" />
                </motion.button>
              </div>
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"
                  alt="Featured article"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <motion.div
                  className="absolute bottom-4 left-4 right-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                    <FiHeart className="text-red-400" />
                    <span className="text-white text-sm font-semibold">Heart Health</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, idx) => {
              const colors = getCardColor(post.color);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group relative bg-gradient-to-br ${colors.from} ${colors.to} backdrop-blur-xl border border-white/10 ${colors.border} rounded-[2rem] overflow-hidden hover:shadow-2xl ${colors.glow} transition-all duration-500 flex flex-col h-full`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                    <motion.div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 + idx * 0.5 }}
                    />
                  </div>

                  {/* Glow on hover */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl blur-lg"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Image */}
                    <div className="w-full h-48 rounded-t-[2rem] relative overflow-hidden">
                      <Image
                        src={post.img}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                      {/* Tag badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tagColors[post.tag]}`}>
                          {post.tag}
                        </span>
                      </div>

                      {/* Category pill */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-xl text-white border border-white/10`}>
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-400 mb-6 flex-1 line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FiClock size={12} />
                            {post.readTime}
                          </span>
                          <span>{post.date.split(',')[0]}</span>
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-slate-500 group-hover:text-emerald-400 transition-colors"
                        >
                          <FiArrowRight size={18} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-black/20"
            >
              Load More Articles
              <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <FiArrowRight />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-10 md:p-16 text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
              >
                <FiHeart className="text-emerald-400 text-2xl" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Stay Updated with ZyntraCare
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Subscribe to our newsletter for weekly health tips, expert insights, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] whitespace-nowrap"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
