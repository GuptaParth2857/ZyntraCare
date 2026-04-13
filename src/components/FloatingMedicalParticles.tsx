'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// SVG Paths for Medical Elements
const DNA_PATH = "M 10 0 C 20 10, 30 10, 40 0 M 10 20 C 20 10, 30 10, 40 20 M 15 5 L 15 15 M 25 5 L 25 15 M 35 5 L 35 15";
const CROSS_PATH = "M 15 0 L 25 0 L 25 15 L 40 15 L 40 25 L 25 25 L 25 40 L 15 40 L 15 25 L 0 25 L 0 15 L 15 15 Z";
const CELL_PATH = "M 20 0 C 31 0, 40 9, 40 20 C 40 31, 31 40, 20 40 C 9 40, 0 31, 0 20 C 0 9, 9 0, 20 0 Z M 20 10 C 25.5 10, 30 14.5, 30 20 C 30 25.5, 25.5 30, 20 30 C 14.5 30, 10 25.5, 10 20 C 10 14.5, 14.5 10, 20 10 Z";

const SHAPES = [
  { type: 'dna', path: DNA_PATH, size: 50, color: 'text-sky-500/30', isStroke: true },
  { type: 'cross', path: CROSS_PATH, size: 30, color: 'text-teal-500/20', isStroke: false },
  { type: 'cell', path: CELL_PATH, size: 40, color: 'text-purple-500/20', isStroke: false },
  { type: 'dna', path: DNA_PATH, size: 60, color: 'text-blue-500/30', isStroke: true },
  { type: 'cross', path: CROSS_PATH, size: 25, color: 'text-emerald-500/20', isStroke: false },
  { type: 'cell', path: CELL_PATH, size: 45, color: 'text-indigo-500/20', isStroke: false },
];

export default function FloatingMedicalParticles() {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    // Generate random particles only on client-side to prevent hydration mismatch
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      shape: SHAPES[i % SHAPES.length],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
      rotationDir: Math.random() > 0.5 ? 1 : -1,
    }));
    setElements(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className={`absolute ${el.shape.color}`}
          initial={{ 
            x: `${el.initialX}vw`, 
            y: `${el.initialY}vh`, 
            opacity: 0,
            scale: 0.5,
            rotate: 0 
          }}
          animate={{
            x: [
              `${el.initialX}vw`, 
              `${el.initialX + (Math.random() * 10 - 5)}vw`, 
              `${el.initialX}vw`
            ],
            y: [
              `${el.initialY}vh`, 
              `${el.initialY - (Math.random() * 20 + 10)}vh`, 
              `${el.initialY}vh`
            ],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
            rotate: 360 * el.rotationDir
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear",
          }}
          style={{ width: el.shape.size, height: el.shape.size }}
        >
          <svg 
            viewBox="0 0 50 50" 
            fill={el.shape.isStroke ? "none" : "currentColor"} 
            stroke={el.shape.isStroke ? "currentColor" : "none"} 
            strokeWidth={el.shape.isStroke ? "3" : "0"} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-full h-full drop-shadow-[0_0_10px_currentColor]"
          >
            <path d={el.shape.path} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
