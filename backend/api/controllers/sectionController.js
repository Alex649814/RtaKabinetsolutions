import db from '../../config/db.js'; // conexión a MySQL
import fs from 'fs';
import path from 'path';

export const getSection = async (req, res) => {
  const { pageName, sectionName } = req.params;
  const sql = 'SELECT * FROM sectioninformation WHERE page_name = ? AND section_name = ?';

  try {
    const [rows] = await db.query(sql, [pageName, sectionName]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No section found' });
    }
    const section = rows[0];
    if(section.image_path){
      section.image_url = `${req.protocol}://${req.get('host')}${section.image_path}`;
    }
    res.json(section);
  } catch (err) {
    console.error("Error al obtener sección:", err);
    res.status(500).json({ error: err.message });
  }
};

export const saveSection = async (req, res) => {
  const { pageName, sectionName } = req.params;
  const { title, description } = req.body;
  const image = req.file;

  let imagePath = null;

  try {
    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const folder = path.join('api', 'uploads', pageName);
      await fs.promises.mkdir(folder, { recursive: true});
      const filePath = path.join(folder, fileName);
      await fs.promises.writeFile(filePath, image.buffer);
      imagePath = `/uploads/${pageName}/${fileName}`;
    }

    const [existing] = await db.query(
      'SELECT * FROM sectioninformation WHERE page_name = ? AND section_name = ?',
      [pageName, sectionName]
    );

    if (existing.length > 0) {
      const finalImage = imagePath || existing[0].image_path;
      await db.query(
        'UPDATE sectioninformation SET title = ?, description = ?, image_path = ? WHERE page_name = ? AND section_name = ?',
        [title, description, finalImage, pageName, sectionName]
      );
      res.json({ message: 'Section updated' });
    } else {
      await db.query(
        'INSERT INTO sectioninformation (page_name, section_name, title, description, image_path) VALUES (?, ?, ?, ?, ?)',
        [pageName, sectionName, title, description, imagePath]
      );
      res.json({ message: 'Section created' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};