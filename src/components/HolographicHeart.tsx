'use client';

import { useRef, useEffect } from 'react';

export default function HolographicHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    let isVisible = false;
    let lastFrame = 0;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    const resize = () => {
      w = canvas.offsetWidth || 300;
      h = canvas.offsetHeight || 300;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Reduced: 400→120 points
    const points: { x: number; y: number; z: number; r: number; offset: number }[] = [];
    for (let i = 0; i < 120; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const hx = 16 * Math.pow(Math.sin(u), 3);
      const hy = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
      const hz = Math.sin(v) * 8 * Math.cos(u / 2);
      points.push({ x: hx * 8, y: -hy * 8, z: hz * 8, r: 1 + Math.random() * 2, offset: Math.random() * Math.PI * 2 });
    }

    let t = 0;

    const draw = (now: number) => {
      if (!isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      ctx.clearRect(0, 0, w, h);
      t += 0.018;

      const cx = w / 2, cy = h / 2;
      ctx.globalCompositeOperation = 'screen';

      const beat = 1 + Math.sin(t * 8) * 0.08;
      const rotY = t * 0.4;
      const rotX = Math.sin(t * 0.3) * 0.2;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const fov = 500;

      const projected = points.map(p => {
        const px = p.x * beat, py = p.y * beat, pz = p.z * beat;
        const ryX = px * cosY - pz * sinY;
        const ryZ = pz * cosY + px * sinY;
        const rxY = py * cosX - ryZ * sinX;
        const rxZ = ryZ * cosX + py * sinX;
        const s = fov / (fov + rxZ);
        return { sx: cx + ryX * s, sy: cy + rxY * s, s, z: rxZ, r: p.r };
      }).sort((a, b) => b.z - a.z);

      // Draw points (no shadowBlur — very expensive)
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.z < -fov + 10) continue;
        const alpha = Math.max(0.1, 0.85 - p.z * 0.002);
        const radius = Math.max(0.5, p.r * p.s);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,113,133,${alpha.toFixed(2)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        lastFrame = 0;
        rafRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    }, { threshold: 0.1 });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
