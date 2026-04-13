'use client';

import { useRef, useEffect } from 'react';

export default function HolographicHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - w / 2) * 0.002,
        y: (e.clientY - rect.top - h / 2) * 0.002
      };
    };
    window.addEventListener('mousemove', onMove);

    let t = 0;

    // Heart Parametric Equation points
    const points: {x: number, y: number, z: number, r: number, offset: number}[] = [];
    for (let i = 0; i < 400; i++) {
       const u = Math.random() * Math.PI * 2;
       const v = Math.random() * Math.PI;
       
       // Standard heart shape formulas
       const hx = 16 * Math.pow(Math.sin(u), 3);
       const hy = 13 * Math.cos(u) - 5 * Math.cos(2*u) - 2 * Math.cos(3*u) - Math.cos(4*u);
       
       // Add some z depth based on v
       const hz = Math.sin(v) * 8 * Math.cos(u/2);
       
       points.push({
         x: hx * 8, // scale
         y: -hy * 8, // flip y
         z: hz * 8,
         r: 1 + Math.random() * 2,
         offset: Math.random() * Math.PI * 2
       });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.015;

      const cx = w / 2;
      const cy = h / 2;

      ctx.globalCompositeOperation = 'screen';

      // Draw background glow
      const beat = 1 + Math.sin(t * 8) * 0.1; // heartbeat pulse
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250 * beat);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.15)'); // Red
      glow.addColorStop(0.5, 'rgba(244, 63, 94, 0.05)'); // Rose
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Rotations
      const rotY = t * 0.5 + mouseRef.current.x;
      const rotX = Math.sin(t * 0.3) * 0.2 + mouseRef.current.y;
      
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const fov = 500;

      // Z-sorting
      const projected = points.map(p => {
        // Pulse offset
        const scalePulse = 1 + Math.sin(t * 8 + p.offset) * 0.08;
        const px = p.x * scalePulse * beat;
        const py = p.y * scalePulse * beat;
        const pz = p.z * scalePulse * beat;

        // Apply rotation
        const ryX = px * cosY - pz * sinY;
        const ryZ = pz * cosY + px * sinY;
        const rxY = py * cosX - ryZ * sinX;
        const rxZ = ryZ * cosX + py * sinX;

        const s = fov / (fov + rxZ);
        return {
          sx: cx + ryX * s,
          sy: cy + rxY * s,
          s,
          z: rxZ,
          r: p.r
        };
      }).sort((a, b) => b.z - a.z);

      // Connecting lines for a wireframe look
      ctx.beginPath();
      for (let i = 0; i < projected.length; i++) {
        if (projected[i].z < -fov + 10) continue;
        
        ctx.moveTo(projected[i].sx, projected[i].sy);
        // Connect to a nearby point
        if (i < projected.length - 1 && Math.abs(projected[i].z - projected[i+1].z) < 20) {
           ctx.lineTo(projected[i+1].sx, projected[i+1].sy);
        }
      }
      ctx.strokeStyle = `rgba(244, 63, 94, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw points
      projected.forEach((p, i) => {
        if (p.z < -fov + 10) return;
        const alpha = Math.max(0.1, 0.9 - p.z * 0.002);
        const radius = p.r * p.s;
        
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 113, 133, ${alpha})`; // Pinkish Red
        
        // Add strong glow to some points
        if (i % 5 === 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f43f5e';
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className="w-full h-full relative group cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
