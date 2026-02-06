import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Gallery from './components/pages/Gallery';
import Products from './components/pages/Products';
import Contact from './components/pages/Contact';
import Administrator from './components/pages/Administrator';

import HomeAdmin from './admin/Home/HomeAdmin';
import AboutUsAdmin from './admin/AboutUs/AboutUsAdmin.jsx';
import GalleryAdmin from './admin/Gallery/GalleryAdmin';
import ProductsAdmin from './admin/Products/ProductsAdmin';
import ContactAdmin from './admin/Contact/ContactAdmin';
import EstimateGeneratorAdmin from './admin/Estimate_Generator/EstimateGeneratorAdmin';
import ScrollToTop from './components/ScrollTop.jsx';
import Login from './components/pages/Login.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {

  return (
    <>
  <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login/>} />

          <Route path="/administrator" element={<ProtectedRoute><Administrator /></ProtectedRoute> }>
            <Route path="home" element={<HomeAdmin />} />
            <Route path="about-us" element={<AboutUsAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="contact" element={<ContactAdmin />} />
            <Route path="EstimateGenerator" element={<EstimateGeneratorAdmin />} />
          </Route>
        </Routes>
        <ToastContainer position='bottom-right' autoClose={3000} />
</AuthProvider>
    </>
  );
}

export default App
