'use client';

import { useRef, useEffect } from 'react';

interface BrainNode {
  x: number; y: number; z: number;
  vx: number; vy: number;
  r: number;
  phase: number;
  active: boolean;
  activationTimer: number;
  color: string;
  gr: number; gg: number; gb: number;  // rgb components for safe rgba
}

interface Synapse {
  from: BrainNode;
  to: BrainNode;
  pulsePos: number;
  pulseActive: boolean;
  pulseSpeed: number;
  color: string;
  cr: number; cg: number; cb: number;
}

const NODE_DEFS = [
  { c: '#818cf8', r: 129, g: 140, b: 248 },
  { c: '#a78bfa', r: 167, g: 139, b: 250 },
  { c: '#c084fc', r: 192, g: 132, b: 252 },
  { c: '#38bdf8', r: 56,  g: 189, b: 248 },
  { c: '#e879f9', r: 232, g: 121, b: 249 },
];

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, isNaN(v) ? 0 : v));
const safeRgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r},${g},${b},${clamp(a).toFixed(3)})`;

export default function AIBrain3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ W: 0, H: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrame = 0;
    const FRAME_MS = 1000 / 30; // 30fps cap

    const setSize = () => {
      const W = Math.max(canvas.offsetWidth, 10);
      const H = Math.max(canvas.offsetHeight, 10);
      sizeRef.current = { W, H };
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    setSize();

    // Delay first frame to let layout settle
    const initTimer = setTimeout(() => {
      setSize();
      startAnimation();
    }, 80);

    const COUNT = 28; // Reduced: 44→28
    let nodes: BrainNode[] = [];
    let synapses: Synapse[] = [];

    const buildGraph = () => {
      const { W, H } = sizeRef.current;
      nodes = Array.from({ length: COUNT }, (_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rnd = Math.cbrt(Math.random());
        const R = Math.min(W, H) * 0.32 * rnd;
        const def = NODE_DEFS[i % NODE_DEFS.length];
        return {
          x: W / 2 + R * Math.sin(phi) * Math.cos(theta),
          y: H / 2 + R * Math.sin(phi) * Math.sin(theta) * 0.7,
          z: R * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 3.5 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
          active: false,
          activationTimer: 0,
          color: def.c,
          gr: def.r, gg: def.g, gb: def.b,
        };
      });

      synapses = [];
      const maxD = Math.min(W, H) * 0.28;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (Math.sqrt(dx*dx + dy*dy) < maxD) {
            const def = NODE_DEFS[Math.floor(Math.random() * NODE_DEFS.length)];
            synapses.push({
              from: a, to: b,
              pulsePos: Math.random(),
              pulseActive: Math.random() > 0.5,
              pulseSpeed: 0.006 + Math.random() * 0.010,
              color: def.c, cr: def.r, cg: def.g, cb: def.b,
            });
          }
        }
      }
    };

    let t = 0;
    let running = true;
    let isVisible = false;

    const draw = (now: number) => {
      if (!running || !isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      const { W, H } = sizeRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.011;

      // Move nodes (spring back to center cluster)
      for (const n of nodes) {
        n.x += n.vx * 0.4;
        n.y += n.vy * 0.4;
        const dx = n.x - W/2, dy = n.y - H/2;
        const d = Math.sqrt(dx*dx + dy*dy);
        const maxR = Math.min(W, H) * 0.44;
        if (d > maxR) { n.vx -= dx * 0.0008; n.vy -= dy * 0.0008; }
        n.vx *= 0.998; n.vy *= 0.998;

        if (!n.active && Math.random() < 0.003) { n.active = true; n.activationTimer = 55; }
        if (n.active) { n.activationTimer--; if (n.activationTimer <= 0) n.active = false; }
      }

      // Draw synapses
      for (const s of synapses) {
        const a = s.from, b = s.to;
        const depth = ((a.z + b.z) / 2 + 200) / 400;
        const baseAlpha = clamp(0.06 + clamp(depth) * 0.20);
        const aMult = (a.active || b.active) ? 2.8 : 1;

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, safeRgba(a.gr, a.gg, a.gb, baseAlpha * aMult));
        grad.addColorStop(1, safeRgba(b.gr, b.gg, b.gb, baseAlpha * aMult));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8 + clamp(depth) * 1.2;
        ctx.stroke();

        // Traveling pulse
        if (s.pulseActive) {
          s.pulsePos += s.pulseSpeed;
          if (s.pulsePos > 1) {
            s.pulsePos = 0;
            s.pulseActive = Math.random() > 0.18;
          }
          const px = a.x + (b.x - a.x) * s.pulsePos;
          const py = a.y + (b.y - a.y) * s.pulsePos;
          const pr = clamp(2.5 + clamp(depth) * 2.5, 0, 15);
          const pg = ctx.createRadialGradient(px, py, 0, px, py, pr * 3.5);
          pg.addColorStop(0, s.color);
          pg.addColorStop(0.4, safeRgba(s.cr, s.cg, s.cb, 0.7));
          pg.addColorStop(1, safeRgba(s.cr, s.cg, s.cb, 0));
          ctx.beginPath();
          ctx.arc(px, py, pr * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        } else if (Math.random() < 0.008) {
          s.pulseActive = true;
          s.pulsePos = 0;
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const depth = clamp((n.z + 200) / 400);
        const pulse = 1 + 0.28 * Math.sin(t * 1.4 + n.phase);
        const r = clamp(n.r * (0.4 + 0.6 * depth) * pulse * (n.active ? 1.9 : 1), 0.5, 25);
        const alpha = clamp(0.30 + depth * 0.65);
        const aMult = n.active ? 2.8 : 1;

        // Outer glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5.5);
        glow.addColorStop(0, safeRgba(n.gr, n.gg, n.gb, alpha * 0.4 * aMult));
        glow.addColorStop(1, safeRgba(n.gr, n.gg, n.gb, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 5.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        const core = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.4, n.color);
        core.addColorStop(1, safeRgba(n.gr, n.gg, n.gb, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        // Activation ring expanding out
        if (n.active) {
          const ringR = r * (1 + (55 - n.activationTimer) / 28);
          ctx.beginPath();
          ctx.arc(n.x, n.y, clamp(ringR, 0, 50), 0, Math.PI * 2);
          ctx.strokeStyle = safeRgba(n.gr, n.gg, n.gb, n.activationTimer / 55 * 0.9);
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      }

      // Central brain ambient aura
      const aura = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.42);
      aura.addColorStop(0, `rgba(168,85,247,${(0.04 + 0.02 * Math.sin(t)).toFixed(3)})`);
      aura.addColorStop(0.6, 'rgba(99,102,241,0.025)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(W/2, H/2, Math.min(W,H)*0.42, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();
    };

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && running) {
        lastFrame = 0;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    }, { threshold: 0.1 });
    observer.observe(canvas);

    const startAnimation = () => {
      buildGraph();
      rafRef.current = requestAnimationFrame(draw);
    };


    const onResize = () => { setSize(); buildGraph(); };
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      observer.disconnect();
      clearTimeout(initTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
