'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type ColorTheme = 'teal' | 'blue' | 'purple' | 'red' | 'green' | 'amber' | 'cyan' | 'pink' | 'emerald' | 'indigo';

interface AnimatedBackgroundProps {
  theme?: ColorTheme;
  children?: ReactNode;
  className?: string;
}

const THEME_COLORS: Record<ColorTheme, { orb1: string; orb2: string; orb3: string; orb4: string; grad1: string; grad2: string }> = {
  teal:    { orb1: 'bg-teal-500/10',    orb2: 'bg-cyan-500/8',     orb3: 'bg-emerald-500/8',  orb4: 'bg-teal-500/6',    grad1: 'rgba(20,184,166,0.12)', grad2: 'rgba(14,165,233,0.1)' },
  blue:    { orb1: 'bg-blue-500/10',     orb2: 'bg-sky-500/8',      orb3: 'bg-indigo-500/8',   orb4: 'bg-blue-500/6',    grad1: 'rgba(59,130,246,0.12)', grad2: 'rgba(14,165,233,0.1)' },
  purple:  { orb1: 'bg-purple-500/10',   orb2: 'bg-violet-500/8',   orb3: 'bg-fuchsia-500/8',  orb4: 'bg-purple-500/6',  grad1: 'rgba(168,85,247,0.12)', grad2: 'rgba(236,72,153,0.1)' },
  red:     { orb1: 'bg-red-500/10',      orb2: 'bg-rose-500/8',     orb3: 'bg-orange-500/8',   orb4: 'bg-red-500/6',     grad1: 'rgba(239,68,68,0.12)',  grad2: 'rgba(244,63,94,0.1)' },
  green:   { orb1: 'bg-green-500/10',    orb2: 'bg-emerald-500/8',  orb3: 'bg-teal-500/8',     orb4: 'bg-green-500/6',   grad1: 'rgba(34,197,94,0.12)',  grad2: 'rgba(20,184,166,0.1)' },
  amber:   { orb1: 'bg-amber-500/10',    orb2: 'bg-orange-500/8',   orb3: 'bg-yellow-500/8',   orb4: 'bg-amber-500/6',   grad1: 'rgba(245,158,11,0.12)', grad2: 'rgba(251,146,60,0.1)' },
  cyan:    { orb1: 'bg-cyan-500/10',     orb2: 'bg-sky-500/8',      orb3: 'bg-blue-500/8',     orb4: 'bg-cyan-500/6',    grad1: 'rgba(6,182,212,0.12)',  grad2: 'rgba(14,165,233,0.1)' },
  pink:    { orb1: 'bg-pink-500/10',     orb2: 'bg-rose-500/8',     orb3: 'bg-fuchsia-500/8',  orb4: 'bg-pink-500/6',    grad1: 'rgba(236,72,153,0.12)', grad2: 'rgba(217,70,239,0.1)' },
  emerald: { orb1: 'bg-emerald-500/10',  orb2: 'bg-teal-500/8',     orb3: 'bg-cyan-500/8',     orb4: 'bg-emerald-500/6', grad1: 'rgba(16,185,129,0.12)', grad2: 'rgba(20,184,166,0.1)' },
  indigo:  { orb1: 'bg-indigo-500/10',   orb2: 'bg-purple-500/8',   orb3: 'bg-blue-500/8',     orb4: 'bg-indigo-500/6',  grad1: 'rgba(99,102,241,0.12)', grad2: 'rgba(139,92,246,0.1)' },
};

export default function AnimatedBackground({
  theme = 'emerald',
  className = ''
}: AnimatedBackgroundProps) {
  const c = THEME_COLORS[theme];

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Radial gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 0%, ${c.grad1} 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, ${c.grad2} 0%, transparent 60%),
            radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Pulsing orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[15%] left-[5%] w-[500px] h-[500px] ${c.orb1} rounded-full blur-[150px]`}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute bottom-[10%] right-[5%] w-[600px] h-[600px] ${c.orb2} rounded-full blur-[180px]`}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute top-[40%] right-[20%] w-[400px] h-[400px] ${c.orb3} rounded-full blur-[120px]`}
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className={`absolute top-[60%] left-[30%] w-[350px] h-[350px] ${c.orb4} rounded-full blur-[100px]`}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
