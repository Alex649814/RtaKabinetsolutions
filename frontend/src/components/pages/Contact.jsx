import ContactForm from "../ContactForm";
import Footer from "../Footer";
import NavigationBar from "../NavigationBar";
import TopBar from "../TopBar";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";



const icons = {
  location: (
    <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7-7.5 11-7.5 11s-7.5-4-7.5-11a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  phone: (
    <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2zm14-14a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z" />
    </svg>
  ),
  calendar: (
    <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  clock: (
    <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  ),
  facebook: (
    <a href="https://www.facebook.com/profile.php?id=61572527397285" target="_blank" rel="noopener noreferrer">
      <FaFacebookF className="w-8 h-8 text-blue-600" />
    </a>
  ),
  instagram: (
    <a href="https://www.instagram.com/ingalbertoespinoza/" target="_blank" rel="noopener noreferrer">
      <FaInstagram className="w-8 h-8 text-pink-500" />
    </a>
  ),
  tiktok: (
    <a href="https://www.tiktok.com/@ing6179" target="_blank" rel="noopener noreferrer">
      <FaTiktok className="w-8 h-8 text-black" />
    </a>
  ),
};

const Contact = () => {
  return (
    <>
      <div style={{ fontFamily: "Georgia, serif" }}>
        <TopBar />
        <NavigationBar />
      </div>

      <div style={{ fontFamily: "Georgia, serif" }}>
        <div className="bg-blue-200 py-8 px-2 flex justify-center">
          <div className="bg-white border mx-auto flex flex-col md:flex-row w-full max-w-5xl shadow-lg">
            <div className="md:w-1/2 w-full p-8 flex flex-col gap-4 border-b md:border-b-0 md:border-r">
              <h2 className="text-3xl font-bold mb-4">Get In Touch!</h2>
              <div className="flex items-center text-lg">{icons.location}<span>Tucson, AZ</span></div>
              <div className="flex items-center text-lg">{icons.phone}<span>+520-668-0771</span></div>
              <div className="flex items-center text-lg">{icons.calendar}<span>Monday - Saturday</span></div>
              <div className="flex items-center text-lg">{icons.clock}<span>10:00 AM - 5:00 PM</span></div>
              <div className="mt-6">
                <span className="font-bold text-xl">Follow us</span>
                <div className="flex gap-4 mt-2">{icons.facebook}{icons.instagram}{icons.tiktok}</div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "Georgia, serif" }}>
        <Footer />
      </div>
    </>
  );
};

export default Contact;