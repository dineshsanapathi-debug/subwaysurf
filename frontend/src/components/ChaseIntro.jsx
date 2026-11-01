import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural 3D Subway Surfers Police Inspector
function StylizedPoliceInspector({ runTime = 0 }) {
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();

  useFrame(() => {
    const angle = Math.sin(runTime * 14) * 0.75;
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = angle;
      rightLegRef.current.rotation.x = -angle;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -angle * 0.9;
      rightArmRef.current.rotation.x = angle * 0.9;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(runTime * 14)) * 0.12;
      bodyRef.current.rotation.z = Math.sin(runTime * 7) * 0.04;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Inspector Torso - Plump Navy Blue Uniform */}
      <group position={[0, 1.25, 0]}>
        {/* Uniform Coat */}
        <mesh castShadow>
          <boxGeometry args={[0.76, 0.75, 0.52]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
        {/* Gold Uniform Buttons */}
        <mesh position={[0, 0.18, 0.27]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0.27]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.14, 0.27]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gold Officer Shield Badge */}
        <mesh position={[-0.22, 0.18, 0.27]}>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Black Duty Belt with Gold Buckle */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <boxGeometry args={[0.78, 0.12, 0.54]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.32, 0.28]}>
          <boxGeometry args={[0.14, 0.1, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
        {/* Police Walkie Talkie on Belt */}
        <mesh position={[0.36, -0.22, 0.15]}>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Head with Moustache & Police Visor Hat */}
      <group position={[0, 1.88, 0]}>
        {/* Chubby Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#fcd5b4" roughness={0.7} />
        </mesh>
        {/* Big Nose */}
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#f87171" roughness={0.6} />
        </mesh>
        {/* Dark Bushy Moustache */}
        <mesh position={[0, -0.08, 0.28]}>
          <boxGeometry args={[0.24, 0.07, 0.06]} />
          <meshStandardMaterial color="#3f2e21" roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.08, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.1, 0.08, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* Navy Police Hat with Visor */}
        <group position={[0, 0.22, -0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.36, 0.32, 0.22, 16]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
          </mesh>
          {/* Black Shiny Visor Brim */}
          <mesh position={[0, -0.08, 0.24]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Gold Hat Badge */}
          <mesh position={[0, 0.04, 0.34]}>
            <circleGeometry args={[0.07, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.48, 1.5, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.2, 0.62, 0.22]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        {/* Hand with Baton */}
        <mesh position={[0, -0.62, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fcd5b4" />
        </mesh>
        {/* Police Baton */}
        <mesh position={[0, -0.62, 0.2]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.55, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.48, 1.5, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.2, 0.62, 0.22]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fcd5b4" />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.2, 0.85, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.26, 0.7, 0.26]} />
          <meshStandardMaterial color="#172554" />
        </mesh>
        {/* Black Boots */}
        <mesh position={[0, -0.72, 0.08]} castShadow>
          <boxGeometry args={[0.28, 0.18, 0.44]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.2, 0.85, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.26, 0.7, 0.26]} />
          <meshStandardMaterial color="#172554" />
        </mesh>
        <mesh position={[0, -0.72, 0.08]} castShadow>
          <boxGeometry args={[0.28, 0.18, 0.44]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// Procedural 3D Subway Surfers Police Dog
function StylizedPoliceDog({ runTime = 0 }) {
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const tailRef = useRef();

  useFrame(() => {
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

export default function ChaseIntro({ onComplete, onSkip, characterName = 'Dinesh' }) {
  const policeRef = useRef();
  const dogRef = useRef();
  const elapsed = useRef(0);
  const completed = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    elapsed.current = 0;
    completed.current = false;
  }, []);

  useFrame((state, delta) => {
    if (completed.current) return;
    elapsed.current += delta;
    const t = elapsed.current;
    setCurrentTime(t);

    // Inspector and Dog movement during the chase
    if (policeRef.current) {
      if (t < 1.3) {
        // Emerging from behind camera/tracks
        policeRef.current.position.z = 4.2 - t * 0.5;
        policeRef.current.position.x = 0.3;
      } else {
        // Chasing in hot pursuit behind the player
        policeRef.current.position.z = 3.6 - (t - 1.3) * 0.45;
        policeRef.current.position.x = Math.sin(t * 3) * 0.2;
      }
    }

    if (dogRef.current) {
      if (t < 1.3) {
        dogRef.current.position.z = 5.0 - t * 0.4;
        dogRef.current.position.x = 1.1;
      } else {
        dogRef.current.position.z = 4.5 - (t - 1.3) * 0.45;
        dogRef.current.position.x = 0.95 + Math.sin(t * 4) * 0.15;
      }
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
      if (onComplete) onComplete();
    }
  });

  return (
    <group>
      {/* Graffiti Subway Wall during opening */}
      {currentTime < 2.0 && <GraffitiWall />}

      {/* Police Inspector */}
      <group ref={policeRef} position={[0, 0, 3.8]}>
        <StylizedPoliceInspector runTime={currentTime} />
      </group>

      {/* Police Dog */}
      <group ref={dogRef} position={[0.95, 0, 4.6]}>
        <StylizedPoliceDog runTime={currentTime} />
      </group>
    </group>
  );
}

