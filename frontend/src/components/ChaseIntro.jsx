import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subway Surfers Police Inspector Cutout Sprite
function StylizedPoliceInspector() {
  const meshRef = useRef();
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load('/images/police.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const runTime = state.clock.getElapsedTime();
    const bobY = Math.abs(Math.sin(runTime * 16)) * 0.14;
    const swayZ = Math.sin(runTime * 8) * 0.05;
    meshRef.current.position.y = 1.6 + bobY;
    meshRef.current.rotation.z = swayZ;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Ground Shadow */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 0.85]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>
      {/* Indian Police Officer Cutout Sprite - Facing opposite to screen (running down the track in hot pursuit) */}
      <mesh ref={meshRef} position={[0, 1.6, 0]} rotation={[-0.14, Math.PI, 0]}>
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

// Procedural 3D Subway Surfers Police Dog
function StylizedPoliceDog() {
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const tailRef = useRef();

  useFrame((state) => {
    const runTime = state.clock.getElapsedTime();
    const angle = Math.sin(runTime * 18) * 0.65;
    if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = angle;
    if (frontRightLeg.current) frontRightLeg.current.rotation.x = -angle;
    if (backLeftLeg.current) backLeftLeg.current.rotation.x = -angle;
    if (backRightLeg.current) backRightLeg.current.rotation.x = angle;
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(runTime * 24) * 0.5;
  });

  return (
    <group scale={[0.7, 0.7, 0.7]} position={[0, 0.35, 0]}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.42, 0.45, 0.85]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.55, -0.45]}>
        <mesh castShadow>
          <boxGeometry args={[0.38, 0.35, 0.45]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -0.06, -0.28]} castShadow>
          <boxGeometry args={[0.26, 0.22, 0.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Black Nose */}
        <mesh position={[0, 0.04, -0.41]}>
          <boxGeometry args={[0.1, 0.07, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Panting Pink Tongue */}
        <mesh position={[0.04, -0.16, -0.26]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.09, 0.16, 0.03]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.12, 0.08, -0.22]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.12, 0.08, -0.22]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Floppy Dog Ears */}
        <mesh position={[-0.22, 0.14, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.08, 0.25, 0.18]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.22, 0.14, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.08, 0.25, 0.18]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Spiked Police Collar */}
        <mesh position={[0, -0.16, 0.15]}>
          <boxGeometry args={[0.42, 0.1, 0.42]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={frontLeftLeg} position={[-0.18, 0.05, -0.25]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>
      <group ref={frontRightLeg} position={[0.18, 0.05, -0.25]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>
      <group ref={backLeftLeg} position={[-0.18, 0.05, 0.25]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>
      <group ref={backRightLeg} position={[0.18, 0.05, 0.25]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>

      {/* Wagging Tail */}
      <group ref={tailRef} position={[0, 0.38, 0.42]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.35, 6]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>
    </group>
  );
}

// Graffiti Wall Section for Intro Scene
function GraffitiWall() {
  return (
    <group position={[-2.4, 1.8, 0.8]}>
      {/* Brick/Concrete Subway Wall */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.2, 4.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Graffiti Art Plane */}
      <mesh position={[0.11, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.8, 2.2]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.12, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.2]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export default function ChaseIntro({
  onComplete,
  onSkip,
  characterName = 'Bhargav',
  playerRef = null,
  engine = null
}) {
  const policeRef = useRef();
  const dogRef = useRef();
  const wallRef = useRef();
  const elapsed = useRef(0);
  const completed = useRef(false);

  useEffect(() => {
    elapsed.current = 0;
    completed.current = false;
    return () => {
      if (playerRef?.current) {
        playerRef.current.position.set(0, 0, 0);
        playerRef.current.rotation.set(0, 0, 0);
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (completed.current) return;
    elapsed.current += delta;
    const t = elapsed.current;

    // Toggle wall visibility without triggering React re-renders
    if (wallRef.current) {
      wallRef.current.visible = (t < 2.0);
    }

    // Dynamic Hero running movement during the chase sequence
    if (playerRef?.current) {
      if (t < 1.3) {
        // Hero caught spray-painting near graffiti wall
        playerRef.current.position.x = -1.0;
        playerRef.current.position.y = 0;
        playerRef.current.position.z = 0.4;
        playerRef.current.rotation.y = Math.PI * 0.42; // Facing the wall
      } else {
        // Hero turns forward and sprints down the tracks away from the police!
        playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, 0, delta * 7);
        playerRef.current.position.z = THREE.MathUtils.lerp(playerRef.current.position.z, -0.6, delta * 5);
        playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, 0, delta * 9);
      }
    }

    // Scroll tracks during chase sprint (t >= 1.3s)
    if (t >= 1.3 && engine?.chunks) {
      const moveDist = delta * 20;
      for (const chunk of engine.chunks) {
        chunk.z += moveDist;
        if (chunk.z > 100) {
          const minZ = Math.min(...engine.chunks.map((c) => c.z));
          chunk.z = minZ - 100;
        }
      }
    }

    // Dynamic Police Inspector & Dog chase movement and heading towards the hero
    const heroTargetX = playerRef?.current ? playerRef.current.position.x : 0;
    const heroTargetZ = playerRef?.current ? playerRef.current.position.z : -0.6;

    if (policeRef.current) {
      if (t < 1.3) {
        // Emerging and spotting the hero at the graffiti wall
        policeRef.current.position.z = 4.2 - t * 0.5;
        policeRef.current.position.x = 0.3;
      } else {
        // Chasing in hot pursuit behind the player down the tracks
        policeRef.current.position.z = 3.6 - (t - 1.3) * 0.42;
        policeRef.current.position.x = Math.sin(t * 3) * 0.2;
      }

      // Calculate dynamic heading directly to the hero
      const dx = heroTargetX - policeRef.current.position.x;
      const dz = heroTargetZ - policeRef.current.position.z;
      const heading = Math.atan2(-dx, -dz);
      policeRef.current.rotation.y = THREE.MathUtils.lerp(policeRef.current.rotation.y, heading, delta * 14);
    }

    if (dogRef.current) {
      if (t < 1.3) {
        dogRef.current.position.z = 5.0 - t * 0.4;
        dogRef.current.position.x = 1.1;
      } else {
        dogRef.current.position.z = 4.5 - (t - 1.3) * 0.42;
        dogRef.current.position.x = 0.95 + Math.sin(t * 4) * 0.15;
      }

      // Dog also tracks and faces directly towards the hero
      const ddx = heroTargetX - dogRef.current.position.x;
      const ddz = heroTargetZ - dogRef.current.position.z;
      const dogHeading = Math.atan2(ddx, -ddz);
      dogRef.current.rotation.y = THREE.MathUtils.lerp(dogRef.current.rotation.y, dogHeading, delta * 14);
    }

    // Dynamic Cinematic Camera Sequence (0s to 5s)
    if (t < 1.3) {
      // Close-up angle: player caught spraying graffiti
      state.camera.position.x = -1.2;
      state.camera.position.y = 2.4;
      state.camera.position.z = 2.6;
      state.camera.lookAt(-0.8, 1.4, 0.2);
    } else {
      // Sweeping dramatic chase camera moving behind the police chase
      const chaseProgress = (t - 1.3) / 3.7; // 0 to 1
      const camY = THREE.MathUtils.lerp(3.2, 4.8, chaseProgress);
      const camZ = THREE.MathUtils.lerp(5.2, 7.0, chaseProgress);
      state.camera.position.x = Math.sin(t * 2) * 0.18;
      state.camera.position.y = camY + Math.sin(t * 8) * 0.05;
      state.camera.position.z = camZ;
      state.camera.lookAt(0, 1.6, -10);
    }

    // After 5 seconds, finish intro and begin endless running!
    if (t >= 5.0 && !completed.current) {
      completed.current = true;
      if (playerRef?.current) {
        playerRef.current.position.set(0, 0, 0);
        playerRef.current.rotation.set(0, 0, 0);
      }
      if (onComplete) onComplete();
    }
  });

  return (
    <group>
      {/* Graffiti Subway Wall during opening (toggled via ref without state updates) */}
      <group ref={wallRef}>
        <GraffitiWall />
      </group>

      {/* Police Inspector */}
      <group ref={policeRef} position={[0, 0, 3.8]}>
        <StylizedPoliceInspector />
      </group>

      {/* Police Dog */}
      <group ref={dogRef} position={[0.95, 0, 4.6]}>
        <StylizedPoliceDog />
      </group>
    </group>
  );
}

