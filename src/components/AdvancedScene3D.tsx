'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';

function GlowingSphere() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function SecondarySphere() {
  return (
    <Sphere args={[0.8, 64, 64]} position={[3, 1, -2]}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.3}
        speed={1.2}
        roughness={0.2}
        metalness={0.7}
      />
    </Sphere>
  );
}

function RotatingRing() {
  return (
    <mesh rotation={[Math.PI / 4, 0, 0]}>
      <torusGeometry args={[3, 0.1, 16, 64]} />
      <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function ParticleField() {
  return (
    <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );
}

export default function AdvancedScene3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={1.5} />
          <pointLight position={[10, -5, 5]} color="#06b6d4" intensity={1} />
          
          <GlowingSphere />
          <SecondarySphere />
          <RotatingRing />
          <ParticleField />
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </Suspense>
    </div>
  );
}