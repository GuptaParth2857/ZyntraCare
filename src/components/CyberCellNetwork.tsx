'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Cell {
  id: number;
  x: number;
  y: number;
  z: number;
  type: 'tcell' | 'bcell' | 'virus' | 'antibody' | 'protein';
  size: number;
  color: string;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  active: boolean;
}

const cellTypes = {
  tcell: { color: '#3b82f6', size: 18, label: 'T-Cell' },
  bcell: { color: '#8b5cf6', size: 16, label: 'B-Cell' },
  virus: { color: '#ef4444', size: 14, label: 'Virus' },
  antibody: { color: '#22c55e', size: 12, label: 'Antibody' },
  protein: { color: '#f59e0b', size: 10, label: 'Protein' },
};

export default function CyberCellNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const animationRef = useRef<number>(0);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 500;

    const newCells: Cell[] = [];
    const types = Object.keys(cellTypes) as (keyof typeof cellTypes)[];
    
    for (let i = 0; i < 40; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const cellType = cellTypes[type];
      newCells.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 200 - 100,
        type,
        size: cellType.size + Math.random() * 4,
        color: cellType.color,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 0.5,
        life: 100,
        active: true
      });
    }

    newCells[0].type = 'tcell';
    newCells[0].color = '#3b82f6';
    newCells[0].size = 20;
    newCells[1].type = 'antibody';
    newCells[1].color = '#22c55e';
    newCells[1].size = 18;

    setCells(newCells);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.02;
      const FOV = 300;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (const cell of newCells) {
        cell.x += cell.vx;
        cell.y += cell.vy;
        cell.z += cell.vz;
        cell.life -= 0.1;

        if (cell.x < 0 || cell.x > canvas.width) cell.vx *= -1;
        if (cell.y < 0 || cell.y > canvas.height) cell.vy *= -1;
        if (cell.z < -100 || cell.z > 100) cell.vz *= -1;
      }

      const sortedCells = [...newCells].sort((a, b) => b.z - a.z);

      ctx.save();

      for (let i = 0; i < sortedCells.length; i++) {
        for (let j = i + 1; j < sortedCells.length; j++) {
          const a = sortedCells[i];
          const b = sortedCells[j];
          
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dz = a.z - b.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 80) {
            if (a.type === 'tcell' && b.type === 'antibody') continue;
            if (a.type === 'virus' && b.type === 'antibody') continue;
            if (a.type === 'antibody' && b.type === 'virus') continue;
            
            const alpha = (1 - dist / 80) * 0.2;
            const aScale = FOV / (FOV + a.z);
            const bScale = FOV / (FOV + b.z);
            
            ctx.beginPath();
            ctx.moveTo(a.x * aScale + centerX * (1 - aScale), a.y * aScale + centerY * (1 - aScale));
            ctx.lineTo(b.x * bScale + centerX * (1 - bScale), b.y * bScale + centerY * (1 - bScale));
            
            const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, a.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, b.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const cell of sortedCells) {
        const scale = FOV / (FOV + cell.z);
        const x = cell.x * scale + centerX * (1 - scale);
        const y = cell.y * scale + centerY * (1 - scale);
        const size = cell.size * scale;
        
        const isHovered = hoveredCell === cell.id;
        const baseAlpha = Math.min(1, Math.max(0.2, (cell.z + 100) / 200));
        
        if (isHovered || cell.type === 'tcell' || cell.type === 'antibody') {
          ctx.beginPath();
          ctx.arc(x, y, size + 8, 0, Math.PI * 2);
          ctx.fillStyle = cell.color + '15';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, cell.color);
        gradient.addColorStop(0.7, cell.color + 'cc');
        gradient.addColorStop(1, cell.color + '00');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = baseAlpha;
        ctx.shadowColor = cell.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (cell.type === 'virus') {
          const spikes = 8;
          ctx.strokeStyle = cell.color;
          ctx.lineWidth = 1;
          for (let s = 0; s < spikes; s++) {
            const angle = (s / spikes) * Math.PI * 2 + time;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            ctx.lineTo(x + Math.cos(angle) * (size + 6), y + Math.sin(angle) * (size + 6));
            ctx.stroke();
          }
        }

        if (cell.type === 'antibody') {
          ctx.strokeStyle = cell.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x, y + size);
          ctx.moveTo(x - size * 0.7, y - size * 0.3);
          ctx.lineTo(x, y);
          ctx.lineTo(x + size * 0.7, y - size * 0.3);
          ctx.moveTo(x - size * 0.7, y + size * 0.3);
          ctx.lineTo(x, y);
          ctx.lineTo(x + size * 0.7, y + size * 0.3);
          ctx.stroke();
        }

        if (isHovered) {
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fillText(cellTypes[cell.type].label, x, y + size + 15);
        }
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      let found: number | null = null;
      for (const cell of cells) {
        const dx = cell.x - mx;
        const dy = cell.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < cell.size + 10) {
          found = cell.id;
          break;
        }
      }
      setHoveredCell(found);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredCell]);

  return (
    <motion.div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-80 cursor-pointer"
        aria-label="Interactive cell network visualization"
      />
      <motion.div 
        className="absolute bottom-2 left-2 flex gap-2 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {Object.entries(cellTypes).map(([type, data]) => (
          <div key={type} className="flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-slate-400">{data.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}