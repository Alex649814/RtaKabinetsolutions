import ContactForm from '../ContactForm';
import ImageCarousel from '../shared/ImageCarousel';
import Footer from '../Footer';
import NavigationBar from '../NavigationBar';
import OurServices from '../home/OurServices';
import WorkExperience from '../home/WorkExperience';
import WhyChooseUs from '../home/WhyChooseUs';
import GoogleMap from '../Location';
import BannerWrapper from '../shared/BannerWrapper';

function Home() {
  return (
    <div style={{ fontFamily: 'Georgia, serif' }} className="min-h-screen w-full overflow-x-hidden pt-[112px]">
   
      <NavigationBar />

      {/* Hero Section */}
      <div className="relative w-full h-[500px]">
        <div className="absolute inset-0 z-0">
          <ImageCarousel page="home" />
        </div>
        <div className="absolute inset-0 z-10">
          <BannerWrapper page="home" />
        </div>
      </div>

      {/* Transitions Between Sections */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-white transition-all duration-700 ease-in-out">
        <WorkExperience page="home" customFilter="experience" />
      </div>

      <div className="bg-gradient-to-b from-white to-gray-50 transition-all duration-700 ease-in-out">
        <OurServices page="home" />
      </div>

      <div className="bg-gradient-to-b from-gray-50 to-white transition-all duration-700 ease-in-out">
        <WhyChooseUs page="home" customFilter="chooseus" />
      </div>

      {/* Google Map */}
      <section className="h-[90vh]">
        <GoogleMap />
      </section>

      {/* Contact Form */}
      <div className="min-h-screen bg-black rounded-2xl flex flex-col items-center justify-center px-4 py-10">
        <h1 className="text-5xl font-bold text-white mb-8">Contact us</h1>
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
}

export default Home;