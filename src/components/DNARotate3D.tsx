'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

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
      document.body.style.cursor = 'grab';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      if (!dragRef.current.dragging) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.5 + dragRef.current.rotY;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + dragRef.current.rotX * 0.3;
      } else {
        groupRef.current.rotation.y = dragRef.current.rotY;
        groupRef.current.rotation.x = dragRef.current.rotX * 0.3;
      }
    }
  });

  const handlePointerDown = (e: any) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX || e.pointers[0]?.clientX;
    dragRef.current.lastY = e.clientY || e.pointers[0]?.clientY;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    document.body.style.cursor = 'grab';
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (!dragRef.current.dragging) document.body.style.cursor = 'default';
  };

  const spheres = [];
  const numStrands = 24;
  
  for (let i = 0; i < numStrands; i++) {
    const t = i / numStrands;
    const angle = t * Math.PI * 8;
    const y = (t - 0.5) * 4;
    const radius = 0.6;
    
    spheres.push({
      pos1: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      pos2: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius],
      color: i % 2 === 0 ? '#14b8a6' : '#06b6d4'
    });
  }

  return (
    <group 
      ref={groupRef} 
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {spheres.map((s, i) => (
        <group key={i}>
          <Float speed={2} rotationIntensity={0} floatIntensity={0}>
            <mesh position={s.pos1 as [number, number, number]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.8}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
            <mesh position={s.pos2 as [number, number, number]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.8}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
          </Float>
        </group>
      ))}
      
      <Torus args={[0.6, 0.04, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.5} />
      </Torus>
      <Torus args={[0.6, 0.04, 16, 100]} rotation={[Math.PI / 2, Math.PI, 0]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </Torus>
      
      {spheres.filter((_, i) => i % 3 === 0).map((s, i) => (
        <mesh key={`bridge-${i}`} position={[0, s.pos1[1], 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function DNA3DScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#14b8a6" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />
      <DNABase />
    </>
  );
}

export default function DNARotate3D() {
  return (
    <div className="w-full h-full cursor-grab">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <DNA3DScene />
      </Canvas>
    </div>
  );
}