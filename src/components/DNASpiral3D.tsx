'use client';

import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 26;
const RADIUS = 1.35;
const HEIGHT = 6;
const TURNS = 2.4;

// ---------------------------------------------------------------------------
// True 3D (three.js) — smooth glowing rotating double-helix spiral. Matches
// the classic "beautiful moving spiral DNA" look: gradient backbones, glowing
// base-pair rungs, nucleotide bubbles, floating particles + soft bloom.
// ---------------------------------------------------------------------------

function makeHelixData() {
  const lPts: THREE.Vector3[] = [];
  const rPts: THREE.Vector3[] = [];
  const tPts: THREE.Vector3[] = [];
  const bPts: THREE.Vector3[] = [];
  const count = 140;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const angle = t * TURNS * Math.PI * 2;
    const y = (t - 0.5) * HEIGHT;
    lPts.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS));
    rPts.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS));
  }
  // Rung (base-pair) positions — a ring every PAIRS-th of the height
  for (let i = 0; i <= PAIRS; i++) {
    const t = i / PAIRS;
    const angle = t * TURNS * Math.PI * 2;
    const y = (t - 0.5) * HEIGHT;
    tPts.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS));
    bPts.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS));
  }
  return {
    leftCurve: new THREE.CatmullRomCurve3(lPts),
    rightCurve: new THREE.CatmullRomCurve3(rPts),
    rungLeft: tPts,
    rungRight: bPts,
  };
}

function GlowParticle({ pos, color, size, speed }: { pos: THREE.Vector3; color: string; size: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.y = pos.y + Math.sin(t + pos.x * 0.7) * 0.25;
    const pulse = 0.8 + 0.4 * Math.sin(t * 1.6 + pos.z);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
    </mesh>
  );
}

function DNAHelix({ reduced }: { reduced?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { leftCurve, rightCurve, rungLeft, rungRight } = useMemo(makeHelixData, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
  });

  const cyan = '#22d3ee';
  const blue = '#60a5fa';
  const purple = '#a78bfa';
  const amber = '#fbbf24';
  const pink = '#f472b6';
  const white = '#f0f9ff';

  return (
    <group ref={groupRef} rotation={[0.12, 0, 0]}>
      {/* Ribbon backbones */}
      {[
        { curve: leftCurve, color: cyan, emissive: '#0891b2' },
        { curve: rightCurve, color: blue, emissive: '#3b82f6' },
      ].map((b, idx) => (
        <group key={`backbone-${idx}`}>
          <mesh>
            <tubeGeometry args={[b.curve, 160, 0.09, 12, false]} />
            <meshPhysicalMaterial
              color={b.color}
              emissive={b.emissive}
              emissiveIntensity={1.1}
              metalness={0.35}
              roughness={0.15}
              clearcoat={1}
              clearcoatRoughness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>
          {/* soft outer halo */}
          <mesh>
            <tubeGeometry args={[b.curve, 160, 0.22, 12, false]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.08} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Base-pair rungs */}
      {rungLeft.map((lp, i) => {
        const rp = rungRight[i];
        const dir = new THREE.Vector3().subVectors(rp, lp);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        const mid = lp.clone().lerp(rp, 0.5);
        const isAmber = i % 6 === 3;
        const isPink = i % 8 === 5;
        const glow = isAmber ? amber : isPink ? pink : cyan;
        return (
          <group key={`rung-${i}`}>
            <mesh position={mid} quaternion={quat}>
              <cylinderGeometry args={[0.035, 0.035, len * 0.86, 8]} />
              <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.85} />
            </mesh>
            {/* hot base pair (dots) with a sparkle every few */}
            {!reduced && i % 3 === 0 && (
              <GlowParticle pos={mid.clone().add(new THREE.Vector3(0, 0.05, 0))} color={white} size={0.07} speed={0.6 + (i % 5) * 0.2} />
            )}
          </group>
        );
      })}

      {/* Nucleotide bubbles on backbone */}
      {!reduced &&
        rungLeft.map((_, i) => {
          const color = i % 4 === 2 ? amber : i % 5 === 3 ? pink : undefined;
          return (
            <group key={`bubble-L-${i}`}>
              <GlowParticle
                pos={rungLeft[i]}
                color={color ?? cyan}
                size={i % 6 === 0 ? 0.14 : 0.1}
                speed={0.5 + (i % 4) * 0.25}
              />
              <GlowParticle
                pos={rungRight[i]}
                color={color ?? (i % 4 === 1 ? purple : blue)}
                size={i % 6 === 1 ? 0.13 : 0.09}
                speed={0.5 + (i % 4) * 0.2}
              />
            </group>
          );
        })}

      {/* Central axis glow column */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, HEIGHT, 8]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.12} toneMapped={false} />
      </mesh>

      {/* Floating energy particles */}
      <Sparkles count={reduced ? 30 : 90} scale={[RADIUS * 2.6, HEIGHT, RADIUS * 2.6]} size={1.6} speed={0.25} color={cyan} opacity={0.35} />
      <Sparkles count={reduced ? 0 : 40} scale={[RADIUS * 3, HEIGHT, RADIUS * 3]} size={2.4} speed={0.15} color={purple} opacity={0.2} />
    </group>
  );
}

