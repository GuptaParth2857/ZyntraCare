'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAIRS = 50;
const RADIUS = 2.4;
const HEIGHT = 0.5;
const TWIST = 0.3;

const darkMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9, roughness: 0.15 });
const orangeGlowMat = new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#ff6600', emissiveIntensity: 5, toneMapped: false });
const blueGlowMat = new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#00ccff', emissiveIntensity: 4, toneMapped: false });
const silverMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 1.0, roughness: 0.2 });

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

function DNAStructure() {
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
      
      // We'll create varied glowing elements
      const isBlue = Math.random() > 0.8;
      const glowMat = isBlue ? blueGlowMat : orangeGlowMat;
      const isBroken = Math.random() > 0.85;

      arr.push({ i, p1, p2, glowMat, isBroken, isBlue });
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0.2]}>
      {rungs.map((rung, i) => {
        // Backbone segments connecting to the NEXT rung
        const nextRung = rungs[i + 1];
        
        // Calculate midpoint with a gap for the center connection
        const midPoint = rung.p1.clone().lerp(rung.p2, 0.5);
        
        // Left rung rod (from P1 to slightly before middle)
        const leftInner = rung.p1.clone().lerp(midPoint, rung.isBroken ? 0.7 : 0.95);
        // Right rung rod (from P2 to slightly before middle)
        const rightInner = rung.p2.clone().lerp(midPoint, rung.isBroken ? 0.7 : 0.95);

        return (
          <React.Fragment key={`rung-${i}`}>
            {/* Backbone connecting to next node */}
            {nextRung && (
              <>
                <TubeSegment start={rung.p1} end={nextRung.p1} radius={0.16} material={rung.isBlue ? blueGlowMat : darkMat} />
                <TubeSegment start={rung.p2} end={nextRung.p2} radius={0.16} material={Math.random() > 0.9 ? blueGlowMat : darkMat} />
              </>
            )}

            {/* Glowing joints on backbone */}
            <mesh position={rung.p1}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <primitive object={orangeGlowMat} />
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
              <primitive object={rung.glowMat} />
            </mesh>
            <mesh position={rightInner}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <primitive object={rung.glowMat} />
            </mesh>

            {/* Add occasional floating holographic text/data bits */}
            {i % 8 === 0 && (
              <mesh position={midPoint.clone().add(new THREE.Vector3(0, 0.8, 0))}>
                <boxGeometry args={[0.2, 0.6, 0.05]} />
                <primitive object={blueGlowMat} />
              </mesh>
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
}

export default function DNARotate3D() {
  return (
    <div className="w-full h-full min-h-[500px] relative cursor-move bg-transparent">
      {/* Fallback glow background matching the reference */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(2,132,199,0.08) 0%, transparent 60%)' }} />
      
      <Canvas 
        camera={{ position: [0, 0, 14], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: true }}
      >
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#0284c7" />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ea580c" distance={15} />

        <DNAStructure />
        
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
            intensity={2.0} 
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
        
        {/* Environment brings out the reflections in the metallic backbone */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}