import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Blue Passenger Coach (ICF / Utkrisht Livery)
 * Built with full 3D geometry: blue body, light blue stripe, curved silver roof,
 * barred passenger windows on both sides, steel bogies, and inter-coach gangways.
 */
export function Coach({ z = 0, coachIndex = 0 }) {
  return (
    <group position={[0, 0, z]}>
      {/* 1. Main Blue Passenger Coach Body */}
      <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.5, 6.8]} />
        <meshStandardMaterial color="#0755a5" roughness={0.65} metalness={0.15} />
      </mesh>

      {/* 2. Light Blue Accent Livery Stripe below windows */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.82, 0.22, 6.82]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.4} />
      </mesh>

      {/* 3. Coach Curved / Beveled Silver Roof */}
      <mesh position={[0, 2.95, 0]} receiveShadow>
        <boxGeometry args={[2.88, 0.18, 6.9]} />
        <meshStandardMaterial color="#d9e3ed" roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Roof Walkway Strip for Player Running */}
      <mesh position={[0, 3.06, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.05, 6.8]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* 4. Windows on Both Flanks (5 windows per side) */}
      {Array.from({ length: 5 }, (_, i) => {
        const windowZ = -2.4 + i * 1.2;
        return (
          <React.Fragment key={i}>
            {/* Left flank window */}
            <mesh position={[-1.41, 1.95, windowZ]}>
              <boxGeometry args={[0.035, 0.75, 0.75]} />
              <meshStandardMaterial color="#172b42" metalness={0.35} roughness={0.3} />
            </mesh>
            {/* Window safety grille / bar */}
            <mesh position={[-1.42, 1.95, windowZ]}>
              <boxGeometry args={[0.02, 0.04, 0.7]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>

            {/* Right flank window */}
            <mesh position={[1.41, 1.95, windowZ]}>
              <boxGeometry args={[0.035, 0.75, 0.75]} />
              <meshStandardMaterial color="#172b42" metalness={0.35} roughness={0.3} />
            </mesh>
            {/* Window safety grille / bar */}
            <mesh position={[1.42, 1.95, windowZ]}>
              <boxGeometry args={[0.02, 0.04, 0.7]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* 5. Coach Wheel Bogies */}
      {[-2.2, 2.2].map((zPos, bIdx) => (
        <group key={bIdx} position={[0, 0, zPos]}>
          {/* Bogie Frame */}
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[2.4, 0.15, 1.8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Steel Wheels */}
          {[-1.05, 1.05].map((xPos) =>
            [-0.5, 0.5].map((wZ, wIdx) => (
              <mesh
                key={`${xPos}-${wIdx}`}
                position={[xPos, 0.48, wZ]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
                <meshStandardMaterial color="#252525" metalness={0.65} roughness={0.4} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* 6. Inter-Coach Flexible Gangway / Vestibule Accordion Bellows */}
      <mesh position={[0, 1.8, 3.5]}>
        <boxGeometry args={[1.6, 2.1, 0.35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Indian Railways WAP-4 Electric Locomotive
 * Built from 3D shapes matching the uploaded photograph:
 * - Red locomotive body (#d71932)
 * - Yellow / cream horizontal safety stripe (#ffdf65)
 * - Grey lower chassis (#8d969d)
 * - Front beveled nose & dual tinted windshields (#142c43)
 * - Dual high-beam forehead headlights + lower marker headlights
 * - Indian Railways cowcatcher with hazard chevrons
 * - Rooftop high-voltage electric pantograph
 * - Heavy-duty Co-Co wheel bogies
 * - Optional front jump ramp for roof running
 */
export function Locomotive({ hasRamp = true }) {
  return (
    <group>
      {/* 1. Red Locomotive Body */}
      <mesh position={[0, 1.85, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[2.95, 2.6, 6.2]} />
        <meshStandardMaterial color="#d71932" roughness={0.45} metalness={0.15} />
      </mesh>

      {/* 2. Yellow / Cream Safety Stripe running along the locomotive */}
      <mesh position={[0, 1.45, -0.6]}>
        <boxGeometry args={[2.98, 0.22, 6.23]} />
        <meshStandardMaterial color="#ffdf65" roughness={0.3} />
      </mesh>

      {/* 3. Grey Lower Chassis Beam */}
      <mesh position={[0, 0.72, -0.6]}>
        <boxGeometry args={[3.05, 0.55, 6.4]} />
        <meshStandardMaterial color="#8d969d" metalness={0.55} roughness={0.5} />
      </mesh>

      {/* 4. Front Beveled Nose Section Facing the Player (+Z) */}
      <mesh position={[0, 1.45, 2.55]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[2.92, 1.8, 0.55]} />
        <meshStandardMaterial color="#e51d37" roughness={0.4} />
      </mesh>

      {/* 5. Dual Front Windshields with Rubber Beading */}
      {[-0.72, 0.72].map((x, idx) => (
        <group key={idx} position={[x, 2.35, 2.84]}>
          <mesh>
            <boxGeometry args={[1.05, 0.85, 0.06]} />
            <meshStandardMaterial
              color="#142c43"
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
          {/* Black Windshield Wiper */}
          <mesh position={[0, -0.2, 0.04]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.04, 0.45, 0.02]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}

      {/* Front Yellow Safety Band */}
      <mesh position={[0, 1.35, 2.86]}>
        <boxGeometry args={[2.8, 0.16, 0.05]} />
        <meshStandardMaterial color="#ffe16b" />
      </mesh>

      {/* 6. High-Beam Forehead Twin Headlights (Upper Cab) */}
      <group position={[0, 2.95, 2.7]}>
        <mesh position={[-0.22, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#fef08a"
            emissiveIntensity={1.8}
          />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#fef08a"
            emissiveIntensity={1.8}
          />
        </mesh>
        {/* Soft Forward Track Light */}
        <pointLight position={[0, 0, 0.8]} color="#fef08a" intensity={1.5} distance={12} />
      </group>

      {/* Lower Marker Headlights */}
      {[-1, 1].map((x, idx) => (
        <mesh key={idx} position={[x, 1.05, 2.88]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#fff4bd"
            emissive="#fff0a0"
            emissiveIntensity={1.3}
          />
        </mesh>
      ))}

      {/* 7. Heavy-Duty Front Bumper & Twin Buffers */}
      <mesh position={[0, 0.45, 2.92]}>
        <boxGeometry args={[2.85, 0.3, 0.35]} />
        <meshStandardMaterial color="#34383b" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.9, 0.9].map((bx, bIdx) => (
        <mesh key={bIdx} position={[bx, 0.45, 3.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.18, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}

      {/* 8. Indian Railways Cowcatcher / Cattle Guard with Yellow Hazard Slashing */}
      <group position={[0, 0.25, 2.98]}>
        <mesh>
          <boxGeometry args={[2.7, 0.32, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((hx, hIdx) => (
          <mesh key={hIdx} position={[hx, 0, 0.09]}>
            <planeGeometry args={[0.18, 0.28]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
      </group>

      {/* 9. Rooftop Walkway Strip & WAP-4 Electric Pantograph */}
      <mesh position={[0, 3.18, -0.6]} receiveShadow>
        <boxGeometry args={[1.5, 0.06, 6.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      {/* High-voltage roof pantograph */}
      <group position={[0, 3.22, -1.2]}>
        {/* Base insulators */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.3, 0.08, 1.1]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.8} />
        </mesh>
        {/* Diamond Scissor Arm */}
        <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
          <meshStandardMaterial color="#f97316" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
          <meshStandardMaterial color="#f97316" metalness={0.7} />
        </mesh>
        {/* Top catenary collector bar */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.18]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
      </group>

      {/* 10. Front Jump Ramp (if enabled) */}
      {hasRamp && (
        <group position={[0, 0, 3.9]}>
          <mesh position={[0, 0.72, 0]} rotation={[0.42, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[2.4, 0.2, 2.5]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          {/* Chevron hazard striping on ramp face */}
          <mesh position={[0, 0.85, 0]} rotation={[0.42, 0, 0]}>
            <planeGeometry args={[2.1, 0.4]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* 11. Locomotive Wheels (Co-Co Heavy Bogies) */}
      {[-2.5, -0.6, 1.2].map((zPos, idx) => (
        <group key={idx} position={[0, 0, zPos]}>
          {[-1.12, 1.12].map((xPos) => (
            <mesh
              key={`${xPos}-${idx}`}
              position={[xPos, 0.55, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.46, 0.46, 0.22, 18]} />
              <meshStandardMaterial color="#242424" metalness={0.65} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * IndianTrain Main Component
 * Renders a full Indian Railways train rake:
 * Red WAP-4 Electric Locomotive at the front (+Z facing the runner)
 * followed by 3 Blue ICF Passenger Coaches trailing behind (-Z).
 *
 * Supports:
 * - Direct GameEngine obstacle synchronization: `position={[obs.x, obs.y, obs.z]}`
 * - Standalone autonomous running: `laneX`, `startZ`, `speed`, `resetZ`, `onReset`
 */
export default function IndianTrain({
  position,
  laneX = 0,
  startZ = -100,
  speed = 18,
  resetZ = -120,
  onReset,
  length = 28,
  hasRamp = true,
  isMoving = false,
  obstacleRef
}) {
  const trainRef = useRef();

  // Autonomous animation when used in standalone mode without an external position prop
  useFrame((_, delta) => {
    if (!trainRef.current) return;
    if (position === undefined && isMoving) {
      trainRef.current.position.z += speed * delta;
      // Recycle the train after it passes the player.
      if (trainRef.current.position.z > 25) {
        trainRef.current.position.z = resetZ;
        onReset?.();
      }
    }
  });

  const finalPos = position || [laneX, 0, startZ];

  /**
   * Train Rake Geometry Layout:
   * Total rake length = 28m
   * - Front of Locomotive (+bumper): local Z = +14m (+length / 2)
   * - Locomotive center: local Z = +10.5m
   * - Coach 1 center: local Z = +3.5m
   * - Coach 2 center: local Z = -3.5m
   * - Coach 3 center: local Z = -10.5m
   * - Rear of Coach 3: local Z = -14m (-length / 2)
   * This aligns the 3D model with GameEngine's [z - halfL, z + halfL] collision box!
   */
  return (
    <group ref={obstacleRef || trainRef} position={finalPos}>
      {/* Front Red WAP-4 Electric Locomotive */}
      <group position={[0, 0, 10.5]}>
        <Locomotive hasRamp={hasRamp} />
      </group>

      {/* Trailing Blue Passenger Coaches (ICF Livery) */}
      <Coach z={3.5} coachIndex={1} />
      <Coach z={-3.5} coachIndex={2} />
      <Coach z={-10.5} coachIndex={3} />
    </group>
  );
}

