
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import GameBubble3D from "./GameBubble3D.jsx";
import BubbleBurst3D from "./BubbleBurst3D.jsx";
import { cellToPixel } from "../game/hexGrid.js";

import {
  BOARD_WIDTH,
  BUBBLE_RADIUS,
} from "../game/constants.js";

const W = BOARD_WIDTH;
const H = 600;
const R = BUBBLE_RADIUS;

const WORLD_THEMES = [
  {
    name: "Magical Garden",
    background: "#06251f",
    secondary: "#064e3b",
    primary: "#34d399",
    accent: "#a3e635",
    glow: "#10b981",
    light: "#6ee7b7",
  },
  {
    name: "Underwater Ocean",
    background: "#031d3b",
    secondary: "#075985",
    primary: "#38bdf8",
    accent: "#22d3ee",
    glow: "#0284c7",
    light: "#7dd3fc",
  },
  {
    name: "Fantasy Valley",
    background: "#171044",
    secondary: "#312e81",
    primary: "#818cf8",
    accent: "#c084fc",
    glow: "#6366f1",
    light: "#a5b4fc",
  },
  {
    name: "Icy Peaks",
    background: "#10283d",
    secondary: "#164e63",
    primary: "#67e8f9",
    accent: "#bae6fd",
    glow: "#0891b2",
    light: "#e0f2fe",
  },
  {
    name: "Lava Volcano",
    background: "#310d12",
    secondary: "#7c2d12",
    primary: "#fb923c",
    accent: "#facc15",
    glow: "#ea580c",
    light: "#fdba74",
  },
  {
    name: "Cosmic Galaxy",
    background: "#160b35",
    secondary: "#4c1d95",
    primary: "#c084fc",
    accent: "#f0abfc",
    glow: "#9333ea",
    light: "#e9d5ff",
  },
];

function getWorldIndex(levelId) {
  const id = Math.max(1, Number(levelId) || 1);

  if (id <= 5) return 0;
  if (id <= 10) return 1;
  if (id <= 20) return 2;
  if (id <= 30) return 3;
  if (id <= 35) return 4;

  return 5;
}

function to3D(x, y, z = 0) {
  return [x - W / 2, H / 2 - y, z];
}

// ======================================
// ANIMATED PARTICLES
// ======================================

function WorldParticles({ theme, worldIndex }) {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: ((i * 73 + 31) % (W - 25)) - W / 2,
      y: ((i * 97 + 17) % (H - 30)) - H / 2,
      size: 0.035 + (i % 5) * 0.025,
      speed: 0.35 + (i % 5) * 0.16,
      phase: i * 0.8,
    }));
  }, []);

  return (
    <group position={[0, 0, -3.8]}>
      {particles.map((particle, i) => (
        <FloatingParticle
          key={i}
          particle={particle}
          theme={theme}
          worldIndex={worldIndex}
        />
      ))}
    </group>
  );
}

function FloatingParticle({ particle, theme, worldIndex }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.elapsedTime;

    const verticalMovement =
      Math.sin(time * particle.speed + particle.phase) * 0.42;

    const horizontalMovement =
      Math.cos(time * 0.35 + particle.phase) * 0.22;

    ref.current.position.y = particle.y + verticalMovement;
    ref.current.position.x = particle.x + horizontalMovement;

    const pulse = Math.sin(time * 2 + particle.phase);

    ref.current.scale.setScalar(1 + pulse * 0.15);
  });

  return (
    <mesh ref={ref} position={[particle.x, particle.y, 0]}>
      <sphereGeometry args={[particle.size, 12, 12]} />
      <meshBasicMaterial
        color={worldIndex === 4 ? theme.primary : theme.accent}
        transparent
        opacity={worldIndex === 4 ? 0.85 : 0.55}
      />
    </mesh>
  );
}

// ======================================
// WORLD DECORATIONS
// Ambient Orbs intentionally removed
// ======================================

function WorldDecorations({ theme, worldIndex }) {
  return (
    <group position={[0, 0, -4.3]}>
      {worldIndex === 0 && <GardenDecorations theme={theme} />}
      {worldIndex === 1 && <OceanDecorations theme={theme} />}
      {worldIndex === 2 && <FantasyDecorations theme={theme} />}
      {worldIndex === 3 && <IceDecorations theme={theme} />}
      {worldIndex === 4 && <VolcanoDecorations theme={theme} />}
      {worldIndex === 5 && <GalaxyDecorations theme={theme} />}
    </group>
  );
}

