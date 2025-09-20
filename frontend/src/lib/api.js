// frontend/src/lib/api.js
const DEV_FALLBACK = 'http://localhost:5000';

export const API_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ''
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? DEV_FALLBACK : '');

export function toAbsoluteUrl(path) {
  if (!path) return '';
  // Si ya es absoluta (http/https), úsala tal cual
  if (/^https?:\/\//i.test(path)) return path;
  // Normaliza las barras
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
}