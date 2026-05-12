// Base URL for the Backend API.
// In local development, it can be empty (using Vite's proxy) or point to the local backend.
// In production (Vercel), it should point to your deployed Render/Railway backend.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Custom fetch wrapper to automatically prepend the base URL
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
