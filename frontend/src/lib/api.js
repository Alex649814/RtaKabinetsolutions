// frontend/src/lib/api.js
const DEV_FALLBACK = 'http://localhost:5000';

export const API_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ''
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? DEV_FALLBACK : '');

export function toAbsoluteUrl(path) {
  if (!path) return '';
  
  // Si ya es absoluta (http/https), úsala pero forzamos https si venía como http
  if (/^https?:\/\//i.test(path)) {
    return path.replace(/^http:\/\//i, 'https://');
  }

  // Normaliza las barras y fuerza https
  const url = path.startsWith('/')
    ? `${API_URL}${path}`
    : `${API_URL}/${path}`;

  return url.replace(/^http:\/\//i, 'https://');
}