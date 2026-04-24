'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

interface HeartParticle {
  x: number;
  y: number;
  z: number;
  angle: number;
  radius: number;
  speed: number;
  baseColor: string;
  size: number;
  opacity: number;
}

export default function HolographicHeart3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const newParticles: HeartParticle[] = [];
    // Teal + warm red BEAST palette
    const colors = ['#14b8a6', '#ef4444', '#f87171', '#dc2626', '#0d9488', '#d4a574'];
    
    for (let ring = 0; ring < 8; ring++) {
      const numParticles = 20 + ring * 8;
      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2;
        newParticles.push({
          angle,
          radius: 30 + ring * 18,
          x: 0,
          y: 0,
          z: (Math.random() - 0.5) * 60,
          speed: 0.005 + ring * 0.002,
          baseColor: colors[ring % colors.length],
          size: 3 + Math.random() * 3,
          opacity: 0.6 - ring * 0.05
        });
      }
    }
    setParticles(newParticles);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      time += 0.03;

      const sortedParticles = [...newParticles].sort((a, b) => a.z - b.z);

      for (const p of sortedParticles) {
        p.angle += p.speed;

        const pulse = Math.sin(time * 2) * 10;
        const currentRadius = p.radius + pulse * (p.radius / 100);
        
        const x = centerX + Math.cos(p.angle) * currentRadius;
        const y = centerY + Math.sin(p.angle) * currentRadius * 0.6;
        
        const scale = (p.z + 100) / 200;
        const alpha = p.opacity * Math.min(1, Math.max(0.2, scale + 0.3));
        const size = p.size * scale;

        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        ctx.arc(x, y, size + 2, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor + '30';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, p.baseColor);
        gradient.addColorStop(1, p.baseColor + '00');
        ctx.fillStyle = gradient;
        ctx.shadowColor = p.baseColor;
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60);
      ctx.bezierCurveTo(centerX + 80, centerY - 20, centerX + 80, centerY + 60, centerX, centerY + 80);
      ctx.bezierCurveTo(centerX - 80, centerY + 60, centerX - 80, centerY - 20, centerX, centerY - 60);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const wave = Math.sin(time * 3 + i) * 5;
        ctx.globalAlpha = 0.1 - i * 0.03;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60 + wave);
        ctx.bezierCurveTo(
          centerX + 80 - i * 10, centerY - 20 + wave, 
          centerX + 80 - i * 10, centerY + 60 + wave, 
          centerX, centerY + 80 + wave
        );
        ctx.bezierCurveTo(
          centerX - 80 + i * 10, centerY + 60 + wave, 
          centerX - 80 + i * 10, centerY - 20 + wave, 
          centerX, centerY - 60 + wave
        );
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="w-48 h-48 md:w-64 md:h-64"
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-red-500"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <FaHeart size={32} className="opacity-60" />
      </motion.div>
    </motion.div>
  );
}