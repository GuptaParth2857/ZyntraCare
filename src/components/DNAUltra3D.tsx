'use client';

import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 30;
const RADIUS = 1.8;
const HEIGHT = 0.6;
const TWIST = 0.38;

function CinematicDNA({ bloomIntensity = 1.0, particleCount = 60 }: { bloomIntensity?: number; particleCount?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const flowRef = useRef<THREE.Group>(null);

  const { leftCurve, rightCurve, nodes } = useMemo(() => {
    const lPts: THREE.Vector3[] = [];
    const rPts: THREE.Vector3[] = [];
    const n = { l: [] as THREE.Vector3[], r: [] as THREE.Vector3[], m: [] as THREE.Vector3[] };

    for (let i = 0; i <= PAIRS; i++) {
      const angle = i * TWIST;
      const y = (i - PAIRS / 2) * HEIGHT;
      const lp = new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS);
      const rp = new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS);
      lPts.push(lp);
      rPts.push(rp);
      n.l.push(lp);
      n.r.push(rp);
      n.m.push(lp.clone().lerp(rp, 0.5));
    }

    return {
      leftCurve: new THREE.CatmullRomCurve3(lPts),
      rightCurve: new THREE.CatmullRomCurve3(rPts),
      nodes: n,
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.position.y = Math.sin(t * 0.35) * 0.25;
    }
    if (flowRef.current) {
      flowRef.current.children.forEach((child, i) => {
        const speed = 0.4;
        const offset = i * (1 / flowRef.current!.children.length);
        const phase = ((t * speed + offset) % 1 + 1) % 1;
        const curve = i % 2 === 0 ? leftCurve : rightCurve;
        const pos = curve.getPointAt(phase);
        child.position.copy(pos);
      });
    }
  });

  // Teal color palette for BEAST upgrade
  const tealColor = '#14b8a6';
  const goldColor = '#d4a574';
  const lightTeal = '#5eead4';

  return (
    <group ref={groupRef} rotation={[0.2, 0.3, 0.12]}>
      {/* Left backbone - teal tinted */}
      <mesh>
        <tubeGeometry args={[leftCurve, 140, 0.06, 10, false]} />
        <meshStandardMaterial color={tealColor} emissive={tealColor} emissiveIntensity={0.4} metalness={0.95} roughness={0.08} envMapIntensity={4} />
      </mesh>

      {/* Right backbone - teal tinted */}
      <mesh>
        <tubeGeometry args={[rightCurve, 140, 0.06, 10, false]} />
        <meshStandardMaterial color={tealColor} emissive={tealColor} emissiveIntensity={0.4} metalness={0.95} roughness={0.08} envMapIntensity={4} />
      </mesh>

      {/* Rungs & Nodes */}
      {nodes.m.map((mid, i) => {
        const lp = nodes.l[i];
        const rp = nodes.r[i];
        const dist = lp.distanceTo(rp);
        const dir = rp.clone().sub(lp).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        // Teal + Gold accent pattern (BEAST colors)
        const accentType = i % 8;
        const rungColor   = accentType === 3 ? goldColor : accentType === 7 ? lightTeal : '#5eead4';
        const rungEmissive = accentType === 3 ? '#d4a574' : accentType === 7 ? '#14b8a6' : '#5eead4';
        const rungIntensity = (accentType === 3 || accentType === 7) ? 2.0 * bloomIntensity : 0.3;

        return (
          <group key={`rung-${i}`}>
            {/* Connecting rod */}
            <mesh position={mid} quaternion={q}>
              <cylinderGeometry args={[0.04, 0.04, dist * 0.86, 8]} />
              <meshStandardMaterial
                color={rungColor} emissive={rungEmissive} emissiveIntensity={rungIntensity}
                metalness={1} roughness={0.04} envMapIntensity={5}
              />
            </mesh>

            {/* Left glowing ball - teal */}
            <Float speed={1.5} rotationIntensity={0} floatIntensity={0.04}>
              <mesh position={lp}>
                <sphereGeometry args={[0.27, 24, 24]} />
                <meshStandardMaterial color={lightTeal} emissive={lightTeal} emissiveIntensity={0.8} metalness={0.2} roughness={0.1} envMapIntensity={3} />
              </mesh>
            </Float>

            {/* Right glowing ball - gold */}
            <Float speed={1.8} rotationIntensity={0} floatIntensity={0.04}>
              <mesh position={rp}>
                <sphereGeometry args={[0.27, 24, 24]} />
                <meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={0.8} metalness={0.2} roughness={0.1} envMapIntensity={3} />
              </mesh>
            </Float>
          </group>
        );
      })}

      {/* Flowing energy orbs */}
      <group ref={flowRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`flow-${i}`}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? tealColor : goldColor}
              emissive={i % 2 === 0 ? '#14b8a6' : '#d4a574'}
              emissiveIntensity={2.5 * bloomIntensity}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Floating dust sparkles - teal tinted */}
      <Sparkles count={particleCount} scale={14} size={1.2} speed={0.15} color={lightTeal} opacity={0.25} />
    </group>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a1612]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-2 border-teal-500/20 border-t-teal-500/60 rounded-full animate-spin" />
        <span className="text-teal-400/60 text-xs font-mono tracking-widest">RENDERING DNA...</span>
      </div>
    </div>
  );
}

