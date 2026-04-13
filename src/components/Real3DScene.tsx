'use client';

// Lightweight replacement for heavy Three.js Real3DScene.
// Uses pure CSS + framer-motion — no WebGL overhead, blazing fast.
import { motion } from 'framer-motion';

const ORBS = [
  { size: 600, color: 'rgba(14,165,233,0.06)', top: '-15%', left: '20%', duration: 12 },
  { size: 450, color: 'rgba(20,184,166,0.05)', top: '40%', right: '-10%', duration: 16 },
  { size: 500, color: 'rgba(99,102,241,0.04)', bottom: '-10%', left: '30%', duration: 14 },
  { size: 300, color: 'rgba(236,72,153,0.04)', top: '20%', right: '20%', duration: 10 },
];

export default function Real3DScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            top: (orb as any).top,
            left: (orb as any).left,
            right: (orb as any).right,
            bottom: (orb as any).bottom,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}