import { apiRequest } from './api';

// Start a new game session with flexible payload mapping for levels
export const startSession = async (level = 1) => {
  const numericLevel = typeof level === 'object' ? (level.level || level.id || 1) : Number(level) || 1;
  
  // Backend ko alag-alag variations mein bhejte hain taaki 'Invalid level' error na aaye
  return await apiRequest('POST', '/games/start', { 
    level: numericLevel,
    levelId: numericLevel 
  });
};

export const startGameSession = async (level = 1) => {
  return await startSession(level);
};

export const completeSession = async (gameId, score, bubblesLeft) => {
  return await apiRequest('POST', `/games/${gameId}/complete`, { score, bubblesLeft });
};

export const submitGameScore = async (gameId, score, bubblesLeft) => {
  return await apiRequest('POST', `/games/${gameId}/score`, { score, bubblesLeft });
};

export const getLeaderboard = async () => {
  return await apiRequest('GET', '/games/leaderboard');
};