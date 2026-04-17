'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';

interface DragState {
  dragging: boolean;
  lastX: number;
  lastY: number;
  rotX: number;
  rotY: number;
}

function DNABase() {
  const groupRef = useRef<THREE.Group>(null);
  const dragRef = useRef<DragState>({ dragging: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      dragRef.current.rotY += (e.clientX - dragRef.current.lastX) * 0.008;
      dragRef.current.rotX += (e.clientY - dragRef.current.lastY) * 0.008;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
      dragRef.current.dragging = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (dragRef.current.rotX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (dragRef.current.rotY - groupRef.current.rotation.y) * 0.1;
    }
  });

  const handlePointerDown = () => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = 0;
    dragRef.current.lastY = 0;
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => setIsHovered(false);

  const numBasePairs = 20;
  const radius = 1.5;
  const height = 8;

  const spheres = Array.from({ length: numBasePairs }, (_, i) => {
    const angle = (i / numBasePairs) * Math.PI * 2;
    const y = (i / numBasePairs) * height - height / 2;
    return {
      pos1: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
      pos2: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius] as [number, number, number],
      color: i % 2 === 0 ? '#14b8a6' : '#06b6d4'
    };
  });

  return (
    // @ts-expect-error - R3F elements
    <group 
      ref={groupRef} 
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {spheres.map((s, i) => (
        // @ts-expect-error - R3F elements
        <group key={i}>
          <Float speed={2} rotationIntensity={0} floatIntensity={0}>
            {/* @ts-expect-error - R3F elements */}
            <mesh position={s.pos1 as [number, number, number]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              {/* @ts-expect-error - R3F elements */}
              <meshStandardMaterial 
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </Float>
          <Float speed={2} rotationIntensity={0} floatIntensity={0}>
            {/* @ts-expect-error - R3F elements */}
            <mesh position={s.pos2 as [number, number, number]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              {/* @ts-expect-error - R3F elements */}
              <meshStandardMaterial 
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </Float>
        </group>
      ))}
      {/* @ts-expect-error - R3F elements */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.03, 8, 64]} />
        {/* @ts-expect-error - R3F elements */}
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function DNARotate3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <DNABase />
      </Canvas>
    </div>
  );
}