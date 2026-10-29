'use client';

import { useId, useState } from 'react';
import { DateRange, Period, periodRange, invalidRange } from '@/lib/period';

export default function PeriodFilter({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  const id = useId();
  const [period, setPeriod] = useState<Period>('all');
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm" htmlFor={`${id}-period`}>Periodo
          <select id={`${id}-period`} value={period} onChange={e => {
            const next = e.target.value as Period;
            setPeriod(next);
            if (next !== 'custom') onChange(periodRange(next));
          }} className="block border rounded-lg px-3 py-2 mt-1">
            <option value="all">Todo el histórico</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </label>
        {period === 'custom' && <>
          <label className="text-sm" htmlFor={`${id}-from`}>Desde
            <input id={`${id}-from`} type="date" value={value.from} onChange={e => onChange({ ...value, from: e.target.value })} className="block border rounded-lg px-3 py-2 mt-1" />
          </label>
          <label className="text-sm" htmlFor={`${id}-to`}>Hasta
            <input id={`${id}-to`} type="date" value={value.to} min={value.from || undefined} onChange={e => onChange({ ...value, to: e.target.value })} className="block border rounded-lg px-3 py-2 mt-1" />
          </label>
        </>}
      </div>
      {invalidRange(value) && <p role="alert" className="text-sm text-red-600 dark:text-red-400">La fecha de inicio debe ser anterior o igual a la final.</p>}
    </div>
  );
}
