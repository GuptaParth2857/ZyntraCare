'use client';

import { useRef, useEffect } from 'react';

const COLORS = [
  { solid: '#38bdf8', gr: 56,  gg: 189, gb: 248 },
  { solid: '#2dd4bf', gr: 45,  gg: 212, gb: 191 },
  { solid: '#818cf8', gr: 129, gg: 140, gb: 248 },
  { solid: '#a78bfa', gr: 167, gg: 139, gb: 250 },
  { solid: '#34d399', gr: 52,  gg: 211, gb: 153 },
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
    let isVisible = false;
    let lastFrame = 0;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    const setSize = () => {
      W = canvas.offsetWidth || window.innerWidth;
      H = canvas.offsetHeight || window.innerHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    setSize();

    const DEPTH = 500;
    const FOV = 400;
    const COUNT = 30; // Reduced: 75→30

    const orbs = Array.from({ length: COUNT }, (_, i) => {
      const c = COLORS[i % COLORS.length];
      return {
        x: (Math.random() - 0.5) * W * 2.5,
        y: (Math.random() - 0.5) * H * 2.5,
        z: Math.random() * DEPTH,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.5,
        baseRadius: 4 + Math.random() * 9,
        solid: c.solid,
        gr: c.gr, gg: c.gg, gb: c.gb,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.8,
      };
    });

    let t = 0;

    const project = (x: number, y: number, z: number) => {
      const scale = FOV / (FOV + z);
      return { px: W / 2 + x * scale, py: H / 2 + y * scale, scale };
    };

    const draw = (now: number) => {
      if (!isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      t += 0.01;

      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy; o.z += o.vz;
        if (o.x < -W * 1.5) o.x = W * 1.5;
        if (o.x > W * 1.5)  o.x = -W * 1.5;
        if (o.y < -H * 1.5) o.y = H * 1.5;
        if (o.y > H * 1.5)  o.y = -H * 1.5;
        if (o.z < 0)        o.z = DEPTH;
        if (o.z > DEPTH)    o.z = 0;
      }

      const sorted = [...orbs].sort((a, b) => b.z - a.z);

      // Draw connections (skip more pairs to reduce O(n²) load)
      for (let i = 0; i < sorted.length; i += 2) {
        for (let j = i + 1; j < sorted.length; j += 2) {
          const a = sorted[i], b = sorted[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          if (dx * dx + dy * dy + dz * dz > 130 * 130) continue; // reduced range
          const pA = project(a.x, a.y, a.z);
          const pB = project(b.x, b.y, b.z);
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const alpha = (1 - dist / 130) * 0.15;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.strokeStyle = `rgba(${a.gr},${a.gg},${a.gb},${alpha.toFixed(2)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Draw orbs
      for (const o of sorted) {
        const { px, py, scale } = project(o.x, o.y, o.z);
        if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

        const pulse = 1 + 0.2 * Math.sin(t * o.speed + o.phase);
        const r = o.baseRadius * scale * pulse;
        const alpha = 0.2 + 0.6 * scale;

        // Simple core dot (no expensive radial gradient for all orbs)
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${o.gr},${o.gg},${o.gb},${alpha.toFixed(2)})`;
        ctx.fill();
      }
    };

    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        lastFrame = 0;
        rafRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);

    const onResize = () => setSize();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
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
