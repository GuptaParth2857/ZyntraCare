'use client';

import { useRef, useEffect } from 'react';

// Pure CSS/Canvas shapes — no @react-three/drei dependency
export default function Medical3DShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    const shapes = [
      { type: 'capsule', x: 0.12, y: 0.3, color: '#0ea5e9', phase: 0 },
      { type: 'icosahedron', x: 0.85, y: 0.65, color: '#8b5cf6', phase: 1.5 },
      { type: 'torus', x: 0.5, y: 0.85, color: '#dc2626', phase: 3 },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const t = (performance.now() - startTime) / 1000;

      ctx.clearRect(0, 0, W, H);

      for (const shape of shapes) {
        const x = W * shape.x;
        const float = Math.sin(t * 0.8 + shape.phase) * 15;
        const y = H * shape.y + float;
        const rot = t * 0.15 + shape.phase;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        if (shape.type === 'capsule') {
          // Draw pill/capsule shape using arc (no roundRect needed)
          const w = 35, h = 80;
          const r = w / 2;
          ctx.beginPath();
          ctx.arc(0, -h / 2 + r, r, Math.PI, 0);
          ctx.lineTo(w / 2, h / 2 - r);
          ctx.arc(0, h / 2 - r, r, 0, Math.PI);
          ctx.lineTo(-w / 2, -h / 2 + r);
          ctx.closePath();
          const grd = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
          grd.addColorStop(0, shape.color + 'cc');
          grd.addColorStop(1, shape.color + '44');
          ctx.fillStyle = grd;
          ctx.shadowBlur = 30;
          ctx.shadowColor = shape.color;
          ctx.fill();
        } else if (shape.type === 'icosahedron') {
          // Draw hexagon (approximating icosahedron)
          const size = 60;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const px = Math.cos(a) * size;
            const py = Math.sin(a) * size;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
          grd.addColorStop(0, shape.color + 'aa');
          grd.addColorStop(1, shape.color + '11');
          ctx.fillStyle = grd;
          ctx.strokeStyle = shape.color + '88';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 25;
          ctx.shadowColor = shape.color;
          ctx.fill();
          ctx.stroke();
          // Inner lines
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
            ctx.strokeStyle = shape.color + '44';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        } else if (shape.type === 'torus') {
          // Draw ring
          const outerR = 80, innerR = 55;
          ctx.beginPath();
          ctx.arc(0, 0, outerR, 0, Math.PI * 2);
          ctx.arc(0, 0, innerR, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
          grd.addColorStop(0, shape.color + 'cc');
          grd.addColorStop(1, shape.color + '33');
          ctx.fillStyle = grd;
          ctx.shadowBlur = 30;
          ctx.shadowColor = shape.color;
          ctx.fill('evenodd');
        }

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.35 }}
      aria-hidden="true"
    />
  );
}
