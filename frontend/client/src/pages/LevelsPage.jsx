
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  isUnlocked,
  progressFromUser,
} from "../utils/progress.js";

const categories = [
  {
    title: "Magical Garden",
    range: "LEVELS 01–05",
    icon: "🌿",
    start: 1,
    end: 5,
    color: "#34d399",
    glow: "rgba(52,211,153,.35)",
    description: "Begin your bubble adventure",
    atmosphere: "garden",
  },
  {
    title: "Underwater Ocean",
    range: "LEVELS 06–10",
    icon: "🌊",
    start: 6,
    end: 10,
    color: "#38bdf8",
    glow: "rgba(56,189,248,.35)",
    description: "Explore the mysterious deep",
    atmosphere: "ocean",
  },
  {
    title: "Fantasy Valley",
    range: "LEVELS 11–20",
    icon: "🔮",
    start: 11,
    end: 20,
    color: "#a78bfa",
    glow: "rgba(167,139,250,.35)",
    description: "Discover a magical dimension",
    atmosphere: "fantasy",
  },
  {
    title: "Icy Peaks",
    range: "LEVELS 21–30",
    icon: "❄️",
    start: 21,
    end: 30,
    color: "#67e8f9",
    glow: "rgba(103,232,249,.35)",
    description: "Conquer the frozen mountains",
    atmosphere: "ice",
  },
  {
    title: "Lava Volcano",
    range: "LEVELS 31–35",
    icon: "🔥",
    start: 31,
    end: 35,
    color: "#fb923c",
    glow: "rgba(251,146,60,.35)",
    description: "Survive the burning world",
    atmosphere: "lava",
  },
  {
    title: "Cosmic Galaxy",
    range: "LEVELS 36–40",
    icon: "🌌",
    start: 36,
    end: 40,
    color: "#e879f9",
    glow: "rgba(232,121,249,.35)",
    description: "Reach the ultimate dimension",
    atmosphere: "galaxy",
  },
];

