
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Stars,
  Sparkles,
} from "@react-three/drei";

function Bubble({ position, color, size, speed = 1 }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.005 * speed;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.12;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 48, 48]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.12}
          metalness={0.25}
          distort={0.12}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function Arena() {
  return (
    <>
      <color attach="background" args={["#080b20"]} />

      <fog attach="fog" args={["#080b20", 9, 24]} />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[5, 8, 6]}
        intensity={3}
      />

      <pointLight
        position={[-5, 2, 4]}
        color="#8b5cf6"
        intensity={35}
      />

      <pointLight
        position={[5, -2, 3]}
        color="#06b6d4"
        intensity={25}
      />

      <Stars
        radius={80}
        depth={40}
        count={1200}
        factor={3}
        fade
        speed={0.5}
      />

      <Sparkles
        count={90}
        scale={[12, 12, 5]}
        size={2}
        speed={0.4}
        color="#a78bfa"
      />

      <Bubble
        position={[-3.5, 2, -2]}
        color="#a855f7"
        size={0.65}
      />

      <Bubble
        position={[3.5, 1, -3]}
        color="#06b6d4"
        size={0.8}
        speed={1.4}
      />

      <Bubble
        position={[-4, -2, -3]}
        color="#ec4899"
        size={0.5}
        speed={0.8}
      />

      <Bubble
        position={[4, -2.5, -2]}
        color="#6366f1"
        size={0.7}
        speed={1.2}
      />

      <Bubble
        position={[0, 3.5, -4]}
        color="#fbbf24"
        size={0.35}
      />
    </>
  );
}

export default function GameScene3D() {
  return (
    <div className="game-scene-3d">
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 50,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Arena />
      </Canvas>
    </div>
  );
}
