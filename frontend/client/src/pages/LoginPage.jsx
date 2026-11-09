import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Glowing Orbs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)',
        top: '10%', left: '20%', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none'
      }}></div>

      {/* Main 3D Arcade Login Card */}
      <div className="arcade-card-3d" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '32px',
        padding: '45px 35px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>

        {/* 3D Floating Emoji Orb */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px auto',
          background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #f59e0b 60%, #b45309 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.5), inset -4px -4px 8px rgba(180, 83, 9, 0.8), inset 4px 4px 8px rgba(255, 255, 255, 0.8)',
          animation: 'float3D 3.5s ease-in-out infinite'
        }}>
          😊
        </div>

        <h1 style={{
          margin: '0 0 6px 0',
          fontSize: '28px',
          fontWeight: '900',
          color: '#ffffff',
          letterSpacing: '1px',
          textShadow: '0 2px 10px rgba(6, 182, 212, 0.5)'
        }}>
          WELCOME <span style={{ color: '#38bdf8' }}>BACK</span>
        </h1>
        <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
          Sign in to continue your arcade adventure
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              required
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
            />
          </div>

          {/* Heavy 3D Arcade Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
              color: '#0f172a',
              border: 'none',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '900',
              borderRadius: '16px',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: `
                0 8px 0 #b45309,
                0 15px 25px rgba(245, 158, 11, 0.4),
                inset 0 2px 3px rgba(255, 255, 255, 0.6)
              `,
              transition: 'all 0.15s ease',
              marginTop: '8px',
              outline: 'none'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 4px 0 #b45309, 0 8px 15px rgba(245, 158, 11, 0.4)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 8px 0 #b45309, 0 15px 25px rgba(245, 158, 11, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.6)';
            }}
          >
            🚀 Log In
          </button>

        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>

      </div>

    </div>
  );
}