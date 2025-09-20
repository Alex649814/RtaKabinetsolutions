import {FreeEstimateButton} from './shared/FreeEstimateButton';

const Banner = ({ title, showButton }) => {
    return (
      <section className="relative w-full h-[500px]">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-4 space-y-20">
          <h2 className="text-7xl md:text-7xl font-light italic">
            {title}
          </h2>
          {showButton && (
            <FreeEstimateButton color="bg-black hover:bg-gray-900 text-white font-semibold px-10 py-4 text-lg rounded-xl shadow-lg transition duration-300"
 />
          )}
        </div>
      </section>
    );
  };
  
  export default Banner;