'use client';

import { useRef, useEffect } from 'react';

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.offsetWidth || 300;
    let H = canvas.offsetHeight || 300;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let isVisible = false;
    let lastFrame = 0;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    let cx = W / 2, cy = H / 2;
    let R = Math.min(W, H) * 0.38;
    let t = 0;

    const MERIDIANS = 8;  // Reduced: 12→8
    const PARALLELS = 6;  // Reduced: 8→6
    const DOTS = 50;      // Reduced: 120→50

    const dots = Array.from({ length: DOTS }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2,
      color: ['#38bdf8', '#2dd4bf', '#818cf8', '#34d399'][Math.floor(Math.random() * 4)],
      speed: (Math.random() - 0.5) * 0.003,
    }));

    // Reduced: 3 satellites → 2
    const satellites = Array.from({ length: 2 }, (_, i) => ({
      orbitAngle: (i / 2) * Math.PI * 2,
      orbitTilt: (i * 0.4 + 0.2) * Math.PI,
      orbitR: R * (1.2 + i * 0.08),
      color: ['#38bdf8', '#a78bfa'][i],
      speed: 0.012 + i * 0.007,
    }));

    const project3D = (lat: number, lng: number, rot: number) => {
      const rLng = lng + rot;
      const x3 = Math.cos(lat) * Math.sin(rLng);
      const y3 = Math.sin(lat);
      const z3 = Math.cos(lat) * Math.cos(rLng);
      return { px: cx + R * x3, py: cy - R * y3 * 0.85, z: z3 };
    };

    const draw = (now: number) => {
      if (!isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      t += 0.009;
      const rot = t * 0.25;

      // Globe aura
      const aura = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.5);
      aura.addColorStop(0, 'rgba(14,165,233,0.18)');
      aura.addColorStop(0.5, 'rgba(20,184,166,0.08)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // Outline
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56,189,248,0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Parallels
      for (let p = 1; p < PARALLELS; p++) {
        const lat = (p / PARALLELS) * Math.PI - Math.PI / 2;
        const r2d = R * Math.cos(lat);
        const y2d = cy - R * Math.sin(lat) * 0.85;
        ctx.beginPath();
        ctx.ellipse(cx, y2d, r2d, r2d * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,0.09)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Meridians (front only)
      for (let m = 0; m < MERIDIANS; m++) {
        const lng0 = (m / MERIDIANS) * Math.PI * 2 + rot;
        ctx.beginPath();
        let started = false;
        for (let step = 0; step <= 40; step++) {
          const lat2 = (step / 40) * Math.PI - Math.PI / 2;
          const x3 = Math.cos(lat2) * Math.sin(lng0);
          const y3 = Math.sin(lat2);
          const z3 = Math.cos(lat2) * Math.cos(lng0);
          if (z3 >= 0) {
            const px = cx + R * x3, py = cy - R * y3 * 0.85;
            if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
          } else if (started) {
            ctx.stroke(); ctx.beginPath(); started = false;
          }
        }
        if (started) {
          ctx.strokeStyle = 'rgba(56,189,248,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Surface dots (no radial gradient — use simple circle)
      for (const d of dots) {
        d.lng += d.speed;
        const { px, py, z } = project3D(d.lat, d.lng, rot);
        if (z < -0.1) continue;
        const size = d.size * (0.4 + 0.6 * z);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.3 + 0.7 * z;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Satellites (simplified — no trails)
      for (const sat of satellites) {
        sat.orbitAngle += sat.speed;
        const ox = cx + sat.orbitR * Math.cos(sat.orbitAngle);
        const oy = cy + sat.orbitR * Math.sin(sat.orbitAngle) * 0.4;
        ctx.beginPath();
        ctx.arc(ox, oy, 5, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
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
    }, { threshold: 0.1 });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} aria-hidden="true" />
  );
}
