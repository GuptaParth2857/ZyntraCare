'use client';

import { useRef, useEffect } from 'react';

/**
 * A stunning, rotating 3D Medical Cross built purely with Canvas Web APIs (No WebGL issues).
 * Adds a high-end interactive 3D hero asset to the homepage!
 */
export default function MedicalCore3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, tX: 0, tY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0, h = 0;
    const setSize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    setSize();
    window.addEventListener('resize', setSize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      mouseRef.current.tX = x * 0.005;
      mouseRef.current.tY = y * 0.005;
    };
    window.addEventListener('mousemove', onMouseMove);

    let t = 0;

    // Define 3D vertices for a blocky 3D Medical Cross
    const sz = 40; // thick center
    const arm = 90; // length of arms
    const vertices: { x: number, y: number, z: number }[] = [];
    
    // Create base points for a 3D Cross using basic geometries
    const addBox = (wX: number, hY: number, dZ: number) => {
      const p = [
        [-wX, -hY, -dZ], [wX, -hY, -dZ], [wX, hY, -dZ], [-wX, hY, -dZ],
        [-wX, -hY,  dZ], [wX, -hY,  dZ], [wX, hY,  dZ], [-wX, hY,  dZ]
      ];
      // Edges defined by indices
      const e = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7]
      ];
      return { p, e };
    };

    // We build 3 intersecting boxes to make a solid cross
    const b1 = addBox(arm, sz, sz); // Horizontal
    const b2 = addBox(sz, arm, sz); // Vertical
    const b3 = addBox(sz, sz, arm); // Depth-wise

    const allBoxes = [b1, b2, b3];

    // Orbiting particles
    const particles = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      orbitR: 150 + Math.random() * 80,
      orbitTilt: (Math.random() - 0.5) * 2,
      speed: 0.01 + Math.random() * 0.02,
      yOff: (Math.random() - 0.5) * 100
    }));

    const draw = () => {
      t += 0.015;
      mouseRef.current.x += (mouseRef.current.tX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.tY - mouseRef.current.y) * 0.05;

      // Transparent Background for blending
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';
      const cx = w / 2;
      const cy = h / 2;

      // Subtle Background Core Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      bgGlow.addColorStop(0.5, 'rgba(45, 212, 191, 0.02)');
      bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // Rotation matrix values
      const rotY = t * 0.7 + mouseRef.current.x;
      const rotX = Math.sin(t * 0.4) * 0.3 + mouseRef.current.y;
      
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const fov = 400;

      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const ryX = x * cosY - z * sinY;
        const ryZ = z * cosY + x * sinY;
        // Rotate X
        const rxY = y * cosX - ryZ * sinX;
        const rxZ = ryZ * cosX + y * sinX;
        
        const scale = fov / (fov + rxZ);
        return {
          sx: cx + ryX * scale,
          sy: cy + rxY * scale,
          s: scale,
          z: rxZ
        };
      };

      // Draw Cross structure
      allBoxes.forEach((box) => {
        const projP = box.p.map(p => project(p[0], p[1], p[2]));
        
        box.e.forEach(edge => {
          const p1 = projP[edge[0]];
          const p2 = projP[edge[1]];
          
          if (p1.z < -fov + 10 || p2.z < -fov + 10) return; // behind camera
          
          const alpha = Math.max(0.05, 0.8 - (p1.z + p2.z) * 0.002);
          
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1.5 * ((p1.s + p2.s) / 2);
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38bdf8';
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Points
        projP.forEach(p => {
          if (p.z < -fov + 10) return;
          const alpha = Math.max(0.1, 1 - p.z * 0.003);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 2.5 * p.s, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
          ctx.fill();
        });
      });

      // Draw Orbiting particles
      particles.forEach(p => {
        p.angle += p.speed;
        // 3d pos
        const px = Math.cos(p.angle) * p.orbitR;
        const py = p.yOff;
        const pz = Math.sin(p.angle) * p.orbitR * p.orbitTilt;
        
        const proj = project(px, py, pz);
        if (proj.z < -fov + 10) return;

        const pAlpha = Math.max(0.1, 1 - proj.z * 0.003);
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, 1.5 * proj.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${pAlpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('mousemove', onMouseMove);
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
