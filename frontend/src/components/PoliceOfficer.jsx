import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getCachedPoliceTexture } from './PoliceCharacter';

/**
 * PoliceOfficer Component
 * Renders the authentic Indian Police Officer cutout image ("Image Boy") during the Subway-style capture sequence.
 * Features:
 * - High-resolution Indian Police Officer cutout (/images/police.png) matching ChaseIntro and PoliceCharacter
 * - Sprints up directly from behind the hero to execute the capture
 * - Smooth running stride bobbing and forward lean
 * - Approaches right up to the hero (Z = heroPosition[2] + 0.75) and secures the catch as progress reaches 1.0
 * - Dynamic ground shadow aligned to track/surface height
 * - NEVER changes to a generic animated/3D police model
 */
export default function PoliceOfficer({ active, progress = 0, heroPosition = [0, 0, 0] }) {
  const officerRef = useRef();
  const spriteRef = useRef();
  const shadowRef = useRef();
  const currentZ = useRef(heroPosition[2] + 5.0);

  // Retrieve cached police officer ("Image Boy") texture
  const texture = useMemo(() => getCachedPoliceTexture(), []);

  useFrame((state, delta) => {
    if (!officerRef.current || !active) return;
    const time = state.clock.getElapsedTime();

    // Smoothly advance officer from behind the hero towards the capture spot
    // At progress = 0: distance is ~4.5m behind; at progress = 1: distance is ~0.75m behind (securing the catch)
    const targetZ = THREE.MathUtils.lerp(heroPosition[2] + 4.5, heroPosition[2] + 0.75, Math.min(1, progress * 1.35));
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, Math.min(1, delta * 8));

    // Follow hero's lane and vertical surface height
    officerRef.current.position.x = heroPosition[0];
    officerRef.current.position.y = heroPosition[1] || 0;
    officerRef.current.position.z = currentZ.current;

    // Direct orientation: Officer faces directly toward the hero while catching
    officerRef.current.lookAt(heroPosition[0], officerRef.current.position.y, heroPosition[2]);

    // Energetic running bobbing during sprint, stabilizing into firm capture stance
    const isSprinting = progress < 0.85;
    const bobY = isSprinting ? Math.abs(Math.sin(time * 18)) * 0.12 : 0;
    const swayZ = isSprinting ? Math.sin(time * 9) * 0.04 : 0;
    const sprintLean = isSprinting ? -0.16 : -0.04;

    if (spriteRef.current) {
      spriteRef.current.position.y = 1.6 + bobY;
      spriteRef.current.rotation.set(sprintLean, 0, swayZ);
    }

    // Dynamic ground shadow under officer's feet
    if (shadowRef.current) {
      shadowRef.current.position.y = 0.03;
      shadowRef.current.scale.setScalar(0.95 + (isSprinting ? Math.sin(time * 16) * 0.08 : 0));
    }
  });

  if (!active) return null;

  return (
    <group ref={officerRef} position={[heroPosition[0], heroPosition[1] || 0, heroPosition[2] + 5.0]}>
      {/* Dynamic Ground Shadow */}
      <mesh ref={shadowRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Indian Police Officer ("Image Boy") Cutout Sprite */}
      <mesh ref={spriteRef} position={[0, 1.6, 0]} rotation={[-0.14, 0, 0]}>
        <planeGeometry args={[2.06, 3.2]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