export default function DNAUltra3D({ height = 600 }: { height?: number }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(60);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Reduce bloom on mobile for performance
      setBloomIntensity(mobile ? 0.5 : 1.0);
      setParticleCount(mobile ? 30 : 60);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Reduce bloom further if reduced motion is preferred
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setBloomIntensity(0.3);
      setParticleCount(20);
    }
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden select-none group"
      style={{ height }}
    >
      {/* CSS top bokeh blur */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none" style={{
        height: '32%',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
      }} />

      {/* CSS bottom bokeh blur */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{
        height: '28%',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
      }} />

      {/* Teal ambient glow behind DNA */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 55% 65% at 48% 52%, rgba(20, 184, 166, 0.10) 0%, transparent 70%)',
      }} />

      {/* Interaction hint */}
      <div className={`absolute top-4 right-4 z-20 pointer-events-none transition-opacity duration-500 ${isInteracting ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[10px] font-mono text-teal-400/60 tracking-widest">SCROLL TO ZOOM</span>
          <span className="text-[10px] font-mono text-teal-400/60 tracking-widest">DRAG TO ROTATE</span>
        </div>
      </div>

      {/* Corner brackets */}
      {(['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'] as const).map((cls, i) => (
        <div key={i} className={`absolute w-6 h-6 border-teal-500/30 z-20 pointer-events-none ${cls}`} />
      ))}

      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 1, 9], fov: 42 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
        >
          {/* Background */}
          <color attach="background" args={['#0a1612']} />

          {/* Cinematic lighting - teal tinted */}
          <ambientLight intensity={0.25} />
          <directionalLight position={[8, 14, 8]} intensity={3.5} color="#ffffff" />
          <directionalLight position={[-5, -5, -5]} intensity={1.8} color="#5eead4" />
          <pointLight position={[0, 0, 6]} intensity={2.5} color="#ffffff" distance={14} />
          <pointLight position={[-4, -8, 3]} intensity={1.5} color="#5eead4" distance={18} />
          <pointLight position={[4, 8, -3]} intensity={1.0} color="#d4a574" distance={16} />

          <CinematicDNA bloomIntensity={bloomIntensity} particleCount={particleCount} />

          <Environment preset="studio" />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            autoRotate
            autoRotateSpeed={0.5}
            dampingFactor={0.06}
            enableDamping
            minDistance={4}
            maxDistance={20}
            zoomSpeed={0.8}
          />

          {/* Optimized Bloom */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.4}
              mipmapBlur
              intensity={bloomIntensity}
              levels={6}
              luminanceSmoothing={0.3}
            />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}