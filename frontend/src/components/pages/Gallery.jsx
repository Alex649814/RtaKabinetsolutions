import { useState, useEffect } from "react";
import BannerWrapper from "../shared/BannerWrapper";
import Footer from "../Footer";
import NavigationBar from "../NavigationBar";
import TopBar from "../TopBar";
import ImageCarousel from '../shared/ImageCarousel';
import GalleryImages from '../gallery/GalleryImages';
import ImageGalleryModal from "../shared/ImageGalleryModal";

const Gallery = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  const handleOpenImage = (images, index) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleNext = () => setModalIndex((prev) => (prev + 1) % modalImages.length);
  const handlePrev = () => setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);


    useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [modalOpen]);


  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <TopBar />
      <NavigationBar />
      
      <div className="relative w-full h-[500px]">
        <div className="absolute inset-0 z-0">
          <ImageCarousel page="gallery" />
        </div>
        <div className='absolute inset-0 z-10'>
          <BannerWrapper page='gallery' />
        </div>
      </div>

      <GalleryImages
        page="gallery"
        customFilter="kitchens"
        title="Kitchens"
        onImageClick={handleOpenImage}
      />
      <GalleryImages
        page="gallery"
        customFilter="cabinets"
        title="Cabinets"
        onImageClick={handleOpenImage}
      />
      <GalleryImages
        page="gallery"
        customFilter="quartzcountertops"
        title="Epoxy Countertops"
        onImageClick={handleOpenImage}
      />

      <GalleryImages
        page="gallery"
        customFilter="doors"
        title="Doors"
        onImageClick={handleOpenImage}
      />

      <Footer />

      {modalOpen && (
        <ImageGalleryModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={handleCloseModal}
          onNext={handleNext}
          onPrev={handlePrev}
        />
        
      )}
      
    </div>
  );
};

export default Gallery;