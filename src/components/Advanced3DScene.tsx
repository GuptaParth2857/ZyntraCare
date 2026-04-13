'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaBrain, FaDna, FaStethoscope, FaUserMd, FaAmbulance, FaPills, FaLungs, FaHeart, FaBone, FaRibbon } from 'react-icons/fa';

const floatingIcons = [
  { icon: <FaHeartbeat />, color: '#ef4444', x: '8%', y: '12%', size: 32 },
  { icon: <FaBrain />, color: '#8b5cf6', x: '88%', y: '18%', size: 28 },
  { icon: <FaDna />, color: '#14b8a6', x: '15%', y: '65%', size: 36 },
  { icon: <FaStethoscope />, color: '#0ea5e9', x: '78%', y: '70%', size: 30 },
  { icon: <FaUserMd />, color: '#22c55e', x: '45%', y: '88%', size: 26 },
  { icon: <FaAmbulance />, color: '#f97316', x: '92%', y: '45%', size: 28 },
  { icon: <FaPills />, color: '#ec4899', x: '3%', y: '40%', size: 24 },
  { icon: <FaLungs />, color: '#06b6d4', x: '65%', y: '22%', size: 26 },
  { icon: <FaHeart />, color: '#dc2626', x: '25%', y: '35%', size: 22 },
  { icon: <FaBone />, color: '#fafafa', x: '75%', y: '82%', size: 20 },
];

export default function Advanced3DScene() {
  useEffect(() => {
    // Force animation to render
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-slate-950 to-teal-950" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[150px]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -80, 0],
          y: [0, -60, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[100px]"
        animate={{
          rotate: 360,
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating icons with strong animations */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ 
            left: item.x, 
            top: item.y,
          }}
          animate={{
            y: [0, -40, 0, 20, 0],
            x: [0, 20, 0, -15, 0],
            rotate: [0, 15, -10, 5, 0],
            scale: [1, 1.2, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 5 + index * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        >
          <div 
            className="relative"
            style={{ fontSize: item.size }}
          >
            <span className="relative z-10" style={{ color: item.color, filter: 'drop-shadow(0 0 15px ' + item.color + ')' }}>
              {item.icon}
            </span>
            {/* Glow effect */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: item.color, filter: 'blur(20px)' }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            />
          </div>
        </motion.div>
      ))}

      {/* Animated rings */}
      <motion.div
        className="absolute top-1/4 left-1/4"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg width="200" height="200" className="opacity-20">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="10 20" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5 15" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3 10" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <svg width="160" height="160" className="opacity-20">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="8 16" />
          <circle cx="80" cy="80" r="50" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 12" />
        </svg>
      </motion.div>

      {/* Particle dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${5 + (i * 5)}%`,
            top: `${10 + (i * 3)}%`,
            backgroundColor: ['#0ea5e9', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'][i % 5],
          }}
          animate={{
            y: [0, -50, 0, 30, 0],
            opacity: [0.2, 0.8, 0.5, 0.7, 0.2],
            scale: [1, 1.5, 0.8, 1.2, 1],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Medical cross grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 opacity-60" />
    </div>
  );
}