import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * PoliceOfficer Component
 * 3D Police Officer for the Subway Surfers-style capture sequence.
 * Features:
 * - Runs up from behind the hero (Z = heroPosition[2] + 5 approaching to + 0.7)
 * - Leans forward while sprinting with running bob
 * - Stretches arms forward to catch and escort the hero as progress approaches 1.0
 * - Follows hero across all 3 lanes and elevated heights
 */
export default function PoliceOfficer({ active, progress = 0, heroPosition = [0, 0, 0] }) {
  const officer = useRef();

  useFrame((_, delta) => {
    if (!officer.current || !active) return;

    // Move the officer from behind the hero towards the hero
    const targetZ = heroPosition[2] + 0.7;
    officer.current.position.z +=
      (targetZ - officer.current.position.z) * Math.min(1, delta * 5);

    // Keep aligned in hero's lane and vertical elevation
    officer.current.position.x = heroPosition[0];

    // Lean forward while running; straighten up at the end
    officer.current.rotation.x = progress < 0.8 ? -0.12 : 0;
    officer.current.position.y = progress < 0.8
      ? (heroPosition[1] || 0) + 0.04 * Math.sin(performance.now() / 80)
      : (heroPosition[1] || 0);
  });

  if (!active) return null;

  return (
    <group
      ref={officer}
      position={[heroPosition[0], heroPosition[1] || 0, heroPosition[2] + 5]}
      scale={1}
    >
      {/* legs */}
      <mesh position={[-0.16, 0.35, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.18]} />
        <meshStandardMaterial color="#172b55" />
      </mesh>
      <mesh position={[0.16, 0.35, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.18]} />
        <meshStandardMaterial color="#172b55" />
      </mesh>

      {/* uniform body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.62, 0.72, 0.32]} />
        <meshStandardMaterial color="#183b78" />
      </mesh>

      {/* arms: reach forward to grab/escort hero when catching up */}
      <mesh
        position={[-0.34, 0.95, progress > 0.6 ? -0.22 : 0]}
        rotation={[progress > 0.6 ? 0.85 : 0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.14, 0.52, 0.14]} />
        <meshStandardMaterial color="#183b78" />
      </mesh>
      <mesh
        position={[0.34, 0.95, progress > 0.6 ? -0.22 : 0]}
        rotation={[progress > 0.6 ? 0.85 : 0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.14, 0.52, 0.14]} />
        <meshStandardMaterial color="#183b78" />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#c98f68" />
      </mesh>

      {/* police cap */}
      <mesh position={[0, 1.68, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.12, 16]} />
        <meshStandardMaterial color="#10264c" />
      </mesh>
      <mesh position={[0, 1.61, 0.13]} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.2]} />
        <meshStandardMaterial color="#10264c" />
      </mesh>

      {/* badge */}
      <mesh position={[0.2, 1.08, 0.17]}>
        <boxGeometry args={[0.1, 0.13, 0.025]} />
        <meshStandardMaterial color="#f4cf55" metalness={0.5} />
      </mesh>
    </group>
  );
}
