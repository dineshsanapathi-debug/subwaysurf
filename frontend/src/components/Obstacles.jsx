import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import IndianTrain from './IndianTrain';

export function LowBarrier({ position = [0, 0, 0] }) {
  // Exact match to the red-and-white striped hurdle in the screenshot
  return (
    <group position={position}>
      {/* Concrete Support Feet */}
      <mesh position={[-0.95, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 0.5]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      <mesh position={[0.95, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 0.5]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Wooden Vertical Posts */}
      <mesh position={[-0.95, 0.55, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#9a3412" roughness={0.7} />
      </mesh>
      <mesh position={[0.95, 0.55, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#9a3412" roughness={0.7} />
      </mesh>

      {/* Main Red & White Striped Crossbar */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.2, 0.45, 0.16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* Alternating White Stripes */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((sx, idx) => (
        <mesh key={idx} position={[sx, 0.75, 0.09]}>
          <planeGeometry args={[0.2, 0.45]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Top Rounded Wooden Cap */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 2.22, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function HighBarrier({ position = [0, 0, 0] }) {
  // Overhead Yellow Girder with "SLIDE" indicator and clearance below
  return (
    <group position={position}>
      {/* Tall Vertical Posts */}
      <mesh position={[-1.05, 1.6, 0]} castShadow>
        <boxGeometry args={[0.18, 3.2, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[1.05, 1.6, 0]} castShadow>
        <boxGeometry args={[0.18, 3.2, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* High Crossbar with Downward Arrow Sign */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[2.3, 0.8, 0.22]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>

      {/* Hazard Yellow & Black Striping */}
      {[-0.8, -0.3, 0.2, 0.7].map((hx, idx) => (
        <mesh key={idx} position={[hx, 2.4, 0.12]} rotation={[0, 0, 0.4]}>
          <planeGeometry args={[0.18, 0.8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );
}

export function Roadblock({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Solid Red/Orange Construction Barricade */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.9, 0.5]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} />
      </mesh>
      {/* Reflective Warning Plate */}
      <mesh position={[0, 0.95, 0.26]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshStandardMaterial color="#fde047" roughness={0.3} />
      </mesh>
      {/* Blinking Hazard Dome Light */}
      <mesh position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.28, 12]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
    </group>
  );
}

export function ElevatedRamp({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* 3-Lane Wide Inclined Cyber Roadway Deck leading up to upper floor */}
      <mesh position={[0, 2.3, 0]} rotation={[0.28, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[11.8, 0.4, 16.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.4} />
      </mesh>

      {/* Surface Grip Floor Panels for 3 Lanes */}
      {[-3.2, 0, 3.2].map((lx) => (
        <mesh key={lx} position={[lx, 2.48, 0]} rotation={[0.28, 0, 0]}>
          <boxGeometry args={[2.8, 0.05, 16.2]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      ))}

      {/* Glowing Neon Cyan Boundary Rails */}
      {[-5.8, 5.8].map((rx) => (
        <mesh key={rx} position={[rx, 2.65, 0]} rotation={[0.28, 0, 0]}>
          <boxGeometry args={[0.2, 0.45, 16.5]} />
          <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2.0} />
        </mesh>
      ))}

      {/* Glowing Neon Green/Cyan Hazard Chevrons pointing UP */}
      {[-6, -2, 2, 6].map((cz, ci) => (
        <mesh key={ci} position={[0, 2.55, cz]} rotation={[-1.29, 0, 0]}>
          <planeGeometry args={[9.5, 0.8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      ))}

      {/* Entrance Cyber Arch at Top of Ramp */}
      <group position={[0, 4.6, -7.5]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[12.2, 0.4, 0.5]} />
          <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-5.9, 0, 0]}>
          <boxGeometry args={[0.3, 3.6, 0.4]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[5.9, 0, 0]}>
          <boxGeometry args={[0.3, 3.6, 0.4]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  );
}

export function SkyLaserGate({ position = [0, 8.65, 0] }) {
  return (
    <group position={position}>
      {/* Side Energy Pylons on edges of runway deck */}
      <mesh position={[-5.8, 1.35, 0]} castShadow>
        <boxGeometry args={[0.3, 2.7, 0.4]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} />
      </mesh>
      <mesh position={[5.8, 1.35, 0]} castShadow>
        <boxGeometry args={[0.3, 2.7, 0.4]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} />
      </mesh>

      {/* Top Cross Truss */}
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[11.8, 0.35, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* Blinking Hazard Beacon Domes */}
      {[-5.8, -2.5, 2.5, 5.8].map((bx, bi) => (
        <mesh key={bi} position={[bx, 2.95, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.2, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* Glowing Pulsing Laser Beam (Clearance below: 1.1m; requires SLIDE to pass under!) */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 11.6, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#f43f5e"
          emissiveIntensity={3.0}
        />
      </mesh>
      {/* Outer energy aura cylinder */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 11.6, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.4} />
      </mesh>

      {/* Downward Slide Indicator Chevron Hologram */}
      <mesh position={[0, 2.2, 0.2]}>
        <planeGeometry args={[1.8, 0.7]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

export function SkyDrone({ position = [0, 8.65, 0] }) {
  return (
    <group position={position}>
      {/* Floating Aerial Cyber Drone Obstacle at Y = 1.35m above runway deck */}
      <group position={[0, 1.35, 0]}>
        {/* Central Core Chassis */}
        <mesh castShadow>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pulsing Red Eye / Scanner Visor */}
        <mesh position={[0, 0, 0.38]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Red Threat Beacon Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.7, 16]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.7} />
        </mesh>

        {/* Rotor Arms */}
        {[-0.65, 0.65].map((rx, ri) => (
          <group key={ri} position={[rx, 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.45, 0.06, 0.08]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Spinning Rotor Disc */}
            <mesh position={[rx > 0 ? 0.2 : -0.2, 0.08, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.02, 12]} />
              <meshBasicMaterial color="#00ccff" transparent opacity={0.65} />
            </mesh>
          </group>
        ))}

        {/* Holographic Warning Forcefield (Must switch lanes to avoid!) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 1.8, 0.3]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.25} wireframe />
        </mesh>
      </group>
    </group>
  );
}

export function OverheadBeam({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Heavy Industrial Overhead Girder at Y = 5.25m over ground tracks */}
      {/* Support Columns on sides */}
      <mesh position={[-6.2, 2.7, 0]} castShadow>
        <boxGeometry args={[0.4, 5.4, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>
      <mesh position={[6.2, 2.7, 0]} castShadow>
        <boxGeometry args={[0.4, 5.4, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>

      {/* Main Low Clearance Crossbeam (Y = 5.25m: hits players standing/jumping on train roof!) */}
      <mesh position={[0, 5.25, 0]} castShadow>
        <boxGeometry args={[12.8, 0.65, 0.6]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} />
      </mesh>

      {/* Hazard Yellow & Black Striping */}
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((sx, idx) => (
        <mesh key={idx} position={[sx, 5.25, 0.32]} rotation={[0, 0, 0.4]}>
          <planeGeometry args={[0.35, 0.65]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}

      {/* Low Clearance Warning Sign */}
      <mesh position={[0, 4.65, 0.35]}>
        <boxGeometry args={[3.6, 0.55, 0.08]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Flashing Hazard Beacon Lights */}
      {[-2.0, 0, 2.0].map((lx, li) => (
        <mesh key={li} position={[lx, 5.7, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.3, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
    </group>
  );
}

function ObstacleItem({ obs }) {
  const itemRef = useRef();

  // 60 FPS frame-perfect obstacle movement directly on GPU via useFrame
  useFrame(() => {
    if (itemRef.current) {
      itemRef.current.position.set(obs.x, obs.y, obs.z);
    }
  });

  return (
    <group ref={itemRef} position={[obs.x, obs.y, obs.z]}>
      {obs.type === 'train' && (
        <IndianTrain
          position={[0, 0, 0]}
          length={obs.length || 28}
          hasRamp={obs.hasRamp}
          isMoving={obs.isMoving}
        />
      )}
      {obs.type === 'elevated_ramp' && <ElevatedRamp position={[0, 0, 0]} />}
      {obs.type === 'low_barrier' && <LowBarrier position={[0, 0, 0]} />}
      {obs.type === 'high_barrier' && <HighBarrier position={[0, 0, 0]} />}
      {obs.type === 'roadblock' && <Roadblock position={[0, 0, 0]} />}
      {obs.type === 'sky_laser_gate' && <SkyLaserGate position={[0, 0, 0]} />}
      {obs.type === 'sky_drone' && <SkyDrone position={[0, 0, 0]} />}
      {obs.type === 'overhead_beam' && <OverheadBeam position={[0, 0, 0]} />}
    </group>
  );
}

export default function Obstacles({ obstacles = [] }) {
  return (
    <group>
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} obs={obs} />
      ))}
    </group>
  );
}