// ======================================
// MAGICAL GARDEN
// ======================================

function GardenDecorations({ theme }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (W / 2 - 1), -210, 0]}
          rotation={[0, 0, side * -0.25]}
        >
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[side * i * 0.35, i * 38, 0]}
              rotation={[0, 0, side * 0.45]}
            >
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? "#34d399" : "#a3e635"}
                transparent
                opacity={0.55}
              />
            </mesh>
          ))}
        </group>
      ))}

      {[-1, 1].map((side) => (
        <mesh
          key={`flower-${side}`}
          position={[side * (W / 2 - 1.2), -245, 0.2]}
        >
          <torusGeometry args={[0.45, 0.025, 10, 40]} />
          <meshBasicMaterial
            color={theme.accent}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// ======================================
// UNDERWATER OCEAN
// ======================================

function OceanDecorations({ theme }) {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i * 67) % W) - W / 2,
            -245 + (i % 3) * 16,
            0,
          ]}
          rotation={[0, 0, (i % 2 ? 1 : -1) * 0.18]}
        >
          <coneGeometry args={[0.22, 1.5 + (i % 3) * 0.3, 7]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#0e7490" : theme.primary}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {[0, 1, 2].map((i) => (
        <mesh
          key={`bubble-${i}`}
          position={[i * 3 - 3, -180 + i * 35, 0.3]}
        >
          <sphereGeometry args={[0.24 + i * 0.08, 20, 20]} />
          <meshBasicMaterial
            color={theme.light}
            transparent
            opacity={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}

// ======================================
// FANTASY VALLEY
// ======================================

function FantasyDecorations({ theme }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (W / 2 - 1.1), -205, 0]}
        >
          <mesh rotation={[0, 0, side * 0.12]}>
            <coneGeometry args={[1.05, 3.2, 5]} />
            <meshBasicMaterial
              color="#312e81"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 1.1, 0.2]}>
            <octahedronGeometry args={[0.36, 0]} />
            <meshBasicMaterial
              color={theme.accent}
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ======================================
// ICY PEAKS
// ======================================

function IceDecorations({ theme }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (W / 2 - 0.8), -210, 0]}
        >
          <mesh rotation={[0, 0, side * 0.12]}>
            <coneGeometry args={[1.4, 3.7, 5]} />
            <meshBasicMaterial
              color="#164e63"
              transparent
              opacity={0.42}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 1.1, 0.2]}>
            <coneGeometry args={[0.55, 1.2, 5]} />
            <meshBasicMaterial
              color={theme.light}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ======================================
// LAVA VOLCANO
// ======================================

