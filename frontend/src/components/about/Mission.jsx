import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FreeEstimateButton } from "../shared/FreeEstimateButton";
import { API_URL, toAbsoluteUrl } from "../../lib/api";

const Mission = ({ page, customFilter }) => {
  const [textContent, setTextContent] = useState({
    title: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/section/${page}/${customFilter}`) // 👈 reemplazo de localhost
      .then(res => res.json())
      .then(data => {
        setTextContent({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
        });
      })
      .catch(error => console.error("Error fetching section content:", error));
  }, [page, customFilter]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }} 
      viewport={{ once: true }}
      className="py-16 bg-gradient-to-r from-gray-300 to-gray-400 text-black font-sans"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-6">
        {textContent.image_url && (
          <motion.div 
            className="w-full md:w-1/2 flex justify-center md:justify-start"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={toAbsoluteUrl(textContent.image_url)}
              alt="Section Image"
              className="w-80 h-80 object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}

        <div className="w-full md:w-1/2 text-center md:text-left">
          <h3 className="text-4xl font-extrabold mb-6 text-gray-900 drop-shadow font-serif">
            {textContent.title}
          </h3>
          <p className="text-lg leading-relaxed">
            {textContent.description}
          </p>
          <FreeEstimateButton
            className="py-4 px-8 rounded-xl shadow text-base"
            color="bg-green-600"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default Mission;