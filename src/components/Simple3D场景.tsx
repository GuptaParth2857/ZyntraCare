'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  opacity: number;
}

const COLORS = ['#38bdf8', '#8b5cf6', '#06b6d4', '#a78bfa', '#22d3ee'];

export default function Simple3D场景() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 80 }, () => ({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 500,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.5 + 0.3,
      }));
    };
    initParticles();

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x > width || p.x < -width) p.vx *= -1;
        if (p.y > height || p.y < -height) p.vy *= -1;
        if (p.z > 500 || p.z < 0) p.vz *= -1;

        const scale = 300 / (p.z || 1);
        const x = centerX + p.x * scale * 0.003;
        const y = centerY + p.y * scale * 0.003;
        const size = Math.max(1, p.size * scale * 0.01);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * Math.min(1, scale * 0.01);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * 0.2;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}
    />
  );
}