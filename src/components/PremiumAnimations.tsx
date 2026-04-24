'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export default function PremiumParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const particleCount = isMobile ? 45 : 80; // Good visual density
    const lastTimeRef = { current: 0 };
    const FPS_CAP = 30; // Standard 30fps
    const FRAME_MS = 1000 / FPS_CAP;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      // Teal + Gold BEAST palette
      color: ['#14b8a6', '#0d9488', '#5eead4', '#d4a574', '#ca8a04'][
        Math.floor(Math.random() * 5)
      ],
    });

    const initParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const drawParticle = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            // Teal connection lines
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const updateParticle = (p: Particle) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    };

    const animate = (now: number) => {
      // FPS throttle
      if (now - lastTimeRef.current < FRAME_MS) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        updateParticle(p);
        drawParticle(p);
      });

      // Skip particle connections on mobile
      if (!isMobile) {
        connectParticles();
      }

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate(0);

    window.addEventListener('resize', resizeCanvas);

    // Page Visibility API - pause when hidden
    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    resizeCanvas();
    initParticles();
    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

export function AnimatedGradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ backgroundSize: '200% 200%' }}
    >
      {children}
    </motion.span>
  );
}

export function GlowingBorder({ children, color = 'sky' }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    sky: 'from-sky-500 to-cyan-400',
    teal: 'from-teal-500 to-emerald-400',
    blue: 'from-blue-500 to-indigo-400',
    purple: 'from-purple-500 to-pink-400',
  };

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10">
        {children}
      </div>
    </motion.div>
  );
}

export function MorphingBlob({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        borderRadius: ['60% 40% 30% 70%/60% 30% 70% 40%', '30% 60% 70% 40%/50% 60% 30% 60%', '60% 40% 30% 70%/60% 30% 70% 40%'],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function FloatingIcon({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function PulseRing({ size = 60, color = 'sky' }: { size?: number; color?: string }) {
  const colorMap: Record<string, string> = {
    sky: 'border-sky-400',
    teal: 'border-teal-400',
    blue: 'border-blue-400',
    red: 'border-red-400',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${colorMap[color]} opacity-0`}
          animate={{
            scale: [1, 2],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
