import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Stylized Animated Inspector Model
function ProceduralInspector({ time = 0 }) {
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();

  useFrame(() => {
    const angle = Math.sin(time * 16) * 0.8;
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = angle;
      rightLegRef.current.rotation.x = -angle;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -angle * 0.9;
      rightArmRef.current.rotation.x = angle * 0.9;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(time * 16)) * 0.12;
      bodyRef.current.rotation.z = Math.sin(time * 8) * 0.05;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Torso - Navy Blue Officer Uniform */}
      <group position={[0, 1.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.76, 0.75, 0.52]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
        {/* Gold Buttons */}
        <mesh position={[0, 0.18, -0.27]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.02, -0.27]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
        {/* Gold Officer Badge */}
        <mesh position={[0.22, 0.18, -0.27]}>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
        {/* Black Duty Belt */}
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.78, 0.12, 0.54]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Head with Moustache & Police Visor Hat */}
      <group position={[0, 1.88, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#fcd5b4" roughness={0.7} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0, -0.3]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
        {/* Bushy Moustache */}
        <mesh position={[0, -0.08, -0.28]}>
          <boxGeometry args={[0.24, 0.07, 0.06]} />
          <meshStandardMaterial color="#3f2e21" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.08, -0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.1, 0.08, -0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* Visor Hat */}
        <group position={[0, 0.22, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.34, 0.32, 0.18, 16]} />
            <meshStandardMaterial color="#172554" />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
          {/* Black Visor Brim pointing towards player (-Z) */}
          <mesh position={[0, -0.06, -0.24]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[0.42, 0.03, 0.26]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Arms with Police Baton */}
      <group ref={leftArmRef} position={[-0.45, 1.45, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.45, 1.45, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        {/* Swinging Baton */}
        <mesh position={[0, -0.65, -0.15]} rotation={[0.8, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.65, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      </group>

      {/* Running Legs */}
      <group ref={leftLegRef} position={[-0.22, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.22, 0.8, 0.24]} />
          <meshStandardMaterial color="#172554" />
        </mesh>
        <mesh position={[0, -0.78, -0.08]} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.22, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.22, 0.8, 0.24]} />
          <meshStandardMaterial color="#172554" />
        </mesh>
        <mesh position={[0, -0.78, -0.08]} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
}

// Stylized Animated Police Dog
function ProceduralDog({ time = 0 }) {
  const dogRef = useRef();

  useFrame(() => {
    if (dogRef.current) {
      dogRef.current.position.y = Math.abs(Math.sin(time * 18)) * 0.1;
      dogRef.current.rotation.z = Math.sin(time * 9) * 0.05;
    }
  });

  return (
    <group ref={dogRef} scale={0.7}>
      {/* Dog Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.4, 0.68]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Spiked Collar */}
      <mesh position={[0, 0.52, -0.28]}>
        <boxGeometry args={[0.38, 0.1, 0.14]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, -0.45]} castShadow>
        <boxGeometry args={[0.36, 0.35, 0.38]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.56, -0.66]}>
        <boxGeometry args={[0.24, 0.2, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

export default function PoliceChase({ active = false, playerRef }) {
  const policeGroupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 8));

  useFrame((state, delta) => {
    if (!policeGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (active && playerRef?.current) {
      // Player current position
      const playerPos = playerRef.current.position;

      // Chase target position right behind the hero (Z + 2.5)
      const targetPos = new THREE.Vector3(
        playerPos.x,
        playerPos.y,
        playerPos.z + 2.5
      );

      // Smoothly sprint up to the hero
      currentPos.current.lerp(targetPos, Math.min(delta * 6, 1));
      policeGroupRef.current.position.copy(currentPos.current);
      policeGroupRef.current.visible = true;
    } else {
      // Fall back into distance and hide when chase ends
      currentPos.current.z += delta * 12;
      policeGroupRef.current.position.copy(currentPos.current);
      if (currentPos.current.z > 14) {
        policeGroupRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={policeGroupRef} position={[0, 0, 8]} visible={false}>
      {/* Police Inspector Officer */}
      <ProceduralInspector time={performance.now() * 0.001} />
      {/* Police Dog Running on the right side */}
      <group position={[0.85, 0, 0.5]}>
        <ProceduralDog time={performance.now() * 0.001} />
      </group>
    </group>
  );
}
