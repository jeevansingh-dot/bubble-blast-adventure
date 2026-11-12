
import React, { useRef } from "react";
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

const RAINBOW_HUES = [
  0.98,
  0.08,
  0.18,
  0.42,
  0.55,
  0.72,
  0.85,
];

export default function GameBubble3D({
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
    if (!bubbleRef.current) return;

    const time = state.clock.elapsedTime;

    if (animated) {
      bubbleRef.current.rotation.y += delta * 0.35;
      bubbleRef.current.rotation.x =
        Math.sin(time * 0.8) * 0.06;

      // Floating animation relative to the parent group
      bubbleRef.current.position.y =
        Math.sin(time * 2.1) * radius * 0.055;

      if (glowRef.current) {
        const pulse = 1 + Math.sin(time * 2.5) * 0.035;
        glowRef.current.scale.setScalar(pulse);
      }

      if (highlightRef.current) {
        highlightRef.current.rotation.z =
          Math.sin(time * 1.2) * 0.08;
      }
    }

    // Animated rainbow color
    if (isRainbow && materialRef.current) {
      const hue =
        (time * 0.18) % 1;

      materialRef.current.color.setHSL(
        hue,
        0.9,
        0.58
      );

      materialRef.current.emissive.setHSL(
        hue,
        0.8,
        0.22
      );
    }
  });

  return (
    <group position={position}>

      {/* OUTER GLOW */}
      <mesh
        ref={glowRef}
        scale={1.13}
      >
        <sphereGeometry args={[radius, 40, 40]} />
        <meshBasicMaterial
          color={bubbleColor}
          transparent
          opacity={isBomb ? 0.2 : 0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* MAIN 3D BUBBLE */}
      <mesh
        ref={bubbleRef}
        castShadow
        receiveShadow
      >
        <sphereGeometry
          args={[radius, 64, 64]}
        />

        <meshPhysicalMaterial
          ref={materialRef}
          color={bubbleColor}
          metalness={0.08}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.04}
          reflectivity={1}
          ior={1.35}
          emissive={bubbleColor}
          emissiveIntensity={isBomb ? 0.3 : 0.16}
        />
      </mesh>

      {/* LARGE GLASS REFLECTION */}
      <group
        ref={highlightRef}
        position={[
          -radius * 0.27,
          radius * 0.38,
          radius * 0.82,
        ]}
      >
        <mesh
          scale={[
            radius * 0.24,
            radius * 0.14,
            radius * 0.045,
          ]}
        >
          <sphereGeometry args={[1, 32, 24]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.88}
            depthWrite={false}
          />
        </mesh>

        {/* Soft reflection */}
        <mesh
          position={[
            radius * 0.12,
            -radius * 0.2,
            radius * 0.015,
          ]}
          scale={[
            radius * 0.1,
            radius * 0.055,
            radius * 0.025,
          ]}
        >
          <sphereGeometry args={[1, 24, 20]} />
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
        position={[
          radius * 0.43,
          -radius * 0.34,
          radius * 0.79,
        ]}
        scale={radius * 0.065}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>

      {/* BOMB DETAIL */}
      {isBomb && (
        <>
          <mesh
            position={[
              radius * 0.12,
              radius * 0.18,
              radius * 0.91,
            ]}
            scale={radius * 0.1}
          >
            <sphereGeometry args={[1, 20, 20]} />
            <meshBasicMaterial color="#fff1f2" />
          </mesh>

          <pointLight
            color="#ff315c"
            intensity={0.35}
            distance={radius * 4}
          />
        </>
      )}

    </group>
  );
}
