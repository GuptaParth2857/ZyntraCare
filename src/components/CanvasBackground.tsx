'use client';

// CanvasBackground — optimized neural field
// KEY PERF FIXES vs original:
//  1. Stars: 300 → 120 desktop / 60 mobile  (O(n²) was ~44,850 ops/frame → now ~7,140)
//  2. Page Visibility API: pauses RAF when tab is hidden (saves 100% CPU when backgrounded)
//  3. 30fps cap for background canvas (target: 33ms/frame vs 16ms — halves CPU)
//  4. Connection distance: 90 → 75 (fewer pairs qualify)
//  5. Passive resize listener

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname() || '';

  // Stop the whole RAF loop for users who prefer reduced motion
  // (accessibility + saves main-thread/GPU on every page).
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => { reducedMotionRef.current = mq.matches; };
    reducedMotionRef.current = mq.matches;
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else (mq as any).addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else (mq as any).removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Theming based on Route
    let themeColors = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#f472b6']; // Default Mix
    let orbsColors = ['#38bdf8', '#a78bfa', '#34d399'];
    let ringsColors = ['#3b82f6', '#8b5cf6', '#10b981'];
    let connColor = '129,140,248'; // Indigo
    let bgColor = 'rgba(2, 6, 23, 0.15)'; // Slate 950

    if (pathname.includes('/pharmacies') || pathname.includes('/pharmacy') || pathname.includes('/medications')) {
      themeColors = ['#34d399', '#10b981', '#059669', '#6ee7b7', '#047857'];
      orbsColors = ['#34d399', '#10b981', '#059669'];
      ringsColors = ['#10b981', '#059669', '#047857'];
      connColor = '52,211,153'; // Emerald
      bgColor = 'rgba(2, 12, 10, 0.15)'; // dark greenish
    } else if (pathname.includes('/hospitals') || pathname.includes('/doctors') || pathname.includes('/specialists')) {
      themeColors = ['#38bdf8', '#0ea5e9', '#0284c7', '#22d3ee', '#06b6d4'];
      orbsColors = ['#38bdf8', '#0ea5e9', '#22d3ee'];
      ringsColors = ['#0ea5e9', '#0284c7', '#06b6d4'];
      connColor = '56,189,248'; // Sky
      bgColor = 'rgba(2, 10, 20, 0.15)'; // dark bluish
    } else if (pathname.includes('/corporate-wellness')) {
      themeColors = ['#6366f1', '#818cf8', '#a5b4fc', '#4338ca', '#4f46e5'];
      orbsColors = ['#6366f1', '#818cf8', '#a5b4fc'];
      ringsColors = ['#4f46e5', '#4338ca', '#3730a3'];
      connColor = '99,102,241'; // Indigo
      bgColor = 'rgba(8, 6, 28, 0.18)';
    } else if (pathname.includes('/camp') || pathname.includes('/wellness')) {
      themeColors = ['#fbbf24', '#f59e0b', '#d97706', '#fb923c', '#f97316'];
      orbsColors = ['#fbbf24', '#f59e0b', '#fb923c'];
      ringsColors = ['#f59e0b', '#d97706', '#f97316'];
      connColor = '251,191,36'; // Amber
      bgColor = 'rgba(15, 10, 2, 0.15)'; // dark amberish
    } else if (pathname.includes('/labs') || pathname.includes('/lab') || pathname.includes('/diagnostics')) {
      themeColors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#c4b5fd', '#6d28d9'];
      orbsColors = ['#a78bfa', '#8b5cf6', '#c4b5fd'];
      ringsColors = ['#8b5cf6', '#7c3aed', '#6d28d9'];
      connColor = '167,139,250'; // Violet
      bgColor = 'rgba(12, 6, 22, 0.15)'; // dark violetish
    } else if (pathname.includes('/telehealth') || pathname.includes('/telemedicine')) {
      themeColors = ['#2dd4bf', '#14b8a6', '#0d9488', '#5eead4', '#0f766e'];
      orbsColors = ['#2dd4bf', '#14b8a6', '#5eead4'];
      ringsColors = ['#14b8a6', '#0d9488', '#0f766e'];
      connColor = '45,212,191'; // Teal
      bgColor = 'rgba(2, 12, 12, 0.15)'; // dark tealish
    } else if (pathname.includes('/health-tracker') || pathname.includes('/health')) {
      themeColors = ['#34d399', '#10b981', '#059669', '#6ee7b7', '#047857'];
      orbsColors = ['#34d399', '#10b981', '#6ee7b7'];
      ringsColors = ['#10b981', '#059669', '#047857'];
      connColor = '52,211,153'; // Emerald
      bgColor = 'rgba(2, 12, 10, 0.15)'; // dark greenish
    } else if (pathname.includes('/blood') || pathname.includes('/emergency')) {
      themeColors = ['#fb7185', '#f43f5e', '#e11d48', '#f87171', '#ef4444'];
      orbsColors = ['#fb7185', '#f43f5e', '#f87171'];
      ringsColors = ['#f43f5e', '#e11d48', '#ef4444'];
      connColor = '244,63,94'; // Rose
      bgColor = 'rgba(20, 4, 6, 0.15)'; // dark redish
    } else if (pathname.includes('/ai-health-coach') || pathname.includes('/clinical-ai')) {
      themeColors = ['#818cf8', '#6366f1', '#4f46e5', '#a5b4fc', '#4338ca'];
      orbsColors = ['#818cf8', '#6366f1', '#a5b4fc'];
      ringsColors = ['#6366f1', '#4f46e5', '#4338ca'];
      connColor = '129,140,248'; // Indigo
      bgColor = 'rgba(8, 6, 22, 0.15)'; // dark indigoish
    } else if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
      themeColors = ['#38bdf8', '#818cf8', '#6366f1', '#22d3ee', '#a78bfa'];
      orbsColors = ['#38bdf8', '#818cf8', '#a78bfa'];
      ringsColors = ['#6366f1', '#22d3ee', '#818cf8'];
      connColor = '129,140,248'; // Indigo/Sky
      bgColor = 'rgba(6, 8, 22, 0.15)'; // dark blueish
    } else if (pathname.includes('/first-aid') || pathname.includes('/symptoms')) {
      themeColors = ['#fb923c', '#f97316', '#ea580c', '#fdba74', '#dc2626'];
      orbsColors = ['#fb923c', '#f97316', '#fdba74'];
      ringsColors = ['#f97316', '#ea580c', '#dc2626'];
      connColor = '249,115,22'; // Orange
      bgColor = 'rgba(18, 8, 4, 0.15)'; // dark orangeish
    } else if (pathname.includes('/womens-health') || pathname.includes('/family-care') || pathname.includes('/communities')) {
      themeColors = ['#f472b6', '#ec4899', '#db2777', '#f9a8d4', '#be185d'];
      orbsColors = ['#f472b6', '#ec4899', '#f9a8d4'];
      ringsColors = ['#ec4899', '#db2777', '#be185d'];
      connColor = '244,114,182'; // Pink
      bgColor = 'rgba(20, 4, 12, 0.15)'; // dark pinkish
    } else if (pathname.includes('/pets') || pathname.includes('/rewards')) {
      themeColors = ['#fb923c', '#f59e0b', '#d97706', '#fbbf24', '#f97316'];
      orbsColors = ['#fb923c', '#f59e0b', '#fbbf24'];
      ringsColors = ['#f59e0b', '#d97706', '#f97316'];
      connColor = '251,146,60'; // Orange/Gold
      bgColor = 'rgba(16, 10, 2, 0.15)'; // dark warm
    } else if (pathname.includes('/booking') || pathname.includes('/install')) {
      themeColors = ['#2dd4bf', '#14b8a6', '#0d9488', '#5eead4', '#0f766e'];
      orbsColors = ['#2dd4bf', '#14b8a6', '#5eead4'];
      ringsColors = ['#14b8a6', '#0d9488', '#0f766e'];
      connColor = '45,212,191'; // Teal
      bgColor = 'rgba(2, 12, 12, 0.15)'; // dark tealish
    } else if (pathname.includes('/chat') || pathname.includes('/blogs') || pathname.includes('/contact')) {
      themeColors = ['#94a3b8', '#64748b', '#475569', '#cbd5e1', '#334155'];
      orbsColors = ['#94a3b8', '#64748b', '#cbd5e1'];
      ringsColors = ['#64748b', '#475569', '#334155'];
      connColor = '148,163,184'; // Slate
      bgColor = 'rgba(10, 10, 12, 0.15)'; // dark slateish
    }

    // ── Responsive particle count - optimized
    const isMobile = window.innerWidth < 768;
    const STAR_COUNT        = isMobile ? 60  : 150; 
    const CONNECT_DISTANCE  = isMobile ? 0   : 80;  
    const FPS_CAP           = 30;                    
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
      color:   themeColors[Math.floor(Math.random() * themeColors.length)],
      opacity: Math.random() * 0.5 + 0.15,
      pulse:   Math.random() * Math.PI * 2,
    }));

    // Flying energy orbs
    const orbs: Orb[] = isMobile ? [] : [
      { angle: 0,   radius: 0.32, speed:  0.006, color: orbsColors[0], trailPoints: [] },
      { angle: 2.1, radius: 0.28, speed: -0.008, color: orbsColors[1], trailPoints: [] },
      { angle: 4.2, radius: 0.36, speed:  0.005, color: orbsColors[2], trailPoints: [] },
    ];

    // Spinning rings
    const rings: Ring[] = isMobile ? [] : [
      { angleX: 0,   angleY: 0,   sizeR: 0.22, speedX:  0.004, speedY:  0.003, color: ringsColors[0] },
      { angleX: 1.2, angleY: 0.8, sizeR: 0.28, speedX: -0.003, speedY:  0.005, color: ringsColors[1] },
      { angleX: 0.5, angleY: 1.5, sizeR: 0.18, speedX:  0.006, speedY: -0.004, color: ringsColors[2] },
    ];

    const startTime = performance.now();

    const draw = (now: number) => {
      if (pausedRef.current || reducedMotionRef.current) {
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

      ctx.fillStyle = bgColor;
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
              ctx.strokeStyle = `rgba(${connColor},${a})`;
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
        if (orb.trailPoints.length > 18) orb.trailPoints.shift(); // Nice trail length

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
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.75, display: 'block' }}
    />
  );
}
