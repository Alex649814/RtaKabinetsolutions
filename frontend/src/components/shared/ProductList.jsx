// ProductList.jsx
import { useState } from "react";
import { FreeEstimateButton } from "../shared/FreeEstimateButton";
import { toAbsoluteUrl } from "../../lib/api"; // 👈 nuevo

const ProductList = ({ products, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredProducts.map(product => {
          let sizes = [];

          if (Array.isArray(product.sizes)) {
            sizes = product.sizes;
          } else if (typeof product.sizes === "string" && product.sizes.trim() !== "") {
            try {
              sizes = JSON.parse(product.sizes);
            } catch {
              sizes = [];
            }
            <div className="mt-4 flex justify-center md:justify-start">
              <FreeEstimateButton
                className="py-3 px-6 rounded-xl shadow text-base"
                color="bg-green-600"
              />
            </div>
          }

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
            >
              <img
                src={toAbsoluteUrl(product.image_path)}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{product.name}</h2>

                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold">Colors</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(Array.isArray(product.colors)
                      ? product.colors
                      : (typeof product.colors === "string" && product.colors.trim().startsWith("[")
                        ? JSON.parse(product.colors)
                        : product.colors.split(",")
                    )).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 border"
                        style={{ backgroundColor: color.trim() }}
                        title={color.trim()}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Sizes</h4>
                  <ul className="list-disc list-inside text-sm text-gray-800">
                    {sizes.map((size, idx) => (
                      <li key={idx}>{size}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Material</h4>
                  <p className="text-gray-800">{product.materials}</p>
                </div>

                {onAdd && (
                  <button
                    onClick={() => onAdd(product)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add to estimate
                  </button>
                )}

                {/* Botón adicional personalizado */}
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