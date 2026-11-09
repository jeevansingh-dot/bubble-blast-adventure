import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const levelCategories = [
    { title: 'Tutorial Zone', range: 'Levels 1–5', icon: '🌱', start: 1, end: 5 },
    { title: 'Beginner Coast', range: 'Levels 6–10', icon: '🫧', start: 6, end: 10 },
    { title: 'Easy Valley', range: 'Levels 11–20', icon: '🎯', start: 11, end: 20 },
    { title: 'Medium Peaks', range: 'Levels 21–30', icon: '⚡', start: 21, end: 30 },
    { title: 'Hard Volcano', range: 'Levels 31–35', icon: '🔥', start: 31, end: 35 },
    { title: 'Expert Domain', range: 'Levels 36–40', icon: '👑', start: 36, end: 40 },
  ];

  const completedLevels = user?.progress?.completedLevels || 5; 
  const totalStars = user?.progress?.totalStars || 14;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Banner Dashboard Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '24px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>
            LEVEL <span style={{ color: '#06b6d4' }}>MAP</span>
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
            Pop bubbles, hit high scores & unlock stage rewards!
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(9, 13, 22, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 24px',
          borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Progress</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>{completedLevels} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 40</span></span>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Stars</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#fbbf24' }}>⭐ {totalStars} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 120</span></span>
          </div>
        </div>
      </div>

      {/* World Map Level Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {levelCategories.map((cat, idx) => (
          <div key={idx} style={{
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>{cat.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>{cat.title}</h2>
                  <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>{cat.range}</span>
                </div>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                Stage {idx + 1}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '16px' }}>
              {Array.from({ length: cat.end - cat.start + 1 }, (_, i) => {
                const levelNum = cat.start + i;
                const isUnlocked = levelNum <= completedLevels + 1;
                const isCompleted = levelNum <= completedLevels;

                return (
                  <button
                    key={levelNum}
                    onClick={() => isUnlocked && navigate(`/game/${levelNum}`)}
                    disabled={!isUnlocked}
                    style={{
                      position: 'relative',
                      height: '95px',
                      borderRadius: '18px',
                      border: isUnlocked ? '2px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
                      background: isUnlocked 
                        ? (isCompleted ? 'linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)' : 'linear-gradient(145deg, #0284c7 0%, #0369a1 100%)')
                        : 'rgba(15, 23, 42, 0.4)',
                      boxShadow: isUnlocked ? '0 8px 20px rgba(3, 105, 161, 0.4)' : 'none',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      opacity: isUnlocked ? 1 : 0.45,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      padding: '8px'
                    }}
                  >
                    <span style={{ fontSize: '22px', fontWeight: '900', color: isUnlocked ? '#ffffff' : '#64748b' }}>
                      {levelNum}
                    </span>
                    <div style={{ marginTop: '6px', fontSize: '11px' }}>
                      {isUnlocked ? (
                        <span style={{ color: '#fbbf24' }}>⭐⭐⭐</span>
                      ) : (
                        <span>🔒</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}