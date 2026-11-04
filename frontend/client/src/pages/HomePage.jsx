import { Link } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS = [
  ["🎯", "Aim"],
  ["🫧", "Match"],
  ["💥", "Pop"],
  ["🐣", "Rescue"],
];

const FEATURES = [
  ["🗺️", "40+ Levels"],
  ["🧨", "Boosters"],
  ["🏆", "Leaderboard"],
  ["🏅", "Achievements"],
];

// Bubbo: our original helper character
function Mascot() {
  return (
    <svg
      className="mascot"
      width="150"
      height="150"
      viewBox="0 0 150 150"
      role="img"
      aria-label="Bubbo, the friendly bubble helper"
    >
      <defs>
        <radialGradient id="bubboBody" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="45%" stopColor="#ffd93d" />
          <stop offset="100%" stopColor="#ff9a3d" />
        </radialGradient>
      </defs>
      <ellipse cx="75" cy="140" rx="34" ry="6" fill="rgba(0,0,0,0.25)" />
      <circle cx="75" cy="72" r="58" fill="url(#bubboBody)" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      <ellipse cx="52" cy="40" rx="14" ry="8" fill="rgba(255,255,255,0.7)" transform="rotate(-30 52 40)" />
      <circle cx="55" cy="72" r="9" fill="#1b1b3a" />
      <circle cx="95" cy="72" r="9" fill="#1b1b3a" />
      <circle cx="58" cy="69" r="3" fill="white" />
      <circle cx="98" cy="69" r="3" fill="white" />
      <path d="M58 94 Q75 112 92 94" fill="none" stroke="#1b1b3a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="90" r="7" fill="rgba(255,90,120,0.45)" />
      <circle cx="110" cy="90" r="7" fill="rgba(255,90,120,0.45)" />
    </svg>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: "center", maxWidth: "620px", padding: "16px 0 32px" }}>
      <Mascot />

      <h1
        className="title-gradient"
        style={{
          fontSize: "clamp(34px, 9vw, 64px)",
          lineHeight: 1.05,
          margin: "8px 0 14px",
          fontWeight: 900,
        }}
      >
        {GAME_NAME}
      </h1>

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        {STEPS.map(([icon, label]) => (
          <span key={label} className="chip">
            <span aria-hidden="true">{icon}</span> {label}.
          </span>
        ))}
      </div>

      <Link to={user ? "/levels" : "/register"} className="play-btn">
        PLAY NOW
      </Link>

      {!user && (
        <p style={{ marginTop: "18px" }}>
          Already a player?{" "}
          <Link to="/login" style={{ color: "#ffd93d", fontWeight: "bold" }}>
            Log in
          </Link>
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "36px",
        }}
      >
        {FEATURES.map(([icon, label]) => (
          <div key={label} className="feature-card">
            <div aria-hidden="true" style={{ fontSize: "26px" }}>
              {icon}
            </div>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}