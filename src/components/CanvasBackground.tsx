'use client';

// CanvasBackground — optimized neural field
// KEY PERF FIXES vs original:
//  1. Stars: 300 → 120 desktop / 60 mobile  (O(n²) was ~44,850 ops/frame → now ~7,140)
//  2. Page Visibility API: pauses RAF when tab is hidden (saves 100% CPU when backgrounded)
//  3. 30fps cap for background canvas (target: 33ms/frame vs 16ms — halves CPU)
//  4. Connection distance: 90 → 75 (fewer pairs qualify)
//  5. Passive resize listener

import { useRef, useEffect } from 'react';

interface Star {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; opacity: number; pulse: number;
}

interface Orb {
  angle: number; radius: number; speed: number;
  color: string; trailPoints: { x: number; y: number }[];
}

interface Ring {
  angleX: number; angleY: number; sizeR: number;
  speedX: number; speedY: number; color: string;
}

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Responsive particle count (mobile = 40, desktop = 100)
    const isMobile = window.innerWidth < 768;
    const STAR_COUNT        = isMobile ? 40  : 100;
    const CONNECT_DISTANCE  = isMobile ? 0   : 60;  // Skip connections on mobile
    const FPS_CAP           = 25;                    // Reduced for battery saving
    const FRAME_MS          = 1000 / FPS_CAP;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Neural field stars
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      vx:      (Math.random() - 0.5) * 0.25,
      vy:      (Math.random() - 0.5) * 0.25,
      size:    Math.random() * 2.2 + 0.3,
      color:   ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#f472b6'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.5 + 0.15,
      pulse:   Math.random() * Math.PI * 2,
    }));

    // Flying energy orbs with trails (desktop only - skip on mobile)
    const orbs: Orb[] = isMobile ? [] : [
      { angle: 0,   radius: 0.32, speed:  0.006, color: '#38bdf8', trailPoints: [] },
      { angle: 2.1, radius: 0.28, speed: -0.008, color: '#a78bfa', trailPoints: [] },
    ];

    // Spinning rings (desktop only — skip on mobile)
    const rings: Ring[] = isMobile ? [] : [
      { angleX: 0,   angleY: 0,   sizeR: 0.22, speedX:  0.004, speedY:  0.003, color: '#3b82f6' },
      { angleX: 1.2, angleY: 0.8, sizeR: 0.28, speedX: -0.003, speedY:  0.005, color: '#8b5cf6' },
      { angleX: 0.5, angleY: 1.5, sizeR: 0.18, speedX:  0.006, speedY: -0.004, color: '#10b981' },
    ];

    const startTime = performance.now();

    const draw = (now: number) => {
      if (pausedRef.current) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // 30fps throttle — skip frame if too soon
      if (now - lastTimeRef.current < FRAME_MS) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTimeRef.current = now;

      const W = canvas.width;
      const H = canvas.height;
      const t = (now - startTime) / 1000;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, W, H);

      // ── Stars / Neural particles
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
        const pulse = (Math.sin(t * 1.5 + s.pulse) + 1) / 2;
        const a = s.opacity * (0.5 + 0.5 * pulse);
        const r = s.size * (0.8 + 0.4 * pulse);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // ── Neural connections (desktop only — O(n²), skipped on mobile)
      if (CONNECT_DISTANCE > 0) {
        const distSq = CONNECT_DISTANCE * CONNECT_DISTANCE;
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < distSq) {
              const a = (1 - Math.sqrt(d2) / CONNECT_DISTANCE) * 0.12;
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.strokeStyle = `rgba(129,140,248,${a})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // ── Glowing rings (desktop only)
      if (rings.length) {
        const cx = W / 2, cy = H / 2;
        for (const ring of rings) {
          ring.angleX += ring.speedX;
          ring.angleY += ring.speedY;
          const rW = W * ring.sizeR;
          const rH = rW * Math.abs(Math.cos(ring.angleX)) * 0.4 + 5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rW, rH, ring.angleY, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color + '33';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ring.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // ── Flying energy orbs with trails
      const cx = W / 2, cy = H / 2;
      for (const orb of orbs) {
        orb.angle += orb.speed;
        const ox = cx + Math.cos(orb.angle) * W * orb.radius;
        const oy = cy + Math.sin(orb.angle * 1.3) * H * 0.18;

        orb.trailPoints.push({ x: ox, y: oy });
        if (orb.trailPoints.length > 12) orb.trailPoints.shift(); // Shorter trail

        for (let i = 1; i < orb.trailPoints.length; i++) {
          const a = (i / orb.trailPoints.length) * 0.7;
          const r = (i / orb.trailPoints.length) * 5;
          ctx.beginPath();
          ctx.arc(orb.trailPoints[i].x, orb.trailPoints[i].y, r, 0, Math.PI * 2);
          ctx.fillStyle = orb.color + Math.round(a * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 18);
        grd.addColorStop(0, orb.color + 'cc');
        grd.addColorStop(1, orb.color + '00');
        ctx.beginPath();
        ctx.arc(ox, oy, 18, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ox, oy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // ── Page Visibility API: pause when tab is hidden (saves 100% CPU)
    const onVisibilityChange = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.75, display: 'block' }}
    />
  );
}
