import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const THEMES = [
  {
    id: 'indian_railway',
    name: 'Indian Railway',
    subtitle: 'Northern Railway • New Delhi Junction',
    country: '🇮🇳 India',
    icon: '🚂',
    badge: 'NEW DELHI EXPRESS',
    sky: '#55b9ee',
    fog: '#60a5fa',
    fogNear: 40,
    fogFar: 120,
    ambientLight: '#e0f2fe',
    ambientIntensity: 0.95,
    sunLight: '#fffbeb',
    sunIntensity: 1.6,
    ground: '#854d0e', // Warm Earthy Ballast
    sleeper: '#9a3412', // Rich Teak Sleepers
    rail: '#cbd5e1', // Polished Steel
    wallBase: '#475569',
    wallTop: '#cbd5e1',
    buildingColors: ['#f97316', '#fbbf24', '#ef4444', '#06b6d4', '#10b981'],
    accent: '#f59e0b',
    neonGlow: false,
    gantryColor: '#eab308', // Indian Railways yellow lattice
    bannerText: 'NEW DELHI JUNCTION',
    sceneryType: 'indian'
  },
  {
    id: 'tokyo_city',
    name: 'Tokyo City',
    subtitle: 'Shibuya Crossing • Neo-Tokyo Underground',
    country: '🇯🇵 Japan',
    icon: '🗼',
    badge: 'SHIBUYA METRO LINE',
    sky: '#110b29', // Deep Cyberpunk Indigo
    fog: '#1e144a', // Neon Purple Fog
    fogNear: 35,
    fogFar: 110,
    ambientLight: '#3b0764',
    ambientIntensity: 0.75,
    sunLight: '#06b6d4', // Cyan Moonlight
    sunIntensity: 1.25,
    ground: '#1e1b4b', // Dark Asphalt Ballast
    sleeper: '#312e81', // Futuristic Composite Sleepers
    rail: '#00eaff', // Glowing Cyan Neon Rails
    wallBase: '#0f172a',
    wallTop: '#a855f7',
    buildingColors: ['#4c1d95', '#6b21a8', '#0e7490', '#1e293b', '#3b0764'],
    accent: '#f43f5e', // Hot Neon Pink
    neonGlow: true,
    gantryColor: '#a855f7', // Purple Neon Gantries
    bannerText: 'TOKYO METRO • 渋谷',
    sceneryType: 'tokyo'
  },
  {
    id: 'egypt_desert',
    name: 'Egypt Desert',
    subtitle: 'Valley of the Kings • Giza Sands Express',
    country: '🇪🇬 Egypt',
    icon: '🏜️',
    badge: 'GIZA SANDS RAIL',
    sky: '#f59e0b', // Amber Desert Sunset
    fog: '#d97706', // Golden Dust Fog
    fogNear: 40,
    fogFar: 120,
    ambientLight: '#fef3c7',
    ambientIntensity: 1.05,
    sunLight: '#fde68a', // Blazing Golden Sunlight
    sunIntensity: 1.85,
    ground: '#b45309', // Warm Sand Dune Ballast
    sleeper: '#78350f', // Sun-bleached Palm Sleepers
    rail: '#fef08a', // Gleaming Gold Rails
    wallBase: '#ca8a04', // Carved Sandstone
    wallTop: '#eab308',
    buildingColors: ['#d97706', '#b45309', '#ca8a04', '#92400e', '#eab308'],
    accent: '#fbbf24',
    neonGlow: false,
    gantryColor: '#d97706', // Ancient Sandstone Gateway Arches
    bannerText: 'GIZA VALLEY OF THE KINGS',
    sceneryType: 'egypt'
  },
  {
    id: 'new_york',
    name: 'New York City',
    subtitle: 'Times Square • Manhattan Subway Loop',
    country: '🇺🇸 USA',
    icon: '🗽',
    badge: 'MTA TIMES SQUARE',
    sky: '#475569', // Dusk Metro Skyline
    fog: '#64748b', // Manhattan Blue Fog
    fogNear: 38,
    fogFar: 115,
    ambientLight: '#cbd5e1',
    ambientIntensity: 0.9,
    sunLight: '#f8fafc', // Crisp City Daylight
    sunIntensity: 1.5,
    ground: '#334155', // Dark Metro Stone Track
    sleeper: '#1e293b', // Heavy Steel Sleepers
    rail: '#f1f5f9', // Polished Chrome Rails
    wallBase: '#1e293b', // Classic NYC Subway Tiled Walls
    wallTop: '#f59e0b',
    buildingColors: ['#334155', '#475569', '#64748b', '#713f12', '#1e293b'],
    accent: '#f59e0b', // NYC Taxi Yellow
    neonGlow: false,
    gantryColor: '#0284c7', // Steel Blue Subway Truss
    bannerText: 'MTA TIMES SQ - 42 ST',
    sceneryType: 'newyork'
  },
  {
    id: 'tropical_beach',
    name: 'Tropical Beach',
    subtitle: 'Paradise Bay • Coral Coastline Surf',
    country: '🏝️ Tropical',
    icon: '🌴',
    badge: 'PARADISE EXPRESS',
    sky: '#0284c7', // Radiant Turquoise Azure
    fog: '#38bdf8', // Sea Mist Fog
    fogNear: 45,
    fogFar: 130,
    ambientLight: '#e0f2fe',
    ambientIntensity: 1.1,
    sunLight: '#fef08a', // Brilliant Tropical Sun
    sunIntensity: 1.75,
    ground: '#d97706', // Golden Coastal Sand
    sleeper: '#854d0e', // Driftwood Sleepers
    rail: '#e2e8f0', // Silver Rails
    wallBase: '#0d9488', // Coral Stone Ledges
    wallTop: '#2dd4bf',
    buildingColors: ['#0284c7', '#0d9488', '#059669', '#14b8a6', '#f59e0b'],
    accent: '#06b6d4', // Bright Aqua
    neonGlow: false,
    gantryColor: '#10b981', // Palm Bamboo Arches
    bannerText: 'PARADISE BEACH SURF COAST',
    sceneryType: 'beach'
  }
];

