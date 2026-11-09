import { Link } from "react-router-dom";
import Mascot from "../components/Mascot.jsx";
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
  ["🔄", "Swap Bubble"],
  ["🏆", "Leaderboard"],
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "640px",
        padding: "20px 0 40px",
      }}
    >
      <Mascot />

      <h1
        className="title-gradient"
        style={{
          fontSize: "clamp(36px, 9vw, 68px)",
          lineHeight: 1.05,
          margin: "10px 0 16px",
          fontWeight: 900,
          letterSpacing: "-0.5px",
        }}
      >
        {GAME_NAME}
      </h1>

      <p
        style={{
          margin: "0 0 22px",
          fontSize: "16px",
          color: "rgba(244,246,255,0.75)",
          fontWeight: 500,
        }}
      >
        Aim. Match. Pop. Rescue the chicks.
      </p>

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        {STEPS.map(([icon, label]) => (
          <span key={label} className="chip">
            <span aria-hidden="true">{icon}</span> {label}
          </span>
        ))}
      </div>

      <Link to={user ? "/levels" : "/register"} className="play-btn">
        PLAY NOW
      </Link>

      {!user && (
        <p style={{ marginTop: "20px", color: "rgba(244,246,255,0.8)" }}>
          Already a player?{" "}
          <Link to="/login" style={{ color: "#ffd93d", fontWeight: "bold" }}>
            Log in
          </Link>
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginTop: "40px",
        }}
      >
        {FEATURES.map(([icon, label]) => (
          <div key={label} className="feature-card">
            <div
              aria-hidden="true"
              style={{ fontSize: "28px", marginBottom: "6px" }}
            >
              {icon}
            </div>
            <strong style={{ fontSize: "14px" }}>{label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}