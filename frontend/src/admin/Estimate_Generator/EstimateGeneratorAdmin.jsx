import { useEffect, useMemo, useRef, useState } from 'react';
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

  const estimateRef = useRef(null);
  const [isMiniVisible, setIsMiniVisible] = useState(false);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);

  // Muestra el mini-panel cuando la sección del presupuesto NO está visible
  useEffect(() => {
    const el = estimateRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        // Si NO se ve el presupuesto en pantalla -> mostramos el mini
        setIsMiniVisible(!entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [estimateItems.length]);

  // Bloquea scroll del body cuando el panel está abierto (tipo YouTube)
  useEffect(() => {
    if (!isEstimateOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [isEstimateOpen]);


  const generateEstimatePDF = async (items, fileName) => {
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

   // ✅ TABLA + TOTAL (footer) + manejo PRO de paginación para que NOTAS/FIRMA nunca se corten
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
  startY: 70,
  head: [tableColumn],
  body: tableRows,

  // ✅ TOTAL como parte de la tabla (footer)
  foot: [[
    { content: 'Total', colSpan: 4, styles: { halign: 'right' } },
    { content: `$${calculatedTotal.toFixed(2)}`, styles: { halign: 'right' } }
  ]],
  showFoot: 'lastPage',

  theme: 'grid',
  margin: { left: 14, right: 14, top: 20, bottom: 28 },

  styles: { fontSize: 10, cellPadding: 2 },

  headStyles: {
    fillColor: [240, 237, 237],
    textColor: 0,
    halign: 'center',
    fontStyle: 'bold'
  },

  footStyles: {
    fillColor: [240, 237, 237],
    textColor: 0,
    fontStyle: 'bold'
  },

  columnStyles: {
    0: { halign: 'center', cellWidth: 10 }, // No.
    1: { halign: 'left' },                  // Description
    2: { halign: 'center', cellWidth: 22 }, // Quantity
    3: { halign: 'right',  cellWidth: 28 }, // Unit Cost
    4: { halign: 'right',  cellWidth: 28 }  // Amount
  },

  // ✅ Header en cada página (línea superior)
  didDrawPage: () => {
    doc.setDrawColor(100);
    doc.setLineWidth(0.3);
    doc.line(14, 28, 197, 28);
  }
});

// ✅ Posición final real en la última página donde terminó la tabla
let finalY = doc.lastAutoTable.finalY;

// ✅ Si notas/firma no caben, forzamos nueva página (PRO)
const pdfpageHeight = doc.internal.pageSize.height;
const footerLineY = pdfpageHeight - 22;

// espacio aproximado que ocupan: título + caja notas + firma + aire
const neededSpace = 55;

if (finalY + neededSpace > footerLineY) {
  doc.addPage();
  finalY = 20; // arrancamos arriba en nueva página
}

// =======================
// ✅ NOTAS (debajo de la tabla, sin cortarse)
// =======================
doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.setTextColor(200, 0, 0);

// Cambia el título si quieres: Notes / Conditions
doc.text("Client Information", 14, finalY + 12);

doc.setTextColor(0, 0, 0);
doc.setDrawColor(184, 183, 183);
doc.setLineWidth(0.4);

const boxX = 14;
const boxY = finalY + 15;
const boxW = 126;
const boxH = 26;

// ✅ si quieres mantener el recuadro de notas, déjalo:
//doc.rect(boxX, boxY, boxW, boxH);

const defaultNotes =
  "1. This estimate is valid for 30 days from the date issued.\n" +
  "2. Any changes to the project scope may result in additional costs.";

const notesText = (clientNotes || "").trim() ? clientNotes.trim() : defaultNotes;

const wrapWithNewlines = (text, width) =>
  text.split("\n").flatMap((line) => doc.splitTextToSize(line, width));

const wrapped = wrapWithNewlines(notesText, boxW - 6);
doc.text(wrapped, boxX + 3, boxY + 7);

// =======================
// ✅ FIRMA (derecha)
// =======================
doc.setDrawColor(0);
doc.rect(145, finalY + 12, 50, 29);
doc.text("Client", 165, finalY + 17);


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

    await savePdfPro(doc, fileName);
    
    toast.success(`PDF guardado correctamente 💾`, {
    position: "bottom-right",
    autoClose: 2000,
});

  };

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelMin, setIsPanelMin] = useState(true);
  const PANEL_GUTTER = 460; // ancho del panel (≈420) + margen
  const needsGutter = isPanelOpen && !isPanelMin;
  const gutterStyle = needsGutter ? { paddingRight: PANEL_GUTTER } : undefined;
  const gutterClass = isPanelOpen && !isPanelMin ? 'xl:pr-[460px]' : '';
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const buildDefaultPdfName = () => {
    const base = clientName?.trim() ? clientName.trim() : "Client";
    const date = new Date().toISOString().slice(0, 10); // 2026-02-06
    return `Estimate-${base}-${date}.pdf`;
  };

  const normalizePdfName = (name) => {
  const cleaned = (name || "").trim();
  if (!cleaned) return "Estimate.pdf";
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
};

const savePdfPro = async (doc, fileName) => {
  const finalName = normalizePdfName(fileName);

  // ✅ File System Access API (Chrome/Edge)
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName: finalName,
      types: [
        {
          description: "PDF Document",
          accept: { "application/pdf": [".pdf"] }
        }
      ]
    });

    const writable = await handle.createWritable();
    const blob = doc.output("blob");
    await writable.write(blob);
    await writable.close();
    return;
  }

  // ✅ Fallback (Safari/Firefox): descarga normal
  doc.save(finalName);
};

  return (
  <>
    <div className="mt-[90px] px-4"></div>

    {/* =======================
        FILTRO (con gutter)
    ======================= */}
    <div className={`w-full ${gutterClass}`}>
      <div className="max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar mueble por nombre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* =======================
        LISTA DE PRODUCTOS (con gutter)
    ======================= */}
    <div className={`w-full ${gutterClass}`}>
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">📦 Muebles disponibles</h2>

        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          {Object.entries(groupedVariants)
            .filter(([_, group]) => group.name.toLowerCase().includes(filter.toLowerCase()))
            .map(([productId, group]) => {
              const productName = group.name;
              const groupVariants = group.variants || [];
              const productImage = groupVariants.find((v) => v.image_path)?.image_path;

              const selected = selectedOptions[productId] || {};
              const selectedVariant = groupVariants.find(
                (v) => v.color === selected.color && v.size === selected.size
              );

              const availableColors = Array.from(new Set(groupVariants.map((v) => v.color)));
              const availableSizes = Array.from(new Set(groupVariants.map((v) => v.size)));

              return (
                <div
                  key={productId}
                  className="flex flex-col xl:flex-row border rounded-lg shadow p-4 gap-4 bg-white"
                >
                  {/* Imagen */}
                  {productImage && (
                    <div className="w-full xl:w-1/2">
                      <img
                        src={getImageUrl(productImage)}
                        alt="Producto"
                        className="w-full h-auto md:h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{productName}</h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Descripción: </strong>
                        {groupVariants[0]?.description}
                      </p>

                      <div className="mb-2">
                        <p className="font-medium">Colores:</p>
                        <div className="flex gap-3 flex-wrap">
                          {availableColors.map((color) => {
                            const colorHex = groupVariants.find((v) => v.color === color)?.colorHex;
                            const isSelected = selected.color === color;

                            return (
                              <div
                                key={color}
                                onClick={() => handleOptionChange(productId, "color", color)}
                                className="cursor-pointer"
                              >
                                <span
                                  className={`block w-6 h-6 rounded border-2 ${
                                    isSelected ? "ring-2 ring-blue-500" : "border-gray-300"
                                  }`}
                                  style={{ backgroundColor: colorHex }}
                                  title={color}
                                />
                                <span className="text-xs">{color}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {availableSizes.map((size) => (
                          <label key={size} className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name={`size-${productId}`}
                              value={size}
                              checked={selected.size === size}
                              onChange={() => handleOptionChange(productId, "size", size)}
                            />
                            <span>{size}</span>
                          </label>
                        ))}
                      </div>

                      <p className="mt-2 font-semibold text-gray-800">
                        Precio: {selectedVariant ? `$${selectedVariant.price}` : "---"}
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
      </div>
    </div>

    {/* =======================
        PANEL FLOTANTE (Arriba-derecha)
        - No estorba al toast (toast abajo-derecha)
        - Incluye Info cliente + presupuesto
    ======================= */}

    {/* Botón para abrir si está cerrado */}
    {!isPanelOpen && (
      <button
        onClick={() => {
          setIsPanelOpen(true);
          setIsPanelMin(false);
        }}
        className="fixed top-24 right-6 z-[9999] bg-white border shadow-lg rounded-xl px-4 py-2 hover:bg-gray-50"
      >
        🧾 Ver presupuesto
      </button>
    )}

    {/* Vista minimizada */}
    {isPanelOpen && isPanelMin && (
      <button
        onClick={() => setIsPanelMin(false)}
        className="fixed top-24 right-6 z-[9999] bg-white border shadow-lg rounded-xl px-4 py-2 hover:bg-gray-50 text-left"
        title="Abrir presupuesto"
      >
        <div className="font-semibold">🧾 Presupuesto</div>
        <div className="text-sm text-gray-600">Total: ${total.toFixed(2)}</div>
      </button>
    )}

    {/* Panel completo */}
    {isPanelOpen && !isPanelMin && (
        <div className="
          fixed top-20 sm:top-24 right-3 sm:right-6 z-[9999]
          w-[calc(100vw-1.5rem)] sm:w-[420px] xl:w-[460px]
          h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)]
          bg-white border rounded-2xl shadow-2xl overflow-hidden
        ">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧾</span>
            <div>
              <div className="font-semibold leading-tight">Presupuesto generado</div>
              <div className="text-sm text-gray-600 leading-tight">
                Total: ${total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPanelMin(true)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              title="Minimizar"
            >
              Minimizar
            </button>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body layout: scroll interno + footer fijo */}
        <div className="h-[calc(100%-56px)] flex flex-col">
          {/* Scroll interno */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Info cliente dentro del panel */}
            <div className="border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span>📇</span>
                  <h3 className="font-semibold">Información del cliente</h3>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Requerido: nombre, dirección, teléfono
                </div>
              </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
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
                  className="border p-2 rounded xl:col-span-2 h-28 resize-none"
                />
              </div>
            </div>

            {/* Items del presupuesto */}
            <div className="border rounded-xl p-4">
              <h3 className="font-semibold mb-3">🧾 Productos agregados</h3>

              {estimateItems.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay productos añadidos aún.</p>
              ) : (
                <div className="space-y-3">
                  {estimateItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <p className="font-semibold">{item.name}</p>
                      {!!item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <label className="text-sm">Cantidad:</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                quantity: parseInt(e.target.value || "0", 10),
                              })
                            )
                          }
                          className="w-20 p-1 border rounded"
                        />

                        <label className="text-sm">Precio:</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            dispatch(
                              updatePrice({
                                id: item.id,
                                price: parseFloat(e.target.value || "0"),
                              })
                            )
                          }
                          className="w-28 p-1 border rounded"
                        />

                        <span className="ml-auto font-semibold text-sm">
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
                </div>
              )}
            </div>
          </div>

          {/* Footer fijo */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    dispatch(clearEstimate());
                    setClientName("");
                    setClientAddress("");
                    setClientPhone("");
                    setClientEmail("");
                    setClientNotes("");
                  }}
                  className="px-5 py-2 bg-gray-700 text-white rounded-lg"
                >
                  Limpiar
                </button>

                <button
                  onClick={async () => {
                    if (!clientName || !clientAddress || !clientPhone) {
                      toast.error("Por favor completa el nombre, dirección y teléfono del cliente.", {
                        position: "bottom-right",
                      });
                      return;
                    }

                    // ✅ Si existe el picker nativo (Chrome/Edge), usamos SOLO ese
                    if (window.showSaveFilePicker) {
                      try {
                        setIsSavingPdf(true);
                        await generateEstimatePDF(estimateItems, buildDefaultPdfName());
                      } catch (err) {
                        console.error(err);
                        toast.error("No se pudo generar el PDF.", { position: "bottom-right" });
                      } finally {
                        setIsSavingPdf(false);
                      }
                      return;
                    }

                    // ✅ Si NO existe (Safari/Firefox), usamos tu modal bonito para el nombre
                    setPdfFileName(buildDefaultPdfName());
                    setShowSaveModal(true);
                  }}

                  className="px-5 py-2 bg-green-600 text-white rounded-lg"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    {showSaveModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => !isSavingPdf && setShowSaveModal(false)}
    />

    {/* card */}
    <div className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Guardar PDF</h3>
          <p className="text-sm text-gray-500 mt-1">
            Escribe el nombre del archivo. El formato será <b>.pdf</b>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => !isSavingPdf && setShowSaveModal(false)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Nombre del archivo</label>
        <input
          value={pdfFileName}
          onChange={(e) => setPdfFileName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isSavingPdf) {
              e.preventDefault();
              document.getElementById("btn-save-pdf")?.click();
            }
          }}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Estimate-JohnDoe-2026-02-06.pdf"
          autoFocus
        />

        <div className="mt-2 text-xs text-gray-500">
          Tip: Puedes poner solo el nombre, nosotros agregamos <b>.pdf</b> si falta.
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowSaveModal(false)}
          disabled={isSavingPdf}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          id="btn-save-pdf"
          type="button"
          disabled={isSavingPdf}
          onClick={async () => {
            try {
              setIsSavingPdf(true);
              // 👉 Aquí generas el PDF y lo guardas con nombre personalizado
              await generateEstimatePDF(estimateItems, pdfFileName); 
              setShowSaveModal(false);
            } catch (err) {
              console.error(err);
              toast.error("No se pudo generar el PDF.", { position: "bottom-right" });
            } finally {
              setIsSavingPdf(false);
            }
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSavingPdf ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  </div>
)}

  </>
);

};

export default EstimateGeneratorAdmin;
