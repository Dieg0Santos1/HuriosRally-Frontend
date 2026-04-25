import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

type Invoice = {
  id: number;
  client: string;
  amount: number;
  type: "boleta" | "factura";
  date: string; // ISO date
  file?: string;
};

export default function BoletasFacturas() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ejemplos estáticos (front-end only)
  const [invoices] = useState<Invoice[]>([
    { id: 1, client: "Cliente_1", amount: 40, type: "boleta", date: new Date().toISOString(), file: "#" },
    { id: 2, client: "Cliente_2", amount: 38, type: "factura", date: new Date(Date.now() - 86400 * 1000 * 2).toISOString(), file: "#" },
    { id: 3, client: "Cliente_3", amount: 41, type: "factura", date: new Date(Date.now() - 86400 * 1000 * 10).toISOString(), file: "#" },
    { id: 4, client: "Cliente_4", amount: 100, type: "factura", date: new Date(Date.now() - 86400 * 1000 * 20).toISOString(), file: "#" },
  ]);

  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const daysInMonth = (d: Date) => endOfMonth(d).getDate();

  const invoicesByDate = useMemo(() => {
    const map: Record<string, Invoice[]> = {};
    invoices.forEach(inv => {
      const iso = new Date(inv.date).toISOString().slice(0, 10);
      if (!map[iso]) map[iso] = [];
      map[iso].push(inv);
    });
    return map;
  }, [invoices]);

  // días del mes visible (no memoizado para simplicidad)
  const days = (() => {
    const y = visibleMonth.getFullYear();
    const m = visibleMonth.getMonth();
    const dim = daysInMonth(visibleMonth);
    const arr: { date: string; items: Invoice[] }[] = [];
    for (let d = 1; d <= dim; d++) {
      const iso = new Date(y, m, d).toISOString().slice(0, 10);
      arr.push({ date: iso, items: invoicesByDate[iso] || [] });
    }
    return arr;
  })();

  const goPrev = () => setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNext = () => setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // tabla simple: paginación local
  const [page, setPage] = useState(1);
  const perPage = 5;
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return invoices.slice(start, start + perPage);
  }, [invoices, page]);
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <section className="bg-white/90 border border-white/20 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin-profile')} className="px-2 py-1 border rounded text-sm">Regresar</button>
              <h1 className="text-2xl font-semibold">Boletas/Facturas</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-500">{visibleMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={goPrev} className="px-2 py-1 border rounded">◀</button>
                  <button onClick={goNext} className="px-2 py-1 border rounded">▶</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                  <div key={d} className="text-xs text-gray-500">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* simple: offset days */}
                {(() => {
                  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
                  const cells: React.ReactNode[] = [];
                  for (let i=0;i<firstDay;i++) cells.push(<div key={'e'+i} />);
                  days.forEach(d => {
                    const count = d.items.length;
                    const isSelected = selectedDate === d.date;
                    cells.push(
                      <button key={d.date} onClick={() => setSelectedDate(d.date)} className={`p-2 rounded ${isSelected ? 'bg-[var(--Primary_3)] text-white' : 'hover:bg-gray-100'}`}>
                        <div className="text-sm">{new Date(d.date).getDate()}</div>
                        {count > 0 && <div className="text-[10px] text-gray-600">{count} llegada{s(count)}</div>}
                      </button>
                    );
                  });
                  return cells;
                })()}
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Lista de boletas/facturas</h3>
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
                    {paged.map(inv => (
                      <tr key={inv.id} className="border-t">
                        <td className="py-2">{inv.client}</td>
                        <td className="py-2">S/ {inv.amount}</td>
                        <td className="py-2">{inv.type}</td>
                        <td className="py-2">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="py-2"><a className="text-blue-600" href={inv.file}>link</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">Página {page}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded">‹</button>
                  <button onClick={() => setPage(p => p+1)} className="px-2 py-1 border rounded">›</button>
                </div>
              </div>
            </div>
          </div>

          {/* detalle por fecha seleccionada */}
          {selectedDate && (
            <div className="mt-6 bg-gray-50 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Llegadas para {selectedDate}</h4>
                <button onClick={() => setSelectedDate(null)} className="text-sm text-blue-600">CANCEL</button>
              </div>
              <ul className="text-sm">
                {(invoicesByDate[selectedDate] || []).map(it => (
                  <li key={it.id} className="py-1 border-b">{it.client} — S/ {it.amount} — {it.type}</li>
                ))}
                {(invoicesByDate[selectedDate] || []).length === 0 && <li className="text-gray-500">No hay llegadas para esta fecha.</li>}
              </ul>
            </div>
          )}

        </section>
      </main>
    </>
  );
}

function s(n: number) { return n === 1 ? '' : 's' }
