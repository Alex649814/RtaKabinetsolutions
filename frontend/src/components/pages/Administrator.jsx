import { Link, Outlet } from 'react-router-dom';
import NavigationBar from '../NavigationBar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const Administrator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <NavigationBar />

      {/* Botón hamburguesa para pantallas pequeñas */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-gray-800 text-white p-2 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Barra lateral fija alineada debajo del navbar */}
      <aside
        className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-60 bg-gray-100 shadow-md p-4 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block`}
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Panel Admin</h2>
        <nav className="space-y-4">
          <Link to="home" className="block text-gray-700 hover:text-blue-600">🏠 Home</Link>
          <Link to="about-us" className="block text-gray-700 hover:text-blue-600">ℹ️ About Us</Link>
          <Link to="gallery" className="block text-gray-700 hover:text-blue-600">🖼 Gallery</Link>
          <Link to="products" className="block text-gray-700 hover:text-blue-600">📦 Products</Link>
          <Link to="contact" className="block text-gray-700 hover:text-blue-600">📩 Contact</Link>
          <Link to="EstimateGenerator" className="block text-gray-700 hover:text-blue-600">📄 Estimate Generator</Link>
        </nav>
      </aside>

      {/* Contenido principal alineado correctamente */}
      <main className="md:ml-60 mt-16 p-6">
        <Outlet />
      </main>
    </>
  );
};

export default Administrator;
