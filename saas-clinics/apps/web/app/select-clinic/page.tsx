'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClinicOption {
  id: string;
  name: string;
  role: string;
}

export default function SelectClinicPage() {
  const router = useRouter();
  const [data, setData] = useState<{ clinics: ClinicOption[]; userId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('clinic_selection');
    if (!raw) { router.push('/login'); return; }
    setData(JSON.parse(raw));
  }, [router]);

  async function selectClinic(clinicId: string) {
    if (!data) return;
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/select-clinic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.userId, clinicId }),
    });

    const result = await res.json();
    sessionStorage.removeItem('clinic_selection');
    localStorage.setItem('token', result.access_token);
    router.push('/dashboard');
  }

  if (!data) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Seleccionar clínica</h1>
        <p className="text-slate-500 text-sm mb-6">Perteneces a múltiples clínicas. Elige con cuál operar.</p>

        <div className="space-y-2">
          {data.clinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => selectClinic(clinic.id)}
              disabled={loading}
              className="w-full text-left border border-slate-200 rounded-lg px-4 py-3 hover:border-brand-500 hover:bg-brand-50 transition disabled:opacity-60"
            >
              <p className="font-medium text-slate-900">{clinic.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{clinic.role}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
