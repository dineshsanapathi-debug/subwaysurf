import React from 'react';
import Train from './Train';

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

export default function Obstacles({ obstacles = [] }) {
  return (
    <group>
      {obstacles.map((obs) => {
        if (obs.type === 'train') {
          return (
            <Train
              key={obs.id}
              position={[obs.x, obs.y, obs.z]}
              length={obs.length || 18}
              color={obs.color || '#2563eb'}
              hasRamp={obs.hasRamp}
              isCargo={obs.isCargo || obs.color === '#dc2626'}
              isMoving={obs.isMoving}
            />
          );
        }
        if (obs.type === 'low_barrier') {
          return <LowBarrier key={obs.id} position={[obs.x, obs.y, obs.z]} />;
        }
        if (obs.type === 'high_barrier') {
          return <HighBarrier key={obs.id} position={[obs.x, obs.y, obs.z]} />;
        }
        if (obs.type === 'roadblock') {
          return <Roadblock key={obs.id} position={[obs.x, obs.y, obs.z]} />;
        }
        return null;
      })}
    </group>
  );
}
