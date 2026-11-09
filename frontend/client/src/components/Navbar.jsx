
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  async function handleLogout() {
    close();
    await logout();
    navigate("/");
  }

  return (
    <header className="nav">
      {/* Logo */}
      <Link to="/" className="nav-brand" onClick={close}>
        <span className="nav-dot" aria-hidden="true" />
        {GAME_NAME}
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Navigation Links */}
      <nav
        id="main-nav"
        aria-label="Main"
        className={`nav-links${open ? " open" : ""}`}
      >
        <NavLink to="/" end className="nav-link" onClick={close}>
          Home
        </NavLink>

        {user ? (
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

            <NavLink to="/profile" className="nav-link" onClick={close}>
              Profile
            </NavLink>

            <NavLink to="/settings" className="nav-link" onClick={close}>
              Settings
            </NavLink>

            <span className="nav-user">
              Hi, {user.name}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="nav-btn"
            >
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
