'use client';

import React, { useRef, useMemo, Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 32;
const RADIUS = 1.6;
const HEIGHT = 0.55;
const TWIST = 0.35;
const BASES = ['A', 'T', 'C', 'G'];

function NodePulse({ pos, color, speed, delay }: { pos: THREE.Vector3; color: string; speed: number; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * speed + delay);
    meshRef.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.25, 20, 20]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        metalness={0.05}
        roughness={0.1}
        clearcoat={0.6}
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    </mesh>
  );
}

function OrbitalRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const ringGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 0.004;
    shape.absarc(0, 0, radius, 0, Math.PI * 2);
    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, [radius]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = (tilt ?? 0.3) + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
  });

  return (
    <mesh ref={ref} rotation={[tilt ?? 0.3, 0, 0]}>
      <ringGeometry args={[radius - 0.01, radius + 0.01, 80]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function FloatingBase({ pos, base, color }: { pos: THREE.Vector3; base: string; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => pos.clone(), [pos]);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = startPos.x + Math.sin(t * 0.4 + offset) * 0.3;
    ref.current.position.y = startPos.y + Math.sin(t * 0.3 + offset * 1.3) * 0.25;
    ref.current.position.z = startPos.z + Math.cos(t * 0.35 + offset * 0.7) * 0.3;
  });

  return (
    <sprite position={[pos.x, pos.y, pos.z]} ref={ref as any}>
      <spriteMaterial transparent opacity={0.25} depthWrite={false}>
        <canvasTexture attach="map" args={[makeTextCanvas(base, color)]} />
      </spriteMaterial>
    </sprite>
  );
}

function makeTextCanvas(text: string, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.fillText(text, 32, 32);
  return c;
}

