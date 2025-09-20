import { useEffect, useState } from 'react';
import { FreeEstimateButton } from '../../components/shared/FreeEstimateButton';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const ExperienceSection = ({ page, customFilter }) => {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/section/${page}/${customFilter}`)
      .then(res => res.json())
      .then(data => {
        setSectionData({
          title: data.title,
          description: data.description,
          imageUrl: (data.image_url || '').replace(/\\/g, '/')
        });
      })
      .catch(error => console.error('Error fetching section data:', error));
  }, [page, customFilter]);

  return (
    <section className="bg-gradient-to-br from-white to-gray-100 py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6">
        {sectionData?.imageUrl && (
          <img
            src={toAbsoluteUrl(sectionData.imageUrl)}
            alt="Experience"
            className="w-full md:w-1/2 h-auto max-h-[500px] object-cover rounded-2xl shadow-lg"
          />
        )}
        <div className="w-full md:w-1/2 max-w-lg text-center md:text-left">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
            {sectionData?.title || 'Título de ejemplo'}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            {sectionData?.description || 'Descripción de ejemplo...'}
          </p>
          <div className="mt-10 flex justify-center">
            <FreeEstimateButton
              className="py-3 px-8 rounded-xl shadow text-base"
              color="bg-green-600"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;