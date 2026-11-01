import React from 'react';

export default function Train({
  position = [0, 0, 0],
  length = 18,
  color = '#2563eb',
  hasRamp = true,
  isCargo = false,
  isMoving = false
}) {
  const trainHeight = 3.3;
  const trainWidth = 2.4;

  // Render Red Cargo Shipping Container Train Car (matching center lane in screenshot)
  if (isCargo || color === '#dc2626') {
    return (
      <group position={position}>
        {/* Main Red Cargo Box */}
        <mesh position={[0, trainHeight / 2 + 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[trainWidth, trainHeight, length]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>

        {/* Vertical Corrugated Ribs along Container Sides */}
        {[-7, -5, -3, -1, 1, 3, 5, 7].map((zRib, idx) => (
          <React.Fragment key={idx}>
            {/* Left ribs */}
            <mesh position={[-trainWidth / 2 - 0.04, trainHeight / 2 + 0.1, zRib]} castShadow>
              <boxGeometry args={[0.08, trainHeight * 0.9, 0.5]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.3} />
            </mesh>
            {/* Right ribs */}
            <mesh position={[trainWidth / 2 + 0.04, trainHeight / 2 + 0.1, zRib]} castShadow>
              <boxGeometry args={[0.08, trainHeight * 0.9, 0.5]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.3} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Container Corner Castings (Industrial steel blocks) */}
        {[-length / 2 + 0.2, length / 2 - 0.2].map((zCorner, ci) => (
          <group key={ci} position={[0, 0, zCorner]}>
            <mesh position={[-trainWidth / 2 + 0.1, trainHeight + 0.05, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[trainWidth / 2 - 0.1, trainHeight + 0.05, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Rear Face Facing Player with Rear Lights and Bumper */}
        <group position={[0, 0, length / 2]}>
          {/* Bumper with Yellow/Black stripes */}
          <mesh position={[0, 0.45, 0.1]}>
            <boxGeometry args={[trainWidth - 0.1, 0.4, 0.15]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>
          {/* Rear Warning Red Lights */}
          <mesh position={[-0.7, 0.45, 0.2]}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.7, 0.45, 0.2]}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Jump Ramp on the front bumper if enabled */}
        {hasRamp && (
          <group position={[0, 0, length / 2 + 1.2]}>
            <mesh position={[0, 0.8, 0]} rotation={[0.42, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[2.0, 0.22, 2.8]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
            {/* Caution hazard stripes */}
            <mesh position={[0, 0.94, 0]} rotation={[0.42, 0, 0]}>
              <planeGeometry args={[1.8, 0.4]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // Classic Blue & Silver Rounded Commuter Subway Train (matching right lane in screenshot)
  return (
    <group position={position}>
      {/* Lower Train Chassis (Vibrant Electric Blue) */}
      <mesh position={[0, trainHeight * 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[trainWidth, trainHeight * 0.75, length]} />
        <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.15} />
      </mesh>

      {/* Rounded Silver/White Train Roof */}
      <mesh position={[0, trainHeight * 0.92, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[trainWidth * 0.52, trainWidth * 0.52, length - 0.2, 24, 1, false, 0, Math.PI]}
          rotation={[0, 0, -Math.PI / 2]}
        />
        <meshStandardMaterial color="#f1f5f9" roughness={0.25} metalness={0.3} />
      </mesh>

      {/* Rear Face (Facing Player at length/2) */}
      <group position={[0, 0, length / 2 + 0.02]}>
        {/* Blue Rear Plate */}
        <mesh position={[0, trainHeight * 0.55, 0]}>
          <planeGeometry args={[trainWidth - 0.1, trainHeight * 0.85]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        {/* Rear Windows (Like in screenshot) */}
        <mesh position={[-0.55, trainHeight * 0.62, 0.02]}>
          <planeGeometry args={[0.55, 0.85]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
        <mesh position={[0.55, trainHeight * 0.62, 0.02]}>
          <planeGeometry args={[0.55, 0.85]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
        {/* Rear Glowing Red Marker Lights */}
        <mesh position={[-0.75, 0.55, 0.03]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.75, 0.55, 0.03]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Yellow Bumper Bar */}
        <mesh position={[0, 0.45, 0.04]}>
          <boxGeometry args={[trainWidth - 0.2, 0.25, 0.1]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      {/* Side Passenger Windows */}
      {[-6, -3, 0, 3, 6].map((zWin, idx) => (
        <React.Fragment key={idx}>
          {/* Left Windows */}
          <mesh position={[-trainWidth / 2 - 0.02, trainHeight * 0.65, zWin]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.5, 0.85]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.4} />
          </mesh>
          {/* Right Windows */}
          <mesh position={[trainWidth / 2 + 0.02, trainHeight * 0.65, zWin]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.5, 0.85]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.4} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Jump Ramp on the front bumper if enabled */}
      {hasRamp && (
        <group position={[0, 0, length / 2 + 1.2]}>
          <mesh position={[0, 0.8, 0]} rotation={[0.42, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[2.0, 0.22, 2.8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
          {/* Caution hazard stripes */}
          <mesh position={[0, 0.94, 0]} rotation={[0.42, 0, 0]}>
            <planeGeometry args={[1.8, 0.4]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* Steel Undercarriage & Wheels */}
      {[-5, 0, 5].map((zWheel, i) => (
        <group key={i} position={[0, 0.35, zWheel]}>
          <mesh position={[-trainWidth / 2 + 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[trainWidth / 2 - 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
