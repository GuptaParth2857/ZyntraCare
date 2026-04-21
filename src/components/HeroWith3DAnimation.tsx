'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function GlowingBlob() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0}
        metalness={0.8}
      />
    </Sphere>
  );
}

function FloatingParticles() {
  const points = useRef<THREE.Points>(null);
  const count = 800;
  
  const particlesPosition = useRef(new Float32Array(count * 3));
  
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      particlesPosition.current.set([x, y, z], i * 3);
    }
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.7} />
    </points>
  );
}

function AnimatedRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ring1Ref.current) ring1Ref.current.rotation.x += 0.002;
    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.003;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= 0.001;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.002;
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, -3]}>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, -3]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.5, 0.03, 16, 100]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} />
      </mesh>
    </>
  );
}

export default function HeroWith3DAnimation() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={1} />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <GlowingBlob />
          </Float>
          <FloatingParticles />
          <AnimatedRings />
          <Stars radius={100} depth={50} count={2000} factor={3} saturation={0.5} fade />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        >
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          AI-Powered Healthcare
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
        >
          Your Health,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Our Priority</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl"
        >
          Find the best hospitals, expert specialists, and emergency services across India.
          Book appointments instantly and track live bed availability.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/hospitals"
            className="group flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:-translate-y-1"
          >
            Find Hospitals
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          
          <Link
            href="/emergency"
            className="flex items-center gap-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Emergency
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-400 text-sm"
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
          />
        </div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  );
}