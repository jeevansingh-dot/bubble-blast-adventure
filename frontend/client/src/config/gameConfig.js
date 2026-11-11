// Single source of truth for the game name.
export const GAME_NAME =
  import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";

// Normalize API URL
function normalizeApiUrl(url) {
  const clean = url.trim().replace(/\/+$/, "");

  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

export const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ||
  "https://bubble-blast-adventure-4f4h.onrender.com/api"
);