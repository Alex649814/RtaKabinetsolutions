import GallerySection from '../../components/shared/GallerySectionTemp';
import CarouselSection from '../../components/shared/CarouselSection';

const GalleryAdmin = () => {
  return (
    <>
      <CarouselSection pageName="gallery"/>
      <GallerySection pageName="gallery" sectionName="kitchens" />
      <GallerySection pageName="gallery" sectionName="cabinets" />
      <GallerySection pageName="gallery" sectionName="quartzcountertops" />
      <GallerySection pageName="gallery" sectionName="doors" />
    </>
  );
};

export default GalleryAdmin;