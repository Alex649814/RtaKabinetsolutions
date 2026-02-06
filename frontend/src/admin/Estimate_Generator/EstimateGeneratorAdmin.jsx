import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductVariants } from '../../features/productVariants/productVariantsSlice';
import {
  addToEstimate,
  removeFromEstimate,
  updateQuantity,
  updatePrice,
  clearEstimate
} from '../../features/Estimate/estimateSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EstimateGeneratorAdmin = () => {
  const dispatch = useDispatch();
  const variants = useSelector((state) => state.productVariants.list) || [];
  const estimateItems = useSelector((state) => state.estimate.items) || [];

  const [selectedOptions, setSelectedOptions] = useState({});
  const [filter, setFilter] = useState('');

  // Cliente
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  useEffect(() => {
    dispatch(fetchProductVariants());
  }, [dispatch]);

  // ✅ BACKEND BASE (Dockploy/Prod): usa env si existe
  // En producción: setea VITE_BACKEND_URL o VITE_API_URL con tu dominio del backend
  // Ej: VITE_BACKEND_URL=https://tudominio.com  (si tu reverse proxy manda /uploads al backend)
  // o:  VITE_BACKEND_URL=https://api.tudominio.com
  const DEV_BACKEND =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000';

  const PROD_BACKEND =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    window.location.origin;

  const BACKEND_BASE = (import.meta.env.DEV ? DEV_BACKEND : PROD_BACKEND).replace(/\/$/, '');

  // ✅ Normaliza rutas de imagen, incluyendo casos donde viene "http://localhost:5000/..."
  const getImageUrl = (path) => {
    if (!path) return '';

    // si viene "http://localhost:5000/..." en prod, lo reemplazamos por tu backend real
    const localhostFixed = path.replace(/^https?:\/\/localhost:\d+/i, BACKEND_BASE);

    // si ya es URL completa (https://...) la regresamos (ya con fix de localhost si aplicaba)
    if (/^https?:\/\//i.test(localhostFixed)) return localhostFixed;

    // si viene sin slash, se lo agregamos
    const normalizedPath = localhostFixed.startsWith('/') ? localhostFixed : `/${localhostFixed}`;

    // si BACKEND_BASE es "", usamos ruta relativa
    if (!BACKEND_BASE) return normalizedPath;

    return `${BACKEND_BASE}${normalizedPath}`;
  };

  const groupedVariants = useMemo(() => {
    return variants.reduce((acc, variant) => {
      const key = variant.product_id;
      if (!acc[key]) {
        acc[key] = {
          name: variant.product_name,
          variants: []
        };
      }
      acc[key].variants.push(variant);
      return acc;
    }, {});
  }, [variants]);

  const handleOptionChange = (productId, type, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));
  };

  const handleAdd = (productId) => {
    const options = selectedOptions[productId];

    if (!options?.color || !options?.size) {
      toast.error("Selecciona un color y una medida antes de agregar el producto.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `error-${productId}`
      });
      return;
    }

    const variant = groupedVariants[productId]?.variants?.find(
      (v) => v.color === options.color && v.size === options.size
    );

    if (!variant) {
      toast.error("La combinación seleccionada no está disponible.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `unavailable-${productId}`
      });
      return;
    }

    dispatch(addToEstimate({
      id: variant.id,
      name: `${variant.product_name} - ${variant.color} - ${variant.size}`,
      description: variant.description || '',
      price: variant.price,
      quantity: 1
    }));

    toast.success("Producto agregado al presupuesto", {
      position: "bottom-right",
      autoClose: 2000,
      toastId: `success-${productId}`
    });
  };

  const total = estimateItems.reduce(
    (acc, item) => acc + (item.quantity * item.price),
    0
  );

  const generateEstimatePDF = (items) => {
    const doc = new jsPDF();
    const estimateNumber = "001";
    const date = new Date().toLocaleDateString();
    const calculatedTotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    doc.setFontSize(16);
    doc.setFont("times", "normal");
    doc.text("RTA KABINETS", 15, 20);
    doc.setFontSize(14);
    doc.setFont("times", "italic");
    doc.text("Carpentry", 190, 15, { align: "right" });
    doc.text("Estimate", 190, 22, { align: "right" });

    doc.setDrawColor(100);
    doc.setLineWidth(0.3);
    doc.line(14, 28, 197, 28);

    doc.setFontSize(11);
    doc.setTextColor(200, 0, 0);
    doc.text("Client Information", 14, 36);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${clientName || 'Cliente no especificado'}`, 14, 44);
    doc.text(`Address: ${clientAddress || 'Dirección no especificada'}`, 14, 50);
    doc.text(`Phone: ${clientPhone || 'Teléfono no especificado'}`, 14, 56);
    doc.text(`Email: ${clientEmail || 'Email not specified'}`, 14, 62);

    doc.setFillColor(240, 237, 237);
    doc.rect(115, 33, 42, 20, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Estimate Number: # ${estimateNumber}`, 117, 40);
    doc.text(`Date: ${date}`, 117, 48);

    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(156, 33, 1, 20, 'F');

    doc.setFillColor(160, 160, 210);
    doc.rect(157, 33, 40, 20, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Cost", 168, 40);
    doc.setFontSize(14);
    doc.text(`$${calculatedTotal.toFixed(2)}`, 168, 48);

    const tableColumn = ["No.", "Description", "Quantity", "Unit Cost", "Amount"];
    const tableRows = [];

    items.forEach((item, index) => {
      const subtotal = item.quantity * item.price;
      tableRows.push([
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        `$${parseFloat(item.price).toFixed(2)}`,
        `$${subtotal.toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 237, 237],
        textColor: 0,
        halign: 'center'
      },
      styles: { fontSize: 10 }
    });

    const headY = 70;
    const rowHeight = 7.5;
    const tableWidth = 182;
    const tableX = 14;

    doc.setDrawColor(184, 183, 183);
    doc.setLineWidth(0.5);
    doc.rect(tableX, headY, tableWidth, rowHeight);

    const finalY = doc.lastAutoTable.finalY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.setDrawColor(184, 183, 183);
    doc.setFillColor(240, 237, 237);
    doc.rect(158, finalY, 38, 10, 'FD');
    doc.setTextColor(0);
    doc.text(`   Total:         $${calculatedTotal.toFixed(2)}`, 158, finalY + 7);

    // ✅ NOTAS (con default si no hay texto)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 55, 72);
    doc.text("Client Information", 14, finalY + 20);

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(184, 183, 183);
    doc.setLineWidth(0.4);

    const boxX = 14;
    const boxY = finalY + 23;
    const boxW = 126;
    const boxH = 26;

    const defaultNotes =
      "1. This estimate is valid for 30 days from the date issued.\n" +
      "2. Any changes to the project scope may result in additional costs.";

    const notesText = (clientNotes || "").trim() ? clientNotes.trim() : defaultNotes;

    const wrapWithNewlines = (text, width) =>
      text
        .split("\n")
        .flatMap((line) => doc.splitTextToSize(line, width));

    const wrapped = wrapWithNewlines(notesText, boxW - 6);
    doc.text(wrapped, boxX + 3, boxY + 7);

    // Firma
    doc.setDrawColor(0);
    doc.rect(145, finalY + 20, 50, 25);
    doc.text("Client", 165, finalY + 24);

    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(100);
    doc.line(14, pageHeight - 22, 200, pageHeight - 22);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.textWithLink("Email: carpentry.ido@gmail.com", 20, pageHeight - 10, {
      url: "mailto:carpentry.ido@gmail.com"
    });
    doc.text("Phone: 520-668-0771", 95, pageHeight - 10);
    doc.textWithLink("@RTA Cabinetry Store", 150, pageHeight - 10, {
      url: "https://www.facebook.com/profile.php?id=61572527397285"
    });

    doc.save("presupuesto.pdf");
  };

  return (
    <>
      <div className="mt-[90px] px-4"></div>

      {/* Filtro */}
      <div className="max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar mueble por nombre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de productos */}
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">📦 Muebles disponibles</h2>

        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          {Object.entries(groupedVariants)
            .filter(([_, group]) => group.name.toLowerCase().includes(filter.toLowerCase()))
            .map(([productId, group]) => {
              const productName = group.name;
              const groupVariants = group.variants || [];
              const productImage = groupVariants.find(v => v.image_path)?.image_path;

              const selected = selectedOptions[productId] || {};
              const selectedVariant = groupVariants.find(
                v => v.color === selected.color && v.size === selected.size
              );

              const availableColors = Array.from(new Set(groupVariants.map(v => v.color)));
              const availableSizes = Array.from(new Set(groupVariants.map(v => v.size)));

              return (
                <div
                  key={productId}
                  className="flex flex-col md:flex-row border rounded-lg shadow p-4 gap-4"
                >
                  {/* Imagen */}
                  {productImage && (
                    <div className="w-full md:w-1/2">
                      <img
                        src={getImageUrl(productImage)}
                        alt="Producto"
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          // por si viene una ruta rara, evitamos el ícono roto
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{productName}</h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Descripción: </strong>{groupVariants[0]?.description}
                      </p>

                      <div className="mb-2">
                        <p className="font-medium">Colores:</p>
                        <div className="flex gap-3 flex-wrap">
                          {availableColors.map(color => {
                            const colorHex = groupVariants.find(v => v.color === color)?.colorHex;
                            const isSelected = selected.color === color;
                            return (
                              <div
                                key={color}
                                onClick={() => handleOptionChange(productId, 'color', color)}
                                className="cursor-pointer"
                              >
                                <span
                                  className={`block w-6 h-6 rounded border-2 ${
                                    isSelected ? 'ring-2 ring-blue-500' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: colorHex }}
                                  title={color}
                                ></span>
                                <span className="text-xs">{color}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {availableSizes.map(size => (
                          <label
                            key={size}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="radio"
                              name={`size-${productId}`}
                              value={size}
                              checked={selected.size === size}
                              onChange={() => handleOptionChange(productId, 'size', size)}
                            />
                            <span>{size}</span>
                          </label>
                        ))}
                      </div>

                      <p className="mt-2 font-semibold text-gray-800">
                        Precio: {selectedVariant ? `$${selectedVariant.price}` : '---'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAdd(productId)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

          <ToastContainer
            position="bottom-right"
            autoClose={2000}
            hideProgressBar
            closeOnClick
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            draggable={false}
            limit={3}
          />      
        
        </div>

      {/* Cliente */}
      <div className="max-w-4xl mx-auto mt-8 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">📇 Información del cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Notas / condiciones (opcional)..."
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            className="border p-2 rounded md:col-span-2 h-28 resize-none"
          />
        </div>
      </div>

      {/* Presupuesto */}
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">🧾 Presupuesto generado</h2>

        {estimateItems.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos añadidos aún.</p>
        ) : (
          <div className="space-y-4">
            {estimateItems.map((item) => (
              <div key={item.id} className="p-4 border rounded">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      dispatch(updateQuantity({
                        id: item.id,
                        quantity: parseInt(e.target.value)
                      }))
                    }
                    className="w-16 p-1 border rounded"
                  />

                  <label>Precio:</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      dispatch(updatePrice({
                        id: item.id,
                        price: parseFloat(e.target.value)
                      }))
                    }
                    className="w-20 p-1 border rounded"
                  />

                  <span className="ml-auto font-semibold">
                    Subtotal: ${(item.quantity * item.price).toFixed(2)}
                  </span>

                  <button
                    onClick={() => dispatch(removeFromEstimate(item.id))}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 text-right">
              <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>

              <button
                onClick={() => {
                  dispatch(clearEstimate());
                  setClientName('');
                  setClientAddress('');
                  setClientPhone('');
                  setClientEmail('');
                  setClientNotes('');
                }}
                className="mt-2 px-4 py-2 bg-gray-700 text-white rounded"
              >
                Limpiar
              </button>

              <button
                onClick={() => {
                  if (!clientName || !clientAddress || !clientPhone) {
                    toast.error("Por favor completa el nombre, dirección y teléfono del cliente.", {
                      position: "bottom-right"
                    });
                    return;
                  }
                  generateEstimatePDF(estimateItems);
                }}
                className="mt-2 ml-4 px-4 py-2 bg-green-600 text-white rounded"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EstimateGeneratorAdmin;
