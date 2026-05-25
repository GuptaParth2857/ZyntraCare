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

    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();

    let isVisible = true;
    let lastFrame = 0;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    const DOTS = 200;
    const RING_PARTICLES = 60;
    const STARS = 100;

    const dots = Array.from({ length: DOTS }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2.5,
      color: ['#22d3ee', '#67e8f9', '#38bdf8', '#60a5fa', '#818cf8', '#fbbf24'][Math.floor(Math.random() * 6)],
      speed: (Math.random() - 0.5) * 0.004,
    }));

    const ringParticles = Array.from({ length: RING_PARTICLES }, (_, i) => ({
      angle: (i / RING_PARTICLES) * Math.PI * 2,
      radius: 0,
      size: 1.5 + Math.random() * 1.5,
      speed: 0.005 + Math.random() * 0.01,
      tilt: Math.random() * Math.PI,
      color: ['#22d3ee', '#60a5fa', '#fbbf24'][Math.floor(Math.random() * 3)],
    }));

    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.5,
      speed: 0.05 + Math.random() * 0.1,
    }));

    let t = 0;

    const project3D = (lat: number, lng: number, rot: number, radius: number, cx: number, cy: number) => {
      const rLng = lng + rot;
      const x3 = Math.cos(lat) * Math.sin(rLng);
      const y3 = Math.sin(lat);
      const z3 = Math.cos(lat) * Math.cos(rLng);
      return { px: cx + radius * x3, py: cy - radius * y3 * 0.85, z: z3 };
    };

    const draw = (now: number) => {
      if (!isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      if (W === 0 || H === 0) return;

      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.38;
      const rot = t * 0.2;

      // --- Stars background ---
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.x * 10);
        ctx.beginPath();
        ctx.arc(cx + s.x * W * 0.45, cy + s.y * H * 0.45, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle * 0.4})`;
        ctx.fill();
      }

      // --- Outer glow aura ---
      const auraGrad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2);
      auraGrad.addColorStop(0, 'rgba(6,182,212,0.12)');
      auraGrad.addColorStop(0.3, 'rgba(56,189,248,0.07)');
      auraGrad.addColorStop(0.6, 'rgba(96,165,250,0.03)');
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2, 0, Math.PI * 2);
      ctx.fillStyle = auraGrad;
      ctx.fill();

      // --- Rings around globe ---
      for (let ri = 0; ri < 3; ri++) {
        const ringR = R * (1.5 + ri * 0.3);
        const tilt = ri * 0.4 + t * (0.02 + ri * 0.01);
        ctx.beginPath();
        for (let a = 0; a <= 64; a++) {
          const angle = (a / 64) * Math.PI * 2;
          const ex = cx + ringR * Math.cos(angle);
          const ey = cy + ringR * Math.sin(angle) * 0.3;
          const rotX = cx + (ex - cx) * Math.cos(tilt) - (ey - cy) * Math.sin(tilt);
          const rotY = cy + (ex - cx) * Math.sin(tilt) + (ey - cy) * Math.cos(tilt);
          const alpha = 0.08 - ri * 0.02 + 0.04 * Math.sin(angle + t);
          if (a === 0) ctx.moveTo(rotX, rotY);
          else ctx.lineTo(rotX, rotY);
        }
        ctx.strokeStyle = `rgba(6,182,212,${0.1 - ri * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // --- Ring particles ---
      for (const rp of ringParticles) {
        rp.angle += rp.speed;
        const ringR = R * (1.6 + 0.3 * Math.sin(rp.angle * 0.5));
        const ex = cx + ringR * Math.cos(rp.angle);
        const ey = cy + ringR * Math.sin(rp.angle) * 0.3;
        const tiltAmount = rp.tilt + t * 0.1;
        const rotX = cx + (ex - cx) * Math.cos(tiltAmount) - (ey - cy) * Math.sin(tiltAmount);
        const rotY = cy + (ex - cx) * Math.sin(tiltAmount) + (ey - cy) * Math.cos(tiltAmount);
        ctx.beginPath();
        ctx.arc(rotX, rotY, rp.size, 0, Math.PI * 2);
        ctx.fillStyle = rp.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- Globe outline ---
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6,182,212,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- Grid: Parallels ---
      for (let p = 1; p < 10; p++) {
        const lat = (p / 10) * Math.PI - Math.PI / 2;
        const r2d = R * Math.cos(lat);
        const y2d = cy - R * Math.sin(lat) * 0.85;
        ctx.beginPath();
        ctx.ellipse(cx, y2d, r2d, r2d * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // --- Grid: Meridians (front half) ---
      for (let m = 0; m < 12; m++) {
        const lng0 = (m / 12) * Math.PI * 2 + rot;
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
          ctx.strokeStyle = 'rgba(6,182,212,0.12)';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // --- Surface dots ---
      for (const d of dots) {
        d.lng += d.speed;
        const { px, py, z } = project3D(d.lat, d.lng, rot, R, cx, cy);
        if (z < -0.1) continue;
        const size = d.size * (0.4 + 0.6 * z);
        const alpha = 0.3 + 0.7 * z;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- Orbiting satellites with trails ---
      for (let si = 0; si < 3; si++) {
        const satAngle = t * (0.3 + si * 0.15) + si * 2.1;
        const satR = R * (1.3 + si * 0.15);
        const satTilt = 0.3 + si * 0.3;
        const orbitSize = 4 + si * 1.5;
        const colors = ['#22d3ee', '#60a5fa', '#fbbf24'];

        // Trail
        for (let j = 0; j < 12; j++) {
          const ta = satAngle - j * 0.08;
          const tx = cx + Math.cos(ta) * satR * Math.cos(satTilt);
          const ty = cy + Math.sin(ta) * satR * 0.35;
          const alpha = (1 - j / 12) * 0.6;
          const radius = (1 - j / 12) * orbitSize * 0.5;
          ctx.beginPath();
          ctx.arc(tx, ty, radius, 0, Math.PI * 2);
          ctx.fillStyle = colors[si];
          ctx.globalAlpha = alpha * 0.4;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Main satellite
        const sx = cx + Math.cos(satAngle) * satR * Math.cos(satTilt);
        const sy = cy + Math.sin(satAngle) * satR * 0.35;
        const satGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, orbitSize * 2);
        satGrad.addColorStop(0, colors[si]);
        satGrad.addColorStop(1, colors[si] + '00');
        ctx.beginPath();
        ctx.arc(sx, sy, orbitSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = satGrad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, orbitSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- Connection lines (between random dots) ---
      for (let ci = 0; ci < 8; ci++) {
        const i1 = Math.floor(Math.random() * DOTS);
        const i2 = Math.floor(Math.random() * DOTS);
        if (i1 === i2) continue;
        const p1 = project3D(dots[i1].lat, dots[i1].lng, rot, R, cx, cy);
        const p2 = project3D(dots[i2].lat, dots[i2].lng, rot, R, cx, cy);
        if (p1.z < 0 || p2.z < 0) continue;
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = `rgba(6,182,212,${0.04 + 0.06 * p1.z * p2.z})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    window.addEventListener('resize', resize, { passive: true });

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} aria-hidden="true" />
  );
}
