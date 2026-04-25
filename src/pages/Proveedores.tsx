import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

type Provider = {
  id: number;
  name: string;
  date: string;
  status: string;
  amount: number;
};

export default function Proveedores() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([
    { id: 1, name: "Acme", date: "2024-06-01", status: "Enviado", amount: 2500 },
    { id: 2, name: "Bravo", date: "2024-06-02", status: "Cancelado", amount: 1200 },
    { id: 3, name: "Charlie's", date: "2024-06-02", status: "Finalizado", amount: 500 },
    { id: 4, name: "Delta", date: "2024-06-03", status: "Recepciona", amount: 750 },
    { id: 5, name: "Echo", date: "2024-06-04", status: "Pendiente", amount: 3000 },
    { id: 6, name: "Foxtrot", date: "2024-06-05", status: "Pendiente", amount: 1150 },
    { id: 7, name: "Golf", date: "2024-06-06", status: "Enviado", amount: 2300 },
    { id: 8, name: "Acme", date: "2024-06-07", status: "Cancelado", amount: 900 },
    { id: 9, name: "India", date: "2024-06-08", status: "Finalizado", amount: 600 },
    { id: 10, name: "Jullett", date: "2024-06-09", status: "Enviado", amount: 1850 },
    { id: 11, name: "Kilo", date: "2024-06-10", status: "Recepciona", amount: 2750 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newAmount, setNewAmount] = useState("");
  // edición por fila
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const filtered = useMemo(() => {
    return providers.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (dateFrom && p.date < dateFrom) return false;
      return true;
    });
  }, [providers, query, statusFilter, dateFrom]);

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

  const openAdd = () => {
    setNewName(""); setNewDate(""); setNewStatus(""); setNewAmount("");
    setShowAddModal(true);
  };

  const saveNew = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    const p: Provider = {
      id: Date.now(),
      name: newName.trim(),
      date: newDate || new Date().toISOString().slice(0,10),
      status: newStatus || "Pendiente",
      amount: Number(newAmount) || 0,
    };
    setProviders(prev => [p, ...prev]);
    setShowAddModal(false);
    setPage(1);
  };

  const deleteProvider = (id: number) => {
    if (!confirm('¿Eliminar registro? Esta acción no se puede deshacer.')) return;
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const openEdit = (p: Provider) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDate(p.date);
    setEditStatus(p.status);
    setEditAmount(String(p.amount));
  };

  const saveEdit = () => {
    if (editingId == null) return;
    setProviders(prev => prev.map(pr => pr.id === editingId ? { ...pr, name: editName.trim() || pr.name, date: editDate || pr.date, status: editStatus || pr.status, amount: Number(editAmount) || 0 } : pr ));
    setEditingId(null);
  };

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <section className="bg-white/90 border border-white/20 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Proveedores</h1>
            <button onClick={openAdd} className="px-3 py-2 bg-yellow-400 rounded text-sm">+ Agregar</button>
          </div>

          <div className="flex gap-2 items-center mb-4 flex-wrap">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded w-48" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded">
              <option value="">Estado</option>
              <option>Enviado</option>
              <option>Cancelado</option>
              <option>Finalizado</option>
              <option>Recepciona</option>
              <option>Pendiente</option>
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded" />
            <button onClick={() => navigate('/admin-profile')} className="ml-auto px-3 py-2 border rounded">Regresar</button>
          </div>

          <div className="overflow-x-auto max-h-72 border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-600">
                  <th className="py-2 px-3">Fecha Pedi</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Monto</th>
                  <th className="py-2 px-3">Actualiz</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 px-3">{p.date}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3">{p.status}</td>
                    <td className="py-2 px-3">${p.amount.toFixed(2)}</td>
                    <td className="py-2 px-3 flex gap-3">
                      <button onClick={() => openEdit(p)} className="text-blue-600">Actualizar</button>
                      <button onClick={() => deleteProvider(p.id)} className="text-red-600">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">No hay resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={() => setPage(1)} className="px-2 py-1 border rounded">«</button>
            <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded">‹</button>
            {/* simple numeric pages */}
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`px-2 py-1 border rounded ${page===i+1 ? 'bg-[var(--Primary_3)] text-white' : ''}`}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-2 py-1 border rounded">›</button>
            <button onClick={() => setPage(totalPages)} className="px-2 py-1 border rounded">»</button>
          </div>

          {/* Add modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-md w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Agregar Proveedor</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-600">✕</button>
                </div>
                <form onSubmit={saveNew} className="grid grid-cols-1 gap-3">
                  <label className="text-sm">Proveedor</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">Fecha</label>
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm">Estado</label>
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="">Seleccionar</option>
                        <option>Enviado</option>
                        <option>Cancelado</option>
                        <option>Finalizado</option>
                        <option>Recepciona</option>
                        <option>Pendiente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Monto</label>
                    <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Monto" className="w-full px-3 py-2 border rounded" />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-[var(--Primary_5)] text-white rounded">Guardar cambios</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit modal (por fila) */}
          {editingId != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-md w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Actualizar Proveedor</h3>
                  <button onClick={() => setEditingId(null)} className="text-gray-600">✕</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="grid grid-cols-1 gap-3">
                  <label className="text-sm">Proveedor</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">Fecha</label>
                      <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm">Estado</label>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="">Seleccionar</option>
                        <option>Enviado</option>
                        <option>Cancelado</option>
                        <option>Finalizado</option>
                        <option>Recepciona</option>
                        <option>Pendiente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Monto</label>
                    <input value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Monto" className="w-full px-3 py-2 border rounded" />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 border rounded">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-[var(--Primary_5)] text-white rounded">Guardar cambios</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </section>
      </main>
    </>
  );
}
