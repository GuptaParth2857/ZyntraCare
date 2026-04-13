'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const moleculeElements = [
  { color: '#0ea5e9', label: 'O', size: 16 },
  { color: '#14b8a6', label: 'N', size: 14 },
  { color: '#8b5cf6', label: 'C', size: 18 },
  { color: '#ec4899', label: 'H', size: 10 },
  { color: '#22c55e', label: 'S', size: 12 },
  { color: '#f97316', label: 'P', size: 14 },
];

const positions = [
  { x: '15%', y: '20%' },
  { x: '70%', y: '15%' },
  { x: '25%', y: '60%' },
  { x: '80%', y: '55%' },
  { x: '45%', y: '80%' },
  { x: '85%', y: '35%' },
  { x: '10%', y: '75%' },
  { x: '55%', y: '40%' },
];

export default function Floating3DMolecules() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.classList.add('loaded');
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      {positions.map((pos, index) => {
        const element = moleculeElements[index % moleculeElements.length];
        return (
          <motion.div
            key={index}
            className="absolute flex items-center justify-center rounded-full font-bold"
            style={{ 
              left: pos.x, 
              top: pos.y, 
              width: element.size * 2.5, 
              height: element.size * 2.5,
              backgroundColor: element.color + '20',
              border: `1px solid ${element.color}40`,
              color: element.color,
              fontSize: element.size,
            }}
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1, 0.95, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 1.2,
            }}
          >
            {element.label}
          </motion.div>
        );
      })}

      <svg className="absolute inset-0 w-full h-full opacity-5">
        {positions.slice(0, 4).map((_, index) => (
          <motion.line
            key={index}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.3, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 1.5,
            }}
            x1={`${positions[index].x}`}
            y1={`${positions[index].y}`}
            x2={`${positions[(index + 2) % positions.length].x}`}
            y2={`${positions[(index + 2) % positions.length].y}`}
            stroke="#14b8a6"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}