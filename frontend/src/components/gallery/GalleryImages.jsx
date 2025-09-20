// GalleryImages.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const GalleryImages = ({ page, customFilter, title, onImageClick }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/gallery/${page}/${customFilter}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.images)) {
          setImages(data.images.map(item => item.path));
        } else {
          console.warn("No se encontraron imágenes:", data);
          setImages([]);
        }
      })
      .catch(err => console.error(`Error loading ${customFilter} images:`, err));
  }, [page, customFilter]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }} 
      viewport={{ once: true }}
      className="py-16 bg-gray-100 font-sans"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-gray-800 font-serif">
          {title}
        </h2>
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {images.map((img, index) => (
            <motion.div 
              key={index} 
              whileHover={{ scale: 1.05 }} 
              transition={{ type: 'spring', stiffness: 300 }}
              className="overflow-hidden rounded-xl shadow-lg"
            >
              <img
                src={toAbsoluteUrl(img)}
                alt={`${title} - ${index}`}
                className="w-full h-auto object-cover rounded-xl cursor-pointer"
                onClick={() => onImageClick && onImageClick(images, index)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default GalleryImages;