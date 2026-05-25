'use client';

import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 32;
const RADIUS = 1.6;
const HEIGHT = 0.55;
const TWIST = 0.35;

function CinematicDNA({ bloomIntensity = 0.8, particleCount = 40 }: { bloomIntensity?: number; particleCount?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const flowRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);

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
      groupRef.current.rotation.y = t * 0.1;
    }
    if (flowRef.current) {
      flowRef.current.children.forEach((child, i) => {
        const speed = 0.3;
        const offset = i * (1 / flowRef.current!.children.length);
        const phase = ((t * speed + offset) % 1 + 1) % 1;
        const curve = i % 2 === 0 ? leftCurve : rightCurve;
        const pos = curve.getPointAt(phase);
        child.position.copy(pos);
      });
    }
    if (scanRef.current) {
      const scanY = (Math.sin(t * 0.5) * 0.5 + 0.5) * 2 - 1;
      scanRef.current.position.y = scanY * HEIGHT * PAIRS * 0.5;
    }
  });

  const cyan = '#06b6d4';
  const blue = '#3b82f6';
  const amber = '#f59e0b';
  const white = '#f0f9ff';

  return (
    <group ref={groupRef} rotation={[0.15, 0, 0.1]}>
      {/* Backbones */}
      {[leftCurve, rightCurve].map((curve, sideIdx) => {
        const isLeft = sideIdx === 0;
        return (
          <group key={`backbone-${sideIdx}`}>
            <mesh>
              <tubeGeometry args={[curve, 140, 0.05, 8, false]} />
              <meshPhysicalMaterial
                color={isLeft ? cyan : blue}
                emissive={isLeft ? cyan : blue}
                emissiveIntensity={0.15}
                metalness={0.3}
                roughness={0.4}
                transparent
                opacity={0.7}
                clearcoat={0.3}
              />
            </mesh>
            <mesh>
              <tubeGeometry args={[curve, 140, 0.12, 8, false]} />
              <meshBasicMaterial color={isLeft ? cyan : blue} transparent opacity={0.04} />
            </mesh>
          </group>
        );
      })}

      {/* Rungs + Nodes */}
      {nodes.m.map((mid, i) => {
        const lp = nodes.l[i];
        const rp = nodes.r[i];
        const dist = lp.distanceTo(rp);
        const dir = rp.clone().sub(lp).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        const isAmber = i % 7 === 3;
        const col = isAmber ? amber : cyan;
        const emCol = isAmber ? amber : cyan;

        return (
          <group key={`rung-${i}`}>
            <mesh position={mid} quaternion={q}>
              <cylinderGeometry args={[0.03, 0.03, dist * 0.8, 6]} />
              <meshPhysicalMaterial
                color={col}
                emissive={emCol}
                emissiveIntensity={0.2}
                metalness={0.6}
                roughness={0.2}
                transparent
                opacity={0.8}
              />
            </mesh>
            {[lp, rp].map((pos, side) => {
              const isLeft = side === 0;
              const baseColor = isLeft ? cyan : blue;
              return (
                <group key={`node-${side}`}>
                  <mesh position={pos}>
                    <sphereGeometry args={[0.3, 20, 20]} />
                    <meshBasicMaterial color={baseColor} transparent opacity={0.08} />
                  </mesh>
                  <Float speed={1.2} rotationIntensity={0} floatIntensity={0.03}>
                    <mesh position={pos}>
                      <sphereGeometry args={[0.18, 20, 20]} />
                      <meshPhysicalMaterial
                        color={baseColor}
                        emissive={baseColor}
                        emissiveIntensity={0.4}
                        metalness={0.1}
                        roughness={0.2}
                        clearcoat={0.5}
                        transparent
                        opacity={0.85}
                      />
                    </mesh>
                  </Float>
                  <mesh position={pos}>
                    <sphereGeometry args={[0.06, 12, 12]} />
                    <meshBasicMaterial color={white} transparent opacity={0.6} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Scan line */}
      <mesh ref={scanRef} position={[0, 0, 0]}>
        <ringGeometry args={[0.1, RADIUS * 1.6, 48]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Energy flow */}
      <group ref={flowRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`flow-${i}`}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? cyan : amber}
              transparent
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <Sparkles count={particleCount} scale={10} size={0.8} speed={0.08} color={cyan} opacity={0.15} />
    </group>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#060d12]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border border-cyan-500/20 border-t-cyan-500/60 rounded-full animate-spin" />
        <span className="text-cyan-400/40 text-[10px] font-mono tracking-[0.2em]">LOADING</span>
      </div>
    </div>
  );
}

export default function DNAUltra3D({ height = 600 }: { height?: number }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0.8);
  const [particleCount, setParticleCount] = useState(40);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBloomIntensity(mobile ? 0.4 : 0.8);
      setParticleCount(mobile ? 20 : 40);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setBloomIntensity(0.2);
      setParticleCount(15);
    }
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden select-none group"
      style={{ height }}
    >
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,13,18,0.6) 100%)',
      }} />

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none" style={{
        height: '25%',
        background: 'linear-gradient(to bottom, #060d12 0%, transparent 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{
        height: '25%',
        background: 'linear-gradient(to top, #060d12 0%, transparent 100%)',
      }} />

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
      }} />

      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[10px] font-mono text-cyan-400/40 tracking-[0.15em]">LIVE SEQUENCING</span>
      </div>

      {/* Interaction hint */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700 ${isInteracting ? 'opacity-0' : 'opacity-30 group-hover:opacity-60'}`}>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/30 tracking-[0.1em]">DRAG TO EXPLORE</span>
          <span className="w-0.5 h-3 bg-white/10" />
          <span className="text-[9px] font-mono text-white/30 tracking-[0.1em]">SCROLL TO ZOOM</span>
        </div>
      </div>

      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 38 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
        >
          <color attach="background" args={['#060d12']} />

          <ambientLight intensity={0.3} color="#a5f3fc" />
          <directionalLight position={[4, 8, 6]} intensity={2.5} color="#f8fafc" />
          <directionalLight position={[-4, -2, -6]} intensity={1.2} color="#67e8f9" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#06b6d4" distance={12} />
          <pointLight position={[0, 6, 0]} intensity={0.8} color="#3b82f6" distance={12} />
          <pointLight position={[0, -6, 0]} intensity={0.6} color="#06b6d4" distance={12} />

          <CinematicDNA bloomIntensity={bloomIntensity} particleCount={particleCount} />

          <Environment preset="night" />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            autoRotate
            autoRotateSpeed={0.4}
            dampingFactor={0.08}
            enableDamping
            minDistance={4}
            maxDistance={16}
            zoomSpeed={0.6}
          />

          <EffectComposer>
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.08} intensity={0.8 * bloomIntensity} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}