const styles = `
.levels-page {
  width: 100%;
  max-width: 1250px;
  margin: auto;
  padding: 30px 20px 70px;
  color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.levels-page * {
  box-sizing: border-box;
}

.levels-page button {
  font-family: inherit;
}

.levels-ambient {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -2;
  background:
    radial-gradient(ellipse at 15% 20%,rgba(30,64,175,.16),transparent 40%),
    radial-gradient(ellipse at 85% 75%,rgba(126,34,206,.14),transparent 40%);
}

.levels-ambient::before,
.levels-ambient::after {
  content: "";
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: .17;
  animation: galaxyFloat 12s ease-in-out infinite alternate;
}

.levels-ambient::before {
  background: #2563eb;
  top: 10%;
  left: -200px;
}

.levels-ambient::after {
  background: #9333ea;
  right: -200px;
  bottom: 5%;
  animation-delay: -5s;
}

.galaxy-star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255,255,255,.8);
  opacity: .5;
  animation: starTwinkle var(--duration) ease-in-out infinite alternate;
  animation-delay: var(--delay);
}

.galaxy-particle {
  position: absolute;
  left: var(--x);
  bottom: -30px;
  width: var(--size);
  height: var(--size);
  border: 1px solid rgba(125,211,252,.4);
  border-radius: 50%;
  box-shadow: inset 0 0 8px rgba(56,189,248,.25);
  animation: galaxyRise var(--duration) linear infinite;
  animation-delay: var(--delay);
}

.levels-hero {
  position: relative;
  overflow: hidden;
  padding: 38px;
  border: 1px solid rgba(125,211,252,.22);
  border-radius: 30px;
  background:
    radial-gradient(ellipse at 80% 5%,rgba(14,165,233,.2),transparent 40%),
    radial-gradient(ellipse at 5% 100%,rgba(124,58,237,.18),transparent 45%),
    linear-gradient(135deg,#101e3b,#080e1e 75%);
  box-shadow:
    0 25px 70px rgba(0,0,0,.4),
    inset 0 1px rgba(255,255,255,.08);
  margin-bottom: 35px;
}

.levels-hero::after {
  content: "✦";
  position: absolute;
  right: 7%;
  top: 3%;
  font-size: 145px;
  color: rgba(56,189,248,.12);
  animation: starRotate 24s linear infinite;
  pointer-events: none;
}

.hero-orbit {
  position: absolute;
  right: 7%;
  top: 18%;
  width: 170px;
  height: 170px;
  border: 1px solid rgba(56,189,248,.2);
  border-radius: 50%;
  box-shadow: 0 0 35px rgba(56,189,248,.1);
  animation: orbitSpin 18s linear infinite;
}

.hero-orbit::before {
  content: "";
  position: absolute;
  top: 18px;
  left: 12px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 20px #38bdf8;
}

.levels-eyebrow {
  color: #67e8f9;
  font-size: 11px;
  letter-spacing: 4px;
  font-weight: 1000;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.levels-title {
  font-size: clamp(32px,5vw,57px);
  font-weight: 1000;
  letter-spacing: 2px;
  margin: 0;
  line-height: 1.12;
  position: relative;
  z-index: 1;
}

.levels-title span {
  background: linear-gradient(90deg,#38bdf8,#818cf8,#c084fc);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px rgba(56,189,248,.3));
}

.levels-subtitle {
  color: #94a3b8;
  margin: 13px 0 0;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.levels-stats {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 14px;
  margin-top: 32px;
  position: relative;
  z-index: 1;
}

.level-stat {
  padding: 17px;
  border-radius: 18px;
  background: rgba(2,8,23,.62);
  border: 1px solid rgba(148,163,184,.15);
  backdrop-filter: blur(12px);
  transition: .3s ease;
}

.level-stat:hover {
  transform: translateY(-5px);
  border-color: rgba(56,189,248,.5);
  box-shadow: 0 10px 25px rgba(14,165,233,.12);
}

.level-stat-label {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.level-stat-value {
  display: block;
  font-size: 27px;
  font-weight: 1000;
  margin-top: 7px;
}

.level-overall {
  margin-top: 26px;
  position: relative;
  z-index: 1;
}

.level-overall-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 11px;
  letter-spacing: 1px;
}

.level-progress-track {
  height: 11px;
  border-radius: 30px;
  background: rgba(148,163,184,.15);
  overflow: hidden;
}

.level-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#06b6d4,#6366f1,#c084fc);
  box-shadow: 0 0 20px rgba(56,189,248,.65);
  transition: width .9s ease;
}

.level-section-title {
  font-size: 12px;
  font-weight: 1000;
  letter-spacing: 4px;
  color: #64748b;
  margin: 0 0 17px 5px;
}

.level-world {
  position: relative;
  margin-bottom: 28px;
  padding: 25px;
  border-radius: 26px;
  border: 1px solid rgba(148,163,184,.15);
  background:
    radial-gradient(ellipse at 100% 0%,var(--world-glow),transparent 45%),
    linear-gradient(145deg,rgba(17,28,51,.97),rgba(5,11,25,.98));
  box-shadow: 0 18px 45px rgba(0,0,0,.28);
  overflow: hidden;
  animation: worldAppear .7s ease both;
  transition: border-color .3s ease, transform .3s ease;
}

.level-world:hover {
  border-color: var(--world-color);
}

.level-world::before {
  content: "";
  position: absolute;
  top: -110px;
  right: -90px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: var(--world-color);
  filter: blur(90px);
  opacity: .17;
  pointer-events: none;
}

.level-world-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 21px;
  position: relative;
  z-index: 1;
}

.level-world-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-portal-icon {
  width: 65px;
  height: 65px;
  border-radius: 21px;
  display: grid;
  place-items: center;
  font-size: 32px;
  background:
    radial-gradient(circle at 30% 20%,rgba(255,255,255,.23),transparent 55%),
    linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.025));
  border: 1px solid var(--world-color);
  box-shadow:
    0 0 25px var(--world-glow),
    inset 0 0 15px rgba(255,255,255,.07);
  animation: portalFloat 3s ease-in-out infinite;
  position: relative;
}

.level-portal-icon::after {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px solid var(--world-color);
  border-radius: 25px;
  opacity: .25;
  animation: portalPulse 3s ease-in-out infinite;
}

.level-world-title {
  font-size: 21px;
  font-weight: 1000;
  margin: 0;
  letter-spacing: .3px;
}

.level-world-range {
  display: block;
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: 2px;
  margin-top: 6px;
}

.level-world-description {
  color: #64748b;
  font-size: 11px;
  margin-top: 5px;
}

.level-world-count {
  padding: 9px 15px;
  border-radius: 30px;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.09);
  color: #cbd5e1;
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: 1px;
}

.level-world-progress {
  height: 5px;
  background: rgba(255,255,255,.08);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.level-world-progress > div {
  height: 100%;
  border-radius: 10px;
  box-shadow: 0 0 15px currentColor;
  transition: width .8s ease;
}

.level-map-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px 5px 25px;
  scrollbar-width: thin;
  scrollbar-color: rgba(56,189,248,.4) transparent;
  position: relative;
  z-index: 1;
}

.level-map-scroll::-webkit-scrollbar {
  height: 5px;
}

.level-map-scroll::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,.4);
  border-radius: 20px;
}

.level-map-track {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-width: max-content;
  padding: 0 15px;
}

.level-map-path {
  position: absolute;
  top: 38px;
  left: 48px;
  right: 48px;
  height: 5px;
  border-radius: 20px;
  background: rgba(71,85,105,.45);
  overflow: hidden;
  z-index: 0;
}

.level-map-path::before {
  content: "";
  position: absolute;
  inset: 0;
  width: var(--path-progress);
  background: linear-gradient(90deg,var(--path-color),#67e8f9,#c084fc);
  border-radius: inherit;
  box-shadow: 0 0 15px var(--path-color);
  transition: width 1s ease;
}

.level-map-path::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 65px;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
  animation: pathShine 3s linear infinite;
}

.level-map-item {
  width: 100px;
  flex: 0 0 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.level-map-item:nth-child(even) {
  margin-top: 55px;
}

.level-map-item:nth-child(odd) {
  margin-top: 0;
}

.level-map-node {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 23px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  outline: none;
  transition: transform .25s ease,box-shadow .25s ease;
}

.level-map-node.unlocked {
  cursor: pointer;
  color: white;
  background:
    radial-gradient(circle at 30% 15%,rgba(255,255,255,.32),transparent 55%),
    linear-gradient(145deg,#075985,#172554 75%);
  border: 1px solid rgba(56,189,248,.7);
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,.25),
    0 8px 22px rgba(3,105,161,.28);
}

.level-map-node.completed {
  background:
    radial-gradient(circle at 30% 15%,rgba(255,255,255,.32),transparent 55%),
    linear-gradient(145deg,#a16207,#422006 85%);
  border-color: rgba(251,191,36,.9);
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,.2),
    0 0 23px rgba(251,191,36,.2);
}

.level-map-node.current {
  border: 2px solid #67e8f9;
  box-shadow:
    0 0 0 6px rgba(34,211,238,.1),
    0 0 30px rgba(34,211,238,.65);
  animation: currentPulse 2s infinite;
}

.level-map-node.current::before {
  content: "";
  position: absolute;
  inset: -11px;
  border: 1px solid #67e8f9;
  border-radius: 28px;
  animation: spotlight 2s ease-out infinite;
  pointer-events: none;
}

.level-map-node.locked {
  color: #64748b;
  background: linear-gradient(145deg,#1e293b,#080e1e);
  border: 1px solid rgba(100,116,139,.3);
  cursor: not-allowed;
  opacity: .48;
}

.level-map-node.unlocked:hover {
  transform: translateY(-8px) scale(1.09);
  box-shadow: 0 14px 30px rgba(14,165,233,.45);
  border-color: #67e8f9;
}

.level-map-node:focus-visible {
  outline: 3px solid #67e8f9;
  outline-offset: 5px;
}

.level-map-number {
  font-size: 22px;
  font-weight: 1000;
  line-height: 1;
}

.level-map-stars {
  font-size: 9px;
  letter-spacing: 1px;
  white-space: nowrap;
  color: #fde68a;
}

.level-map-lock {
  font-size: 19px;
  filter: grayscale(.5);
}

.level-map-label {
  margin-top: 13px;
  min-height: 24px;
  text-align: center;
  font-size: 9px;
  font-weight: 1000;
  letter-spacing: .7px;
  color: #64748b;
  white-space: nowrap;
}

.level-map-label.current-label {
  color: #67e8f9;
  text-shadow: 0 0 12px rgba(103,232,249,.5);
}

.level-map-label.completed-label {
  color: #fbbf24;
}

.level-map-check {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  background: #fbbf24;
  color: #422006;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 1000;
  border: 2px solid #111827;
}

.level-world-hint {
  margin-top: 6px;
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-align: center;
}

.levels-footer {
  margin-top: 32px;
  padding: 20px;
  text-align: center;
  border-radius: 18px;
  border: 1px solid rgba(148,163,184,.12);
  background: rgba(15,23,42,.55);
  color: #64748b;
  font-size: 11px;
  letter-spacing: 1px;
}

@keyframes galaxyFloat {
  from { transform: translateY(-20px) scale(.9); }
  to { transform: translateY(30px) scale(1.15); }
}

@keyframes starTwinkle {
  from { opacity: .15; transform: scale(.7); }
  to { opacity: .9; transform: scale(1.3); }
}

@keyframes galaxyRise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: .6; }
  90% { opacity: .4; }
  100% { transform: translateY(-110vh) translateX(35px); opacity: 0; }
}

@keyframes starRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orbitSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes portalFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}

@keyframes portalPulse {
  0%,100% { transform: scale(.95); opacity: .15; }
  50% { transform: scale(1.12); opacity: .55; }
}

@keyframes pathShine {
  from { transform: translateX(-100px); }
  to { transform: translateX(100vw); }
}

@keyframes spotlight {
  0% { transform: scale(.8); opacity: .8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes currentPulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(34,211,238,.08),0 0 15px rgba(34,211,238,.2); }
  50% { box-shadow: 0 0 0 7px rgba(34,211,238,.13),0 0 28px rgba(34,211,238,.5); }
}

@keyframes worldAppear {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media(max-width:650px) {
  .levels-page {
    padding: 18px 11px 45px;
  }

  .levels-hero {
    padding: 24px 17px;
    border-radius: 23px;
  }

  .hero-orbit {
    width: 100px;
    height: 100px;
    right: 5%;
    top: 15%;
  }

  .levels-stats {
    gap: 8px;
  }

  .level-stat {
    padding: 12px 9px;
  }

  .level-stat-value {
    font-size: 20px;
  }

  .level-world {
    padding: 18px 13px;
    border-radius: 21px;
  }

  .level-world-title {
    font-size: 17px;
  }

  .level-portal-icon {
    width: 52px;
    height: 52px;
    font-size: 26px;
    border-radius: 17px;
  }

  .level-map-item {
    width: 84px;
    flex-basis: 84px;
  }

  .level-map-item:nth-child(even) {
    margin-top: 47px;
  }

  .level-map-node {
    width: 59px;
    height: 59px;
    border-radius: 19px;
  }

  .level-map-path {
    top: 33px;
    left: 41px;
    right: 41px;
  }

  .level-map-number {
    font-size: 19px;
  }

  .level-world-count {
    font-size: 9px;
  }
}

@media(prefers-reduced-motion:reduce) {
  .levels-page *,
  .levels-page *::before,
  .levels-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
`;

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const progress = progressFromUser(user);
  const stars = progress.stars || {};

  const totalLevels = 40;

  const completedLevels = Object.values(stars).filter(
    (value) => Number(value) > 0
  ).length;

  const totalStars = Object.values(stars).reduce(
    (total, value) => total + Number(value || 0),
    0
  );

  const progressPercent = Math.min(
    100,
    (completedLevels / totalLevels) * 100
  );

  const unlockedLevels = Array.from(
    { length: totalLevels },
    (_, index) => index + 1
  ).filter((level) => isUnlocked(level, progress));

  const currentLevel =
    unlockedLevels.find(
      (level) => Number(stars[level] || 0) === 0
    ) ||
    unlockedLevels[unlockedLevels.length - 1] ||
    1;

  const starsData = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        x: `${(index * 37 + 13) % 100}%`,
        y: `${(index * 53 + 7) % 100}%`,
        size: `${1 + (index % 3)}px`,
        duration: `${2 + (index % 4)}s`,
        delay: `${-(index % 5)}s`,
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        x: `${(index * 19 + 8) % 100}%`,
        size: `${10 + (index % 4) * 5}px`,
        duration: `${15 + (index % 7) * 2}s`,
        delay: `${-(index % 9) * 2}s`,
      })),
    []
  );

  return (
    <div className="levels-page">
      <style>{styles}</style>

      {/* GALAXY BACKGROUND */}

      <div className="levels-ambient" aria-hidden="true">
        {starsData.map((star, index) => (
          <span
            key={`star-${index}`}
            className="galaxy-star"
            style={{
              "--x": star.x,
              "--y": star.y,
              "--size": star.size,
              "--duration": star.duration,
              "--delay": star.delay,
            }}
          />
        ))}

        {particles.map((particle, index) => (
          <span
            key={`particle-${index}`}
            className="galaxy-particle"
            style={{
              "--x": particle.x,
              "--size": particle.size,
              "--duration": particle.duration,
              "--delay": particle.delay,
            }}
          />
        ))}
      </div>

      {/* HERO */}

      <section className="levels-hero">
        <div className="hero-orbit" />

        <div className="levels-eyebrow">
          BUBBLE BLAST ADVENTURE · WORLD MAP
        </div>

        <h1 className="levels-title">
          LEVEL <span>JOURNEY</span>
        </h1>

        <p className="levels-subtitle">
          Explore mysterious worlds, pop bubbles and become the ultimate champion.
        </p>

        <div className="levels-stats">
          <div className="level-stat">
            <span className="level-stat-label">
              COMPLETED
            </span>

            <span
              className="level-stat-value"
              style={{ color: "#38bdf8" }}
            >
              {completedLevels}
              <span style={{ color: "#64748b", fontSize: 14 }}>
                {" "}/ 40
              </span>
            </span>
          </div>

          <div className="level-stat">
            <span className="level-stat-label">
              TOTAL STARS
            </span>

            <span
              className="level-stat-value"
              style={{ color: "#fbbf24" }}
            >
              ⭐ {totalStars}
              <span style={{ color: "#64748b", fontSize: 14 }}>
                {" "}/ 120
              </span>
            </span>
          </div>

          <div className="level-stat">
            <span className="level-stat-label">
              UNLOCKED
            </span>

            <span
              className="level-stat-value"
              style={{ color: "#34d399" }}
            >
              {unlockedLevels.length}
              <span style={{ color: "#64748b", fontSize: 14 }}>
                {" "}/ 40
              </span>
            </span>
          </div>
        </div>

        <div className="level-overall">
          <div className="level-overall-top">
            <span>YOUR ADVENTURE PROGRESS</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>

          <div className="level-progress-track">
            <div
              className="level-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* WORLD MAP */}

      <h2 className="level-section-title">
        SELECT YOUR WORLD
      </h2>

      {categories.map((cat, index) => {
        const levelNumbers = Array.from(
          { length: cat.end - cat.start + 1 },
          (_, i) => cat.start + i
        );

        const categoryCompleted = levelNumbers.filter(
          (level) => Number(stars[level] || 0) > 0
        ).length;

        const categoryPercent =
          (categoryCompleted / levelNumbers.length) * 100;

        const categoryUnlocked = levelNumbers.filter(
          (level) => isUnlocked(level, progress)
        ).length;

        const pathProgress =
          categoryUnlocked <= 1
            ? 0
            : ((categoryUnlocked - 1) /
                Math.max(1, levelNumbers.length - 1)) *
              100;

        return (
          <section
            className="level-world"
            key={cat.title}
            style={{
              "--world-color": cat.color,
              "--world-glow": cat.glow,
              borderColor: `${cat.color}35`,
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="level-world-header">
              <div className="level-world-info">
                <div className="level-portal-icon">
                  {cat.icon}
                </div>

                <div>
                  <h2 className="level-world-title">
                    {cat.title}
                  </h2>

                  <span
                    className="level-world-range"
                    style={{ color: cat.color }}
                  >
                    {cat.range}
                  </span>

                  <div className="level-world-description">
                    {cat.description}
                  </div>
                </div>
              </div>

              <div className="level-world-count">
                {categoryCompleted}/{levelNumbers.length} CLEARED
              </div>
            </div>

            <div className="level-world-progress">
              <div
                style={{
                  width: `${categoryPercent}%`,
                  background: `linear-gradient(90deg,${cat.color},#818cf8)`,
                  color: cat.color,
                }}
              />
            </div>

            <div className="level-map-scroll">
              <div className="level-map-track">
                <div
                  className="level-map-path"
                  style={{
                    "--path-progress": `${pathProgress}%`,
                    "--path-color": cat.color,
                  }}
                />

                {levelNumbers.map((levelNum) => {
                  const unlocked = isUnlocked(
                    levelNum,
                    progress
                  );

                  const earnedStars = Math.max(
                    0,
                    Math.min(3, Number(stars[levelNum] || 0))
                  );

                  const completed = earnedStars > 0;

                  const isCurrent =
                    unlocked &&
                    !completed &&
                    levelNum === currentLevel;

                  return (
                    <div
                      className="level-map-item"
                      key={levelNum}
                    >
                      <button
                        type="button"
                        className={[
                          "level-map-node",
                          unlocked ? "unlocked" : "locked",
                          completed ? "completed" : "",
                          isCurrent ? "current" : "",
                        ].join(" ")}
                        onClick={() => {
                          if (unlocked) {
                            navigate(`/game/${levelNum}`);
                          }
                        }}
                        disabled={!unlocked}
                        title={
                          completed
                            ? `Level ${levelNum} completed with ${earnedStars} stars`
                            : unlocked
                            ? `Play Level ${levelNum}`
                            : "Complete previous levels to unlock"
                        }
                      >
                        {completed && (
                          <span className="level-map-check">
                            ✓
                          </span>
                        )}

                        <span className="level-map-number">
                          {levelNum}
                        </span>

                        {unlocked ? (
                          <span className="level-map-stars">
                            {"★".repeat(earnedStars)}
                            {"☆".repeat(3 - earnedStars)}
                          </span>
                        ) : (
                          <span className="level-map-lock">
                            🔒
                          </span>
                        )}
                      </button>

                      <span
                        className={[
                          "level-map-label",
                          isCurrent ? "current-label" : "",
                          completed ? "completed-label" : "",
                        ].join(" ")}
                      >
                        {completed
                          ? "✓ CLEARED"
                          : isCurrent
                          ? "▶ PLAY NOW"
                          : unlocked
                          ? "UNLOCKED"
                          : "LOCKED"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="level-world-hint">
              ← SCROLL TO EXPLORE ALL LEVELS →
            </div>
          </section>
        );
      })}

      <div className="levels-footer">
        ✦ YOUR JOURNEY · YOUR LEGEND · YOUR VICTORY ✦
      </div>
    </div>
  );
}
