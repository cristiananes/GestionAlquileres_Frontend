'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import PeriodFilter from '@/components/PeriodFilter';
import { DateRange, invalidRange } from '@/lib/period';
import { formatCurrency } from '@/lib/presentation';
import type { DashboardSummary } from '@/types';
import { Euro, TrendingDown, Wallet, Building2, Clock, AlertCircle, Inbox } from 'lucide-react';
import { SkeletonDashboardCards, SkeletonChart } from '@/components/Skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<DateRange>({ from: '', to: '' });

  useEffect(() => {
    if (invalidRange(range)) return;
    let active = true;
    dashboardApi.getSummary({ from: range.from || undefined, to: range.to || undefined })
      .then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError('Error al cargar el resumen. Vuelve a seleccionar un periodo para reintentar.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range]);

  if (loading && !data) return (
    <div className="space-y-4 md:space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <SkeletonDashboardCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
  if (!data) return <div role="alert" className="text-red-600 dark:text-red-400">{error} <button onClick={() => { setError(''); setLoading(true); setRange({ ...range }); }} className="underline">Reintentar</button></div>;

  const cards = [
    { label: 'Ingresos totales', value: formatCurrency(data.totalIncomes), icon: Euro, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Gastos totales', value: formatCurrency(data.totalExpenses), icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Balance', value: formatCurrency(data.balance), icon: Wallet, color: data.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Propiedades', value: data.totalProperties.toString(), icon: Building2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const maxAmount = Math.max(data.totalIncomes, data.totalExpenses, 1);
  const profitMargin = data.totalIncomes > 0 ? ((data.balance / data.totalIncomes) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Resumen</h1>
      <PeriodFilter value={range} onChange={next => { setRange(next); setLoading(true); setError(''); }} />
      <p className="text-sm text-gray-600 dark:text-gray-300">Los importes corresponden al periodo seleccionado. Propiedades, tareas y próximos eventos muestran el estado general.</p>
      {loading && !invalidRange(range) && <p role="status" className="text-sm">Actualizando resumen…</p>}
      {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
      <div hidden={loading || Boolean(error) || invalidRange(range)} className="space-y-4 md:space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} rounded-xl p-3 md:p-5 border dark:border-gray-700 card-hover`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">{card.label}</p>
                  <p className={`text-base md:text-2xl font-bold mt-0.5 md:mt-1 truncate ${card.color}`}>{card.value}</p>
                </div>
                <Icon size={24} className={`${card.color} shrink-0 hidden md:block`} />
                <Icon size={18} className={`${card.color} shrink-0 md:hidden`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico Ingresos vs Gastos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-5 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm md:text-base">Ingresos vs Gastos</h2>
          <span className={`text-xs font-medium ${data.balance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            Balance / ingresos: {profitMargin}%
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs md:text-sm mb-1">
              <span className="text-green-700 dark:text-green-400 font-medium">Ingresos</span>
              <span className="text-gray-600 dark:text-gray-300">{formatCurrency(data.totalIncomes)}</span>
            </div>
            <div className="h-5 md:h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(data.totalIncomes / maxAmount) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs md:text-sm mb-1">
              <span className="text-red-600 dark:text-red-400 font-medium">Gastos</span>
              <span className="text-gray-600 dark:text-gray-300">{formatCurrency(data.totalExpenses)}</span>
            </div>
            <div className="h-5 md:h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${(data.totalExpenses / maxAmount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-5 card-hover">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Clock size={18} className="text-orange-500 shrink-0" />
            <h2 className="font-semibold text-sm md:text-base">Tareas pendientes</h2>
            <span className="ml-auto bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {data.pendingTasks}
            </span>
          </div>
          {data.pendingTasks === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No hay tareas pendientes</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.pendingTasks} tarea{data.pendingTasks !== 1 ? 's' : ''} por completar</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-5 card-hover">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <AlertCircle size={18} className="text-blue-500 shrink-0" />
            <h2 className="font-semibold text-sm md:text-base">Próximos eventos</h2>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No hay eventos próximos</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.upcomingEvents.slice(0, 5).map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 text-xs md:text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                  <div className="flex-1 min-w-0"><p className="truncate">{ev.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ev.propertyName || 'Sin propiedad'}{ev.propertyId ? ` (#${ev.propertyId})` : ''}</p></div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs shrink-0">
                    {format(new Date(ev.startDateTime), ev.allDay ? 'dd MMM yyyy' : 'dd MMM yyyy HH:mm', { locale: es })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
