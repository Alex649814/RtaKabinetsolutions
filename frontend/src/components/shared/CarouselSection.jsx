import { useEffect, useState } from 'react';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const CarouselSection = ({ pageName }) => {
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]); // Array de { file, preview }

  // Cargar datos del backend
  useEffect(() => {
    fetch(`${API_URL}/api/carousel/${pageName}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || '');

        if (Array.isArray(data.images)) {
          const loadedImages = data.images.map(img => ({
            id: img.id,
            file: null,
            preview: toAbsoluteUrl(img.path),
            isNew: false
          }));
          setImages(loadedImages);
        }
      })
      .catch(err => console.error('❌ Error al cargar carousel:', err));
  }, [pageName]);

  // Añadir imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      alert('❌ Máximo 10 imágenes');
      return;
    }

    const newImages = files.map(file => ({
      id: null,
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Subir título e imágenes
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);

    images.forEach(img => {
      if (img.isNew && img.file) {
        formData.append('images', img.file);
      }
    });

    try {
      await fetch(`${API_URL}/api/carousel/${pageName}`, {
        method: 'POST',
        body: formData
      });

      alert('✅ Carousel actualizado');
      window.location.reload();
    } catch (err) {
      console.error('❌ Error al enviar carousel:', err);
    }
  };

  const removeImage = async (index) => {
    const img = images[index];
    console.log('👉 Imagen a eliminar:', img);

    // Si es del backend (ya guardada), hay que borrarla con DELETE
    if (!img.isNew && img.id) {
      try {
        await fetch(`${API_URL}/api/carousel/${pageName}/${img.id}`, {
          method: 'DELETE'
        });

        alert('✅ Imagen eliminada del servidor');
      } catch (err) {
        console.error('❌ Error al eliminar imagen del backend:', err);
        return;
      }
    }
    // Quitarla del estado (sea nueva o backend)
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Administrar Carousel {pageName}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Título del banner</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Custom cabinets, made to your style"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Carousel images (maximum 10)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview}
                alt={`preview-${index}`}
                className="w-full h-32 object-contain rounded bg-black"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default CarouselSection;