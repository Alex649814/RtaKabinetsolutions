import { useEffect } from "react";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css';

const ImageGalleryModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center"
      onClick={onClose} // Cierra si hacen clic fuera
    >
      {/* Contador */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold"
      >
        &times;
      </button>

      {/* Botón anterior */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 text-white text-4xl px-2 hover:scale-110"
      >
        &#10094;
      </button>

      {/* Imagen con zoom */}
      <div onClick={(e) => e.stopPropagation()}>
        <Zoom>
          <img
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded"
          />
        </Zoom>
      </div>

      {/* Botón siguiente */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 text-white text-4xl px-2 hover:scale-110"
      >
        &#10095;
      </button>
    </div>
  );
};

export default ImageGalleryModal;