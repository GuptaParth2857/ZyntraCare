'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HelixPoint {
  angle: number;
  radius: number;
  y: number;
  color: string;
  phase: number;
}

export default function DNAHelix3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [particles, setParticles] = useState<HelixPoint[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const newParticles: HelixPoint[] = [];
    // Teal + Gold BEAST palette
    const colors = ['#14b8a6', '#0d9488', '#5eead4', '#d4a574', '#ca8a04', '#facc15'];
    const numPoints = 32;
    const amplitude = 100;
    const frequency = 0.02;

    for (let i = 0; i < numPoints; i++) {
      newParticles.push({
        angle: i * frequency * 2 * Math.PI,
        radius: amplitude,
        y: (i / numPoints) * canvas.height - canvas.height / 2,
        color: colors[i % colors.length],
        phase: i
      });
    }
    setParticles(newParticles);

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 1.2;
      time += 0.02;

      ctx.save();
      ctx.translate(centerX, 0);
      ctx.scale(scale, 1);
      ctx.translate(-centerX, 0);

      for (let i = 0; i < newParticles.length; i++) {
        const p = newParticles[i];
        const angle1 = p.angle + time + Math.PI;
        const angle2 = p.angle + time;
        
        const x1 = Math.cos(angle1) * p.radius;
        const y1 = p.y + centerY;
        const x2 = Math.cos(angle2) * p.radius;
        const y2 = p.y + centerY;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, p.color + '80');
        gradient.addColorStop(1, p.color + '80');
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      for (let i = 0; i < newParticles.length; i++) {
        const p = newParticles[i];
        
        const x1 = Math.cos(p.angle + time + Math.PI) * p.radius;
        const y1 = p.y + centerY;
        
        const size = 12 + Math.sin(time * 3 + i * 0.3) * 3;
        
        ctx.beginPath();
        ctx.arc(x1, y1, size, 0, Math.PI * 2);
        const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, size);
        grad1.addColorStop(0, p.color);
        grad1.addColorStop(1, p.color + '00');
        ctx.fillStyle = grad1;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        
        const x2 = Math.cos(p.angle + time) * p.radius;
        const y2 = y1;
        
        ctx.beginPath();
        ctx.arc(x2, y2, size, 0, Math.PI * 2);
        const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, size);
        grad2.addColorStop(0, p.color);
        grad2.addColorStop(1, p.color + '00');
        ctx.fillStyle = grad2;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.sin(time * 2) * 30, centerY - 100,
        Math.sin(time * 2 + Math.PI) * 100, centerY
      );
      ctx.quadraticCurveTo(
        Math.sin(time * 2 + Math.PI * 2) * 30, centerY + 100,
        0, canvas.height
      );
      const pathGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      pathGradient.addColorStop(0, 'rgba(14, 165, 233, 0.03)');
      pathGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
      pathGradient.addColorStop(1, 'rgba(20, 184, 166, 0.03)');
      ctx.strokeStyle = pathGradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain"
        aria-hidden="true"
      />
    </motion.div>
  );
}