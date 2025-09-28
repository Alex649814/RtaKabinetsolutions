import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const ImageCarousel = ({ page }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/carousel/${page}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.images)) {
          const loadedImages = data.images.map(img => ({
            id: img.id,
            path: toAbsoluteUrl(img.path.replace(/\\/g, '/')),
          }));
          setImages(loadedImages);
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar las imágenes del carrusel:', err);
      });
  }, [page]);

  return (
    <>
      {images.length > 0 && (
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={4000}
          stopOnHover={false}
          showArrows={false}
          swipeable
          emulateTouch
          className="h-[500px] rounded-xl overflow-hidden shadow-lg transition-all duration-1000"
        >
          {images.map((img, index) => (
            <div
              key={img.id}
              className="w-full h-[500px] bg-center bg-cover flex items-center justify-center"
              style={{ backgroundImage: `url(${img.path})` }}
            >
              <img
                src={img.path}
                alt={`Slide-${index}`}
                className="max-h-full max-w-full object-contain shadow-xl"
              />
            </div>
          ))}
        </Carousel>
      )}
    </>
  );
};

export default ImageCarousel;
