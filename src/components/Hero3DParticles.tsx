'use client';

import { useRef, useEffect } from 'react';

interface Orb {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number;
  speed: number;
  type: 'orb' | 'ring' | 'cross';
}

interface Line {
  a: Orb; b: Orb;
  opacity: number;
}

const COLORS = [
  { solid: '#38bdf8', glow: 'rgba(56,189,248,' },    // sky
  { solid: '#2dd4bf', glow: 'rgba(45,212,191,' },    // teal
  { solid: '#818cf8', glow: 'rgba(129,140,248,' },   // indigo
  { solid: '#a78bfa', glow: 'rgba(167,139,250,' },   // violet
  { solid: '#34d399', glow: 'rgba(52,211,153,' },    // emerald
];

export default function Hero3DParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    const setSize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    setSize();

    const DEPTH = 500;
    const FOV = 400;

    // Create orbs in 3D space
    const orbs: Orb[] = Array.from({ length: 75 }, (_, i) => {
      const c = COLORS[i % COLORS.length];
      return {
        x: (Math.random() - 0.5) * W * 2.5,
        y: (Math.random() - 0.5) * H * 2.5,
        z: Math.random() * DEPTH,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.6,
        baseRadius: 5 + Math.random() * 11,
        color: c.solid,
        glowColor: c.glow,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.0,
        type: i % 8 === 0 ? 'ring' : i % 12 === 0 ? 'cross' : 'orb',
      };
    });

    let t = 0;

    // Project 3D -> 2D with perspective
    const project = (orb: Orb) => {
      const scale = FOV / (FOV + orb.z);
      const px = W / 2 + orb.x * scale;
      const py = H / 2 + orb.y * scale;
      return { px, py, scale };
    };

    const drawCross = (cx: number, cy: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.18;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 4;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();
      ctx.restore();
    };

    const drawRing = (cx: number, cy: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      // Update orb positions
      for (const o of orbs) {
        o.x += o.vx;
        o.y += o.vy;
        o.z += o.vz;

        // Boundary bounce with wrap-around
        if (o.x < -W * 1.5) o.x = W * 1.5;
        if (o.x > W * 1.5) o.x = -W * 1.5;
        if (o.y < -H * 1.5) o.y = H * 1.5;
        if (o.y > H * 1.5) o.y = -H * 1.5;
        if (o.z < 0) o.z = DEPTH;
        if (o.z > DEPTH) o.z = 0;
      }

      // Sort back-to-front for correct overdraw
      const sorted = [...orbs].sort((a, b) => b.z - a.z);

      // Draw connections between close orbs
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i], b = sorted[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist3d < 220) {
            const pA = project(a), pB = project(b);
            const avgScale = (pA.scale + pB.scale) / 2;
            const alpha = (1 - dist3d / 220) * 0.18 * avgScale;
            const grad = ctx.createLinearGradient(pA.px, pA.py, pB.px, pB.py);
            grad.addColorStop(0, a.glowColor + alpha + ')');
            grad.addColorStop(1, b.glowColor + alpha + ')');
            ctx.beginPath();
            ctx.moveTo(pA.px, pA.py);
            ctx.lineTo(pB.px, pB.py);
            ctx.strokeStyle = grad;
            ctx.lineWidth = avgScale * 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw orbs
      for (const o of sorted) {
        const { px, py, scale } = project(o);

        // Skip if outside viewport
        if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

        const pulse = 1 + 0.25 * Math.sin(t * o.speed + o.phase);
        const r = o.baseRadius * scale * pulse;
        const alpha = 0.15 + 0.7 * scale;

        if (o.type === 'cross') {
          drawCross(px, py, r * 3, o.color, alpha * 0.9);
        } else if (o.type === 'ring') {
          drawRing(px, py, r * 2.5, o.color, alpha * 0.85);
        } else {
          // Glow halo
          const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 6);
          grd.addColorStop(0, o.glowColor + Math.min(1, alpha * 0.55) + ')');
          grd.addColorStop(0.5, o.glowColor + Math.min(1, alpha * 0.2) + ')');
          grd.addColorStop(1, o.glowColor + '0)');
          ctx.beginPath();
          ctx.arc(px, py, r * 6, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Core dot
          const core = ctx.createRadialGradient(px, py, 0, px, py, r);
          core.addColorStop(0, '#ffffff');
          core.addColorStop(0.35, o.color);
          core.addColorStop(1, o.glowColor + '0)');
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = core;
          ctx.shadowColor = o.color;
          ctx.shadowBlur = r * 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => { setSize(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
