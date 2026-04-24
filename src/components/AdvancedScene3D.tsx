'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';

// Teal + Gold BEAST color palette
const tealColor = '#14b8a6';
const goldColor = '#d4a574';
const darkTeal = '#0d9488';

function GlowingSphere() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color={tealColor}
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
        color={goldColor}
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
      <meshStandardMaterial color={darkTeal} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function ParticleField({ count = 2000 }: { count?: number }) {
  return (
    <Stars radius={100} depth={50} count={count} factor={3} saturation={0} fade speed={0.5} />
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a1612]/80">
      <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
}

export default function AdvancedScene3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [starCount, setStarCount] = useState(2000);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Reduce particles on mobile for performance
      setStarCount(mobile ? 500 : 2000);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });

    // Check for reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setStarCount(200);
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0a1612, #0f172a)' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 60 }}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} color={tealColor} intensity={1.5} />
          <pointLight position={[10, -5, 5]} color={goldColor} intensity={1} />
          
          <GlowingSphere />
          <SecondarySphere />
          <RotatingRing />
          <ParticleField count={starCount} />
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </Suspense>
    </div>
  );
}