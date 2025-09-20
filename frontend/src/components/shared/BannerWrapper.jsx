import { useEffect, useState } from 'react';
import Banner from '../Banner';
import { API_URL } from '../../lib/api';

const BannerWrapper = ({ page, showButton = true }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/carousel/${page}`)
      .then(res => res.json())
      .then(data => {
        if (data.title) {
          setTitle(data.title);
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar el título del banner:', err);
      });
  }, [page]);

  return (
    <div className="w-full h-full flex items-center justify-center text-white text-center px-6">
      <Banner
        title={title || 'Cargando...'}
        showButton={showButton}
      />
    </div>
  );
};

export default BannerWrapper;