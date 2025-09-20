// backend/api/controllers/galleryController.js
import db from '../../config/db.js'; // asegúrate de que sea tu conexión real
import fs from 'fs';
import path from 'path';

export const getGallerySection = async (req, res) => {
  const { pageName, sectionName } = req.params;

  try {
    const [images] = await db.query(
      'SELECT id, image_path FROM gallery_images WHERE page_name = ? AND section_name = ?',
      [pageName, sectionName]
    );

    res.json({
      images: images.map(img => ({
        id: img.id,
        path: `${req.protocol}://${req.get('host')}${img.image_path}`
      }))
    });
  } catch (err) {
    console.error('❌ Error al obtener galería:', err);
    res.status(500).json({ error: 'Error al obtener la galería' });
  }
};

export const saveGallerySection = async (req, res) => {
  const { pageName, sectionName } = req.params;
  const files = req.files;

  try {
    if (files && files.length > 0) {
      const folder = path.join('api', 'uploads', pageName, sectionName);
      await fs.promises.mkdir(folder, { recursive: true });

      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(folder, fileName);
        await fs.promises.writeFile(filePath, file.buffer);

        const imagePath = `/uploads/${pageName}/${sectionName}/${fileName}`;
        
        await db.query(
          'INSERT INTO gallery_images (page_name, section_name, image_path) VALUES (?, ?, ?)',
          [pageName, sectionName, imagePath]
        );
      }
    }

    res.status(200).json({ message: '✅ Imágenes guardadas correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar galería:', err);
    res.status(500).json({ error: 'Error al guardar imágenes' });
  }
};

export const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imagePath = rows[0].image_path;
    const absolutePath = path.join('api', imagePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await db.query('DELETE FROM gallery_images WHERE id = ?', [id]);

    res.json({ message: '✅ Imagen eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar imagen:', err);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};
