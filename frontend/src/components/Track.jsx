import React, { useMemo } from 'react';
import * as THREE from 'three';

const TRACK_WIDTH = 11.6;
const CHUNK_LENGTH = 100;
const LANES_X = [-3.2, 0, 3.2];

// Helper to generate dynamic urban graffiti textures on concrete
function createGraffitiTexture(text, style = 'run') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Concrete base with subtle color gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#525d6d');
  grad.addColorStop(0.5, '#5d6878');
  grad.addColorStop(1, '#475161');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle concrete panel lines and grime
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 1024; x += 256) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Paint Splatters
  const splatters = [
    { x: 180, y: 220, r: 60, c: 'rgba(236, 72, 153, 0.4)' },
    { x: 380, y: 160, r: 90, c: 'rgba(6, 182, 212, 0.35)' },
    { x: 740, y: 280, r: 75, c: 'rgba(168, 85, 247, 0.4)' },
    { x: 880, y: 190, r: 65, c: 'rgba(250, 204, 21, 0.35)' }
  ];
  splatters.forEach((s) => {
    ctx.fillStyle = s.c;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    // Drips
    ctx.fillRect(s.x - 6, s.y, 12, s.r * 1.6);
  });

  if (style === 'run') {
    // Crown symbol above RUN!
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(420, 140);
    ctx.lineTo(440, 90);
    ctx.lineTo(465, 125);
    ctx.lineTo(490, 80);
    ctx.lineTo(515, 125);
    ctx.lineTo(540, 90);
    ctx.lineTo(560, 140);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Large comic graffiti: "RUN!"
    ctx.save();
    ctx.translate(490, 290);
    ctx.rotate(-0.06);
    ctx.font = '900 160px "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black outer shadow
    ctx.fillStyle = '#0f172a';
    ctx.fillText('RUN!', 12, 14);

    // Cyan outline
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 26;
    ctx.strokeText('RUN!', 0, 0);

    // Warm Yellow fill
    ctx.fillStyle = '#fde047';
    ctx.fillText('RUN!', 0, 0);

    // Inner bright highlight
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 150px "Fredoka", "Arial Black", sans-serif';
    ctx.fillText('RUN!', -4, -4);
    ctx.restore();
  } else {
    // Wildstyle graffiti: "STAR" with purple / cyan
    ctx.save();
    ctx.translate(500, 260);
    ctx.rotate(0.05);
    ctx.font = '900 150px "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#090d16';
    ctx.fillText('RUSH', 10, 12);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 28;
    ctx.strokeText('RUSH', 0, 0);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('RUSH', 0, 0);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeText('RUSH', -2, -2);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function Track({ position = [0, 0, 0], theme = 'sunset' }) {
  // Generate procedural graffiti textures once
  const { leftWallTex, rightWallTex } = useMemo(() => {
    return {
      leftWallTex: createGraffitiTexture('RUSH', 'rush'),
      rightWallTex: createGraffitiTexture('RUN!', 'run')
    };
  }, []);

  // Wooden ties (sleepers) spacing
  const ties = useMemo(() => {
    const list = [];
    for (let z = -CHUNK_LENGTH / 2; z < CHUNK_LENGTH / 2; z += 2.2) {
      list.push(z);
    }
    return list;
  }, []);

  // Green grass clumps along the walls
  const grassTufts = useMemo(() => {
    const list = [];
    for (let z = -CHUNK_LENGTH / 2; z < CHUNK_LENGTH / 2; z += 4.5) {
      list.push({ z, scale: 0.6 + (Math.sin(z * 3) * 0.3) });
    }
    return list;
  }, []);

  // Upper city buildings on left and right
  const buildings = useMemo(() => {
    const list = [];
    const colors = [
      '#f97316', // Vibrant Orange
      '#fbbf24', // Sunny Warm Yellow
      '#ef4444', // Red-Coral
      '#06b6d4', // Teal Blue
      '#8b5cf6', // Soft Violet
      '#ec4899', // Pinkish Coral
      '#10b981'  // Mint Green
    ];

    for (let i = 0; i < 9; i++) {
      const z = -CHUNK_LENGTH / 2 + i * 11.5;
      const heightL = 16 + (Math.abs(Math.sin(i * 1.7)) * 12);
      const heightR = 15 + (Math.abs(Math.cos(i * 1.4)) * 14);
      const colorL = colors[i % colors.length];
      const colorR = colors[(i + 3) % colors.length];
      const bannerColor = i % 2 === 0 ? '#ef4444' : '#f59e0b';
      list.push({ z, heightL, heightR, colorL, colorR, bannerColor });
    }
    return list;
  }, []);

  return (
    <group position={position}>
      {/* 1. Track Bed Ground (Warm Earthy Gravel / Ballast) */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[TRACK_WIDTH, 0.12, CHUNK_LENGTH]} />
        <meshStandardMaterial color="#854d0e" roughness={0.95} />
      </mesh>

      {/* 2. Wooden Railway Ties / Sleepers (Rich Warm Wood) */}
      {ties.map((z, idx) => (
        <group key={idx} position={[0, 0.02, z]}>
          {LANES_X.map((lx, lIdx) => (
            <mesh key={lIdx} position={[lx, 0, 0]} receiveShadow>
              <boxGeometry args={[2.2, 0.08, 0.44]} />
              <meshStandardMaterial color="#9a3412" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3. Metallic Shiny Rails with Specular Highlights */}
      {LANES_X.map((lx, lIdx) => (
        <group key={lIdx}>
          {/* Left Rail */}
          <mesh position={[lx - 0.72, 0.09, 0]} receiveShadow>
            <boxGeometry args={[0.07, 0.14, CHUNK_LENGTH]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Right Rail */}
          <mesh position={[lx + 0.72, 0.09, 0]} receiveShadow>
            <boxGeometry args={[0.07, 0.14, CHUNK_LENGTH]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* 4. Concrete Retaining Walls (Sunken Trench Canal) with Graffiti */}
      {/* Left Wall */}
      <group position={[-5.8, 2.6, 0]} rotation={[0, 0, -0.08]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.6, 5.4, CHUNK_LENGTH]} />
          <meshStandardMaterial map={leftWallTex} roughness={0.8} />
        </mesh>
        {/* Wall Top Ledge / Curb */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.35, CHUNK_LENGTH]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        {/* Yellow Metal Handrail along top edge */}
        <mesh position={[0.2, 3.4, 0]}>
          <boxGeometry args={[0.08, 0.8, CHUNK_LENGTH]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Wall */}
      <group position={[5.8, 2.6, 0]} rotation={[0, 0, 0.08]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.6, 5.4, CHUNK_LENGTH]} />
          <meshStandardMaterial map={rightWallTex} roughness={0.8} />
        </mesh>
        {/* Wall Top Ledge / Curb */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.35, CHUNK_LENGTH]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        {/* Yellow Metal Handrail along top edge */}
        <mesh position={[-0.2, 3.4, 0]}>
          <boxGeometry args={[0.08, 0.8, CHUNK_LENGTH]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* 5. Green Cartoon Grass Tufts along the bottom of the walls */}
      {grassTufts.map((g, i) => (
        <React.Fragment key={i}>
          {/* Left Wall Grass */}
          <group position={[-5.3, 0.1, g.z]} scale={[g.scale, g.scale, g.scale]}>
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.22, 0.5, 5]} />
              <meshStandardMaterial color="#22c55e" roughness={0.5} />
            </mesh>
            <mesh position={[-0.1, 0.15, 0.1]} rotation={[0, 0, 0.5]}>
              <coneGeometry args={[0.18, 0.4, 5]} />
              <meshStandardMaterial color="#16a34a" roughness={0.5} />
            </mesh>
          </group>

          {/* Right Wall Grass */}
          <group position={[5.3, 0.1, g.z]} scale={[g.scale, g.scale, g.scale]}>
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.22, 0.5, 5]} />
              <meshStandardMaterial color="#22c55e" roughness={0.5} />
            </mesh>
            <mesh position={[0.1, 0.15, -0.1]} rotation={[0, 0, -0.5]}>
              <coneGeometry args={[0.18, 0.4, 5]} />
              <meshStandardMaterial color="#16a34a" roughness={0.5} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* 6. Upper Promenade & Colorful European Buildings */}
      {buildings.map((b, i) => (
        <React.Fragment key={i}>
          {/* Left Skyscraper / City House */}
          <group position={[-11.5, b.heightL / 2 + 5.2, b.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[9, b.heightL, 9.5]} />
              <meshStandardMaterial color={b.colorL} roughness={0.5} />
            </mesh>
            {/* White Windows Grid */}
            {[-2.5, 0, 2.5].map((wx, wIdx) => (
              <mesh key={wIdx} position={[4.52, 1, wx]}>
                <planeGeometry args={[1.2, 1.6]} />
                <meshStandardMaterial color="#fef08a" roughness={0.2} emissive="#fef08a" emissiveIntensity={0.2} />
              </mesh>
            ))}
            {/* Hanging Banner / Pennant */}
            <mesh position={[4.6, -1.8, 1.5]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.2, 2.4]} />
              <meshStandardMaterial color={b.bannerColor} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Right Skyscraper / City House */}
          <group position={[11.5, b.heightR / 2 + 5.2, b.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[9, b.heightR, 9.5]} />
              <meshStandardMaterial color={b.colorR} roughness={0.5} />
            </mesh>
            {/* White Windows Grid */}
            {[-2.5, 0, 2.5].map((wx, wIdx) => (
              <mesh key={wIdx} position={[-4.52, 1, wx]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[1.2, 1.6]} />
                <meshStandardMaterial color="#fef08a" roughness={0.2} emissive="#fef08a" emissiveIntensity={0.2} />
              </mesh>
            ))}
            {/* Hanging Banner / Pennant */}
            <mesh position={[-4.6, -1.8, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[1.2, 2.4]} />
              <meshStandardMaterial color={b.bannerColor} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* 7. Overhead Steel Lattice Gantries & Catenary Wires */}
      {[-CHUNK_LENGTH / 3, CHUNK_LENGTH / 3].map((gantryZ, gi) => (
        <group key={gi} position={[0, 0, gantryZ]}>
          {/* Yellow Lattice Crossbeam Arch */}
          <mesh position={[0, 6.8, 0]} castShadow>
            <boxGeometry args={[TRACK_WIDTH + 1.2, 0.45, 0.45]} />
            <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Support Legs */}
          <mesh position={[-TRACK_WIDTH / 2 - 0.2, 4.2, 0]} castShadow>
            <boxGeometry args={[0.35, 5.8, 0.35]} />
            <meshStandardMaterial color="#eab308" metalness={0.5} />
          </mesh>
          <mesh position={[TRACK_WIDTH / 2 + 0.2, 4.2, 0]} castShadow>
            <boxGeometry args={[0.35, 5.8, 0.35]} />
            <meshStandardMaterial color="#eab308" metalness={0.5} />
          </mesh>

          {/* Yellow/Black Hazard Chevron Striping */}
          <mesh position={[0, 6.4, 0.25]}>
            <planeGeometry args={[2.8, 0.35]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Overhead Power Catenary Wires hanging down */}
          {LANES_X.map((lx, lIdx) => (
            <group key={lIdx} position={[lx, 6.0, 0]}>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              {/* Electric Insulator */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.22, 8]} />
                <meshStandardMaterial color="#a855f7" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Continuous Overhead Wire Lines stretching through chunk */}
      {LANES_X.map((lx, lIdx) => (
        <mesh key={lIdx} position={[lx, 5.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, CHUNK_LENGTH, 4]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
    </group>
  );
}
