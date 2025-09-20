import db from '../../config/db.js';
import fs from 'fs';
import path from 'path';

export const saveCarousel = async (req, res) => {
    const { pageName } = req.params;
    const { title } = req.body;
    const files = req.files;
    
     try {
    // 1. Guardar el título (una sola entrada con title)
    if (title) {
      const [existingTitle] = await db.query(
        'SELECT * FROM sectioninformation WHERE page_name = ? AND section_name = ? AND title IS NOT NULL',
        [pageName, 'carousel']
      );

      if (existingTitle.length > 0) {
        await db.query(
          'UPDATE sectioninformation SET title = ? WHERE id = ?',
          [title, existingTitle[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO sectioninformation (page_name, section_name, title) VALUES (?, ?, ?)',
          [pageName, 'carousel', title]
        );
      }
    }

    // 2. Guardar las imágenes (cada una como un registro independiente)
    if (files && files.length > 0) {
      const folder = path.join('api', 'uploads', pageName);
      await fs.promises.mkdir(folder, { recursive: true });

      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(folder, fileName);
        await fs.promises.writeFile(filePath, file.buffer);

        const imagePath = `/uploads/${pageName}/${fileName}`;

        await db.query(
          'INSERT INTO sectioninformation (page_name, section_name, image_path) VALUES (?, ?, ?)',
          [pageName, 'carousel', imagePath]
        );
      }
    }

    res.status(200).json({ message: 'Carousel updated' });
        } catch (error) {
            console.error('❌ Error en saveCarousel:', error);
            res.status(500).json({ error: error.message });
        }
    };

  export const getCarousel = async (req, res) => {
  const { pageName } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM sectioninformation WHERE page_name = ? AND section_name = ?',
      [pageName, 'carousel']
    );

    const titleEntry = rows.find(row => row.title);
    const images = rows.filter(row => row.image_path)
    .map(img => ({
       id: img.id,  // ✅ Esto es lo que faltaba
        path: `${req.protocol}://${req.get('host')}${img.image_path}`
    }));

    const data = {
      title: titleEntry?.title || '',
      images
    };

    res.json(data);
    } catch (err) {
        console.error('❌ Error al obtener carousel:', err);
        res.status(500).json({ error: err.message });
    }
}

export const deleteCarouselImage = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('SELECT * FROM sectioninformation WHERE id = ?', [id]);

    if (result.length === 0) return res.status(404).json({ error: 'Imagen no encontrada' });

    const image = result[0];

    // Borrar físicamente
    const imagePath = path.join('api', image.image_path);
    if (fs.existsSync(imagePath)) {
      await fs.promises.unlink(imagePath);
    }

    // Borrar en DB
    await db.query('DELETE FROM sectioninformation WHERE id = ?', [id]);

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar imagen:', err);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};
