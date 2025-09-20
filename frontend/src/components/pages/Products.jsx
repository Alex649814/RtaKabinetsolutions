import { useEffect, useState } from "react";
import Footer from "../Footer";
import NavigationBar from "../NavigationBar";
import TopBar from "../TopBar";
import ImageCarousel from "../shared/ImageCarousel";
import BannerWrapper from "../shared/BannerWrapper";
import ProductList from "../shared/ProductList";
import { API_URL } from "../../lib/api";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <TopBar />
      <NavigationBar />

      {/* Banner Section */}
      <div className="relative w-full h-[500px]">
        <div className="absolute inset-0 z-0">
          <ImageCarousel page="products" customFilter="carousel" />
        </div>
        <div className="absolute inset-0 z-10">
          <BannerWrapper page="products" />
        </div>
      </div>

      {/* Product List EXCLUDED from Georgia */}
      <div className="font-sans">
        <ProductList products={products} />
      </div>

      {/* Placeholder section */}
      <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 gap-10">
        {/* Future content */}
      </div>

      <Footer />
    </div>
  );
};

export default Products;