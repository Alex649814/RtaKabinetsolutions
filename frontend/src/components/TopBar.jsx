import {
  FaCalendarAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const TopBar = () => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Fondo blanco detrás del borde redondo */}
      <div className="absolute top-0 left-0 h-full w-full bg-white z-0"></div>

      {/* Barra negra con borde redondo (mejor uso de padding y sin margen lateral raro) */}
<div className="relative bg-black text-white text-sm py-2 px-4 flex flex-col sm:flex-row justify-between items-center shadow-md z-10">        <div className="flex flex-wrap justify-center gap-6">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <FaCalendarAlt /> Monday - Saturday
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <FaClock /> 10 AM - 5 PM
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span className="hidden sm:inline whitespace-nowrap">Follow us on:</span>

          <a
            href="https://www.facebook.com/profile.php?id=61572527397285"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/ingalbertoespinoza/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.tiktok.com/@ing6179"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <FaTiktok />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;