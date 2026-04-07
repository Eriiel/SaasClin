'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create clinic (setup token is already in localStorage)
      await api.post('/clinics', {
        name: form.name,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.address ? { address: form.address } : {}),
      });

      // Exchange setup token for full JWT with clinic_id
      const { access_token } = await api.post('/auth/refresh', {});
      localStorage.setItem('token', access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la clínica');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Configura tu clínica</h1>
          <p className="text-slate-500 text-sm mt-1">Este es el último paso antes de acceder al panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la clínica</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Clínica Central"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (opcional)</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="+57 300 000 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección (opcional)</label>
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Calle 123 # 45-67"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear clínica y entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
