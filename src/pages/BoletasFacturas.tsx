import React, { useMemo, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { getAllSales, getSaleById, type PaymentSale } from "../api/payments";
import { generateBoletaPDF, generateFacturaPDF } from "../utils/pdfGenerator";

type InvoiceRow = {
  id: number;
  client: string;
  amount: number;
  type: "boleta" | "factura";
  date: string;
  status: string;
};

function getInvoiceType(documentType: string): "boleta" | "factura" {
  return documentType?.toLowerCase() === "dni" ? "boleta" : "factura";
}

function formatCurrency(amount: number) {
  return `S/ ${amount.toFixed(2)}`;
}

function mapSaleToInvoice(sale: PaymentSale): InvoiceRow {
  return {
    id: sale.id,
    client:
      sale.companyName ||
      sale.fullName ||
      sale.user?.email ||
      `Cliente #${sale.id}`,
    amount: sale.total,
    type: getInvoiceType(sale.documentType),
    date: sale.createdAt,
    status: sale.status,
  };
}

export default function BoletasFacturas() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sales, setSales] = useState<PaymentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const perPage = 5;

  useEffect(() => {
    void loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSales();
      setSales(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al cargar las boletas y facturas");
      }
    } finally {
      setLoading(false);
    }
  };

  const invoices = useMemo(
    () =>
      sales
        .map(mapSaleToInvoice)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [sales],
  );

  const endOfMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const daysInMonth = (d: Date) => endOfMonth(d).getDate();

  const invoicesByDate = useMemo(() => {
    const map: Record<string, InvoiceRow[]> = {};
    invoices.forEach((inv) => {
      const iso = new Date(inv.date).toISOString().slice(0, 10);
      if (!map[iso]) map[iso] = [];
      map[iso].push(inv);
    });
    return map;
  }, [invoices]);

  const days = (() => {
    const y = visibleMonth.getFullYear();
    const m = visibleMonth.getMonth();
    const dim = daysInMonth(visibleMonth);
    const arr: { date: string; items: InvoiceRow[] }[] = [];
    for (let d = 1; d <= dim; d++) {
      const iso = new Date(y, m, d).toISOString().slice(0, 10);
      arr.push({ date: iso, items: invoicesByDate[iso] || [] });
    }
    return arr;
  })();

  const filteredInvoices = useMemo(() => {
    if (!selectedDate) return invoices;
    return invoices.filter(
      (invoice) => invoice.date.slice(0, 10) === selectedDate,
    );
  }, [invoices, selectedDate]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / perPage));

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return invoices.slice(start, start + perPage);
  }, [invoices, page]);
  useEffect(() => {
    setPage(1);
  }, [selectedDate]);

  const goPrev = () =>
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  const goNext = () =>
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );

  const handleDownload = async (invoiceId: number) => {
    try {
      setDownloadId(invoiceId);
      setError(null);

      const sale = await getSaleById(invoiceId);
      const items = (sale.items || []).map((item) => ({
        name: item.product?.name || `Producto #${item.product?.id || item.id}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.subtotal,
      }));

      const currentDate = new Date(sale.createdAt).toLocaleDateString("es-PE");
      const paymentMethodLabel = sale.paymentMethod;
      const deliveryMethodLabel = sale.deliveryMethod;
      const invoiceType = getInvoiceType(sale.documentType);
      const paddedId = String(sale.id).padStart(5, "0");

      if (invoiceType === "boleta") {
        await generateBoletaPDF({
          boletaNumber: `B001-${paddedId}`,
          date: currentDate,
          clientName: sale.fullName,
          clientDNI: sale.dni || "---",
          items,
          subtotal: sale.subtotal,
          igv: sale.total - sale.total / 1.18,
          total: sale.total,
          paymentMethod: paymentMethodLabel,
          deliveryMethod: deliveryMethodLabel,
        });
      } else {
        await generateFacturaPDF({
          facturaNumber: `F001-${paddedId}`,
          date: currentDate,
          clientName: sale.companyName || sale.fullName,
          clientRUC: sale.ruc || "---",
          clientAddress: sale.companyAddress || sale.deliveryAddress || "---",
          items,
          subtotal: sale.subtotal,
          anticipos: 0,
          descuentos: 0,
          valorVenta: sale.total / 1.18,
          isc: 0,
          igv: sale.total - sale.total / 1.18,
          total: sale.total,
          paymentMethod: paymentMethodLabel,
          deliveryMethod: deliveryMethodLabel,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo descargar el comprobante");
      }
    } finally {
      setDownloadId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <section className="bg-white/90 border border-white/20 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin-profile")}
                className="px-2 py-1 border rounded text-sm"
              >
                Regresar
              </button>
              <div>
                <h1 className="text-2xl font-semibold">Boletas/Facturas</h1>
                <p className="text-sm text-gray-500">
                  Revisa ventas reales registradas en el sistema.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">
                  {visibleMonth
                    .toLocaleString("es-PE", { month: "long", year: "numeric" })
                    .toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={goPrev} className="px-2 py-1 border rounded">
                    ‹
                  </button>
                  <button onClick={goNext} className="px-2 py-1 border rounded">
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                  <div key={d} className="text-xs text-gray-500">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {(() => {
                  const firstDay = new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth(),
                    1,
                  ).getDay();
                  const cells: React.ReactNode[] = [];
                  for (let i = 0; i < firstDay; i++)
                    cells.push(<div key={`e${i}`} />);
                  days.forEach((d) => {
                    const count = d.items.length;
                    const isSelected = selectedDate === d.date;
                    cells.push(
                      <button
                        key={d.date}
                        onClick={() =>
                          setSelectedDate((current) =>
                            current === d.date ? null : d.date,
                          )
                        }
                        className={`p-2 rounded ${
                          isSelected
                            ? "bg-[var(--Primary_3)] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-sm">
                          {new Date(d.date).getDate()}
                        </div>
                        {count > 0 && (
                          <div className="text-[10px] text-gray-600">
                            {count} comprobante{count === 1 ? "" : "s"}
                          </div>
                        )}
                      </button>,
                    );
                  });
                  return cells;
                })()}
              </div>
            </div>
            {/*¿Cómo hago para que no se aplique el filtro aquí  */}
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">
                Lista de boletas/facturas
              </h3>

              {loading ? (
                <p className="text-sm text-gray-600">Cargando ventas...</p>
              ) : paged.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay comprobantes para mostrar.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="py-2">Cliente</th>
                        <th className="py-2">Monto</th>
                        <th className="py-2">Tipo</th>
                        <th className="py-2">Fecha</th>
                        <th className="py-2">Descargar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((inv) => (
                        <tr key={inv.id} className="border-t">
                          <td className="py-2">{inv.client}</td>
                          <td className="py-2">{formatCurrency(inv.amount)}</td>
                          <td className="py-2 capitalize">{inv.type}</td>
                          <td className="py-2">
                            {new Date(inv.date).toLocaleDateString("es-PE")}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => void handleDownload(inv.id)}
                              disabled={downloadId === inv.id}
                              className="text-blue-600 hover:underline disabled:text-gray-400"
                            >
                              {downloadId === inv.id
                                ? "Generando..."
                                : "Descargar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Página {page} de {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Comprobantes del día
                  </h4>
                  <p className="text-xs text-gray-500">
                    {/* Formateo local para que no muestre el string ISO seco (AAAA-MM-DD) */}
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "es-PE",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs bg-white border hover:bg-gray-50 text-gray-600 px-2 py-1 rounded shadow-sm transition"
                >
                  Limpiar filtro
                </button>
              </div>

              <ul className="text-sm divide-y divide-gray-100">
                {(invoicesByDate[selectedDate] || []).map((it) => (
                  <li
                    key={it.id}
                    className="py-2 flex justify-between items-center gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-900 block truncate">
                        {it.client}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {it.type} • {it.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(it.amount)}
                      </span>
                      <button
                        onClick={() => void handleDownload(it.id)}
                        disabled={downloadId === it.id}
                        className="text-xs text-blue-600 hover:underline disabled:text-gray-400 font-medium"
                      >
                        {downloadId === it.id ? "..." : "Descargar"}
                      </button>
                    </div>
                  </li>
                ))}

                {(invoicesByDate[selectedDate] || []).length === 0 && (
                  <li className="text-gray-500 text-center py-4 bg-white rounded border border-dashed">
                    No hay comprobantes registrados para esta fecha.
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
