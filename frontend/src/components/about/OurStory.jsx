import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FreeEstimateButton } from "../shared/FreeEstimateButton";
import { API_URL, toAbsoluteUrl } from "../../lib/api"; // 👈 nuevo

const OurStory = ({ page, customFilter }) => {
  const [sectionData, setSectionData] = useState({
    title: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/section/${page}/${customFilter}`)
      .then(res => res.json())
      .then(data => {
        setSectionData({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
        });
      })
      .catch(error => console.error("Error fetching section data:", error));
  }, [page, customFilter]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }} 
      viewport={{ once: true }}
      className="py-16 bg-gradient-to-r from-white to-gray-100 font-sans"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-6">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h3 className="text-4xl font-extrabold mb-6 text-gray-800 font-serif">
            {sectionData.title}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {sectionData.description}
          </p>
          <div className="mt-8 flex justify-center md:justify-start">
            <FreeEstimateButton
              className="py-4 px-8 rounded-xl shadow text-base"
              color="bg-green-600"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          {sectionData.image_url && (
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={toAbsoluteUrl(sectionData.image_url)} 
              alt={sectionData.title || "Our Story Image"}
              className="max-h-[450px] w-auto object-cover rounded-2xl shadow-2xl"
            />
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default OurStory;
