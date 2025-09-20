import db from '../../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res) => {
  const file = req.file;
  const section = req.body.section || 'default';

  console.log('📦 Archivo recibido:', file?.originalname);
  console.log('📂 Sección:', section);

  if (!file) {
    console.log('❌ No se recibió archivo');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Subir dos niveles: desde controllers/ → a uploads/
  const uploadPath = path.join(__dirname, '..', 'uploads', section);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('📁 Carpeta creada:', uploadPath);
  }

  const ext = path.extname(file.originalname);
  const filename = `image-${Date.now()}${ext}`;
  const fullPath = path.join(uploadPath, filename);

  try{
    // Escribir archivo desde buffer
    fs.writeFileSync(fullPath, file.buffer);
    console.log('✅ Archivo guardado:', fullPath);
  }catch (e){
    console.log('❌ Error escribiendo archivo:', e);
    return res.status(500).json({ message: 'Error writing file', error: e });
  }
  
   const dbPath = path.join('uploads', section, filename);
   const fileType = file.mimetype;

  const sql = 'INSERT INTO images (section, path, filename, file_type) VALUES (?, ?, ?, ?)';
  try{
    const [result] = await db.query(sql, [section, dbPath, file.originalname, fileType]);
      res.status(200).json({
        message: 'Image uploaded and saved to DB',
        path: dbPath,
        filename: file.originalname,
        file_type: fileType
      });
  }catch (err){
    res.status(500).json({ message: 'Error saving to DB', err });
  }

};

export const getImagesBySection = async (req, res) => {
  const section = req.params.section;
  const filter = req.query.filter || '';

  console.log('📥 Petición recibida para sección:', section, 'con filtro:', filter); // 👈

  const sql = 'SELECT * FROM images WHERE section = ? and filename LIKE ?';
  const values = [section, `%${filter}%`];

  await db.query('SELECT 1');
  console.log('✅ Conexión a MySQL exitosa');

  try {
    // Realizar la consulta para obtener imágenes por sección
    const [results] = await db.query(sql, values);
    console.log('📤 Resultados encontrados:', results);
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error en la consulta SQL:', err);
    res.status(500).json({ message: 'Error fetching images', err });
  }
};