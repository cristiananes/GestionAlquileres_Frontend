'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import type { DashboardSummary } from '@/types';
import { DollarSign, TrendingDown, Wallet, Building2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getSummary()
      .then(setData)
      .catch(() => setError('Error al cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Cargando...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;
  if (!data) return null;

  const cards = [
    { label: 'Ingresos totales', value: `$${data.totalIncomes.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Gastos totales', value: `$${data.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Balance', value: `$${data.balance.toLocaleString()}`, icon: Wallet, color: data.balance >= 0 ? 'text-blue-600' : 'text-red-600', bg: 'bg-blue-50' },
    { label: 'Propiedades', value: data.totalProperties.toString(), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} rounded-xl p-3 md:p-5 border`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 truncate">{card.label}</p>
                  <p className={`text-base md:text-2xl font-bold mt-0.5 md:mt-1 truncate ${card.color}`}>{card.value}</p>
                </div>
                <Icon size={24} className={`${card.color} shrink-0 hidden md:block`} />
                <Icon size={18} className={`${card.color} shrink-0 md:hidden`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Clock size={18} className="text-orange-500 shrink-0" />
            <h2 className="font-semibold text-sm md:text-base">Tareas pendientes</h2>
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {data.pendingTasks}
            </span>
          </div>
          {data.pendingTasks === 0 && <p className="text-gray-500 text-sm">No hay tareas pendientes</p>}
        </div>

        <div className="bg-white rounded-xl border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <AlertCircle size={18} className="text-blue-500 shrink-0" />
            <h2 className="font-semibold text-sm md:text-base">Próximos eventos</h2>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay eventos próximos</p>
          ) : (
            <ul className="space-y-2">
              {data.upcomingEvents.slice(0, 5).map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 text-xs md:text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                  <span className="flex-1 truncate">{ev.title}</span>
                  <span className="text-gray-500 text-xs shrink-0">
                    {format(new Date(ev.startDateTime), 'dd MMM HH:mm', { locale: es })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