function CinematicDNA({ bloomIntensity = 2.0, particleCount = 80 }: { bloomIntensity?: number; particleCount?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const flowRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const nodePulseRef = useRef<number[]>([]);

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
      groupRef.current.rotation.y = t * 0.08;
    }
    if (flowRef.current) {
      flowRef.current.children.forEach((child, i) => {
        const speed = 0.25;
        const offset = i * (1 / flowRef.current!.children.length);
        const phase = ((t * speed + offset) % 1 + 1) % 1;
        const curve = i % 2 === 0 ? leftCurve : rightCurve;
        const pos = curve.getPointAt(phase);
        child.position.copy(pos);
        const s = 1 + 0.3 * Math.sin(phase * Math.PI);
        child.scale.setScalar(s);
      });
    }
    if (scanRef.current) {
      const scanY = (Math.sin(t * 0.5) * 0.5 + 0.5) * 2 - 1;
      scanRef.current.position.y = scanY * HEIGHT * PAIRS * 0.5;
      const opacity = 0.08 + 0.12 * (Math.sin(t * 0.5) * 0.5 + 0.5);
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      scanRef.current.scale.x = 1 + 0.1 * Math.sin(t * 1.5);
    }
  });

  const cyan = '#22d3ee';
  const blue = '#60a5fa';
  const amber = '#fbbf24';
  const white = '#f0f9ff';
  const purple = '#c084fc';

  return (
    <group ref={groupRef} rotation={[0.15, 0, 0.1]}>
      {/* Orbital rings */}
      <OrbitalRing radius={RADIUS * 1.8} color={cyan} speed={0.15} tilt={0.4} />
      <OrbitalRing radius={RADIUS * 2.2} color={blue} speed={-0.1} tilt={0.6} />
      <OrbitalRing radius={RADIUS * 2.6} color={purple} speed={0.08} tilt={0.2} />

      {/* Backbones */}
      {[leftCurve, rightCurve].map((curve, sideIdx) => {
        const isLeft = sideIdx === 0;
        return (
          <group key={`backbone-${sideIdx}`}>
            <mesh>
              <tubeGeometry args={[curve, 140, 0.06, 8, false]} />
              <meshPhysicalMaterial
                color={cyan}
                emissive={isLeft ? cyan : blue}
                emissiveIntensity={0.6}
                metalness={0.2}
                roughness={0.3}
                transparent
                opacity={0.9}
                clearcoat={0.4}
              />
            </mesh>
            <mesh>
              <tubeGeometry args={[curve, 140, 0.18, 8, false]} />
              <meshBasicMaterial color={isLeft ? cyan : blue} transparent opacity={0.1} toneMapped={false} />
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
              <cylinderGeometry args={[0.04, 0.04, dist * 0.85, 6]} />
              <meshPhysicalMaterial
                color={col}
                emissive={emCol}
                emissiveIntensity={0.6}
                metalness={0.4}
                roughness={0.15}
                transparent
                opacity={0.9}
              />
            </mesh>
            {[lp, rp].map((pos, side) => {
              const isLeft = side === 0;
              const baseColor = isLeft ? cyan : blue;
              return (
                <group key={`node-${side}`}>
              <mesh position={pos}>
                <sphereGeometry args={[0.4, 20, 20]} />
                <meshBasicMaterial color={baseColor} transparent opacity={0.15} toneMapped={false} />
              </mesh>
                  <NodePulse pos={pos} color={baseColor} speed={1.2 + i * 0.02} delay={i * 0.15} />
                  <mesh position={pos}>
                    <sphereGeometry args={[0.07, 12, 12]} />
                    <meshBasicMaterial color={white} transparent opacity={0.5} />
                  </mesh>
                  {i % 4 === 0 && (
                    <FloatingBase pos={pos.clone().add(new THREE.Vector3(0, 0.5, 0))} base={BASES[i % 4]} color={baseColor} />
                  )}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Scan line */}
      <mesh ref={scanRef} position={[0, 0, 0]}>
        <ringGeometry args={[0.05, RADIUS * 1.9, 64]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Energy flow */}
      <group ref={flowRef}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`flow-${i}`}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? amber : i % 3 === 1 ? cyan : blue}
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Central axis glow */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, HEIGHT * PAIRS, 8]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.15} toneMapped={false} />
      </mesh>

      <Sparkles count={particleCount} scale={14} size={1.5} speed={0.08} color={cyan} opacity={0.3} />
    </group>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#060d12' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border border-cyan-500/20 border-t-cyan-500/70 rounded-full animate-spin" />
          <div className="absolute inset-1 border border-blue-500/10 border-b-blue-500/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <span className="text-cyan-400/30 text-[10px] font-mono tracking-[0.25em]">SEQUENCING</span>
      </div>
    </div>
  );
}

export default function DNAUltra3D({ height = 600 }: { height?: number }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(2.0);
  const [particleCount, setParticleCount] = useState(80);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Only run the 3D canvas when the section is actually on screen.
  // Keeps the exact same animation/feature, but stops hammering the GPU
  // while it's off-screen — the main cause of lag on the home page.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Honor OS "reduce motion" by rendering a lighter static scene
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setBloomIntensity(0.5);
      setParticleCount(24);
    }
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBloomIntensity(mobile ? 0.8 : 1.6);
      setParticleCount(mobile ? 32 : 70);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden select-none group"
      style={{ height }}
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 40% at 50% 20%, rgba(6,182,212,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 80% 80%, rgba(192,132,252,0.06) 0%, transparent 50%)
          `,
        }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,13,18,0.4) 100%)',
      }} />

      {/* Top/bottom fades */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none h-1/4" style={{
        background: 'linear-gradient(to bottom, #060d12 0%, transparent 100%)',
      }} />
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none h-1/4" style={{
        background: 'linear-gradient(to top, #060d12 0%, transparent 100%)',
      }} />

      {/* Corner accents */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
          <span className="text-[10px] font-mono text-cyan-400/50 tracking-[0.15em]">LIVE SEQUENCING</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end gap-0.5">
        <span className="text-[9px] font-mono text-white/15 tracking-[0.1em]">ZYNTRACARE</span>
        <span className="text-[8px] font-mono text-white/10 tracking-[0.15em]">GENOMICS v2.4</span>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-cyan-500/20 z-20 pointer-events-none" />

      {/* Interaction hint */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700 ${isInteracting ? 'opacity-0' : 'opacity-25 group-hover:opacity-60'}`}>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/40 tracking-[0.1em]">↻ DRAG</span>
          <span className="w-4 h-px bg-white/10" />
          <span className="text-[9px] font-mono text-white/40 tracking-[0.1em]">⇌ ZOOM</span>
        </div>
      </div>

      {inView ? (
        <Suspense fallback={<Loader />}>
          <Canvas
            camera={{ position: [0, 0.5, 8], fov: 38 }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.8, stencil: false, depth: true }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
            onPointerDown={() => setIsInteracting(true)}
            onPointerUp={() => setIsInteracting(false)}
          >
            <color attach="background" args={['#060d12']} />

            <ambientLight intensity={0.5} color="#a5f3fc" />
            <directionalLight position={[4, 8, 6]} intensity={4} color="#f0fdfa" />
            <directionalLight position={[-4, -2, -6]} intensity={2.5} color="#67e8f9" />
            <pointLight position={[0, 0, 5]} intensity={3} color="#22d3ee" distance={15} />
            <pointLight position={[0, 6, 0]} intensity={2} color="#60a5fa" distance={14} />
            <pointLight position={[0, -6, 0]} intensity={1.5} color="#22d3ee" distance={14} />
            <pointLight position={[3, 3, 3]} intensity={1.5} color="#fbbf24" distance={10} />

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
            <Bloom luminanceThreshold={0.05} luminanceSmoothing={0.04} intensity={2.0 * bloomIntensity} mipmapBlur />
          </EffectComposer>
        </Canvas>
        </Suspense>
      ) : (
        <Loader />
      )}
    </div>
  );
}