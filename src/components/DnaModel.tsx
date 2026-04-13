'use client';

import { useRef, useEffect } from 'react';

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  radius: number; opacity: number;
  color: string;
}

interface DNANode {
  angle: number;
  y: number;
  strand: 0 | 1;
}

export default function InteractiveDnaModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Floating particles (bokeh background)
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: 0,
      radius: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: ['#38bdf8', '#a78bfa', '#34d399', '#818cf8', '#f472b6'][Math.floor(Math.random() * 5)],
    }));

    // ── DNA nodes
    const PAIRS = 60;
    const dnaNodes: DNANode[] = [];
    for (let i = 0; i < PAIRS; i++) {
      dnaNodes.push({ angle: (i / PAIRS) * Math.PI * 4, y: i / PAIRS, strand: 0 });
      dnaNodes.push({ angle: (i / PAIRS) * Math.PI * 4 + Math.PI, y: i / PAIRS, strand: 1 });
    }

    // Mouse drag interaction
    let isDragging = false;
    let lastX = 0;
    const onMouseDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) rotationRef.current += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseUp = () => { isDragging = false; };
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let startTime = performance.now();

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const t = (performance.now() - startTime) / 1000;

      ctx.clearRect(0, 0, W, H);

      // ── Background bokeh particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Mouse repel
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          p.x += dx / dist * 1.5;
          p.y += dy / dist * 1.5;
        }

        // Pulse opacity
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + p.z * 5);
        const r = p.radius * (0.8 + 0.4 * p.z);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, p.color.replace(')', `, ${p.opacity * pulse})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace('rgba(', '#'));

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * pulse * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // ── DNA Helix
      const cx = W / 2;
      const cy = H / 2;
      const helixH = H * 0.7;
      const helixR = Math.min(W, H) * 0.12;
      const rot = rotationRef.current + t * 0.25;

      // Draw rungs first (behind strands)
      for (let i = 0; i < PAIRS; i++) {
        const progress = i / (PAIRS - 1);
        const angle = progress * Math.PI * 8 + rot;
        const yPos = cy - helixH / 2 + progress * helixH;

        const x1 = cx + Math.sin(angle) * helixR;
        const x2 = cx + Math.sin(angle + Math.PI) * helixR;
        const depth1 = (Math.cos(angle) + 1) / 2;
        const depth2 = (Math.cos(angle + Math.PI) + 1) / 2;

        // Only draw rungs every 3rd pair  
        if (i % 3 === 0) {
          const rungAlpha = 0.15 + 0.15 * ((depth1 + depth2) / 2);
          ctx.beginPath();
          ctx.moveTo(x1, yPos);
          ctx.lineTo(x2, yPos);
          ctx.strokeStyle = `rgba(129, 140, 248, ${rungAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Rung glow dots
          const dotR = 2.5 + depth1 * 2;
          const dotAlpha = 0.4 + depth1 * 0.6;
          ctx.beginPath();
          ctx.arc(x1, yPos, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${dotAlpha})`;
          ctx.fill();

          const dotR2 = 2.5 + depth2 * 2;
          const dotAlpha2 = 0.4 + depth2 * 0.6;
          ctx.beginPath();
          ctx.arc(x2, yPos, dotR2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${dotAlpha2})`;
          ctx.fill();
        }
      }

      // Draw strand lines
      const drawStrand = (offset: number, colorFn: (depth: number) => string) => {
        ctx.beginPath();
        for (let i = 0; i <= PAIRS; i++) {
          const progress = i / PAIRS;
          const angle = progress * Math.PI * 8 + rot + offset;
          const yPos = cy - helixH / 2 + progress * helixH;
          const x = cx + Math.sin(angle) * helixR;
          const depth = (Math.cos(angle) + 1) / 2;

          if (i === 0) ctx.moveTo(x, yPos);
          else ctx.lineTo(x, yPos);
        }
        ctx.strokeStyle = colorFn(0.8);
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = colorFn(0.8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      drawStrand(0, (a) => `rgba(56, 189, 248, ${a})`);
      drawStrand(Math.PI, (a) => `rgba(167, 139, 250, ${a})`);

      // ── Orbiting energy ring
      const orbitR = helixR * 2.2;
      for (let i = 0; i < 3; i++) {
        const orbitAngle = t * (0.8 + i * 0.3) + (i * Math.PI * 2) / 3;
        const ox = cx + Math.cos(orbitAngle) * orbitR;
        const oy = cy + Math.sin(orbitAngle) * orbitR * 0.35; // Elliptical
        const colors = ['#38bdf8', '#a78bfa', '#34d399'];

        // Trailing glow
        const tailLength = 18;
        for (let j = 0; j < tailLength; j++) {
          const ta = orbitAngle - j * 0.08;
          const tx = cx + Math.cos(ta) * orbitR;
          const ty = cy + Math.sin(ta) * orbitR * 0.35;
          const alpha = (1 - j / tailLength) * 0.6;
          const radius = (1 - j / tailLength) * 5;
          ctx.beginPath();
          ctx.arc(tx, ty, radius, 0, Math.PI * 2);
          ctx.fillStyle = colors[i] + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        // Main dot
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 8);
        grd.addColorStop(0, colors[i] + 'ff');
        grd.addColorStop(1, colors[i] + '00');
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] relative cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white/60 border border-white/10 pointer-events-none select-none">
        ⟳ Interactive 3D — Drag to Explore
      </div>
    </div>
  );
}
