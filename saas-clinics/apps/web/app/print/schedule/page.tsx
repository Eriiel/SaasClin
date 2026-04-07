'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  date: string;
  status: string;
  notes?: string;
  patient: { name: string; phone: string };
  service: { name: string; duration: number };
}

interface Specialist {
  name: string;
  specialty: string;
}

export default function PrintSchedulePage() {
  const params = useSearchParams();
  const specialistId = params.get('specialistId');
  const date = params.get('date');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [clinic, setClinic] = useState<{ name: string } | null>(null);
  const printed = useRef(false);

  useEffect(() => {
    if (!specialistId || !date) return;
    Promise.all([
      api.get('/appointments', { specialistId, date }),
      api.get(`/specialists/${specialistId}`),
      api.get('/clinics/me'),
    ]).then(([appts, spec, cl]) => {
      setAppointments(appts.filter((a: Appointment) => a.status !== 'CANCELLED'));
      setSpecialist(spec);
      setClinic(cl);
    });
  }, [specialistId, date]);

  useEffect(() => {
    if (appointments.length > 0 && specialist && !printed.current) {
      printed.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [appointments, specialist]);

  if (!specialist || !date) return <p className="p-8 text-slate-500">Cargando...</p>;

  const formattedDate = format(new Date(date + 'T12:00:00'), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className="print-page">
      <style>{`
        @media print {
          body { margin: 0; font-family: sans-serif; }
          .no-print { display: none !important; }
        }
        .print-page { max-width: 700px; margin: 0 auto; padding: 40px 32px; font-family: sans-serif; }
        h1 { font-size: 20px; font-weight: 700; margin: 0; }
        h2 { font-size: 14px; font-weight: 500; color: #64748b; margin: 4px 0 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
        th { text-align: left; padding: 8px 12px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: top; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .print-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {clinic?.name ?? 'Clínica'}
          </p>
          <h1>{specialist.name}</h1>
          <h2>{specialist.specialty}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'capitalize' }}>{formattedDate}</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {appointments.length} cita{appointments.length !== 1 ? 's' : ''} programada{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <p style={{ marginTop: '32px', color: '#94a3b8', fontSize: '14px' }}>Sin citas confirmadas o pendientes para este día.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Teléfono</th>
              <th>Servicio</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{format(new Date(a.date), 'HH:mm')}</td>
                <td>{a.patient.name}</td>
                <td style={{ color: '#64748b' }}>{a.patient.phone}</td>
                <td>{a.service.name}</td>
                <td style={{ color: '#64748b' }}>{a.service.duration} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="footer">
        Generado por SaaS Clínicas · {format(new Date(), "dd/MM/yyyy HH:mm")}
      </div>

      <button className="print-btn no-print" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
