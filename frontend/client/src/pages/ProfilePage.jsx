import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const username = user?.username || 'manoj';
  const email = user?.email || 'manoj@gmail.com';
  const joinedDate = '3 November 2026';
  
  const stats = [
    { label: 'Current Level', value: '6', icon: '🎮', color: '#38bdf8' },
    { label: 'Total Stars', value: '14', icon: '⭐', color: '#fbbf24' },
    { label: 'Total Score', value: '7,235', icon: '💎', color: '#06b6d4' },
    { label: 'Bubbles Popped', value: '509', icon: '🫧', color: '#ec4899' },
    { label: 'Best Combo', value: 'x5', icon: '🔥', color: '#f97316' },
    { label: 'Rescued Chicks', value: '0', icon: '🐥', color: '#a855f7' },
    { label: 'Levels Completed', value: '5', icon: '🏆', color: '#eab308' },
    { label: 'Boosters Used', value: '21', icon: '🎁', color: '#10b981' },
  ];

  const boosters = [
    { name: 'Bomb', count: 2, icon: '💣', color: '#ef4444' },
    { name: 'Rainbow', count: 2, icon: '🌈', color: '#3b82f6' },
    { name: 'Extra Shot', count: 2, icon: '⚡', color: '#a855f7' },
  ];

  const achievements = [
    { title: 'First Pop', date: '11/3/2026', icon: '🏆' },
    { title: 'Three Star Hero', date: '11/3/2026', icon: '🌟' },
    { title: 'Combo Starter', date: '11/3/2026', icon: '🔥' },
    { title: 'Perfect Aim', date: '11/3/2026', icon: '🎯' },
  ];

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px 16px',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Profile Header Banner */}
      <div className="arcade-card-3d" style={{
        borderRadius: '24px',
        padding: '30px',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: '900',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(56, 189, 248, 0.5), inset 0 2px 4px rgba(255,255,255,0.5)'
        }}>
          {username.charAt(0).toUpperCase()}
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Player Profile
          </span>
          <h1 style={{ margin: '2px 0 4px 0', fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>
            {username}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{email} • Joined {joinedDate}</p>
        </div>
      </div>

      {/* Game Statistics Grid */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏆</span> Your Game Statistics
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="arcade-card-3d" style={{
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booster Inventory */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎁</span> Booster Inventory
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          {boosters.map((b, idx) => (
            <div key={idx} className="arcade-card-3d" style={{
              borderRadius: '16px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>{b.icon}</span>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>{b.name}</h4>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', background: 'rgba(56,189,248,0.1)', padding: '2px 10px', borderRadius: '10px' }}>
                Qty: {b.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎖️</span> Achievements ({achievements.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {achievements.map((ach, idx) => (
            <div key={idx} className="arcade-card-3d" style={{
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '32px' }}>{ach.icon}</span>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>{ach.title}</h4>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Unlocked {ach.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}