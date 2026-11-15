import React, { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BUBBLE_COLORS = {
  red: "#ff315c",
  blue: "#16bfff",
  green: "#19e58a",
  yellow: "#ffcf32",
  purple: "#a855ff",
  orange: "#ff8733",
  egg: "#fff0bd",
  bomb: "#ff315c",
  rainbow: "#b66cff",
};

// Shared geometries: created ONCE and reused by every bubble.
// (Before, each bubble built its own 64x64 sphere = ~13,000 triangles.)
const BODY_GEO = new THREE.SphereGeometry(1, 28, 28);
const GLOW_GEO = new THREE.SphereGeometry(1, 16, 16);
const SHINE_GEO = new THREE.SphereGeometry(1, 12, 12);

function GameBubble3D({
  position = [0, 0, 0],
  color = "blue",
  radius = 0.4,
  animated = false,
}) {
  const bubbleRef = useRef(null);
  const materialRef = useRef(null);
  const glowRef = useRef(null);
  const highlightRef = useRef(null);

  const bubbleColor = BUBBLE_COLORS[color] || color;
  const isRainbow = color === "rainbow";
  const isBomb = color === "bomb";

  useFrame((state, delta) => {
    // Normal board bubbles are static: do nothing every frame
    if (!animated && !isRainbow) return;
    if (!bubbleRef.current) return;

    const time = state.clock.elapsedTime;

    if (animated) {
      bubbleRef.current.rotation.y += delta * 0.35;
      bubbleRef.current.rotation.x = Math.sin(time * 0.8) * 0.06;
      bubbleRef.current.position.y = Math.sin(time * 2.1) * radius * 0.055;

      if (glowRef.current) {
        const pulse = 1 + Math.sin(time * 2.5) * 0.035;
        glowRef.current.scale.setScalar(radius * 1.13 * pulse);
      }

      if (highlightRef.current) {
        highlightRef.current.rotation.z = Math.sin(time * 1.2) * 0.08;
      }
    }

    if (isRainbow && materialRef.current) {
      const hue = (time * 0.18) % 1;
      materialRef.current.color.setHSL(hue, 0.9, 0.58);
      materialRef.current.emissive.setHSL(hue, 0.8, 0.22);
    }
  });

  return (
    <group position={position}>
      {/* OUTER GLOW */}
      <mesh ref={glowRef} geometry={GLOW_GEO} scale={radius * 1.13}>
        <meshBasicMaterial
          color={bubbleColor}
          transparent
          opacity={isBomb ? 0.2 : 0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* MAIN 3D BUBBLE (no shadows, standard material = much faster) */}
      <mesh ref={bubbleRef} geometry={BODY_GEO} scale={radius}>
        <meshStandardMaterial
          ref={materialRef}
          color={bubbleColor}
          metalness={0.08}
          roughness={0.16}
          emissive={bubbleColor}
          emissiveIntensity={isBomb ? 0.3 : 0.16}
        />
      </mesh>

      {/* LARGE GLASS REFLECTION */}
      <group
        ref={highlightRef}
        position={[-radius * 0.27, radius * 0.38, radius * 0.82]}
      >
        <mesh
          geometry={SHINE_GEO}
          scale={[radius * 0.24, radius * 0.14, radius * 0.045]}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.88}
            depthWrite={false}
          />
        </mesh>

        {/* Soft reflection */}
        <mesh
          geometry={SHINE_GEO}
          position={[radius * 0.12, -radius * 0.2, radius * 0.015]}
          scale={[radius * 0.1, radius * 0.055, radius * 0.025]}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* SMALL REFLECTION */}
      <mesh
        geometry={SHINE_GEO}
        position={[radius * 0.43, -radius * 0.34, radius * 0.79]}
        scale={radius * 0.065}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>

      {/* BOMB DETAIL */}
      {isBomb && (
        <mesh
          geometry={SHINE_GEO}
          position={[radius * 0.12, radius * 0.18, radius * 0.91]}
          scale={radius * 0.1}
        >
          <meshBasicMaterial color="#fff1f2" />
        </mesh>
      )}
    </group>
  );
}

// Re-render only when something really changed (position arrays are new
// objects on every parent render, so compare their numbers)
export default memo(GameBubble3D, (a, b) => {
  const pa = a.position || [0, 0, 0];
  const pb = b.position || [0, 0, 0];

  return (
    a.color === b.color &&
    a.radius === b.radius &&
    a.animated === b.animated &&
    pa[0] === pb[0] &&
    pa[1] === pb[1] &&
    pa[2] === pb[2]
  );
});