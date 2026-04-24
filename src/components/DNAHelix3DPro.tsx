'use client';

import { useRef, useEffect } from 'react';

export default function DNAHelix3DPro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let cw = 0, ch = 0;
    let isVisible = false;
    let lastFrame = 0;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    const resize = () => {
      cw = canvas.offsetWidth || 400;
      ch = canvas.offsetHeight || 400;
      canvas.width = cw * devicePixelRatio;
      canvas.height = ch * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Reduced: 100→40 particles
    const particles = Array.from({ length: 40 }, () => ({
      y: Math.random() * ch,
      speed: Math.random() * 1.5 + 0.4,
      size: Math.random() * 1.2 + 0.4,
      offset: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const pointsCount = 60; // Reduced: 120→60
    const twists = 3.5;
    const letters = ['A', 'T', 'C', 'G'];

    const draw = (now: number) => {
      if (!isVisible) return;
      animRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      time += 0.016;
      ctx.clearRect(0, 0, cw, ch);

      const centerY = ch / 2;
      const centerX = cw / 2;
      const radius = Math.min(cw, ch) * 0.28;
      const height = ch * 0.85;

      const nodes: any[] = [];
      const rungs: any[] = [];

      for (let i = 0; i < pointsCount; i++) {
        const progress = i / (pointsCount - 1);
        const yPos = centerY - height / 2 + progress * height;
        const angle = progress * Math.PI * 2 * twists + time;

        const x1 = Math.sin(angle) * radius;
        const z1 = Math.cos(angle) * radius;
        const x2 = Math.sin(angle + Math.PI) * radius;
        const z2 = Math.cos(angle + Math.PI) * radius;

        const fov = 800;
        const s1 = fov / (fov + z1);
        const s2 = fov / (fov + z2);

        const n1 = { x: centerX + x1 * s1, y: yPos, z: z1, s: s1, isStrand1: true, index: i };
        const n2 = { x: centerX + x2 * s2, y: yPos, z: z2, s: s2, isStrand1: false, index: i };
        nodes.push(n1, n2);
        if (i % 6 === 0) rungs.push({ p1: n1, p2: n2, index: i });
      }

      nodes.sort((a, b) => b.z - a.z);

      // Draw Rungs
      for (const rung of rungs) {
        const depthAlpha = Math.max(0.05, 0.3 - ((rung.p1.z + rung.p2.z) / (radius * 4)));
        const pulse = (Math.sin(time * 4 - rung.index * 0.1) * 0.5 + 0.5);
        const finalAlpha = depthAlpha + pulse * 0.15;
        ctx.beginPath();
        ctx.moveTo(rung.p1.x, rung.p1.y);
        ctx.lineTo(rung.p2.x, rung.p2.y);
        // Teal + Gold BEAST palette
        const grad = ctx.createLinearGradient(rung.p1.x, rung.p1.y, rung.p2.x, rung.p2.y);
        grad.addColorStop(0, `rgba(20,184,166,${finalAlpha})`); // teal
        grad.addColorStop(1, `rgba(212,165,116,${finalAlpha})`); // gold
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // Draw Nodes
      for (const n of nodes) {
        // Teal + Gold BEAST palette
        const color = n.isStrand1 ? '20,184,166' : '212,165,116';
        const size = 2 * n.s;
        const depthAlpha = Math.max(0.1, 0.5 - (n.z / radius) * 0.3);
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${depthAlpha})`;
        ctx.fill();
      }

      // Scanner laser (lightweight)
      const scanY = (Math.sin(time * 0.6) * 0.5 + 0.5) * height + (centerY - height / 2);
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 1.5, scanY);
      ctx.lineTo(centerX + radius * 1.5, scanY);
      ctx.strokeStyle = 'rgba(56,189,248,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Floating ATCG (reduced, no shadow)
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let idx = 0; idx < particles.length; idx++) {
        const p = particles[idx];
        p.y -= p.speed;
        if (p.y < 0) p.y = ch;
        const px = centerX + Math.sin(p.y * 0.005 + p.offset) * radius * 2.5;
        const alpha = 0.08 + (Math.sin(time * 2 + p.offset) * 0.5 + 0.5) * 0.18;
        ctx.fillStyle = `rgba(14,165,233,${alpha.toFixed(2)})`;
        ctx.fillText(letters[idx % 4], px, p.y);
      }
    };

    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        lastFrame = 0;
        animRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animRef.current);
      }
    }, { threshold: 0.1 });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-[480px] block" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(15,23,42,0.9) 100%)' }} />
    </div>
  );
}
