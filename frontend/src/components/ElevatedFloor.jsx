import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MangoItem from './Mango';

/**
 * 500-Metre Elevated Running Route
 * One continuous 500-metre upper floor with three running lanes,
 * glowing cyan boundaries, elevated supports, and vertical mango collectibles.
 */
export default function ElevatedFloor({
  active = false,
  playerRef,
  startZ = 0,
  speed = 20,
  distanceTraveled = 0,
  onComplete,
}) {
  const completed = useRef(false);
  const floorGroupRef = useRef();
  const currentOffsetZ = useRef(0);

  useEffect(() => {
    if (active) {
      completed.current = false;
      currentOffsetZ.current = 0;
    }
  }, [active]);

  useFrame((state, delta) => {
    if (!active || completed.current) return;

    // Advance floor relative to speed / player progress
    currentOffsetZ.current += speed * delta;

    // Check completion condition (500 metres)
    let currentDist = distanceTraveled;
    if (playerRef?.current && startZ !== 0) {
      currentDist = Math.max(currentDist, startZ - playerRef.current.position.z);
    } else {
      currentDist = Math.max(currentDist, currentOffsetZ.current);
    }

    if (currentDist >= 500 && !completed.current) {
      completed.current = true;
      onComplete?.();
    }
  });

  if (!active) return null;

  // Calculate centered Z position so 500m platform streams under player at Z=0
  // Starts ahead at Z = -250 and streams through to Z = +250
  const dist = Math.min(500, Math.max(0, distanceTraveled || currentOffsetZ.current));
  const zCenter = -250 + dist;

  return (
    <group ref={floorGroupRef} position={[0, 4.5, zCenter]}>
      {/* 1. One Continuous 500-Metre Upper Floor Deck */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.5, 500]} />
        <meshStandardMaterial
          color="#334155" // Dark metallic slate deck
          metalness={0.65}
          roughness={0.4}
        />
      </mesh>

      {/* Surface Grip Floor Panels Texture Lines */}
      {[-4, 0, 4].map((px) => (
        <mesh key={px} position={[px, 0.255, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.01, 500]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      ))}

      {/* 2. Left Glowing Boundary Rail */}
      <mesh position={[-5.8, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.4, 500]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={1.8}
        />
      </mesh>
      {/* Left Boundary Glow Flare Line */}
      <mesh position={[-5.8, 0.6, 0]}>
        <boxGeometry args={[0.08, 0.1, 500]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>

      {/* 3. Right Glowing Boundary Rail */}
      <mesh position={[5.8, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.4, 500]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={1.8}
        />
      </mesh>
      {/* Right Boundary Glow Flare Line */}
      <mesh position={[5.8, 0.6, 0]}>
        <boxGeometry args={[0.08, 0.1, 500]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>

      {/* 4. Three Marked Running Lanes (Lane width 3.2m: -3.2, 0, +3.2) */}
      {[-1.6, 1.6].map((lx) => (
        <mesh key={lx} position={[lx, 0.26, 0]}>
          <boxGeometry args={[0.08, 0.02, 500]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}

      {/* 5. Structural Support Pillars extending to ground rails */}
      {Array.from({ length: 26 }, (_, i) => -240 + i * 20).map((pz, idx) => (
        <group key={idx} position={[0, -2.25, pz]}>
          {/* Left concrete/steel pillar */}
          <mesh position={[-5.5, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 4.5, 0.8]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Right concrete/steel pillar */}
          <mesh position={[5.5, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 4.5, 0.8]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Crossbeam girder under deck */}
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[11.6, 0.4, 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 6. Glowing Overhead Cyber Arches every 50 metres */}
      {[-200, -150, -100, -50, 0, 50, 100, 150, 200].map((az, ai) => (
        <group key={ai} position={[0, 2.4, az]}>
          {/* Overhead horizontal neon bar */}
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[12, 0.18, 0.3]} />
            <meshStandardMaterial
              color="#00ccff"
              emissive="#00ccff"
              emissiveIntensity={1.5}
            />
          </mesh>
          {/* Left upright post */}
          <mesh position={[-5.8, 0, 0]}>
            <boxGeometry args={[0.2, 2.8, 0.3]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Right upright post */}
          <mesh position={[5.8, 0, 0]}>
            <boxGeometry args={[0.2, 2.8, 0.3]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* 7. Vertical Standing Mango Collectibles along the 500-metre Upper Highway */}
      {Array.from({ length: 45 }, (_, mi) => {
        const mz = -230 + mi * 10.5;
        const mx = ((mi % 3) - 1) * 3.2; // Spans lanes -3.2, 0, 3.2
        return (
          <group key={mi} position={[mx, 0.9, mz]}>
            <MangoItem position={[0, 0, 0]} scale={0.9} />
          </group>
        );
      })}

      {/* 8. 500-Metre Start & Finish Neon Checkpoints & Ramps */}
      {/* Entrance Ascent Ramp (+Z) */}
      <group position={[0, -2.25, 258]}>
        <mesh rotation={[-0.27, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[12, 0.45, 17]} />
          <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.4} />
        </mesh>
        {/* Entrance Chevrons pointing up to the floor */}
        {[-5, -1, 3].map((cz, ci) => (
          <mesh key={ci} position={[0, 0.26, cz]} rotation={[-1.3, 0, 0]}>
            <planeGeometry args={[10, 0.8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        ))}
        {/* Ramp glowing side rails */}
        {[-5.8, 5.8].map((rx) => (
          <mesh key={rx} position={[rx, 0.35, 0]} rotation={[-0.27, 0, 0]}>
            <boxGeometry args={[0.2, 0.4, 17]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>

      {/* Start Arch Gate */}
      <group position={[0, 2.0, 248]}>
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[12.2, 0.4, 0.5]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[-5.8, 0, 0]}>
          <boxGeometry args={[0.3, 4.0, 0.4]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
        <mesh position={[5.8, 0, 0]}>
          <boxGeometry args={[0.3, 4.0, 0.4]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      </group>

      {/* Finish Arch Gate */}
      <group position={[0, 2.0, -248]}>
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[12.2, 0.4, 0.5]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[-5.8, 0, 0]}>
          <boxGeometry args={[0.3, 4.0, 0.4]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
        <mesh position={[5.8, 0, 0]}>
          <boxGeometry args={[0.3, 4.0, 0.4]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>

      {/* Exit Descent Ramp (-Z) */}
      <group position={[0, -2.25, -258]}>
        <mesh rotation={[0.27, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[12, 0.45, 17]} />
          <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.4} />
        </mesh>
        {/* Exit Chevrons pointing down to ground rails */}
        {[-3, 1, 5].map((cz, ci) => (
          <mesh key={ci} position={[0, 0.26, cz]} rotation={[-1.84, 0, 0]}>
            <planeGeometry args={[10, 0.8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        ))}
        {/* Ramp glowing side rails */}
        {[-5.8, 5.8].map((rx) => (
          <mesh key={rx} position={[rx, 0.35, 0]} rotation={[0.27, 0, 0]}>
            <boxGeometry args={[0.2, 0.4, 17]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

