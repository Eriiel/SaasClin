'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  date: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  notes?: string;
  paymentAmount?: number;
  patient: { id: string; name: string; phone: string };
  specialist: { id: string; name: string; specialty: string };
  service: { id: string; name: string; duration: number; price?: number };
}

interface Specialist { id: string; name: string; }
interface Service { id: string; name: string; duration: number; price?: number; }
interface Patient { id: string; name: string; phone: string; }

const STATUS_LABELS: Record<string, string> = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-red-50 text-red-600',
};

const emptyForm = {
  patientId: '', specialistId: '', serviceId: '',
  date: format(new Date(), 'yyyy-MM-dd'), time: '09:00',
  notes: '', paymentAmount: '',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterSpecialist, setFilterSpecialist] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const params: Record<string, string> = {};
    if (filterDate) params.date = filterDate;
    if (filterSpecialist) params.specialistId = filterSpecialist;
    const data = await api.get('/appointments', params);
    setAppointments(data);
  }

  useEffect(() => { load(); }, [filterDate, filterSpecialist]);

  useEffect(() => {
    Promise.all([
      api.get('/specialists'),
      api.get('/services'),
      api.get('/patients'),
    ]).then(([sp, sv, pt]) => {
      setSpecialists(sp);
      setServices(sv);
      setPatients(pt);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const dateTime = `${form.date}T${form.time}:00`;
      await api.post('/appointments', {
        patientId: form.patientId,
        specialistId: form.specialistId,
        serviceId: form.serviceId,
        date: dateTime,
        ...(form.notes ? { notes: form.notes } : {}),
        ...(form.paymentAmount ? { paymentAmount: Number(form.paymentAmount) } : {}),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function changeStatus(id: string, status: string) {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar cita?')) return;
    await api.delete(`/appointments/${id}`);
    load();
  }

  function printSchedule(specialistId: string) {
    if (!filterDate) return;
    window.open(`/print/schedule?specialistId=${specialistId}&date=${filterDate}`, '_blank');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Citas</h2>
          <p className="text-slate-500 text-sm mt-0.5">{appointments.length} citas encontradas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} /> Nueva cita
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-medium text-slate-900">Nueva cita</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
              <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Seleccionar...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Especialista</label>
              <select required value={form.specialistId} onChange={e => setForm({ ...form, specialistId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Seleccionar...</option>
                {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
              <select required value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Seleccionar...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input type="date" required value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                <input type="time" required value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor cobrado (opcional)</label>
              <input type="number" min={0} step="0.01" value={form.paymentAmount}
                onChange={e => setForm({ ...form, paymentAmount: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Observaciones..."
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              Crear cita
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(emptyForm); }}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select value={filterSpecialist} onChange={e => setFilterSpecialist(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">Todos los especialistas</option>
          {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {filterSpecialist && filterDate && (
          <button onClick={() => printSchedule(filterSpecialist)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
            <Printer size={14} /> Imprimir horario
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {appointments.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">No hay citas para los filtros seleccionados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Hora</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Paciente</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Especialista</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Servicio</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {format(new Date(a.date), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{a.patient.name}</p>
                    <p className="text-slate-500 text-xs">{a.patient.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{a.specialist.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{a.service.name}</p>
                    <p className="text-xs text-slate-400">{a.service.duration} min</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={a.status}
                      onChange={e => changeStatus(a.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${STATUS_STYLES[a.status]}`}
                    >
                      <option value="CONFIRMED">Confirmada</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => remove(a.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
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
