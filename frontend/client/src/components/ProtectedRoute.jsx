import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Jab tak token verify ho raha hai, loading spinner ya clean screen dikhayein
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#38bdf8',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🎮 Loading Arcade...
      </div>
    );
  }

  // Agar user logged in nahi hai, tabhi login page par redirect karein
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}