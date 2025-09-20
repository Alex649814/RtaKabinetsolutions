import { useEffect, useState } from "react";
import CarouselSection from "../../components/shared/CarouselSection";
import FileDrop from "../../components/shared/DragAndDrop";
import { toast } from "react-toastify";
import ProductListModal from "../../components/ProductListModal";
import { ToastContainer } from "react-toastify";
import { API_URL } from "../../lib/api"; // 👈 NUEVO

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [showList, setShowList] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [prices, setPrices] = useState({});
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching products.");
    }
  };

  const fetchOptions = async () => {
    try {
      const [colorsRes, sizesRes] = await Promise.all([
        fetch(`${API_URL}/api/options/colors`),
        fetch(`${API_URL}/api/options/sizes`)
      ]);
      const colorsData = await colorsRes.json();
      const sizesData = await sizesRes.json();
      setColorOptions(colorsData);
      setSizeOptions(sizesData);
    } catch (error) {
      toast.error("Error fetching color and size options.");
    }
  };

  const fetchProductForEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/full/${id}`);
      if (!res.ok) throw new Error("No se pudo cargar el producto");
      const data = await res.json();

      try {
        const parsedColors = Array.isArray(data.colors)
          ? data.colors
          : JSON.parse(data.colors || "[]");

        setFormData({
          name: data.name,
          description: data.description,
          materials: data.materials,
          colors: parsedColors,
          image: null,
          previewImage: data.image_path
        });
      } catch (error) {
        console.error("❌ Error parsing colors:", error);
        setFormData({
          name: data.name,
          description: data.description,
          materials: data.materials,
          colors: [],
          image: null,
          previewImage: data.image_path
        });
      }

      try {
        const parsedSizes = Array.isArray(data.sizes)
          ? data.sizes
          : JSON.parse(data.sizes || "[]");

        setSelectedSizes(parsedSizes);
      } catch (error) {
        console.error("❌ Error parsing selectedSizes:", error);
        setSelectedSizes([]);
      }

      const priceMap = {};
      data.variants.forEach(variant => {
        const { colorHex, sizeLabel, price } = variant;
        if (!priceMap[sizeLabel]) {
          priceMap[sizeLabel] = {};
        }
        priceMap[sizeLabel][colorHex] = price;
      });
      setPrices(priceMap);

      setEditingId(id);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del producto.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOptions();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    colors: [],
    materials: "",
    image: null,
    previewImage: null
  });

  const [newColor, setNewColor] = useState({ hexCode: "#000000", description: "" });
  const [newSize, setNewSize] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      colors: [],
      materials: "",
      image: null
    });
    setSelectedSizes([]);
    setPrices({});
    setEditingId(null);
  };

  const validateForm = () => {
    if (!formData.name.trim() ||
        !formData.description.trim() ||
        !formData.materials.trim() ||
        formData.colors.length === 0 ||
        selectedSizes.length === 0) {
      toast.error("Please fill all fields correctly.");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("materials", formData.materials);
    data.append("colors", JSON.stringify(formData.colors));
    data.append("sizes", JSON.stringify(selectedSizes));
    data.append("prices", JSON.stringify(prices));
    if (formData.image) data.append("image", formData.image);

    try {
      const res = await fetch(
        editingId
          ? `${API_URL}/api/products/${editingId}`
          : `${API_URL}/api/products`,
        {
          method: editingId ? "PUT" : "POST",
          body: data
        }
      );

      if (!res.ok) throw new Error("Server error");
      const result = await res.json();
      const imagePathToUse = result.image_path ?? formData.previewImage ?? "";
      console.log("Respuesta del servidor:", result);
      toast.success(result.message || "Product saved.");

      const productId = editingId || result.productId || result.id;

      // Crear nuevas variantes
      const variants = [];
      for (const size of selectedSizes) {
        for (const color of formData.colors) {
          const rawPrice = prices[size]?.[color];
          const price = isNaN(parseFloat(rawPrice)) ? 0 : parseFloat(rawPrice);
          variants.push({
            colorHex: color,
            sizeLabel: size,
            price,
            image_path: imagePathToUse
          });
        }
      }

      // Enviar variantes
      if (variants.length > 0) {
        console.log("Enviando al backend:", { product_id: productId, variants });
        await fetch(`${API_URL}/api/product_variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, variants })
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product.");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handlePriceChange = (size, color, value) => {
    setPrices(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [color]: value
      }
    }));
  };

  const addColor = async () => {
    const hex = newColor.hexCode.toLowerCase();

    const exists = colorOptions.some(c => c.hexCode.toLowerCase() === hex);
    if (exists) {
      toast.error("Ese color ya está registrado. Por favor, elige otro.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/options/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newColor)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar color");

      toast.success(data.message || "Color agregado correctamente");
      setNewColor({ hexCode: "#000000", description: "" });
      await fetchOptions();
    } catch (err) {
      console.error("❌ Error al agregar color:", err.message);
      toast.error(err.message);
    }
  };

  const addSize = async () => {
    const trimmedSize = newSize.trim();
    if (!trimmedSize) return toast.error("La medida no puede estar vacía");

    const exists = sizeOptions.some(size => size.label.toLowerCase() === trimmedSize.toLowerCase());
    if (exists) {
      toast.error("Esa medida ya está registrada. Por favor, elige una diferente.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/options/sizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmedSize }),
      });

      const data = await res.json();
      console.log("🔍 Respuesta del backend:", data);

      if (!res.ok) {
        throw new Error(data.error || "Error al agregar medida");
      }

      toast.success(data.message || "Medida agregada correctamente");

      setNewSize("");
      await fetchOptions();
    } catch (err) {
      console.error("❌ Error frontend:", err.message);
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error deleting product.");
    }
  };

  const handleEdit = async (product) => {
    try {
      console.log("Product ID para edición:", product.id);
      await fetchProductForEdit(product.id);
      setShowList(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error cargando producto para edición:", err);
    }
  };

  const deleteColor = async (hexCode) => {
    if (!window.confirm("¿Eliminar este color permanentemente?")) return;
    try {
      const res = await fetch(`${API_URL}/api/options/colors/${encodeURIComponent(hexCode)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al eliminar color");
      toast.success("Color eliminado");
      fetchOptions();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el color");
    }
  };

  const deleteSize = async (label) => {
    if (!window.confirm("¿Eliminar esta medida permanentemente?")) return;
    try {
      const res = await fetch(`${API_URL}/api/options/sizes/${encodeURIComponent(label)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al eliminar medida");
      toast.success("Medida eliminada");
      fetchOptions();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la medida");
    }
  };

  const [editingColor, setEditingColor] = useState(null);
  const [editingSize, setEditingSize] = useState(null);
  const [editedSizeLabel, setEditedSizeLabel] = useState("");

  const updateColor = async () => {
    if (!editingColor) return;

    try {
      const res = await fetch(`${API_URL}/api/options/colors/${editingColor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingColor)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error al actualizar el color:", data);
        toast.error(data.error || "No se pudo actualizar el color");
        return;
      }

      toast.success("Color actualizado correctamente");
      setEditingColor(null);
      fetchOptions();
    } catch (err) {
      console.error("❌ Error de red o del frontend:", err);
      toast.error("Error al conectarse con el servidor");
    }
  };

  const updateSize = async () => {
    if (!editingSize || !editedSizeLabel.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/options/sizes/${encodeURIComponent(editingSize)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newLabel: editedSizeLabel })
      });

      if (!res.ok) throw new Error("Error al actualizar medida");

      toast.success("Medida actualizada");
      setEditingSize(null);
      setEditedSizeLabel("");
      fetchOptions();
    } catch (err) {
      console.error("❌ Error al actualizar medida:", err);
      toast.error("No se pudo actualizar medida");
    }
  };

  return (
    <>
      <CarouselSection pageName="products" />

      <ProductListModal
        products={products}
        onClose={() => setShowList(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        show={showList}
      />

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-4">
        <h2 className="text-2xl font-bold">Add Product</h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product name"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Product description"
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="font-semibold">Colors:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {colorOptions.map(({ id, hexCode, description }) => (
              <div key={hexCode} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleMultiChange("colors", hexCode)}
                  style={{
                    backgroundColor: hexCode,
                    border: hexCode === '#FFFFFF' ? '2px solid black' : '1px solid gray'
                  }}
                  className={`w-8 h-8 rounded ${formData.colors.includes(hexCode) ? "ring-2 ring-blue-500" : ""}`}
                />
                <span className="text-xs text-center">{description}</span>

                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingColor({ id, hexCode, description })}
                    className="text-blue-500 text-sm"
                    title="Editar color"
                    type="button"
                  >📝</button>

                  <button
                    onClick={(s) => deleteColor(hexCode)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Eliminar color"
                    type="button"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {sizeOptions.map(({ label }) => (
            <div key={label} className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  onChange={() => handleSizeToggle(label)}
                  checked={selectedSizes.includes(label)}
                />
                <span className="ml-2">{label}</span>
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingSize(label);
                    setEditedSizeLabel(label);
                  }}
                  className="text-blue-500 text-sm"
                  title="Editar medida"
                  type="button"
                >📝</button>

                <button
                  onClick={() => deleteSize(label)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Eliminar medida"
                  type="button"
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <input
          name="materials"
          value={formData.materials}
          onChange={handleChange}
          placeholder="Materials (comma separated)"
          className="w-full border p-2 rounded"
        />

        <FileDrop
          onFileSelect={(file) => setFormData((prev) => ({ ...prev, image: file, previewImage: null  }))}
          selectedFile={formData.image}
          previewImage={formData.previewImage}
        />

        {selectedSizes.length > 0 && formData.colors.length > 0 && (
          <div>
            <label className="font-semibold">Assign Prices by Size & Color:</label>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {selectedSizes.map(size => (
                <div key={size} className="border p-3 rounded">
                  <h4 className="font-semibold mb-2">{size}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {formData.colors.map(color => (
                      <div key={color} className="flex items-center gap-2">
                        <div className="w-5 h-5 border" style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid black' : '1px solid gray' }}></div>
                        <input
                          type="number"
                          placeholder="Price"
                          value={prices[size]?.[color] || ""}
                          onChange={e => handlePriceChange(size, color, e.target.value)}
                          className="w-24 border rounded p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Save Product
        </button>
      </form>

      {/* FORMULARIO EXTRA PARA AGREGAR NUEVOS COLORES Y MEDIDAS */}
      <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded shadow mt-10 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Add New Color</h3>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={newColor.hexCode}
              onChange={e => setNewColor(prev => ({ ...prev, hexCode: e.target.value }))}
              className="border w-12 h-12 rounded"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newColor.description}
              onChange={e => setNewColor(prev => ({ ...prev, description: e.target.value }))}
              className="border p-2 rounded"
            />
            <button
              onClick={addColor}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              Add Color
            </button>
          </div>
        </div>

        {editingColor && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Edit Color</h3>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={editingColor.hexCode}
                onChange={e => setEditingColor(prev => ({ ...prev, hexCode: e.target.value }))}
                className="border w-12 h-12 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={editingColor.description}
                onChange={e => setEditingColor(prev => ({ ...prev, description: e.target.value }))}
                className="border p-2 rounded"
              />
              <button
                onClick={updateColor}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Save Change
              </button>
              <button
                onClick={() => setEditingColor(null)}
                className="text-red-500 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg mb-2">Add New Size</h3>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="E.g. 48 Inches W, 21 Inches D, 34 - 1/2 H"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={addSize}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              Add Size
            </button>
          </div>
        </div>

        {editingSize && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Edit Size</h3>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={editedSizeLabel}
                onChange={(e) => setEditedSizeLabel(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={updateSize}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Save Change
              </button>
              <button
                onClick={() => {
                  setEditingSize(null);
                  setEditedSizeLabel("");
                }}
                className="text-red-500 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-4 flex justify-end">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowList(true)}
        >
          Modify Products
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </>
  );
};

export default ProductsAdmin;