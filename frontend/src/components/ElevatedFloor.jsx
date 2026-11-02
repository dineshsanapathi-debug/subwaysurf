import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural 3D Fluffy White Cartoon Cloud
 */
function FluffyCloud({ position = [0, 0, 0], scale = 1.0 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-1.3, -0.3, 0]}>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, -0.2, 0.2]}>
        <sphereGeometry args={[1.4, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.6, -0.2]}>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.7, 0.5, 0.3]}>
        <sphereGeometry args={[1.1, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Upper Skyway Route (Activated EXCLUSIVELY by touching the Rocket)
 * High-altitude, 100% open, clear 3-lane cosmic highway:
 * - Elevated high in the sky (Y = 8.5m)
 * - Zero buildings, zero walls, zero arches, zero obstacles
 * - Fluffy white 3D cartoon clouds drifting in the open sky
 * - Glowing cyan boundary rails and lane dividers
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

    if (floorGroupRef.current) {
      floorGroupRef.current.position.z = -250 + currentDist;
    }

    if (currentDist >= 500 && !completed.current) {
      completed.current = true;
      onComplete?.();
    }
  });

  // Procedural clouds along the skyway
  const clouds = useMemo(() => {
    const list = [];
    for (let i = 0; i < 24; i++) {
      const z = -240 + i * 20;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (9.5 + (i % 3) * 3.5);
      const y = -1.2 + Math.sin(i * 1.5) * 1.8;
      const scale = 0.8 + (i % 4) * 0.35;
      list.push({ id: i, x, y, z, scale });
    }
    return list;
  }, []);

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

      {/* 5. Fluffy 3D Cartoon Clouds floating in the open sky beside the runway */}
      {clouds.map((c) => (
        <FluffyCloud
          key={c.id}
          position={[c.x, c.y, c.z]}
          scale={c.scale}
        />
      ))}

      {/* 6. Glowing Start & Exit Checkpoint Flat Floor Ledges (Zero Arches/Pillars) */}
      {/* Start Entrance Floor Ledge */}
      <mesh position={[0, 0.17, 249]}>
        <boxGeometry args={[11.8, 0.04, 1.2]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.0} />
      </mesh>

      {/* Exit Jump-Off Edge (-Z) - Glowing Amber Warning Line */}
      <mesh position={[0, 0.17, -249]}>
        <boxGeometry args={[11.8, 0.04, 1.2]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}
