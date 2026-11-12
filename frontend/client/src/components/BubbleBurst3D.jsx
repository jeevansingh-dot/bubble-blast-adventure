
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BOARD_WIDTH } from "../game/constants.js";

const W = BOARD_WIDTH;
const H = 600;
const PARTICLE_COUNT = 18;

const COLOR_MAP = {
  red: "#ec4899",
  blue: "#38bdf8",
  green: "#10b981",
  yellow: "#fbbf24",
  purple: "#a855f7",
  orange: "#f97316",
  egg: "#fef3c7",
  bomb: "#ef4444",
  rainbow: "#a855f7",
};

function getColor(effect) {
  return (
    COLOR_MAP[effect.color] ||
    effect.color ||
    "#38bdf8"
  );
}

function getPosition(effect) {
  return [
    effect.x - W / 2,
    H / 2 - effect.y,
    0,
  ];
}

// ======================================
// EXPLOSION PARTICLES
// ======================================

function BurstParticle({ effect, index }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);

  const particle = useMemo(() => {
    const angle =
      (index / PARTICLE_COUNT) * Math.PI * 2 +
      (index % 3) * 0.12;

    return {
      angle,
      speed: 28 + (index % 5) * 13,
      size: 0.8 + (index % 4) * 0.35,
      vertical: ((index % 5) - 2) * 9,
      rotation: index * 0.7,
    };
  }, [index]);

  const color = getColor(effect);
  const [startX, startY] = getPosition(effect);

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed =
      performance.now() - effect.start;

    if (elapsed < 0) {
      meshRef.current.visible = false;
      return;
    }

    const duration = effect.duration || 600;
    const progress = Math.min(elapsed / duration, 1);

    meshRef.current.visible = progress < 1;

    const easeOut = 1 - Math.pow(1 - progress, 2);

    const distance = particle.speed * easeOut;

    const x =
      Math.cos(particle.angle) * distance;

    const y =
      Math.sin(particle.angle) * distance +
      particle.vertical * progress -
      24 * progress * progress;

    meshRef.current.position.set(
      startX + x,
      startY + y,
      5 + (index % 3) * 0.1
    );

    meshRef.current.rotation.z =
      particle.rotation + progress * 5;

    const scale =
      particle.size * (1 - progress) +
      0.02;

    meshRef.current.scale.setScalar(scale);

    if (materialRef.current) {
      materialRef.current.opacity =
        Math.pow(1 - progress, 1.4);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 12, 12]} />

      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={1}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ======================================
// STREAK PARTICLES
// ======================================

function SparkParticle({ effect, index }) {
  const ref = useRef(null);
  const materialRef = useRef(null);

  const spark = useMemo(() => {
    const angle =
      (index / 8) * Math.PI * 2 + 0.2;

    return {
      angle,
      speed: 45 + (index % 4) * 15,
      length: 1.5 + (index % 3),
    };
  }, [index]);

  const color = getColor(effect);
  const [startX, startY] = getPosition(effect);

  useFrame(() => {
    if (!ref.current) return;

    const elapsed =
      performance.now() - effect.start;

    const progress = Math.min(
      elapsed / 450,
      1
    );

    ref.current.visible =
      elapsed >= 0 && progress < 1;

    const distance = spark.speed * progress;

    const x =
      Math.cos(spark.angle) * distance;

    const y =
      Math.sin(spark.angle) * distance -
      18 * progress * progress;

    ref.current.position.set(
      startX + x,
      startY + y,
      6
    );

    ref.current.rotation.z = spark.angle;

    ref.current.scale.set(
      spark.length * (1 - progress),
      1 - progress,
      1
    );

    if (materialRef.current) {
      materialRef.current.opacity =
        1 - progress;
    }
  });

  return (
    <mesh ref={ref}>
      <capsuleGeometry
        args={[0.45, 2, 4, 8]}
      />

      <meshBasicMaterial
        ref={materialRef}
        color="#ffffff"
        transparent
        opacity={1}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ======================================
// MAIN SHOCKWAVE
// ======================================

function Shockwave({ effect }) {
  const ringRef = useRef(null);
  const materialRef = useRef(null);

  const color = getColor(effect);
  const [x, y] = getPosition(effect);

  useFrame(() => {
    if (!ringRef.current) return;

    const elapsed =
      performance.now() - effect.start;

    const progress = Math.min(
      elapsed / (effect.duration || 600),
      1
    );

    ringRef.current.visible =
      elapsed >= 0 && progress < 1;

    const scale = 2 + progress * 24;

    ringRef.current.scale.setScalar(scale);

    if (materialRef.current) {
      materialRef.current.opacity =
        0.95 * Math.pow(1 - progress, 1.2);
    }
  });

  return (
    <mesh
      ref={ringRef}
      position={[x, y, 7]}
    >
      <torusGeometry args={[1, 0.075, 12, 64]} />

      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ======================================
// SECONDARY SHOCKWAVE
// ======================================

function SecondaryShockwave({ effect }) {
  const ringRef = useRef(null);
  const materialRef = useRef(null);

  const color = getColor(effect);
  const [x, y] = getPosition(effect);

  useFrame(() => {
    if (!ringRef.current) return;

    const elapsed =
      performance.now() - effect.start - 90;

    const progress = Math.min(
      Math.max(elapsed / 480, 0),
      1
    );

    ringRef.current.visible =
      elapsed >= 0 && progress < 1;

    const scale = 1 + progress * 18;

    ringRef.current.scale.setScalar(scale);

    if (materialRef.current) {
      materialRef.current.opacity =
        0.6 * (1 - progress);
    }
  });

  return (
    <mesh
      ref={ringRef}
      position={[x, y, 6.5]}
    >
      <torusGeometry args={[1, 0.035, 8, 64]} />

      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ======================================
// CENTER FLASH
// ======================================

function PopFlash({ effect }) {
  const flashRef = useRef(null);
  const materialRef = useRef(null);

  const color = getColor(effect);
  const [x, y] = getPosition(effect);

  useFrame(() => {
    if (!flashRef.current) return;

    const elapsed =
      performance.now() - effect.start;

    const progress = Math.min(
      elapsed / 260,
      1
    );

    flashRef.current.visible =
      elapsed >= 0 && progress < 1;

    const scale =
      0.5 + progress * 4;

    flashRef.current.scale.setScalar(scale);

    if (materialRef.current) {
      materialRef.current.opacity =
        0.8 * (1 - progress);
    }
  });

  return (
    <mesh
      ref={flashRef}
      position={[x, y, 8]}
    >
      <sphereGeometry args={[1, 24, 24]} />

      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ======================================
// MAIN EXPLOSION EFFECT
// ======================================

export default function BubbleBurst3D({
  effects = [],
}) {
  return (
    <group>
      {effects.map((effect, effectIndex) => {
        const key =
          effect.id ||
          `${effect.start}-${effectIndex}`;

        return (
          <group key={key}>
            <Shockwave effect={effect} />

            <SecondaryShockwave effect={effect} />

            <PopFlash effect={effect} />

            {Array.from(
              { length: PARTICLE_COUNT },
              (_, index) => (
                <BurstParticle
                  key={`particle-${index}`}
                  effect={effect}
                  index={index}
                />
              )
            )}

            {Array.from(
              { length: 8 },
              (_, index) => (
                <SparkParticle
                  key={`spark-${index}`}
                  effect={effect}
                  index={index}
                />
              )
            )}
          </group>
        );
      })}
    </group>
  );
}
