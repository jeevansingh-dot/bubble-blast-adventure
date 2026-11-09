import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic user data fallbacks
  const username = user?.username || 'Manoj';
  const completedLevels = user?.progress?.completedLevels || 5;
  const totalStars = user?.progress?.totalStars || 14;
  const highScore = user?.progress?.highScore || 12450;

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '30px 16px',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* Welcome Hero Banner */}
      <div className="arcade-card-3d" style={{
        borderRadius: '28px',
        padding: '32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '75px',
            height: '75px',
            background: 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0284c7 60%, #0369a1 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 10px 25px rgba(56, 189, 248, 0.5), inset 0 2px 4px rgba(255,255,255,0.6)'
          }}>
            🎮
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Welcome back,
            </span>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {username} 🚀
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate('/levels')}
          style={{
            background: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '14px 32px',
            fontSize: '15px',
            fontWeight: '900',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: '0 8px 0 #064e3b, 0 15px 25px rgba(16, 185, 129, 0.4), inset 0 2px 3px rgba(255,255,255,0.4)',
            transition: 'all 0.15s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            outline: 'none'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = '0 4px 0 #064e3b, 0 8px 15px rgba(16, 185, 129, 0.4)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 8px 0 #064e3b, 0 15px 25px rgba(16, 185, 129, 0.4), inset 0 2px 3px rgba(255,255,255,0.4)';
          }}
        >
          ▶ Resume Game
        </button>
      </div>

      {/* Stats Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { title: 'Levels Cleared', value: `${completedLevels} / 40`, icon: '🗺️', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
          { title: 'Total Stars', value: `⭐ ${totalStars} / 120`, icon: '🌟', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
          { title: 'High Score', value: highScore.toLocaleString(), icon: '🏆', color: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
          { title: 'Global Rank', value: '#12', icon: '🌍', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' }
        ].map((stat, idx) => (
          <div key={idx} className="arcade-card-3d" style={{
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <span style={{ fontSize: '36px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
              {stat.icon}
            </span>
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.title}
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Hub / Recent Activity */}
      <div className="arcade-card-3d" style={{
        borderRadius: '24px',
        padding: '28px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚡</span> Quick Game Hub
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { title: 'Level Map', desc: 'Pick your next stage', icon: '🗺️', route: '/levels', bg: 'rgba(56, 189, 248, 0.1)' },
            { title: 'Leaderboard', desc: 'Check global top scores', icon: '🏆', route: '/leaderboard', bg: 'rgba(251, 191, 36, 0.1)' },
            { title: 'Achievements', desc: 'View badges & rewards', icon: '🎖️', route: '/achievements', bg: 'rgba(236, 72, 153, 0.1)' }
          ].map((action, idx) => (
            <div
              key={idx}
              onClick={() => navigate(action.route)}
              style={{
                background: action.bg,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>{action.icon}</span>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>{action.title}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}