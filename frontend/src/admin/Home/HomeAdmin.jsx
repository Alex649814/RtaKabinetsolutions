import SectionEditorForm from '../../components/shared/SectionEditorForm';
import { useMemo, useEffect, useState } from 'react';
import CarouselSection from '../../components/shared/CarouselSection';
import { API_URL, toAbsoluteUrl } from '../../lib/api';

const HomeAdmin = () => {
  const sections = useMemo(() => [
    { page: "home", key: "experience",    label: "Experience" },
    { page: "home", key: "chooseus",      label: "Why Choose Us" },
    { page: "home", key: "ourservices_1", label: "Our Services (First Image)" },
    { page: "home", key: "ourservices_2", label: "Our Services (Second Image)" },
    { page: "home", key: "ourservices_3", label: "Our Services (Third Image)" }
  ], []);

  const [sectionData, setSectionData] = useState({});

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const results = await Promise.all(
          sections.map(async ({ page, key }) => {
            const res = await fetch(`${API_URL}/api/section/${page}/${key}`, { signal: ac.signal });
            const data = await res.json();
            return { page, key, data };
          })
        );

        const next = {};
        results.forEach(({ page, key, data }) => {
          next[`${page}_${key}`] = {
            title: data.title,
            description: data.description,
            imageUrl: toAbsoluteUrl(data.image_url), // ← URL absoluta lista para usar
          };
        });
        setSectionData(next);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error loading Home sections:', err);
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

      const updatedRes = await fetch(`${API_URL}/api/section/${page}/${key}`, { signal: ac.signal });
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
      if (err.name !== 'AbortError') console.error(`Error al guardar ${page}/${key}:`, err);
    }
  };

  const handleDeleteImage = (page, key) => {
    console.log(`Eliminar imagen de ${page}/${key}`);
    // TODO: implementar DELETE si tu backend lo soporta.
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel - Home</h1>

      <div className="mb-6">
        <CarouselSection pageName="home" />
      </div>

      <div className="space-y-10">
        {sections.map(({ page, key, label }) => {
          const dataKey = `${page}_${key}`;
          const data = sectionData[dataKey];

          return data ? (
            <div key={dataKey} className="bg-white shadow-md rounded-xl p-4 sm:p-6">
              <SectionEditorForm
                title={label}
                pageName={page}
                sectionName={key}
                initialData={data} // imageUrl ya viene absoluta
                onSubmit={(formData) => handleFormSubmit(formData, page, key)}
                onDeleteImage={() => handleDeleteImage(page, key)}
              />
            </div>
          ) : (
            <p key={dataKey} className="text-center text-gray-600">Loading {label}...</p>
          );
        })}
      </div>
    </div>
  );
};

export default HomeAdmin;
