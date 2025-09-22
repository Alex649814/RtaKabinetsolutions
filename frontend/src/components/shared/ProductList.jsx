// ProductList.jsx
import { useState, useMemo } from "react";
import { FreeEstimateButton } from "../shared/FreeEstimateButton";
import { toAbsoluteUrl } from "../../lib/api";

function safeParseJSON(maybeJSON, fallback) {
  if (typeof maybeJSON !== "string") return fallback;
  const s = maybeJSON.trim();
  if (!s) return fallback;
  if (!s.startsWith("[") && !s.startsWith("{")) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

const ProductList = ({ products = [], onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const q = String(searchTerm || "").toLowerCase();
    return products.filter(p => String(p?.name || "").toLowerCase().includes(q));
  }, [products, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* 🔍 Search bar */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 bg-white/30 backdrop-blur-md border border-white/40 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="grid grid-cols-1 gap-10">
        {filteredProducts.map((product) => {
          // --- SIZES: array real, JSON string o vacío ---
          let sizes = [];
          if (Array.isArray(product?.sizes)) {
            sizes = product.sizes;
          } else if (typeof product?.sizes === "string") {
            const trimmed = product.sizes.trim();
            sizes = trimmed
              ? safeParseJSON(trimmed, trimmed.includes(",")
                  ? trimmed.split(",").map(s => s.trim()).filter(Boolean)
                  : [trimmed])
              : [];
          }

          // --- COLORS: array real, JSON string, "red, blue", o vacío ---
          let colors = [];
          if (Array.isArray(product?.colors)) {
            colors = product.colors;
          } else if (typeof product?.colors === "string") {
            const c = product.colors.trim();
            colors = c
              ? safeParseJSON(c, c.includes(",")
                  ? c.split(",").map(x => x.trim()).filter(Boolean)
                  : [c])
              : [];
          }

          const imgSrc = toAbsoluteUrl(product?.image_path);

          return (
            <div
              key={product?.id ?? crypto.randomUUID()}
              className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
            >
              <img
                src={imgSrc}
                alt={product?.name || "Product"}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
              />

              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{product?.name || "Unnamed product"}</h2>

                {!!product?.description && (
                  <div>
                    <h4 className="font-semibold">Description</h4>
                    <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold">Colors</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {colors.map((color, idx) => (
                      <div
                        key={`${product?.id}-color-${idx}`}
                        className="w-6 h-6 border"
                        style={{ backgroundColor: String(color).trim() }}
                        title={String(color).trim()}
                      />
                    ))}
                    {colors.length === 0 && <span className="text-sm text-gray-500">No colors</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Sizes</h4>
                  {sizes.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-800">
                      {sizes.map((size, idx) => (
                        <li key={`${product?.id}-size-${idx}`}>{String(size)}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-500">No sizes</span>
                  )}
                </div>

                {!!product?.materials && (
                  <div>
                    <h4 className="font-semibold">Material</h4>
                    <p className="text-gray-800">{product.materials}</p>
                  </div>
                )}

                {onAdd && (
                  <button
                    onClick={() => onAdd(product)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add to estimate
                  </button>
                )}

                <div className="mt-4 flex justify-center md:justify-start">
                  <FreeEstimateButton
                    className="py-3 px-6 rounded-xl shadow text-base"
                    color="bg-green-600"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;