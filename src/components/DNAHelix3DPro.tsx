'use client';

import { useRef, useEffect } from 'react';

export default function DNAHelix3DPro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Opting out of alpha for pure black background performance
    if (!ctx) return;

    let cw = 0, ch = 0;
    const resize = () => {
      cw = canvas.offsetWidth;
      ch = canvas.offsetHeight;
      canvas.width = cw * window.devicePixelRatio;
      canvas.height = ch * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - cw / 2;
      const y = e.clientY - rect.top - ch / 2;
      mouseRef.current.targetX = x * 0.0005;
      mouseRef.current.targetY = y * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // AI Hex/Data Particles
    const particles = Array.from({ length: 100 }, () => ({
      y: Math.random() * ch,
      speed: Math.random() * 2 + 0.5,
      size: Math.random() * 1.5 + 0.5,
      offset: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const pointsCount = 120;
    const twists = 3.5;

    const draw = () => {
      time += 0.012;

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Clear with dark tech background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#060B14'; // Very deep blue/black
      ctx.fillRect(0, 0, cw, ch);

      ctx.globalCompositeOperation = 'screen';

      const centerY = ch / 2;
      const centerX = cw / 2;
      const radius = Math.min(cw, ch) * 0.28;
      const height = ch * 0.85;

      const nodes: any[] = [];
      const rungs: any[] = [];

      for (let i = 0; i < pointsCount; i++) {
        const progress = i / (pointsCount - 1);
        const yPos = centerY - height / 2 + progress * height;
        const angle = progress * Math.PI * 2 * twists + time + mouseRef.current.y * 10;

        const x1 = Math.sin(angle) * radius;
        const z1 = Math.cos(angle) * radius;
        const x2 = Math.sin(angle + Math.PI) * radius;
        const z2 = Math.cos(angle + Math.PI) * radius;

        const fov = 800;
        const s1 = fov / (fov + z1);
        const s2 = fov / (fov + z2);

        const nx1 = centerX + x1 * s1 + mouseRef.current.x * z1 * 2;
        const nx2 = centerX + x2 * s2 + mouseRef.current.x * z2 * 2;

        const n1 = { x: nx1, y: yPos, z: z1, s: s1, isStrand1: true, index: i };
        const n2 = { x: nx2, y: yPos, z: z2, s: s2, isStrand1: false, index: i };

        nodes.push(n1, n2);

        if (i % 6 === 0) {
          rungs.push({ p1: n1, p2: n2, index: i });
        }
      }

      // Sort Z-Index for pseudo-3D
      nodes.sort((a, b) => b.z - a.z);
      rungs.sort((a, b) => (b.p1.z + b.p2.z) - (a.p1.z + a.p2.z));

      // Draw Rungs (Connections)
      rungs.forEach((rung) => {
        const depthAlpha = Math.max(0.05, 0.3 - ((rung.p1.z + rung.p2.z) / (radius * 4)));
        const pulse = (Math.sin(time * 4 - rung.index * 0.1) * 0.5 + 0.5);
        const finalAlpha = depthAlpha + pulse * 0.2;

        ctx.beginPath();
        ctx.moveTo(rung.p1.x, rung.p1.y);
        ctx.lineTo(rung.p2.x, rung.p2.y);
        const grad = ctx.createLinearGradient(rung.p1.x, rung.p1.y, rung.p2.x, rung.p2.y);
        // Teal to Blue/Purple
        grad.addColorStop(0, `rgba(45, 212, 191, ${finalAlpha})`);
        grad.addColorStop(1, `rgba(56, 189, 248, ${finalAlpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 * ((rung.p1.s + rung.p2.s) / 2);
        ctx.stroke();

        // Data nodes in the middle of rungs
        if (pulse > 0.8) {
          const mx = (rung.p1.x + rung.p2.x) / 2;
          const my = (rung.p1.y + rung.p2.y) / 2;
          ctx.beginPath();
          ctx.arc(mx, my, 2 * rung.p1.s, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#38bdf8';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes (Backbone)
      nodes.forEach((n) => {
        const color = n.isStrand1 ? '45, 212, 191' : '56, 189, 248'; // Teal / Sky
        const size = (n.isStrand1 ? 2.5 : 2.5) * n.s;
        
        const spark = Math.sin(time * 6 + n.y * 0.05) > 0.85;
        const depthAlpha = Math.max(0.1, 0.6 - (n.z / radius) * 0.4);

        ctx.beginPath();
        ctx.arc(n.x, n.y, size * (spark ? 2.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${spark ? 1 : depthAlpha})`;
        if (spark) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgb(${color})`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      // AI Scanner Laser Effect
      ctx.globalCompositeOperation = 'hard-light'; // Intense laser glow
      const scanPhase = Math.sin(time * 0.6);
      const scanY = (scanPhase * 0.5 + 0.5) * height + (centerY - height / 2);
      
      // Laser Line
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 1.5, scanY);
      ctx.lineTo(centerX + radius * 1.5, scanY);
      ctx.strokeStyle = `rgba(56, 189, 248, 0.8)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#38bdf8';
      ctx.stroke();
      
      // Laser Area Glow
      const laserGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      laserGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
      laserGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.15)');
      laserGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(centerX - radius * 1.5, scanY - 30, radius * 3, 60);
      ctx.shadowBlur = 0;

      // Floating ATCG data bits background
      ctx.globalCompositeOperation = 'screen';
      ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const letters = ['A', 'T', 'C', 'G'];
      
      particles.forEach((p, index) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = ch;
        const px = centerX + Math.sin(p.y * 0.005 + p.offset) * radius * 2.8 + mouseRef.current.x * 200;
        
        ctx.fillStyle = `rgba(14, 165, 233, ${0.1 + (Math.sin(time * 3 + p.offset) * 0.5 + 0.5) * 0.7})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0ea5e9';
        ctx.fillText(letters[index % 4], px, p.y);
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-full relative cursor-crosshair overflow-hidden group">
      <canvas ref={canvasRef} className="w-full h-[480px] block" />
      {/* Vignette to blend edges neatly */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(15,23,42,0.9) 100%)'
        }} 
      />
    </div>
  );
}
