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
  followSpeed = 4.5,
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

      // Target position: right behind the player in Z
      const target = new THREE.Vector3(px, py, pz + distanceBehind);

      // Smooth follow pursuit lerp
      currentPos.current.lerp(target, Math.min(1, followSpeed * delta));
      policeRef.current.position.copy(currentPos.current);
      policeRef.current.visible = true;

      // Subtle, energetic running bobbing animation
      const bobY = Math.abs(Math.sin(time * 15)) * 0.12;
      const swayZ = Math.sin(time * 7.5) * 0.04;

      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = 1.75 + bobY;
        spriteMeshRef.current.rotation.z = swayZ;
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
        <planeGeometry args={[1.6, 0.85]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Police Officer 2D Billboard Sprite (Aspect Ratio 0.587) */}
      <mesh ref={spriteMeshRef} position={[0, 1.75, 0]}>
        <planeGeometry args={[2.05, 3.5]} />
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
