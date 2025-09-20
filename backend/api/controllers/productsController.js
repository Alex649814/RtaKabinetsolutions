import fs from 'fs';
import path from 'path';
import db from '../../config/db.js';
import { cleanObsoleteVariants } from './productVariantController.js';

export const saveProduct = async (req, res) => {
  let { name, description, colors, sizes, materials } = req.body;
  const file = req.file;

  try{
    colors = JSON.parse(colors);
    sizes = JSON.parse(sizes);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON in sizes or colors.' });
  }

  try {
    let imagePath = null;

    if (file) {
      const folder = path.join('api', 'uploads', 'products');
      await fs.promises.mkdir(folder, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(folder, fileName);

      await fs.promises.writeFile(filePath, file.buffer);

      imagePath = `/uploads/products/${fileName}`;
    }

    const [result] = await db.query(
      `INSERT INTO products (name, description, colors, sizes, materials, image_path, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        description,
        JSON.stringify(colors),
        JSON.stringify(sizes),
        materials,
        imagePath
      ]
    );

    res.status(200).json({
      message: '✅ Product saved successfully.',
      productId: result.insertId,  // <- muy importante
      image_path: imagePath        // <- opcional pero útil para variants
    });

  } catch (err) {
    console.error('❌ Error saving product:', err);
    res.status(500).json({ error: 'Error saving product.' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ error: 'Error fetching products.' });
  }
};

export const deleteProduct = async (req, res) => {
  try{
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: '✅ Product deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ error: 'Error deleting product.' });
  }
};

export const modifyProduct = async (req, res) => {
  const productId = req.params.id;
  let { name, description, materials, colors, sizes } = req.body;
  const file = req.file;
  
  try {
    colors = JSON.parse(colors);
    sizes = JSON.parse(sizes);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON in sizes or colors." });
  }

  try {
    let imagePath = null;

    if (file) {
      const folder = path.join('api', 'uploads', 'products');
      await fs.promises.mkdir(folder, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(folder, fileName);

      await fs.promises.writeFile(filePath, file.buffer);
      imagePath = `/uploads/products/${fileName}`;
    }

    const updateQuery = imagePath
      ? `UPDATE products SET name = ?, description = ?, materials = ?, colors = ?, sizes = ?, image_path = ? WHERE id = ?`
      : `UPDATE products SET name = ?, description = ?, materials = ?, colors = ?, sizes = ? WHERE id = ?`;

    const params = imagePath
      ? [name, description, materials, JSON.stringify(colors), JSON.stringify(sizes), imagePath, productId]
      : [name, description, materials, JSON.stringify(colors), JSON.stringify(sizes), productId];

    await db.query(updateQuery, params);

    // Obtener color_id y size_id como antes
    const [colorRows] = await db.query(`SELECT id FROM colors WHERE hexCode IN (?)`, [colors]);
    const colorIds = colorRows.map(row => row.id);

    const [sizeRows] = await db.query(`SELECT id FROM sizes WHERE label IN (?)`, [sizes]);
    const sizeIds = sizeRows.map(row => row.id);

    await cleanObsoleteVariants(productId, colorIds, sizeIds);
    const [[updatedProduct]] = await db.query('SELECT image_path FROM products WHERE id = ?', [productId]);

    res.status(200).json({
      message: "Producto actualizado.",
      image_path: updatedProduct.image_path
    });
  } catch (error) {
    console.error("❌ Error al modificar producto:", error);
    res.status(500).json({ error: "Error al modificar producto." });
  }
};

export const getFullProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener producto
    const [products] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    if (products.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const product = products[0];

    // Obtener variantes asociadas
    const [variants] = await db.query(`
      SELECT pv.*, c.hexCode AS colorHex, s.label AS sizeLabel 
      FROM product_variants pv
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE pv.product_id = ?
    `, [id]);

    // Enviar todo junto
    res.json({
      ...product,
      variants
    });

  } catch (err) {
    console.error("Error al obtener producto completo:", err);
    res.status(500).json({ error: "Error al obtener producto completo" });
  }
};