import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Preload the officer PNG
try {
  useTexture.preload('/images/police.png');
} catch (e) {
  // Preload fallback
}

/**
 * PoliceCharacter Component
 * Replaces the old 3D procedural police with the high-resolution 2D Subway Surfers Police Inspector cutout.
 * Features:
 * - Transparent PNG sprite (/images/police.png) with true 0.587 aspect ratio
 * - Smooth lerp tracking behind the player across lanes, train roofs, and skyways
 * - Rhythmic running/bobbing animation and ground shadow
 * - Appears exclusively during the 5-second collision chase state
 */
export default function PoliceCharacter({
  playerRef,
  initialPosition = [0, 0, 7],
  followSpeed = 4,
  active = true,
  distanceBehind = 3.5
}) {
  const policeRef = useRef();
  const spriteMeshRef = useRef();
  const shadowRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...initialPosition));

  // Load transparent police officer texture
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/police.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (!policeRef.current) return;
    const time = state.clock.getElapsedTime();

    if (active && playerRef?.current) {
      // Get player position across lanes and vertical surfaces
      let px = 0;
      let py = 0;
      let pz = 0;

      if (
        playerRef.current.position.x !== 0 ||
        playerRef.current.position.y !== 0 ||
        playerRef.current.position.z !== 0
      ) {
        px = playerRef.current.position.x;
        py = playerRef.current.position.y;
        pz = playerRef.current.position.z;
      } else {
        const playerPos = new THREE.Vector3();
        const targetObj = playerRef.current.children?.[0] || playerRef.current;
        targetObj.getWorldPosition(playerPos);
        px = playerPos.x;
        py = playerPos.y;
        pz = playerPos.z;
      }

      // Target position: right behind the player in Z, clamped to track surface
      const surfaceY = py >= 7.0 ? 8.65 : py >= 2.5 ? 3.2 : 0;
      const target = new THREE.Vector3(px, surfaceY, pz + distanceBehind);

      // Smooth follow pursuit lerp
      currentPos.current.lerp(target, Math.min(1, followSpeed * delta));
      policeRef.current.position.copy(currentPos.current);
      policeRef.current.visible = true;

      // Dynamic heading: calculate angle directly towards the hero
      const dx = px - currentPos.current.x;
      const dz = pz - currentPos.current.z;
      const turnAngle = Math.atan2(-dx, -dz);

      // Energetic forward sprint running bobbing and forward lean
      const bobY = Math.abs(Math.sin(time * 16)) * 0.14;
      const swayZ = Math.sin(time * 8) * 0.05;

      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = 1.6 + bobY;
        // Officer leans into forward sprint (-0.16) and faces directly towards the hero (Math.PI + turnAngle)
        spriteMeshRef.current.rotation.set(-0.16, Math.PI + turnAngle, swayZ);
      }

      // Ground shadow tracking
      if (shadowRef.current) {
        shadowRef.current.position.y = 0.03;
        shadowRef.current.scale.setScalar(0.95 + Math.sin(time * 15) * 0.08);
      }
    } else {
      // Smoothly fall back into distance and hide when chase expires
      currentPos.current.z += delta * 14;
      policeRef.current.position.copy(currentPos.current);
      if (currentPos.current.z > 14) {
        policeRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={policeRef} position={initialPosition} visible={active}>
      {/* Dynamic Ground Shadow */}
      <mesh ref={shadowRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Indian Police Officer 2D Billboard Sprite - Facing opposite to screen */}
      <mesh ref={spriteMeshRef} position={[0, 1.6, 0]} rotation={[-0.14, Math.PI, 0]}>
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
