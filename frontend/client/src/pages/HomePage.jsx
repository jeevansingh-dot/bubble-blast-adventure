import { Link } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: "center", maxWidth: "520px", padding: "32px 0" }}>
      <h1 style={{ fontSize: "clamp(32px, 8vw, 56px)", margin: "0 0 8px" }}>
        {GAME_NAME}
      </h1>
      <p style={{ fontSize: "24px", margin: "0 0 28px" }}>
        Aim. Match. Pop. Rescue.
      </p>

      <Link
        to={user ? "/levels" : "/register"}
        style={{
          display: "inline-block",
          padding: "14px 40px",
          fontSize: "22px",
          fontWeight: "900",
          borderRadius: "999px",
          background: "#ffd93d",
          color: "#1b1b3a",
          textDecoration: "none",
        }}
      >
        PLAY NOW
      </Link>

      {!user && (
        <p>
          Already a player?{" "}
          <Link to="/login" style={{ color: "#ffd93d" }}>
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}