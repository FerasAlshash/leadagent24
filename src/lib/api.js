// Central API base URL resolver
// - In local dev (npm run dev): defaults to 'http://127.0.0.1:8000'
// - In production build (Docker / Nginx): defaults to '' (relative path /api/... routed by Nginx)
// - If explicitly configured via VITE_API_URL: uses the custom URL
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