function SpiralScene({ reduced }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={['#05080f']} />
      <fog attach="fog" args={['#05080f', 12, 24]} />

      <ambientLight intensity={0.4} color="#a5f3fc" />
      <directionalLight position={[5, 8, 6]} intensity={3.2} color="#e0faff" />
      <directionalLight position={[-5, -3, -6]} intensity={2.2} color="#7dd3fc" />
      <pointLight position={[0, 0, 6]} intensity={3.5} color="#22d3ee" distance={16} />
      <pointLight position={[0, 5, 0]} intensity={2.4} color="#818cf8" distance={15} />
      <pointLight position={[0, -5, 0]} intensity={1.6} color="#22d3ee" distance={15} />

      <DNAHelix reduced={reduced} />

      <OrbitControls
        enablePan={false}
        enableZoom
        autoRotate
        autoRotateSpeed={0.9}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.5}
        maxDistance={14}
        zoomSpeed={0.6}
      />

      {!reduced && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.1} intensity={1.25} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS-3D fallback — a REAL spinning 3D helix built purely from CSS transforms
// (translateY → rotateY → translateZ). No WebGL needed, so it renders even in
// environments where WebGL is disabled, and it costs almost nothing.
// ---------------------------------------------------------------------------
function CSSDNASpiral() {
  const dots = Array.from({ length: 26 });
  const strandA = '#22d3ee';
  const strandB = '#60a5fa';
  const amber = '#fbbf24';
  const pink = '#f472b6';

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none" style={{ perspective: 950 }} aria-hidden>
      {/* soft radials */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 42%, rgba(34,211,238,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 50% 70%, rgba(129,140,248,0.08) 0%, transparent 55%)' }} />

      {/* Spinning 3D helix */}
      <div className="relative" style={{ transformStyle: 'preserve-3d', animation: 'dna-spin 14s linear infinite', width: 0, height: 0 }}>
        {dots.map((_, i) => {
          const t = i / (dots.length - 1) - 0.5; // -0.5 .. 0.5
          const y = t * 340;
          const a = i * (360 / 3.5); // twist
          const r = 90;
          const isAmber = i % 6 === 3;
          const isPink = i % 8 === 5;
          const glow = isAmber ? amber : isPink ? pink : i % 2 === 0 ? strandA : strandB;
          const left = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                transform: `translateY(${y}px) rotateY(${a}deg) translateZ(${left ? r : -r}px)`,
                left: 0,
                top: 0,
                width: 10,
                height: 10,
                marginTop: -5,
                marginLeft: -5,
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ background: glow, boxShadow: `0 0 12px 2px ${glow}`, opacity: 0.92 }}
              />
            </div>
          );
        })}
        {/* central axis */}
        <div
          className="absolute"
          style={{
            transform: 'translateY(0)',
            left: 0,
            top: 0,
            width: 2,
            height: 340,
            marginLeft: -1,
            marginTop: -170,
            background: 'linear-gradient(to bottom, rgba(34,211,238,0) 0%, rgba(34,211,238,0.3) 50%, rgba(34,211,238,0) 100%)',
          }}
        />
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#05080f' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border border-cyan-500/20 border-t-cyan-400/80 rounded-full animate-spin" />
          <div className="absolute inset-1 border border-blue-500/10 border-b-blue-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <span className="text-cyan-400/30 text-[10px] font-mono tracking-[0.25em]">SEQUENCING</span>
      </div>
    </div>
  );
}

// Probe once, synchronously, before ever mounting <Canvas>, so WebGL-less
// browsers never even attempt a context (no console error).
function canCreateWebGLContext(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const attrs = { failIfMajorPerformanceCaveat: false, powerPreference: 'default' } as WebGLContextAttributes;
    const gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    return !!gl;
  } catch {
    return false;
  }
}

export default function DNASpiral3D({ height = 480 }: { height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [webglOK, setWebglOK] = useState<boolean>(() => typeof window !== 'undefined' && canCreateWebGLContext());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mount the 3D canvas only when the section is on screen — keeps the exact
  // animation but never hammers the GPU while off-screen (the lag fix).
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

  // Honor reduced-motion + mobile (lighter render)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    setInView((v) => v);
  }, []);
  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden select-none group"
      style={{ height, background: '#05080f' }}
    >
      {/* HUD accents */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
        <span className="text-[10px] font-mono text-cyan-400/50 tracking-[0.15em]">LIVE GENOME</span>
      </div>
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end gap-0.5">
        <span className="text-[9px] font-mono text-white/15 tracking-[0.1em]">ZYNTRACARE</span>
        <span className="text-[8px] font-mono text-white/10 tracking-[0.15em]">GENOMICS v2.6</span>
      </div>
      <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-cyan-500/20 z-20 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-cyan-500/20 z-20 pointer-events-none" />

      {/* Interaction hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-25 group-hover:opacity-60 transition-opacity duration-500">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/40 tracking-[0.1em]">↻ DRAG</span>
          <span className="w-4 h-px bg-white/10" />
          <span className="text-[9px] font-mono text-white/40 tracking-[0.1em]">⇌ ZOOM</span>
        </div>
      </div>

      {webglOK ? (
        inView ? (
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ position: [0, 0.5, 8.5], fov: 40 }}
              gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false, depth: true }}
              dpr={isMobile ? [1, 1] : [1, 1.5]}
            >
              <SpiralScene reduced={reducedMotion} />
            </Canvas>
          </Suspense>
        ) : (
          <Loader />
        )
      ) : (
        <CSSDNASpiral />
      )}

      <style jsx global>{`
        @keyframes dna-spin {
          from { transform: rotateX(8deg) rotateY(0deg); }
          to { transform: rotateX(8deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}