'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 50;
const RADIUS = 2.4;
const HEIGHT = 0.5;
const TWIST = 0.3;

// Teal + Gold BEAST color palette
const tealColor = '#14b8a6';
const tealDark = '#0d9488';
const goldColor = '#d4a574';
const lightTeal = '#5eead4';

function TubeSegment({ start, end, radius, material }: { start: THREE.Vector3, end: THREE.Vector3, radius: number, material: THREE.Material }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (ref.current) {
      const mid = start.clone().lerp(end, 0.5);
      ref.current.position.copy(mid);
      const dir = end.clone().sub(start).normalize();
      ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }
  }, [start, end]);
  
  return (
    <mesh ref={ref} material={material}>
      <cylinderGeometry args={[radius, radius, start.distanceTo(end), 12]} />
    </mesh>
  );
}

function DNAStructure({ bloomIntensity = 2.0 }: { bloomIntensity?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.5;
    }
  });

  const rungs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PAIRS; i++) {
      const y = (i - PAIRS / 2) * HEIGHT;
      const angle = i * TWIST;
      
      const p1 = new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS);
      const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS);
      
      // Teal or gold glowing elements
      const isGold = i % 5 === 0;
      const isTeal = i % 4 === 0;
      const glowColor = isGold ? goldColor : (isTeal ? lightTeal : tealColor);
      const glowEmissive = isGold ? '#d4a574' : (isTeal ? '#5eead4' : '#14b8a6');
      const glowIntensity = (isGold || isTeal) ? 5 * bloomIntensity : 4 * bloomIntensity;
      
      const isBroken = Math.random() > 0.85;

      arr.push({ i, p1, p2, glowColor, glowEmissive, glowIntensity, isBroken, isGold, isTeal });
    }
    return arr;
  }, [bloomIntensity]);

  // Create materials outside render loop for performance
  const goldGlowMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: goldColor, 
    emissive: '#d4a574', 
    emissiveIntensity: 5 * bloomIntensity, 
    toneMapped: false 
  }), [bloomIntensity]);
  
  const tealGlowMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: lightTeal, 
    emissive: '#5eead4', 
    emissiveIntensity: 4 * bloomIntensity, 
    toneMapped: false 
  }), [bloomIntensity]);
  
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#0a1612', 
    metalness: 0.9, 
    roughness: 0.15 
  }), []);
  
  const silverMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#94a3b8', 
    metalness: 1.0, 
    roughness: 0.2 
  }), []);

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0.2]}>
      {rungs.map((rung, i) => {
        const nextRung = rungs[i + 1];
        const midPoint = rung.p1.clone().lerp(rung.p2, 0.5);
        const leftInner = rung.p1.clone().lerp(midPoint, rung.isBroken ? 0.7 : 0.95);
        const rightInner = rung.p2.clone().lerp(midPoint, rung.isBroken ? 0.7 : 0.95);

        return (
          <React.Fragment key={`rung-${i}`}>
            {/* Backbone connecting to next node */}
            {nextRung && (
              <>
                <TubeSegment start={rung.p1} end={nextRung.p1} radius={0.16} material={rung.isTeal ? tealGlowMat : darkMat} />
                <TubeSegment start={rung.p2} end={nextRung.p2} radius={0.16} material={Math.random() > 0.9 ? tealGlowMat : darkMat} />
              </>
            )}

            {/* Glowing joints on backbone - teal or gold */}
            <mesh position={rung.p1}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <primitive object={rung.isGold ? goldGlowMat : tealGlowMat} />
            </mesh>
            <mesh position={rung.p2}>
              <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
              <primitive object={silverMat} />
            </mesh>

            {/* Inner Rods */}
            <TubeSegment start={rung.p1} end={leftInner} radius={0.06} material={silverMat} />
            <TubeSegment start={rung.p2} end={rightInner} radius={0.06} material={silverMat} />

            {/* Glowing Tips in the middle */}
            <mesh position={leftInner}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <primitive object={rung.isGold ? goldGlowMat : tealGlowMat} />
            </mesh>
            <mesh position={rightInner}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <primitive object={rung.isGold ? goldGlowMat : tealGlowMat} />
            </mesh>

            {/* Holographic data bits - teal colored */}
            {i % 8 === 0 && (
              <mesh position={midPoint.clone().add(new THREE.Vector3(0, 0.8, 0))}>
                <boxGeometry args={[0.2, 0.6, 0.05]} />
                <primitive object={tealGlowMat} />
              </mesh>
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
}

export default function DNARotate3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(2.0);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBloomIntensity(mobile ? 1.0 : 2.0);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });

    // Check for reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setBloomIntensity(0.5);
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] relative cursor-move bg-transparent">
      {/* Teal ambient glow background */}
      <div className="absolute inset-0 pointer-events-none" style={{ 
        background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.08) 0%, transparent 60%)' 
      }} />
      
      <Canvas 
        camera={{ position: [0, 0, 14], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <color attach="background" args={['#0a1612']} />
        
        {/* Teal tinted lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={1.5} color={tealColor} />
        <pointLight position={[0, 0, 0]} intensity={3} color={goldColor} distance={15} />

        <DNAStructure bloomIntensity={bloomIntensity} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxDistance={25}
          minDistance={8}
        />
        
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={bloomIntensity} 
            mipmapBlur 
          />
          <DepthOfField 
            focusDistance={0.0} 
            focalLength={0.02} 
            bokehScale={4} 
            height={480} 
          />
          <ToneMapping />
        </EffectComposer>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}