'use client';

import { useRef, useEffect } from 'react';

export default function MedicalCore3D() {
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

    const setSize = () => {
      w = canvas.offsetWidth || 300; h = canvas.offsetHeight || 300;
      canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    setSize();
    window.addEventListener('resize', setSize, { passive: true });

    let t = 0;
    const sz = 40, arm = 90;

    const addBox = (wX: number, hY: number, dZ: number) => {
      const p = [
        [-wX, -hY, -dZ], [wX, -hY, -dZ], [wX, hY, -dZ], [-wX, hY, -dZ],
        [-wX, -hY,  dZ], [wX, -hY,  dZ], [wX, hY,  dZ], [-wX, hY,  dZ],
      ];
      const e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      return { p, e };
    };

    const allBoxes = [addBox(arm, sz, sz), addBox(sz, arm, sz), addBox(sz, sz, arm)];

    // Reduced: 60→20 particles
    const particles = Array.from({ length: 20 }, () => ({
      angle: Math.random() * Math.PI * 2,
      orbitR: 130 + Math.random() * 60,
      orbitTilt: (Math.random() - 0.5) * 2,
      speed: 0.015 + Math.random() * 0.02,
      yOff: (Math.random() - 0.5) * 80,
    }));

    const draw = (now: number) => {
      if (!isVisible) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      t += 0.018;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const rotY = t * 0.7, rotX = Math.sin(t * 0.4) * 0.3;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const fov = 400;

      const project = (x: number, y: number, z: number) => {
        const ryX = x * cosY - z * sinY, ryZ = z * cosY + x * sinY;
        const rxY = y * cosX - ryZ * sinX, rxZ = ryZ * cosX + y * sinX;
        const scale = fov / (fov + rxZ);
        return { sx: cx + ryX * scale, sy: cy + rxY * scale, s: scale, z: rxZ };
      };

      // Cross structure — no shadowBlur
      for (const box of allBoxes) {
        const projP = box.p.map(p => project(p[0], p[1], p[2]));
        for (const edge of box.e) {
          const p1 = projP[edge[0]], p2 = projP[edge[1]];
          if (p1.z < -fov + 10 || p2.z < -fov + 10) continue;
          const alpha = Math.max(0.05, 0.7 - (p1.z + p2.z) * 0.002);
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = `rgba(56,189,248,${alpha.toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Orbiting particles
      for (const p of particles) {
        p.angle += p.speed;
        const px = Math.cos(p.angle) * p.orbitR;
        const py = p.yOff;
        const pz = Math.sin(p.angle) * p.orbitR * p.orbitTilt;
        const proj = project(px, py, pz);
        if (proj.z < -fov + 10) continue;
        const pAlpha = Math.max(0.1, 0.8 - proj.z * 0.003);
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, 1.2 * proj.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${pAlpha.toFixed(2)})`;
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
    }, { threshold: 0.1 });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
      aria-hidden="true"
    />
  );
}
