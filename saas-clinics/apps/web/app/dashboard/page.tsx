'use client';

import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CalendarDays, Users, Stethoscope, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    cancelledThisMonth: 0,
    totalPatients: 0,
    totalSpecialists: 0,
  });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');

    Promise.all([
      api.get('/appointments', { params: { date: today } }),
      api.get('/patients'),
      api.get('/specialists'),
    ]).then(([appts, patients, specialists]) => {
      const todayList = appts.data;
      const cancelled = todayList.filter((a: any) => a.status === 'CANCELLED').length;

      setTodayAppts(todayList);
      setStats({
        todayAppointments: todayList.length,
        cancelledThisMonth: cancelled,
        totalPatients: patients.data.length,
        totalSpecialists: specialists.data.length,
      });
    });
  }, []);

  const cards = [
    { label: 'Citas hoy', value: stats.todayAppointments, icon: CalendarDays, color: 'text-brand-600' },
    { label: 'Canceladas hoy', value: stats.cancelledThisMonth, icon: TrendingUp, color: 'text-red-500' },
    { label: 'Pacientes', value: stats.totalPatients, icon: Users, color: 'text-emerald-600' },
    { label: 'Especialistas', value: stats.totalSpecialists, icon: Stethoscope, color: 'text-violet-600' },
  ];

  return (`
    <div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">
        {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
      </h2>
      <p className="text-slate-500 text-sm mb-8">Resumen del día</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-medium text-slate-900">Citas de hoy</h3>
        </div>
        {todayAppts.length === 0 ? (
          <p className="px-6 py-8 text-slate-500 text-sm text-center">No hay citas programadas para hoy.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppts.map((appt) => (
              <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{appt.patient.name}</p>
                  <p className="text-sm text-slate-500">
                    {appt.specialist.name} · {appt.service.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {format(new Date(appt.date), 'HH:mm')}
                  </p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>`
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    CANCELLED: 'bg-red-50 text-red-600',
  };
  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmada',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelada',
  };
  return (`
    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}'}>
      {labels[status]}
    </span>`
  );
}
