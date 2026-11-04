import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu
  const close = () => setOpen(false);

  async function handleLogout() {
    close();
    await logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <Link to="/" className="nav-brand" onClick={close}>
        <span className="nav-dot" aria-hidden="true" />
        {GAME_NAME}
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "☰"}
      </button>

      <nav id="main-nav" aria-label="Main" className={`nav-links${open ? " open" : ""}`}>
        <NavLink to="/" end className="nav-link" onClick={close}>
          Home
        </NavLink>

        {user && (
          <>
            <NavLink to="/dashboard" className="nav-link" onClick={close}>
              Dashboard
            </NavLink>
            <NavLink to="/levels" className="nav-link" onClick={close}>
              Levels
            </NavLink>
            <NavLink to="/leaderboard" className="nav-link" onClick={close}>
              Leaderboard
            </NavLink>
            <NavLink to="/achievements" className="nav-link" onClick={close}>
              Achievements
            </NavLink>
          </>
        )}

        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button onClick={handleLogout} className="nav-btn">
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link" onClick={close}>
              Log In
            </NavLink>
            <Link to="/register" className="nav-btn" onClick={close}>
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}