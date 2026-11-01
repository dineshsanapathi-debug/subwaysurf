import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MangoItem from './Mango';

/**
 * Upper Skyway Route (Activated EXCLUSIVELY by the Rocket)
 * High-altitude, 100% pristine and clear 3-lane neon skyway:
 * - Elevated at Y = 8.5m (well above all ground walls, trains, and obstacles)
 * - Zero pillars from below or arches blocking the running lanes
 * - 3 clear running lanes with glowing cyan boundary rails
 * - Rows of vertical 3D mango collectibles
 * - Smooth jump-off ledge at the exit where hero dives back to ground tracks
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

  // Continuous forward stream so platform slides smoothly past hero as they leap off
  const dist = Math.max(0, distanceTraveled || currentOffsetZ.current);
  const zCenter = -250 + dist;

  return (
    <group ref={floorGroupRef} position={[0, 8.5, zCenter]}>
      {/* 1. Main Clear 3-Lane Skyway Deck (Elevated at 8.5m - 100% Clear Runway) */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.3, 500]} />
        <meshStandardMaterial
          color="#0f172a" // Deep sleek slate carbon deck
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Surface Grip Floor Runway Strips for All 3 Lanes */}
      {[-3.2, 0, 3.2].map((lx) => (
        <mesh key={lx} position={[lx, 0.155, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.01, 500]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      ))}

      {/* 2. Left Glowing Cyan Boundary Rail */}
      <mesh position={[-5.8, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.45, 500]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={2.2}
        />
      </mesh>
      {/* Left Neon Light Guide Line */}
      <mesh position={[-5.8, 0.6, 0]}>
        <boxGeometry args={[0.08, 0.08, 500]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>

      {/* 3. Right Glowing Cyan Boundary Rail */}
      <mesh position={[5.8, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.45, 500]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={2.2}
        />
      </mesh>
      {/* Right Neon Light Guide Line */}
      <mesh position={[5.8, 0.6, 0]}>
        <boxGeometry args={[0.08, 0.08, 500]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>

      {/* 4. Three Marked Running Lanes (Laser dividers at X = -1.6m and X = +1.6m) */}
      {[-1.6, 1.6].map((lx) => (
        <mesh key={lx} position={[lx, 0.16, 0]}>
          <boxGeometry args={[0.08, 0.02, 500]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}

      {/* 5. Clear Vertical Standing Mango Collectibles (Unobstructed across 3 lanes) */}
      {Array.from({ length: 48 }, (_, mi) => {
        const mz = -230 + mi * 10.0;
        const mx = ((mi % 3) - 1) * 3.2; // Cleanly placed in lanes -3.2, 0, 3.2
        return (
          <group key={mi} position={[mx, 0.9, mz]}>
            <MangoItem position={[0, 0, 0]} scale={0.92} />
          </group>
        );
      })}

      {/* 6. Glowing Start & Exit Checkpoint Ledges */}
      {/* Start Entrance Gate (+Z) */}
      <group position={[0, 1.5, 248]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[12.2, 0.3, 0.4]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[-5.8, 0, 0]}>
          <boxGeometry args={[0.25, 3.6, 0.3]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
        <mesh position={[5.8, 0, 0]}>
          <boxGeometry args={[0.25, 3.6, 0.3]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      </group>

      {/* Exit Jump-Off Ledge (-Z) */}
      <group position={[0, 0, -250]}>
        {/* Glowing Amber Jump Off Warning Edge */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[12, 0.12, 0.5]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
        {/* Overhead Jump Indicator Arch */}
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[12.2, 0.3, 0.4]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[-5.8, 0, 0]}>
            <boxGeometry args={[0.25, 3.6, 0.3]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
          <mesh position={[5.8, 0, 0]}>
            <boxGeometry args={[0.25, 3.6, 0.3]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
