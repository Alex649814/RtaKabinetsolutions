import { useEffect, useState } from 'react';
import { FreeEstimateButton } from '../../components/shared/FreeEstimateButton';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const OurServices = ({ page }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const keys = ['ourservices_1', 'ourservices_2', 'ourservices_3'];

      try {
        const responses = await Promise.all(
          keys.map(key =>
            fetch(`${API_URL}/api/section/${page}/${key}`).then(res => res.json())
          )
        );
        setServices(responses);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, [page]);

  return (
    <section className='bg-black py-14 text-white'>
      <div className='max-w-6xl mx-auto px-4'>
        <h3 className='text-4xl font-bold mb-10 text-center tracking-tight'>Our Services</h3>
        <div className='grid md:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <div
              key={index}
              className='flex flex-col justify-between rounded-xl shadow-lg p-5 bg-gray-800 transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl'
            >
              <div className="overflow-hidden rounded-md ">
                <img
                  src={toAbsoluteUrl(service.image_url?.replace(/\\/g, '/'))}
                  alt={service.title}
                  className='w-full h-60 object-cover transform transition-transform duration-300 hover:scale-105'
                />
              </div>
              <h4 className='font-bold text-lg mt-4 text-center'>{service.title}</h4>
              <p className='text-sm text-gray-300 mt-2 text-center'>
                {service.description}
              </p>
              <FreeEstimateButton
                className="py-3 px-6 rounded-xl shadow text-base"
                color="bg-green-600"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;