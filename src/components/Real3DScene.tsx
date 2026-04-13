'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Group } from 'three';

function AnimatedHeart() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group position={[-3, 1, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#dc2626"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

function AnimatedDNA() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const spheres = [];
  for (let i = 0; i < 20; i++) {
    const y = (i / 20) * 6 - 3;
    const angle = i * 0.6;
    spheres.push({ 
      x: Math.cos(angle) * 0.8, 
      y, 
      z: Math.sin(angle) * 0.8,
      color: i % 2 === 0 ? '#14b8a6' : '#06b6d4'
    });
  }

  return (
    <group position={[3, 0, 0]} ref={groupRef}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <group scale={0.6}>
          {spheres.map((s, i) => (
            <mesh key={i} position={[s.x, s.y, s.z]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.5}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

function MedicalCross() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[-2, -2, 2]}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group ref={groupRef}>
          <mesh>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.3, 0.3]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function BrainShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group position={[2, 2, -1]}>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#8b5cf6"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.2}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}

function AmbulanceObj() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={[0, -1.5, 2]}>
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.8]} />
          <meshStandardMaterial 
            color="#f97316" 
            emissive="#f97316"
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} color="#14b8a6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <AnimatedHeart />
      <AnimatedDNA />
      <MedicalCross />
      <BrainShape />
      <AmbulanceObj />
      
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function Real3DScene() {
  return (
    <motion.div 
      className="fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </motion.div>
  );
}