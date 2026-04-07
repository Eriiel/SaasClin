'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

const emptyForm = { name: '', phone: '', email: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await api.get('/patients');
    setPatients(data);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        ...(form.email ? { email: form.email } : {}),
      };
      if (editing) {
        await api.patch(`/patients/${editing}`, payload);
      } else {
        await api.post('/patients', payload);
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
    if (!confirm('¿Eliminar paciente?')) return;
    await api.delete(`/patients/${id}`);
    load();
  }

  function startEdit(p: Patient) {
    setForm({ name: p.name, phone: p.phone, email: p.email ?? '' });
    setEditing(p.id);
    setShowForm(true);
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Pacientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{patients.length} registrados</p>
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
          <h3 className="font-medium text-slate-900">{editing ? 'Editar paciente' : 'Nuevo paciente'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Carlos Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input required value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+57 300 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (opcional)</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="paciente@email.com"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              {editing ? 'Guardar cambios' : 'Crear paciente'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-80 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">
            {search ? 'Sin resultados.' : 'No hay pacientes registrados.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nombre</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Teléfono</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Email</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.phone}</td>
                  <td className="px-6 py-4 text-slate-500">{p.email ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
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
