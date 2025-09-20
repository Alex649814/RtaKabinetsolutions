import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // O 'auto' si prefieres instantáneo
  }, [pathname]);

  return null; // No renderiza nada en la UI
}
