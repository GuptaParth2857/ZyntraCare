'use client';

// Lightweight background orbs — pure CSS animations (no JS overhead).
// CSS animations run on the GPU compositor thread, not the JS main thread.
// Visual is identical to Framer Motion version, but with zero TBT impact.
import { memo } from 'react';

const ORBS = [
  { size: 600, color: 'rgba(14,165,233,0.06)', top: '-15%', left: '20%',   duration: 12, delay: 0 },
  { size: 450, color: 'rgba(20,184,166,0.05)', top: '40%',  right: '-10%', duration: 16, delay: 2 },
  { size: 500, color: 'rgba(99,102,241,0.04)', bottom: '-10%', left: '30%',duration: 14, delay: 4 },
  { size: 300, color: 'rgba(236,72,153,0.04)', top: '20%',  right: '20%',  duration: 10, delay: 6 },
];

function Real3DScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
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
            // CSS animation on compositor thread — zero JS blocking
            animation: `orb-breathe ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}

export default memo(Real3DScene);