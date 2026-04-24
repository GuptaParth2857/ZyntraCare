'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type ColorTheme = 'teal' | 'blue' | 'purple' | 'red' | 'green' | 'amber' | 'cyan' | 'pink' | 'emerald' | 'indigo';

const colorThemes: Record<ColorTheme, string[]> = {
  teal: ['bg-teal-500/8', 'bg-cyan-500/6', 'bg-emerald-500/5'],
  blue: ['bg-blue-500/8', 'bg-sky-500/6', 'bg-indigo-500/5'],
  purple: ['bg-purple-500/8', 'bg-violet-500/6', 'bg-fuchsia-500/5'],
  red: ['bg-red-500/8', 'bg-rose-500/6', 'bg-orange-500/5'],
  green: ['bg-green-500/8', 'bg-emerald-500/6', 'bg-teal-500/5'],
  amber: ['bg-amber-500/8', 'bg-orange-500/6', 'bg-yellow-500/5'],
  cyan: ['bg-cyan-500/8', 'bg-sky-500/6', 'bg-blue-500/5'],
  pink: ['bg-pink-500/8', 'bg-rose-500/6', 'bg-fuchsia-500/5'],
  emerald: ['bg-emerald-500/8', 'bg-teal-500/6', 'bg-cyan-500/5'],
  indigo: ['bg-indigo-500/8', 'bg-purple-500/6', 'bg-blue-500/5'],
};

interface AnimatedBackgroundProps {
  theme?: ColorTheme;
  children?: ReactNode;
  className?: string;
}

export default function AnimatedBackground({ 
  theme = 'teal', 
  className = '' 
}: AnimatedBackgroundProps) {
  const colors = colorThemes[theme];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <motion.div
        animate={{ opacity: [0.12, 0.24, 0.12], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[10%] left-[10%] w-[600px] h-[600px] ${colors[0]} rounded-full blur-[150px]`}
      />
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className={`absolute bottom-[10%] right-[10%] w-[500px] h-[500px] ${colors[1]} rounded-full blur-[120px]`}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className={`absolute top-[30%] right-[20%] w-[400px] h-[400px] ${colors[2]} rounded-full blur-[100px]`}
      />
    </div>
  );
}