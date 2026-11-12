
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Levels", path: "/levels" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Achievements", path: "/achievements" },
  ];

  if (!user) return null;

  return (
    <>
      <header className="custom-navbar">
        <div className="nav-container">

          {/* Brand */}
          <Link
            to="/"
            className="nav-brand"
            onClick={() => setMenuOpen(false)}
          >
            <div className="logo-badge">B</div>

            <span className="brand-title">
              BUBBLE <span>BLAST</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link-item ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="nav-user-section">
            <div className="user-badge">
              <span className="online-dot"></span>
              <span>
                Hi, <strong>{user.username || user.name || "Player"}</strong>
              </span>
            </div>

            <Link
              to="/profile"
              className={`icon-btn ${
                location.pathname === "/profile" ? "active" : ""
              }`}
              title="Profile Settings"
            >
              ⚙️
            </Link>

            <button onClick={handleLogout} className="logout-btn">
              Log Out
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`mobile-menu-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

        {/* Mobile Dropdown */}
        <div className={`mobile-nav-panel ${menuOpen ? "show" : ""}`}>

          <div className="mobile-user-info">
            <span className="online-dot"></span>
            Welcome, <strong>{user.username || user.name || "Player"}</strong>
          </div>

          <nav className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`mobile-nav-link ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                {link.name}
                <span>›</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-nav-actions">
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="mobile-profile-btn"
            >
              ⚙️ Profile Settings
            </Link>

            <button
              onClick={handleLogout}
              className="mobile-logout-btn"
            >
              Log Out
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Responsive Styles */}
      <style>{`
        .mobile-menu-btn,
        .mobile-nav-panel {
          display: none;
        }

        @media (max-width: 768px) {

          .custom-navbar {
            position: relative;
            z-index: 1000;
            width: 100%;
            overflow: visible;
          }

          .nav-container {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .nav-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            text-decoration: none;
          }

          .brand-title {
            font-size: 19px;
            line-height: 1.15;
            white-space: nowrap;
          }

          .logo-badge {
            flex-shrink: 0;
          }

          .nav-links,
          .nav-user-section {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            width: 44px;
            height: 44px;
            flex-shrink: 0;
            border: 1px solid rgba(139, 92, 246, 0.45);
            border-radius: 12px;
            background: rgba(35, 43, 85, 0.9);
            cursor: pointer;
            padding: 10px;
            touch-action: manipulation;
          }

          .mobile-menu-btn span {
            display: block;
            width: 21px;
            height: 2px;
            border-radius: 5px;
            background: #ffffff;
            transition: transform 0.25s ease, opacity 0.25s ease;
          }

          .mobile-menu-btn.open span:first-child {
            transform: translateY(7px) rotate(45deg);
          }

          .mobile-menu-btn.open span:nth-child(2) {
            opacity: 0;
          }

          .mobile-menu-btn.open span:last-child {
            transform: translateY(-7px) rotate(-45deg);
          }

          .mobile-nav-panel {
            display: block;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            width: 100%;
            box-sizing: border-box;
            padding: 0 16px;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            visibility: hidden;
            background: #0b1022;
            border-bottom: 1px solid rgba(139, 92, 246, 0.3);
            transition:
              max-height 0.3s ease,
              opacity 0.25s ease,
              padding 0.3s ease,
              visibility 0.3s;
          }

          .mobile-nav-panel.show {
            max-height: 600px;
            opacity: 1;
            visibility: visible;
            padding: 16px;
            box-shadow: 0 18px 35px rgba(0, 0, 0, 0.45);
          }

          .mobile-user-info {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 12px;
            color: #cbd5e1;
            background: rgba(99, 102, 241, 0.12);
            font-size: 14px;
          }

          .mobile-user-info strong {
            color: #ffffff;
          }

          .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 14px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 11px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            background: rgba(30, 41, 80, 0.55);
            transition: 0.2s ease;
          }

          .mobile-nav-link span {
            font-size: 22px;
            color: #8b5cf6;
          }

          .mobile-nav-link.active {
            color: #ffffff;
            border-color: rgba(139, 92, 246, 0.6);
            background: linear-gradient(
              100deg,
              rgba(99, 102, 241, 0.3),
              rgba(168, 85, 247, 0.18)
            );
          }

          .mobile-nav-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 14px;
          }

          .mobile-profile-btn,
          .mobile-logout-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 43px;
            border-radius: 10px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            touch-action: manipulation;
          }

          .mobile-profile-btn {
            color: #ffffff;
            background: #27345e;
            border: 1px solid #485a91;
          }

          .mobile-logout-btn {
            color: #ffffff;
            background: linear-gradient(135deg, #dc2626, #9333ea);
            border: none;
          }
        }

        @media (max-width: 380px) {
          .brand-title {
            font-size: 16px;
          }

          .nav-container {
            padding: 10px 12px;
          }
        }
      `}</style>
    </>
  );
}