// Helper to look up theme by id
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

// 1. Tokyo Tower Model for Tokyo Skyline
function TokyoTower({ position = [0, 0, -85] }) {
  return (
    <group position={position}>
      {/* 4 Angled Lattice Legs */}
      <mesh position={[-5, 8, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.3, 0.7, 18, 6]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[5, 8, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.3, 0.7, 18, 6]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.4} metalness={0.7} />
      </mesh>
      {/* First Observation Deck */}
      <mesh position={[0, 16, 0]}>
        <boxGeometry args={[11, 2.4, 11]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Mid White & Red Lattice Section */}
      <mesh position={[0, 24, 0]}>
        <cylinderGeometry args={[1.5, 3.2, 14, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.3} metalness={0.6} />
      </mesh>
      {/* Second Observation Deck */}
      <mesh position={[0, 31, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 1.8, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.4} />
      </mesh>
      {/* Upper Spire & Antenna */}
      <mesh position={[0, 42, 0]}>
        <cylinderGeometry args={[0.1, 1.2, 20, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>
      {/* Blinking Red Beacon at tip */}
      <mesh position={[0, 52.5, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// 2. Great Pyramids for Egypt Desert
function EgyptPyramids({ position = [0, 0, -90] }) {
  return (
    <group position={position}>
      {/* Main Great Pyramid */}
      <mesh position={[-38, 14, -20]} rotation={[0, 0.35, 0]}>
        <coneGeometry args={[36, 32, 4]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>
      {/* Capstone Gold Sheen */}
      <mesh position={[-38, 29, -20]} rotation={[0, 0.35, 0]}>
        <coneGeometry args={[5, 6, 4]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      {/* Second Pyramid (Khafre) */}
      <mesh position={[42, 11, -30]} rotation={[0, -0.25, 0]}>
        <coneGeometry args={[28, 26, 4]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.9} />
      </mesh>
      {/* Distant Third Pyramid (Menkaure) */}
      <mesh position={[68, 6, -55]} rotation={[0, 0.1, 0]}>
        <coneGeometry args={[16, 15, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      {/* Sand Dune Ridges */}
      <mesh position={[0, -2, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 80]} />
        <meshStandardMaterial color="#d97706" roughness={0.95} />
      </mesh>
    </group>
  );
}

// 3. New York City Skyline Silhouettes
function NewYorkSkyline({ position = [0, 0, -85] }) {
  return (
    <group position={position}>
      {/* Empire State Spire Building */}
      <group position={[-25, 24, -10]}>
        <mesh>
          <boxGeometry args={[14, 48, 14]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Stepped crown */}
        <mesh position={[0, 26, 0]}>
          <boxGeometry args={[8, 6, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        {/* Tall Spire */}
        <mesh position={[0, 34, 0]}>
          <cylinderGeometry args={[0.2, 1.2, 12, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
      </group>

      {/* Art Deco Chrysler Tower */}
      <group position={[28, 20, -15]}>
        <mesh>
          <boxGeometry args={[12, 40, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 24, 0]}>
          <coneGeometry args={[6, 12, 4]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} emissive="#38bdf8" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Manhattan Office Grid Silhouettes */}
      {[-55, -40, 48, 62].map((x, i) => (
        <mesh key={i} position={[x, 15 + (i % 2) * 8, -25]}>
          <boxGeometry args={[12, 32 + (i % 2) * 16, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 4. Tropical Beach Palms & Ocean Horizon
function TropicalOceanView({ position = [0, 0, -80] }) {
  return (
    <group position={position}>
      {/* Shimmering Turquoise Ocean Plane */}
      <mesh position={[0, -0.5, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 100]} />
        <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Distant Paradise Island */}
      <mesh position={[35, 3, -60]}>
        <cylinderGeometry args={[12, 18, 6, 16]} />
        <meshStandardMaterial color="#065f46" roughness={0.8} />
      </mesh>
      {/* Tropical Palm Trees along sides */}
      {[-18, 18].map((sideX, sIdx) => (
        <group key={sIdx} position={[sideX, 0, 10]}>
          {/* Curved Palm Trunk */}
          <mesh position={[0, 4, 0]} rotation={[0, 0, sIdx === 0 ? 0.12 : -0.12]}>
            <cylinderGeometry args={[0.3, 0.55, 8, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {/* Palm Fronds Foliage */}
          <group position={[sIdx === 0 ? 0.6 : -0.6, 8, 0]}>
            {[0, 1, 2, 3, 4, 5].map((frondIdx) => {
              const angle = (frondIdx / 6) * Math.PI * 2;
              return (
                <mesh
                  key={frondIdx}
                  position={[Math.cos(angle) * 1.8, -0.4, Math.sin(angle) * 1.8]}
                  rotation={[0.4 * Math.sin(angle), angle, 0.4 * Math.cos(angle)]}
                >
                  <boxGeometry args={[0.6, 0.08, 3.2]} />
                  <meshStandardMaterial color="#16a34a" roughness={0.6} />
                </mesh>
              );
            })}
            {/* Coconuts Cluster */}
            <mesh position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color="#713f12" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// 5. Indian Railway Historic Station Clocktower Landmark
function IndianStationLandmark({ position = [0, 0, -85] }) {
  return (
    <group position={position}>
      {/* Grand Red-Sandstone Station Building */}
      <mesh position={[0, 12, -20]}>
        <boxGeometry args={[55, 24, 18]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.8} />
      </mesh>
      {/* Central Heritage Clocktower */}
      <mesh position={[0, 26, -18]}>
        <boxGeometry args={[10, 16, 10]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      {/* Golden Clock Face */}
      <mesh position={[0, 28, -12.9]} rotation={[0, 0, 0]}>
        <circleGeometry args={[2.5, 24]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Cupola Dome with Indian Flag Spire */}
      <mesh position={[0, 36, -18]}>
        <sphereGeometry args={[4.5, 16, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Reusable Three.js colors to prevent 120 allocations/sec GC churn in useFrame
const _tempSkyColor = new THREE.Color();
const _tempFogColor = new THREE.Color();

/**
 * WorldThemes Component
 * Manages dynamic world theming:
 * - Automatically cycles environments every 500 metres (0-500m India, 500-1000m Tokyo, 1000-1500m Egypt, etc.)
 * - Smoothly lerps scene sky, atmospheric fog, and lighting
 * - Renders iconic background landmark models for each world
 * - Triggers location announcement when crossing world boundaries
 */
export default function WorldThemes({
  playerRef,
  engine,
  themeOverride = 'auto',
  onWorldChange
}) {
  const { scene } = useThree();
  const [themeIndex, setThemeIndex] = useState(0);
  const currentIndex = useRef(-1);

  // Determine starting index if user chose a specific theme
  const baseIndex = useMemo(() => {
    if (!themeOverride || themeOverride === 'auto' || themeOverride === 'sunset') return 0;
    const foundIdx = THEMES.findIndex((t) => t.id === themeOverride);
    return foundIdx >= 0 ? foundIdx : 0;
  }, [themeOverride]);

  useFrame((state, delta) => {
    const distance = engine ? engine.distance : 0;

    let targetIdx = 0;
    if (themeOverride && themeOverride !== 'auto' && themeOverride !== 'sunset') {
      // Locked to user-selected world
      targetIdx = baseIndex;
    } else {
      // Auto World Tour mode: advances every 500 metres!
      targetIdx = (baseIndex + Math.floor(distance / 500)) % THEMES.length;
    }

    if (targetIdx !== currentIndex.current) {
      currentIndex.current = targetIdx;
      setThemeIndex(targetIdx);
      if (onWorldChange) {
        onWorldChange(THEMES[targetIdx], targetIdx, distance);
      }
    }

    const currentTheme = THEMES[targetIdx];

    // Smoothly interpolate scene background and fog colors with zero GC allocations
    _tempSkyColor.set(currentTheme.sky);
    _tempFogColor.set(currentTheme.fog);

    if (scene.background) {
      scene.background.lerp(_tempSkyColor, delta * 2.5);
    } else {
      scene.background = _tempSkyColor.clone();
    }

    if (scene.fog) {
      scene.fog.color.lerp(_tempFogColor, delta * 2.5);
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, currentTheme.fogNear, delta * 2.0);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, currentTheme.fogFar, delta * 2.0);
    } else {
      scene.fog = new THREE.Fog(currentTheme.fog, currentTheme.fogNear, currentTheme.fogFar);
    }
  });

  const activeTheme = THEMES[themeIndex];

  return (
    <group>
      {/* Themed Background Horizons & Landmarks */}
      {activeTheme.id === 'indian_railway' && <IndianStationLandmark position={[0, 0, -90]} />}
      {activeTheme.id === 'tokyo_city' && <TokyoTower position={[0, 0, -85]} />}
      {activeTheme.id === 'egypt_desert' && <EgyptPyramids position={[0, 0, -95]} />}
      {activeTheme.id === 'new_york' && <NewYorkSkyline position={[0, 0, -85]} />}
      {activeTheme.id === 'tropical_beach' && <TropicalOceanView position={[0, 0, -80]} />}
    </group>
  );
}

