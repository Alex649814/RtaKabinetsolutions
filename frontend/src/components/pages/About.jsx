import OurStory from "../about/OurStory";
import BannerWrapper from "../shared/BannerWrapper";
import Footer from "../Footer";
import ImageCarousel from "../shared/ImageCarousel";
import NavigationBar from "../NavigationBar";
import TopBar from "../TopBar";
import Mission from "../about/Mission";
import Vision from '../about/Vision';

 const About = () => {
  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <TopBar />
      <NavigationBar />
      <div className="relative w-full h-[500px]">
        <div className="absolute inset-0 z-0">
          <ImageCarousel page="aboutus" />
        </div>
        <div className="absolute inset-0 z-10">
          <BannerWrapper page="aboutus" />
        </div>
      </div>
      <OurStory page="aboutus" customFilter="ourstory" />
      <Mission page="aboutus" customFilter="mission" />
      <Vision page="aboutus" customFilter="vision" />
      <Footer />
    </div>
  );
};

export default About;