import React, { useEffect, useState } from "react";
import { FreeEstimateButton } from "../shared/FreeEstimateButton";
import { API_URL, toAbsoluteUrl } from "../../lib/api";

const WhyChooseUs = ({ page, customFilter }) => {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/section/${page}/${customFilter}`)
      .then(res => res.json())
      .then(data => {
        setSectionData({
          title: data.title,
          description: data.description,
          imageUrl: (data.image_url || "").replace(/\\/g, "/")
        });
      })
      .catch(error => console.error('Error fetching section data:', error));
  }, [page, customFilter]);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6">
        <div className="w-full md:w-1/2 max-w-lg text-center md:text-left">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
            {sectionData?.title || 'Título por defecto'}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            {sectionData?.description || 'Descripción por defecto...'}
          </p>
          <div className="mt-6 flex justify-center md:justify-start">
          </div>
        </div>
        <div className="w-full md:w-1/2">
          {sectionData?.imageUrl && (
            <img
              src={toAbsoluteUrl(sectionData.imageUrl)}
              alt="Why Choose Us"
              className="w-full max-h-[400px] object-cover rounded-2xl shadow-xl"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;