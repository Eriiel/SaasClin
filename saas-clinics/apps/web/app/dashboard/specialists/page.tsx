'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
};

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  availability: { day: string; startTime: string; endTime: string }[];
}

const emptyForm = { name: '', specialty: '' };
const emptyAvail = { day: 'MONDAY', startTime: '08:00', endTime: '17:00' };

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [availForm, setAvailForm] = useState(emptyAvail);
  const [error, setError] = useState('');

  async function load() {
    const data = await api.get('/specialists');
    setSpecialists(data);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.patch(`/specialists/${editing}`, form);
      } else {
        await api.post('/specialists', form);
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
    if (!confirm('¿Eliminar especialista?')) return;
    await api.delete(`/specialists/${id}`);
    load();
  }

  function startEdit(s: Specialist) {
    setForm({ name: s.name, specialty: s.specialty });
    setEditing(s.id);
    setShowForm(true);
  }

  async function saveAvailability(specialistId: string) {
    setError('');
    try {
      await api.post(`/specialists/${specialistId}/availability`, availForm);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function removeAvailability(specialistId: string, day: string) {
    await api.delete(`/specialists/${specialistId}/availability/${day}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Especialistas</h2>
          <p className="text-slate-500 text-sm mt-0.5">{specialists.length} registrados</p>
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
          <h3 className="font-medium text-slate-900">{editing ? 'Editar especialista' : 'Nuevo especialista'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Dr. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad</label>
              <input
                required value={form.specialty}
                onChange={e => setForm({ ...form, specialty: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Odontología"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              {editing ? 'Guardar cambios' : 'Crear especialista'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {specialists.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-12">No hay especialistas registrados.</p>
        )}
        {specialists.map(s => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-slate-900">{s.name}</p>
                <p className="text-sm text-slate-500">{s.specialty}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <Clock size={14} /> Horarios
                  {expandedId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button onClick={() => startEdit(s)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {expandedId === s.id && (
              <div className="border-t border-slate-100 px-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Horarios actuales</h4>
                    {s.availability.length === 0 ? (
                      <p className="text-sm text-slate-400">Sin horarios definidos</p>
                    ) : (
                      <div className="space-y-1.5">
                        {s.availability.map(a => (
                          <div key={a.day} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-slate-700">{DAY_LABELS[a.day]}</span>
                            <span className="text-sm text-slate-500">{a.startTime} – {a.endTime}</span>
                            <button onClick={() => removeAvailability(s.id, a.day)} className="text-slate-300 hover:text-red-500 ml-2 transition">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Agregar / modificar horario</h4>
                    <div className="space-y-2">
                      <select
                        value={availForm.day}
                        onChange={e => setAvailForm({ ...availForm, day: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <input type="time" value={availForm.startTime}
                          onChange={e => setAvailForm({ ...availForm, startTime: e.target.value })}
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <input type="time" value={availForm.endTime}
                          onChange={e => setAvailForm({ ...availForm, endTime: e.target.value })}
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <button onClick={() => saveAvailability(s.id)}
                        className="w-full bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition">
                        Guardar horario
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
