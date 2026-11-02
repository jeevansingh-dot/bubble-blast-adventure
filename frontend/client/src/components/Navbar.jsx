import { Link, NavLink, useNavigate } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#ffd93d" : "white",
  textDecoration: "none",
  fontWeight: "bold",
});

const smallButton = {
  padding: "6px 14px",
  fontSize: "15px",
  fontWeight: "bold",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  background: "#ffd93d",
  color: "#1b1b3a",
  textDecoration: "none",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header
      style={{
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px 20px",
        padding: "12px 16px",
        background: "#151a4a",
      }}
    >
      <Link
        to="/"
        style={{ color: "#ffd93d", textDecoration: "none", fontWeight: "900", fontSize: "20px" }}
      >
        {GAME_NAME}
      </Link>

      <nav
        aria-label="Main"
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}
      >
        <NavLink to="/" end style={linkStyle}>
          Home
        </NavLink>
               {user && (
          <>
            <NavLink to="/levels" style={linkStyle}>
              Levels
            </NavLink>
            <NavLink to="/leaderboard" style={linkStyle}>
              Leaderboard
            </NavLink>
          </>
        )}

        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button onClick={handleLogout} style={smallButton}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>
              Log In
            </NavLink>
            <Link to="/register" style={smallButton}>
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}