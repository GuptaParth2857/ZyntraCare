'use client';

import { useRef, useEffect } from 'react';

/**
 * Rotating 3D Globe with glowing meridians — pure Canvas 2D
 * Used as the CTA section's ambient animation
 */
export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.38;
    let t = 0;

    const MERIDIANS = 12;    // Longitude lines
    const PARALLELS = 8;     // Latitude lines
    const DOTS = 120;        // Dots on surface

    // Pre-generate surface dots (lat/lng in radians)
    const dots = Array.from({ length: DOTS }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2.5,
      color: ['#38bdf8', '#2dd4bf', '#818cf8', '#34d399'][Math.floor(Math.random() * 4)],
      speed: (Math.random() - 0.5) * 0.003,
    }));

    // Orbiting satellites
    const satellites = Array.from({ length: 3 }, (_, i) => ({
      orbitAngle: (i / 3) * Math.PI * 2,
      orbitTilt: (i * 0.4 + 0.2) * Math.PI,
      orbitR: R * (1.18 + i * 0.07),
      trailPositions: [] as { x: number; y: number }[],
      color: ['#38bdf8', '#a78bfa', '#34d399'][i],
      speed: 0.012 + i * 0.006,
    }));

    const project3D = (lat: number, lng: number, rot: number) => {
      const rLng = lng + rot;
      const x3 = Math.cos(lat) * Math.sin(rLng);
      const y3 = Math.sin(lat);
      const z3 = Math.cos(lat) * Math.cos(rLng);
      const px = cx + R * x3;
      const py = cy - R * y3 * 0.85; // slight Y squash for perspective
      return { px, py, z: z3 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.007;
      const rot = t * 0.25;

      // ── Globe core glow
      const aura = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.6);
      aura.addColorStop(0, 'rgba(14,165,233,0.22)');
      aura.addColorStop(0.5, 'rgba(20,184,166,0.10)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // ── equator & circle outline
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56,189,248,0.30)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Latitude (parallels) — ellipses at different vertical levels
      for (let p = 1; p < PARALLELS; p++) {
        const lat = (p / PARALLELS) * Math.PI - Math.PI / 2;
        const r2d = R * Math.cos(lat);
        const y2d = cy - R * Math.sin(lat) * 0.85;
        const alpha = 0.10 + Math.abs(Math.sin(lat)) * 0.07;
        ctx.beginPath();
        ctx.ellipse(cx, y2d, r2d, r2d * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Longitude (meridians) — great circles
      for (let m = 0; m < MERIDIANS; m++) {
        const lng0 = (m / MERIDIANS) * Math.PI * 2 + rot;
        const points: { x: number; y: number; z: number }[] = [];
        for (let step = 0; step <= 60; step++) {
          const lat2 = (step / 60) * Math.PI - Math.PI / 2;
          const x3 = Math.cos(lat2) * Math.sin(lng0);
          const y3 = Math.sin(lat2);
          const z3 = Math.cos(lat2) * Math.cos(lng0);
          points.push({ x: cx + R * x3, y: cy - R * y3 * 0.85, z: z3 });
        }

        // Draw visible arc (z >= 0 = front)
        ctx.beginPath();
        let drawing = false;
        for (const p of points) {
          const alpha = p.z >= 0 ? 0.09 : 0.025;
          if (p.z >= 0) {
            if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            if (drawing) { ctx.stroke(); drawing = false; ctx.beginPath(); }
          }
        }
        if (drawing) {
          ctx.strokeStyle = 'rgba(56,189,248,0.18)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // ── Surface dots
      const sortedDots = [...dots].sort((a, b) => {
        const za = Math.cos(a.lat) * Math.cos(a.lng + rot);
        const zb = Math.cos(b.lat) * Math.cos(b.lng + rot);
        return za - zb;
      });

      for (const d of sortedDots) {
        d.lng += d.speed;
        const { px, py, z } = project3D(d.lat, d.lng, rot);
        if (z < -0.1) continue; // skip back side

        const size = d.size * (0.4 + 0.6 * z);
        const alpha = 0.3 + 0.7 * z;

        const grd = ctx.createRadialGradient(px, py, 0, px, py, size * 4);
        grd.addColorStop(0, d.color + 'ff');
        grd.addColorStop(0.5, d.color + '88');
        grd.addColorStop(1, d.color + '00');
        ctx.beginPath();
        ctx.arc(px, py, size * 4, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = size * 6;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // ── Orbiting satellites with trails
      for (const sat of satellites) {
        sat.orbitAngle += sat.speed;

        // 3D orbit point
        const ox = cx + sat.orbitR * Math.cos(sat.orbitAngle) * Math.cos(sat.orbitTilt / 2);
        const oy = cy + sat.orbitR * Math.sin(sat.orbitAngle) * 0.4;

        sat.trailPositions.push({ x: ox, y: oy });
        if (sat.trailPositions.length > 30) sat.trailPositions.shift();

        // Draw trail
        for (let i = 1; i < sat.trailPositions.length; i++) {
          const pA = sat.trailPositions[i - 1];
          const pB = sat.trailPositions[i];
          const a = (i / sat.trailPositions.length) * 0.5;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.strokeStyle = sat.color + Math.round(a * 200).toString(16).padStart(2, '0');
          ctx.lineWidth = 2.5 * (i / sat.trailPositions.length);
          ctx.stroke();
        }

        // Satellite dot
        const sg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10);
        sg.addColorStop(0, '#ffffff');
        sg.addColorStop(0.4, sat.color);
        sg.addColorStop(1, sat.color + '00');
        ctx.beginPath();
        ctx.arc(ox, oy, 10, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.shadowColor = sat.color;
        ctx.shadowBlur = 22;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
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
