import { useEffect, useState, useRef } from 'react';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const GallerySection = ({ pageName, sectionName }) => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/gallery/${pageName}/${sectionName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.images)) {
          const loadedImages = data.images.map(img => ({
            id: img.id,
            file: null,
            preview: toAbsoluteUrl(img.path),
            isNew: false,
          }));
          setImages(loadedImages);
        }
      })
      .catch(err => console.error('❌ Error al cargar galería:', err));
  }, [pageName, sectionName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    images.forEach(img => {
      if (img.isNew && img.file) {
        formData.append('images', img.file);
      }
    });

    try {
      await fetch(`${API_URL}/api/gallery/${pageName}/${sectionName}`, {
        method: 'POST',
        body: formData
      });

      alert('✅ Galería actualizada');
      window.location.reload();
    } catch (err) {
      console.error('❌ Error al guardar galería:', err);
    }
  };

  const removeImage = async (index) => {
    const img = images[index];
    if (!img.isNew && img.id) {
      try {
        await fetch(`${API_URL}/api/gallery/${pageName}/${sectionName}/${img.id}`, {
          method: 'DELETE'
        });
        alert('✅ Imagen eliminada del servidor');
      } catch (err) {
        console.error('❌ Error al eliminar imagen del backend:', err);
        return;
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFiles = (files) => {
    const newImages = files.map(file => ({
      id: null,
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleClickDropZone = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 capitalize">
        Administrar Galería ({pageName} - {sectionName})
      </h2>

      <form onSubmit={handleSubmit}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClickDropZone}
          className="mb-4 border-2 border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <p className="text-gray-600">Haz clic o arrastra imágenes aquí</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview}
                alt={`preview-${index}`}
                className="w-full h-32 object-cover rounded shadow"
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
          className="mt-4 w-full px-4 py-2 rounded bg-blue-600 text-white 
                    hover:bg-blue-700 active:bg-blue-800 active:scale-95 
                    focus:outline-none focus:ring-2 focus:ring-blue-300 
                    transition duration-150 ease-in-out"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default GallerySection;