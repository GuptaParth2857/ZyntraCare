'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function ActiveTheoryCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Smooth springs for liquid feel
  const cursorX = useSpring(0, { damping: 25, stiffness: 350, mass: 0.5 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 350, mass: 0.5 });

  const dotX = useSpring(0, { damping: 40, stiffness: 800, mass: 0.1 });
  const dotY = useSpring(0, { damping: 40, stiffness: 800, mass: 0.1 });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };

    const mouseOver = (e: MouseEvent) => {
      // Find if hovering over clickable element
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const mouseDown = () => setIsClicking(true);
    const mouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseover', mouseOver);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseover', mouseOver);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  // Hide custom cursor on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <>
      {/* Outer liquid ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-white/50 rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          border: isHovering ? '1px solid rgba(255,255,255,0)' : '1px solid rgba(255,255,255,0.5)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      {/* Inner sharp dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block"
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: isClicking ? 0 : isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1
        }}
      />
    </>
  );
}