function VolcanoDecorations({ theme }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (W / 2 - 0.8), -210, 0]}
        >
          <mesh rotation={[0, 0, side * 0.12]}>
            <coneGeometry args={[1.4, 3.6, 5]} />
            <meshBasicMaterial
              color="#7f1d1d"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 1.2, 0.2]}>
            <coneGeometry args={[0.38, 0.9, 5]} />
            <meshBasicMaterial
              color="#fb923c"
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -285, 0.1]}>
        <planeGeometry args={[W, 3]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

// ======================================
// COSMIC GALAXY
// ======================================

function GalaxyDecorations({ theme }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: ((i * 59) % W) - W / 2,
        y: ((i * 83) % H) - H / 2,
        size: 0.025 + (i % 4) * 0.02,
        phase: i * 0.5,
      })),
    []
  );

  return (
    <group>
      {stars.map((star, i) => (
        <TwinklingStar key={i} star={star} theme={theme} />
      ))}

      {[0, 1, 2].map((i) => (
        <mesh
          key={`orbit-${i}`}
          position={[
            i === 1 ? W / 2 - 1.3 : -W / 2 + 1.3,
            i * 65 - 80,
            0.2,
          ]}
          rotation={[0.3, 0.3, i * 0.5]}
        >
          <torusGeometry args={[0.55 + i * 0.2, 0.012, 8, 48]} />
          <meshBasicMaterial
            color={theme.accent}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function TwinklingStar({ star, theme }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const pulse =
      0.65 +
      Math.sin(state.clock.elapsedTime * 2 + star.phase) * 0.3;

    ref.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ref} position={[star.x, star.y, 0.3]}>
      <sphereGeometry args={[star.size, 8, 8]} />
      <meshBasicMaterial color={theme.light} />
    </mesh>
  );
}

// ======================================
// 3D LAUNCHER
// ======================================

function Launcher({ angle, theme }) {
  const direction = angle || Math.PI / 2;

  const barrelPosition = [
    Math.cos(direction) * 0.43,
    Math.sin(direction) * 0.43,
    0,
  ];

  return (
    <group position={to3D(W / 2, 540, 0)}>
      <mesh
        position={[0, -0.16, -0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.52, 48]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh position={[0, -0.12, -0.15]} castShadow>
        <cylinderGeometry args={[0.39, 0.46, 0.25, 48]} />
        <meshPhysicalMaterial
          color="#172554"
          metalness={0.8}
          roughness={0.22}
          clearcoat={1}
        />
      </mesh>

      <mesh position={[0, 0.02, -0.12]}>
        <torusGeometry args={[0.37, 0.025, 12, 64]} />
        <meshBasicMaterial color={theme.primary} />
      </mesh>

      <group
        position={barrelPosition}
        rotation={[0, 0, direction - Math.PI / 2]}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.22, 1.05, 32]} />
          <meshPhysicalMaterial
            color="#334155"
            metalness={0.85}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>

        <mesh position={[0, 0.51, 0]}>
          <torusGeometry args={[0.17, 0.035, 12, 32]} />
          <meshBasicMaterial color={theme.light} />
        </mesh>

        <mesh position={[0, -0.48, 0]}>
          <torusGeometry args={[0.2, 0.025, 12, 32]} />
          <meshBasicMaterial color={theme.primary} />
        </mesh>
      </group>

      <pointLight
        position={[0, 0.3, 1]}
        color={theme.primary}
        intensity={0.8}
        distance={3}
      />
    </group>
  );
}

// ======================================
// BOARD BACKGROUND
// ======================================

function BoardBackground({ theme }) {
  return (
    <group>
      <RoundedBox
        args={[W - 8, H - 8, 0.35]}
        radius={0.18}
        smoothness={6}
        position={[0, 0, -5]}
      >
        <meshPhysicalMaterial
          color={theme.background}
          metalness={0.35}
          roughness={0.28}
          transparent
          opacity={0.52}
          clearcoat={1}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      <mesh position={[0, 115, -4.7]}>
        <planeGeometry args={[W * 0.9, 170]} />
        <meshBasicMaterial
          color={theme.glow}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -H / 2 + 1.1, -4.6]}>
        <planeGeometry args={[W * 0.85, 2]} />
        <meshBasicMaterial
          color={theme.primary}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ======================================
// MAIN 3D GAME BOARD
// ======================================

export default function GameBoard3D({
  board,
  current,
  angle,
  effects = [],
  levelId = 1,
}) {
  const worldIndex = getWorldIndex(levelId);

  const theme = useMemo(
    () => WORLD_THEMES[worldIndex],
    [worldIndex]
  );

  const bubbles = useMemo(() => {
    const items = [];

    if (!Array.isArray(board)) return items;

    board.forEach((row, r) => {
      if (!Array.isArray(row)) return;

      row.forEach((bubble, c) => {
        if (!bubble) return;

        const position = cellToPixel(r, c);

        items.push({
          key: `${r}-${c}`,
          x: position.x,
          y: position.y,
          color: bubble.color,
        });
      });
    });

    return items;
  }, [board]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Canvas
        orthographic
        shadows
        dpr={[1, 1.75]}
        camera={{
          position: [0, 0, 100],
          zoom: 1,
          left: -W / 2,
          right: W / 2,
          top: H / 2,
          bottom: -H / 2,
          near: 0.1,
          far: 200,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <ambientLight intensity={1.15} />

        <directionalLight
          position={[-4, 8, 12]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <pointLight
          position={[0, 5, 12]}
          color={theme.primary}
          intensity={1.3}
          distance={30}
        />

        <pointLight
          position={[8, -5, 8]}
          color={theme.accent}
          intensity={0.9}
          distance={25}
        />

        <WorldParticles
          theme={theme}
          worldIndex={worldIndex}
        />

        <WorldDecorations
          theme={theme}
          worldIndex={worldIndex}
        />

        <BoardBackground theme={theme} />

        {bubbles.map((bubble) => (
          <GameBubble3D
            key={bubble.key}
            position={to3D(bubble.x, bubble.y, 0)}
            color={bubble.color}
            radius={R}
          />
        ))}

        <BubbleBurst3D effects={effects} />

        <Launcher angle={angle} theme={theme} />

        {current && (
          <GameBubble3D
            position={to3D(W / 2, 540, 1)}
            color={current}
            radius={R}
            animated
          />
        )}
      </Canvas>
    </div>
  );
}
