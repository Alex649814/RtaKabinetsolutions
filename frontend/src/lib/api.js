// frontend/src/lib/api.js
const DEV_FALLBACK = 'http://localhost:5000';

// 🔒 Fallback seguro para producción si no está definido VITE_API_URL
const PROD_FALLBACK = 'https://api.rtakabinetsolutions.com';

export const API_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ''
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? DEV_FALLBACK : PROD_FALLBACK);

export function toAbsoluteUrl(path) {
  if (!path) return '';

  // Si ya es absoluta (http/https), úsala pero forzamos https
  if (/^https?:\/\//i.test(path)) {
    return path.replace(/^http:\/\//i, 'https://');
  }

  // Normaliza el path para que siempre empiece con /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Une API_URL con el path y fuerza https
  return `${API_URL}${cleanPath}`.replace(/^http:\/\//i, 'https://');
}