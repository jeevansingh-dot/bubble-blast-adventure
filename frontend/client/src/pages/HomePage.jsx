import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* 3D Background Glowing Mesh Spheres */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
        top: '-10%', left: '15%', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(0,0,0,0) 70%)',
        bottom: '-10%', right: '15%', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
      }}></div>

      {/* Main 3D Arcade Glass Stage */}
      <div className="arcade-card-3d" style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '780px',
        width: '100%',
        borderRadius: '36px',
        padding: '55px 35px 45px 35px',
        textAlign: 'center'
      }}>

        {/* Floating 3D Chick Sphere */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 28px auto',
          background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #f59e0b 60%, #b45309 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '52px',
          boxShadow: `
            0 15px 35px rgba(245, 158, 11, 0.6),
            inset -6px -6px 12px rgba(180, 83, 9, 0.8),
            inset 6px 6px 12px rgba(255, 255, 255, 0.8)
          `,
          animation: 'float3D 3.5s ease-in-out infinite'
        }}>
          🐥
        </div>

        {/* 3D Extruded Metallic Glowing Header */}
        <h1 style={{
          fontSize: 'clamp(34px, 5.5vw, 56px)',
          fontWeight: '900',
          color: '#ffffff',
          margin: '0 0 12px 0',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: `
            0 1px 0 #94a3b8,
            0 2px 0 #64748b,
            0 3px 0 #475569,
            0 4px 0 #334155,
            0 5px 10px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(6, 182, 212, 0.6)
          `
        }}>
          BUBBLE <span style={{ 
            color: '#38bdf8',
            textShadow: '0 0 25px rgba(56, 189, 248, 0.8), 0 4px 0 #0284c7'
          }}>BLAST</span> ADVENTURE
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#cbd5e1',
          margin: '0 auto 32px auto',
          fontWeight: '500',
          maxWidth: '520px',
          textShadow: '0 2px 4px rgba(0,0,0,0.6)'
        }}>
          Aim. Match. Pop. Rescue the trapped baby chicks across vibrant arcade worlds!
        </p>

        {/* 3D Pill Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {[
            { label: '🎯 Precision Aim', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8' },
            { label: '💥 Combo Pops', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: '#f472b6' },
            { label: '🐥 Chick Rescue', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: '#fbbf24' }
          ].map((pill, idx) => (
            <span key={idx} style={{
              background: pill.bg,
              border: `1px solid ${pill.border}`,
              padding: '8px 18px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: '700',
              color: pill.color,
              boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}>
              {pill.label}
            </span>
          ))}
        </div>

        {/* Heavy 3D Arcade Play Button */}
        <button
          onClick={() => navigate('/levels')}
          style={{
            background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '18px 56px',
            fontSize: '20px',
            fontWeight: '900',
            borderRadius: '22px',
            cursor: 'pointer',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            boxShadow: `
              0 12px 0 #831843,
              0 20px 30px rgba(236, 72, 153, 0.5),
              inset 0 2px 3px rgba(255, 255, 255, 0.6)
            `,
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(6px)';
            e.currentTarget.style.boxShadow = '0 6px 0 #831843, 0 10px 15px rgba(236, 72, 153, 0.5)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 12px 0 #831843, 0 20px 30px rgba(236, 72, 153, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.6)';
          }}
        >
          🚀 PLAY NOW
        </button>

        {/* 3D Interactive Bottom Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '16px',
          marginTop: '45px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '32px'
        }}>
          {[
            { icon: '🗺️', title: '40+ Levels', desc: 'Arcade Stages' },
            { icon: '💣', title: 'Boosters', desc: 'Explosive Power' },
            { icon: '🔄', title: 'Swap Bubble', desc: 'Tactical Play' },
            { icon: '🏆', title: 'Leaderboard', desc: 'Global Ranks' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '18px 12px',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
                {item.icon}
              </span>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>
                {item.title}
              </h4>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}