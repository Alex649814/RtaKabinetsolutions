import db from '../../config/db.js';

export const getColors = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM colors");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching colors" });
  }
};

export const createColor = async (req, res) => {
  const { hexCode, description } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO colors (hexCode, description) VALUES (?, ?)",
      [hexCode, description]
    );
    res.json({ message: "Color added successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error adding color" });
  }
};

export const getSizes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM sizes");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching sizes" });
  }
};

export const createSize = async (req, res) => {
  const { label } = req.body;
  try {
    await db.query("INSERT INTO sizes (label) VALUES (?)", [label]);
    res.json({ message: "Medida agregada correctamente" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Esta medida ya está registrada. Intenta con otra diferente." });
    }
    console.error("❌ Error al agregar medida:", err);
    res.status(500).json({ error: "Error al agregar medida" });
  }
};

function safeParseJsonString(jsonLike) {
  try {
    if (typeof jsonLike === 'object') {
      // Si ya es array real, lo regresamos tal cual
      return jsonLike;
    }

    let cleaned = jsonLike;

    // Forzamos comillas dobles si no hay
    if (jsonLike.includes("'") && !jsonLike.includes('"')) {
      cleaned = jsonLike.replace(/'/g, '"');
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Error al hacer safeParse:", jsonLike);
    return null;
  }
}

export const deleteColor = async (req, res) => {
  const { hexCode } = req.params;
  console.log(`🟡 Intentando eliminar color: ${hexCode}`);

  try {
    // Paso 1: Obtener ID del color
    const [colorRows] = await db.query("SELECT id FROM colors WHERE hexCode = ?", [hexCode]);
    if (colorRows.length === 0) {
      console.warn("⚠️ Color no encontrado en tabla colors");
      return res.status(404).json({ error: "Color no encontrado" });
    }

    const colorId = colorRows[0].id;
    console.log(`🟢 ID del color encontrado: ${colorId}`);

    // Paso 2: Eliminar variantes de productos con ese color
    const [deletedVariants] = await db.query("DELETE FROM product_variants WHERE color_id = ?", [colorId]);
    console.log(`🗑️ Variantes eliminadas: ${deletedVariants.affectedRows}`);

    // Paso 3: Obtener todos los productos
    const [productRows] = await db.query("SELECT id, colors FROM products");

    for (const product of productRows) {
      const productId = product.id;
      let parsedColors;

      try {
        const raw = product.colors || "[]";
        console.log(`🧵 raw tipo:`, typeof raw, '| contenido:', raw);

        const parsed = safeParseJsonString(product.colors);
        if (!parsed) {
          console.error(`❌ Error al parsear JSON en producto ${productId}:`, product.colors);
          continue;
        }

        parsedColors = parsed.map(c =>
          c.replace(/^['"]+|['"]+$/g, "").trim().toLowerCase()
        );

        console.log(`📦 Producto ${productId} - colores parseados final:`, parsedColors);
      } catch (err) {
        console.error(`❌ Error al parsear JSON en producto ${productId}:`, product.colors);
        continue;
      }
      // Eliminar el color buscado
      const filteredColors = parsedColors.filter(c => c !== hexCode.toLowerCase().trim());

      if (filteredColors.length !== parsedColors.length) {
        if (filteredColors.length === 0) {
          const [deletedProduct] = await db.query("DELETE FROM products WHERE id = ?", [productId]);
          console.log(`🧨 Producto ${productId} eliminado (sin colores restantes)`);
        } else {
          const cleanedJson = JSON.stringify(filteredColors);
          await db.query("UPDATE products SET colors = ? WHERE id = ?", [cleanedJson, productId]);
          console.log(`✏️ Producto ${productId} actualizado con nuevos colores:`, filteredColors);
        }
      } else {
        console.log(`✅ Producto ${productId} no necesita cambios`);
      }
    }

    // Paso 4: Eliminar color de tabla colors
    const [deletedColor] = await db.query("DELETE FROM colors WHERE id = ?", [colorId]);
    console.log(`✅ Color eliminado de tabla colors (ID: ${colorId})`);

    res.json({ message: "Color eliminado correctamente" });

  } catch (error) {
    console.error("❌ Error inesperado en deleteColor:", error);
    res.status(500).json({ error: "Error interno al eliminar color" });
  }
};

export const deleteSize = async (req, res) => {
  const { label } = req.params;

  try {
    // 1. Obtener el ID de la medida
    const [rows] = await db.query("SELECT id FROM sizes WHERE label = ?", [label]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Tamaño no encontrado" });
    }

    const sizeId = rows[0].id;

    // 2. Eliminar variantes relacionadas
    await db.query("DELETE FROM product_variants WHERE size_id = ?", [sizeId]);

    // 3. Actualizar productos que contengan esta medida en su JSON
    const [productRows] = await db.query("SELECT id, sizes FROM products");

    for (const product of productRows) {
      const raw = product.sizes || "[]";
      const parsed = safeParseJsonString(raw);

      if (!parsed) {
        console.error(`❌ Error al parsear JSON en producto ${product.id}:`, raw);
        continue;
      }

      const currentSizes = parsed.map(s =>
        s.replace(/^['"]+|['"]+$/g, "").trim().toLowerCase()
      );

      const filteredSizes = currentSizes.filter(s => s !== label.toLowerCase().trim());

      if (filteredSizes.length !== currentSizes.length) {
        if (filteredSizes.length === 0) {
          await db.query("DELETE FROM products WHERE id = ?", [product.id]);
          console.log(`🧨 Producto ${product.id} eliminado (sin medidas restantes)`);
        } else {
          await db.query("UPDATE products SET sizes = ? WHERE id = ?", [
            JSON.stringify(filteredSizes),
            product.id
          ]);
          console.log(`✏️ Producto ${product.id} actualizado con nuevas medidas:`, filteredSizes);
        }
      } else {
        console.log(`✅ Producto ${product.id} no necesita cambios`);
      }
    }

    // 4. Eliminar la medida
    await db.query("DELETE FROM sizes WHERE id = ?", [sizeId]);
    console.log(`✅ Medida eliminada de tabla sizes (ID: ${sizeId})`);

    res.json({ message: "Medida eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar medida:", error);
    res.status(500).json({ error: "Error interno al eliminar medida" });
  }
};

export const updateColor = async (req, res) => {
  const id = req.params.id;
  const { hexCode, description } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE colors SET hexCode = ?, description = ? WHERE id = ?",
      [hexCode, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Color no encontrado para actualizar" });
    }

    res.json({ message: "Color actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar color:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const updateSize = async (req, res) => {
  const { label } = req.params;
  const { newLabel } = req.body;

  try {
    // Verificar si ya existe otra medida con ese nombre
    const [existing] = await db.query(
      "SELECT * FROM sizes WHERE label = ? AND label != ?",
      [newLabel, label]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Ya existe otra medida con ese nombre." });
    }

    const [result] = await db.query(
      "UPDATE sizes SET label = ? WHERE label = ?",
      [newLabel, label]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Medida no encontrada para actualizar" });
    }

    res.json({ message: "Medida actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar medida:", err);
    res.status(500).json({ error: "Error al actualizar medida" });
  }
};