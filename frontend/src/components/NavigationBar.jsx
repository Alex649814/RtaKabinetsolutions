import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/administrator');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú con tecla Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div
        className={`w-full fixed top-0 left-0 z-40 transition-all duration-500 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
      >
        {/* TopBar dentro del contenedor fijo, para que se mueva junto */}
        {!isAdminRoute && <TopBar />}

        <nav
          className={`relative z-10 px-6 flex justify-between items-center font-semibold ${
            isAdminRoute ? 'py-2' : 'py-4'
          }`}
        >
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight mr-6">
                RTA KABINETS
              </h1>
            </Link>
          </div>

          <button
            className="md:hidden text-3xl text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <ul className="hidden md:flex space-x-8 text-gray-800 font-medium items-center">
            <li><Link to="/" className="hover:text-green-600 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-green-600 transition">About us</Link></li>
            <li><Link to="/gallery" className="hover:text-green-600 transition">Gallery</Link></li>
            <li><Link to="/products" className="hover:text-green-600 transition">Products</Link></li>
            <li><Link to="/contact" className="hover:text-green-600 transition">Contact</Link></li>

            {isAuthenticated && user?.role === 'admin' && (
              <li><Link to="/administrator" className="hover:text-green-600 transition">Administration</Link></li>
            )}

            {isAuthenticated && (
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>

          {open && (
            <ul className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-8 space-y-4 z-50">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-700"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
              <li><Link to="/" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">Home</Link></li>
              <li><Link to="/about" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">About us</Link></li>
              <li><Link to="/gallery" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">Gallery</Link></li>
              <li><Link to="/products" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">Products</Link></li>
              <li><Link to="/contact" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">Contact</Link></li>

              {isAuthenticated && user?.role === 'admin' && (
                <li><Link to="/administrator" onClick={() => setOpen(false)} className="block text-gray-800 hover:text-green-600 transition">Administration</Link></li>
              )}

              {isAuthenticated && (
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          )}
        </nav>
      </div>
    </>
  );
};

export default NavigationBar;