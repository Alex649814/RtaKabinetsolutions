import SectionEditorForm from '../../components/shared/SectionEditorForm';
import { useMemo, useEffect, useState } from 'react';
import CarouselSection from '../../components/shared/CarouselSection';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const AboutUsAdmin = () => {
  // ✅ Memorizar la lista de secciones
  const sections = useMemo(() => [
    { page: "aboutus", key: "ourstory", label: "Our Story" },
    { page: "aboutus", key: "mission", label: "Mission" },
    { page: "aboutus", key: "vision", label: "Vision" }
  ], []);
  
  const [sectionData, setSectionData] = useState({});

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        // Fetch en paralelo
        const results = await Promise.all(
          sections.map(async ({ page, key }) => {
            const res = await fetch(`${API_URL}/api/section/${page}/${key}`, {
              signal: ac.signal,
            });
            const data = await res.json();
            return { page, key, data };
          })
        );

        // Construir estado de una sola vez
        const next = {};
        results.forEach(({ page, key, data }) => {
          next[`${page}_${key}`] = {
            title: data.title,
            description: data.description,
            // 👇 dejamos la URL absoluta ya lista
            imageUrl: toAbsoluteUrl(data.image_url),
          };
        });
        setSectionData(next);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error loading sections:', err);
        }
      }
    })();

    return () => ac.abort();
  }, [sections]);

  const handleFormSubmit = async (formData, page, key) => {
    const ac = new AbortController();
    try {
      await fetch(`${API_URL}/api/section/${page}/${key}`, {
        method: "POST",
        body: formData,
        signal: ac.signal,
      });

      // Recargar la sección actualizada
      const updatedRes = await fetch(`${API_URL}/api/section/${page}/${key}`, {
        signal: ac.signal,
      });
      const updatedData = await updatedRes.json();

      setSectionData(prev => ({
        ...prev,
        [`${page}_${key}`]: {
          title: updatedData.title,
          description: updatedData.description,
          imageUrl: toAbsoluteUrl(updatedData.image_url),
        }
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`Error al guardar ${page}/${key}:`, err);
      }
    }
  };

  const handleDeleteImage = (page, key) => {
    console.log(`Eliminar imagen de ${page}/${key}`);
    // Aquí podrías agregar una petición DELETE si tu backend lo soporta
  };

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - About Us</h1>
        <CarouselSection pageName="aboutus" />
        <br/>
        {sections.map(({ page, key, label }) => {
          const dataKey = `${page}_${key}`;
          const data = sectionData[dataKey];
          return data ? (
            <SectionEditorForm
              key={dataKey}
              title={label}
              pageName={page}
              sectionName={key}
              initialData={data}                 // imageUrl ya viene absoluta
              onSubmit={(formData) => handleFormSubmit(formData, page, key)}
              onDeleteImage={() => handleDeleteImage(page, key)}
            />
          ) : (
            <p key={dataKey}>Loading {label}...</p>
          );
        })}
      </div>
    </>
  );
};

export default AboutUsAdmin;