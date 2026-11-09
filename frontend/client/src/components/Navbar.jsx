import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Levels', path: '/levels' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Achievements', path: '/achievements' },
  ];

  if (!user) return null;

  return (
    <header className="custom-navbar">
      <div className="nav-container">
        
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="logo-badge">B</div>
          <span className="brand-title">
            BUBBLE <span>BLAST</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="nav-links">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="nav-user-section">
          <div className="user-badge">
            <span className="online-dot"></span>
            <span>Hi, <strong>{user.username || user.name || 'Player'}</strong></span>
          </div>

          <Link
            to="/profile"
            className={`icon-btn ${location.pathname === '/profile' ? 'active' : ''}`}
            title="Profile Settings"
          >
            ⚙️
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </div>

      </div>
    </header>
  );
}