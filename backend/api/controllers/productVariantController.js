import db from "../../config/db.js";
// Obtener variantes de producto
export const getProductVariants = async (req, res) => {
  try {
    const { product_id } = req.query;
    const [rows] = await db.query(`
      SELECT pv.*, c.hexCode AS colorHex, s.label AS sizeLabel 
      FROM product_variants pv
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      ${product_id ? 'WHERE pv.product_id = ?' : ''}
    `, product_id ? [product_id] : []);
    res.json(rows);
  } catch (err) {
    console.error("Error getting variants:", err);
    res.status(500).json({ error: "Error fetching variants" });
  }
};

export const getAllProductVariants = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pv.*, 
            p.name AS product_name,
            c.description AS color,
            c.hexCode AS colorHex, 
            s.label AS size
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id;
    `);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching all product variants:', err);
    res.status(500).json({ error: 'Error fetching product variants' });
  }
};

// Crear variantes de producto
export const createProductVariant = async (req, res) => {
  const { product_id, variants } = req.body;

  if (!product_id || !Array.isArray(variants)) {
    return res.status(400).json({ error: "Missing or invalid data" });
  }

  try {
    // Obtener todos los color_id y size_id actuales que deben conservarse
    const validCombinations = [];

    for (const variant of variants) {
      // Obtener color_id
      const [colorResult] = await db.query(
        "SELECT id FROM colors WHERE hexCode = ?",
        [variant.colorHex]
      );
      const colorId = colorResult[0]?.id;
      if (!colorId) throw new Error(`Color not found: ${variant.colorHex}`);

      // Obtener size_id
      const [sizeResult] = await db.query(
        "SELECT id FROM sizes WHERE label = ?",
        [variant.sizeLabel]
      );
      const sizeId = sizeResult[0]?.id;
      if (!sizeId) throw new Error(`Size not found: ${variant.sizeLabel}`);

      // Guardar la combinación válida
      validCombinations.push([colorId, sizeId]);

      const imagePathToUse = variant.image_path && variant.image_path.trim() !== "" ? variant.image_path : null;

      await db.query(
        `INSERT INTO product_variants (product_id, image_path, color_id, size_id, price)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE price = VALUES(price), image_path = VALUES(image_path)`,
        [product_id, imagePathToUse, colorId, sizeId, variant.price]
      );
    }

    // Borrar las combinaciones que ya no están seleccionadas
    if (validCombinations.length > 0) {
      const placeholders = validCombinations.map(() => `(?, ?)`).join(", ");
      const flatValues = validCombinations.flat();

      await db.query(
        `DELETE FROM product_variants
         WHERE product_id = ?
         AND (color_id, size_id) NOT IN (${placeholders})`,
        [product_id, ...flatValues]
      );
    }

    res.status(200).json({ message: "✅ Variants inserted/updated and cleaned up successfully" });
  } catch (error) {
    console.error("❌ Error updating variants:", error);
    res.status(500).json({ error: "Failed to update product variants" });
  }
};

export const cleanObsoleteVariants = async (product_id, validColorIds, validSizeIds) => {
  try {
    // Elimina combinaciones que ya no deben existir
    await db.query(`
      DELETE FROM product_variants
      WHERE product_id = ?
        AND (color_id NOT IN (?) OR size_id NOT IN (?))
    `, [
      product_id,
      validColorIds.length ? validColorIds : [0],
      validSizeIds.length ? validSizeIds : [0]
    ]);
  } catch (err) {
    console.error("❌ Error cleaning obsolete variants:", err);
    throw err;
  }
};

export const modifyProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, materials, colors, sizes } = req.body;

  try {
    const colorIds = colors.map(c => parseInt(c.id));
    const sizeIds = sizes.map(s => parseInt(s.id));

    // Actualiza producto
    await db.query(`
      UPDATE products
      SET name = ?, description = ?, materials = ?, colors = ?, sizes = ?
      WHERE id = ?
    `, [
      name,
      description,
      materials,
      JSON.stringify(colors),
      JSON.stringify(sizes),
      productId
    ]);

    // Borra variantes que ya no aplican
    await cleanObsoleteVariants(productId, colorIds, sizeIds);

    res.status(200).json({ message: "Producto actualizado y variantes limpiadas." });
  } catch (error) {
    console.error("❌ Error al modificar producto:", error);
    res.status(500).json({ error: "Error al modificar producto." });
  }
};