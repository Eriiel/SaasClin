'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

const emptyForm = { name: '', duration: 30, price: '' };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const data = await api.get('/services');
    setServices(data);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        duration: Number(form.duration),
        ...(form.price !== '' ? { price: Number(form.price) } : {}),
      };
      if (editing) {
        await api.patch(`/services/${editing}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar servicio?')) return;
    await api.delete(`/services/${id}`);
    load();
  }

  function startEdit(s: Service) {
    setForm({ name: s.name, duration: s.duration, price: s.price?.toString() ?? '' });
    setEditing(s.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Servicios</h2>
          <p className="text-slate-500 text-sm mt-0.5">{services.length} registrados</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-medium text-slate-900">{editing ? 'Editar servicio' : 'Nuevo servicio'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Consulta general"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duración (min)</label>
              <input required type="number" min={1} value={form.duration}
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio (opcional)</label>
              <input type="number" min={0} step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0.00"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              {editing ? 'Guardar cambios' : 'Crear servicio'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {services.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">No hay servicios registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nombre</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Duración</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Precio</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.duration} min</td>
                  <td className="px-6 py-4 text-slate-600">
                    {s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(s)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
