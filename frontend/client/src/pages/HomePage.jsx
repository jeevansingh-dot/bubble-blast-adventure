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
  ["🏆", "Leaderboard"],
  ["🏅", "Achievements"],
];

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