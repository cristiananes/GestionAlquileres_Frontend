'use client';

import Link from 'next/link';
import { useSaveAction } from '@/hooks/useSaveAction';
import { Notice } from '@/components/Fields';

import { useEffect, useState } from 'react';
import { formatCurrency, incomeLabels, paymentLabels, propertyLabel, todayLocal } from '@/lib/presentation';
import { incomeApi, propertyApi } from '@/lib/api';
import type { Income, IncomeForm, Property } from '@/types';
import Modal from '@/components/Modal';
import PeriodFilter from '@/components/PeriodFilter';
import { DateRange, inDateRange, invalidRange } from '@/lib/period';
import ResponsiveTable from '@/components/ResponsiveTable';
import { Plus, Pencil, Trash2, FileDown } from 'lucide-react';
import { SkeletonTable } from '@/components/Skeleton';
import { format } from 'date-fns';
import { reportApi } from '@/lib/api';

const incomeTypes = ['RENT', 'DEPOSIT', 'LATE_FEE', 'OTHER'] as const;
const paymentMethods = ['CASH', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'OTHER'] as const;

export default function IncomesPage() {
  const [items, setItems] = useState<Income[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState<IncomeForm>({ propertyId: null, amount: null, description: '', incomeDate: '', incomeType: 'RENT', paymentMethod: 'TRANSFER' });
  const [range, setRange] = useState<DateRange>({ from: '', to: '' });
  const [propertyFilter, setPropertyFilter] = useState('');
  const filtered = invalidRange(range) ? [] : items.filter(item => inDateRange(item.incomeDate, range) && (!propertyFilter || item.propertyId === Number(propertyFilter)));

  const [loadError, setLoadError] = useState('');
  const load = () => Promise.all([incomeApi.getAll(), propertyApi.getAll()])
    .then(([records, properties]) => { setItems(records); setProperties(properties); setLoadError(''); })
    .catch(() => setLoadError('No se pudieron cargar los datos. Inténtalo de nuevo.'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { saveAction.reset(); setEditing(null); setForm({ propertyId: null, amount: null, description: '', incomeDate: todayLocal(), incomeType: 'RENT', paymentMethod: 'TRANSFER' }); setModalOpen(true); };
  const openEdit = (item: Income) => { saveAction.reset(); setEditing(item); setForm({ propertyId: item.propertyId, amount: item.amount, description: item.description, incomeDate: item.incomeDate, incomeType: item.incomeType, paymentMethod: item.paymentMethod }); setModalOpen(true); };

  const saveAction = useSaveAction();
  const save = () => saveAction.run(async () => {
    if (form.amount === null) return alert('El importe es obligatorio');
    const data = { ...form, clientRequestId: saveAction.requestId(), amount: form.amount as number };
    if (editing) await incomeApi.update(editing.id, data);
    else await incomeApi.create(data);
    setModalOpen(false);
    load();
  });

  const downloadPDF = () => saveAction.run(async () => {
    if (invalidRange(range)) throw new Error('Fechas invertidas');
    const blob = await reportApi.downloadIncomes(range.from || undefined, range.to || undefined, propertyFilter ? Number(propertyFilter) : undefined);
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'ingresos.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  });

  const remove = (id: number) => saveAction.run(async () => {
    if (confirm('¿Archivar este ingreso?')) { await incomeApi.delete(id); load(); }
  });

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <SkeletonTable />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ingresos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button aria-label="Exportar PDF" disabled={saveAction.saving || invalidRange(range)} onClick={downloadPDF} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shrink-0">
            <FileDown size={16} /> <span className="hidden sm:inline">PDF</span>
          </button>
          <Link href="/recurrences" className="text-sm border dark:border-gray-600 rounded-lg px-3 py-2">Recurrente</Link>
          <button aria-label="Nuevo registro" onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
            <Plus size={16} /> <span className="hidden sm:inline">Puntual</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <PeriodFilter value={range} onChange={setRange} />
        <label className="text-sm min-w-0 max-w-full">Propiedad
          <select aria-label="Filtrar por propiedad" value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="block border rounded-lg px-3 py-2 mt-1 max-w-full">
            <option value="">Todas las propiedades</option>
            {properties.map(p => <option key={p.id} value={p.id}>{propertyLabel(p)}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} · Total: {formatCurrency(filtered.reduce((sum, item) => sum + item.amount, 0))}</p>

      {saveAction.error && <Notice>{saveAction.error}</Notice>}
      {loadError && <div role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError} <button onClick={load} className="underline">Reintentar</button></div>}
      <ResponsiveTable
        columns={[
          { key: 'date', label: 'Fecha', render: (item) => format(new Date(item.incomeDate), 'dd/MM/yyyy') },
          { key: 'desc', label: 'Descripción', render: (item) => <span>{item.description}<span className="block text-xs text-gray-500 dark:text-gray-400">{item.occurrenceId ? 'Recurrente confirmado' : 'Puntual'}</span></span> },
          { key: 'property', label: 'Propiedad', render: (item) => <span className="text-gray-600 dark:text-gray-300">{item.propertyName || '-'}</span> },
          { key: 'type', label: 'Tipo', render: (item) => <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{incomeLabels[item.incomeType]}</span> },
          { key: 'method', label: 'Método', render: (item) => <span className="text-gray-600 dark:text-gray-300">{paymentLabels[item.paymentMethod] || '-'}</span> },
          { key: 'amount', label: 'Importe', render: (item) => <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(item.amount)}</span> },
          { key: 'actions', label: 'Acción', render: (item) => (
            <div className="flex gap-1">
              <button disabled={!!item.occurrenceId} title={item.occurrenceId ? "Pago de una recurrencia: archiva para corregirlo" : "Editar"} aria-label="Editar" onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil size={15} /></button>
              <button aria-label="Archivar" title="Archivar" onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          )},
        ]}
        data={filtered}
        emptyMessage="Sin ingresos para los filtros seleccionados"
        mobileCard={(item) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{item.description}</span>
              <span className="font-medium text-green-700 dark:text-green-400 shrink-0">{formatCurrency(item.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span>{format(new Date(item.incomeDate), 'dd/MM/yyyy')}</span>
              <span>{item.propertyName || '-'}</span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{incomeLabels[item.incomeType]}</span>
            </div>
            <div className="flex justify-end gap-1 pt-1 border-t">
              <button disabled={!!item.occurrenceId} title={item.occurrenceId ? "Pago de una recurrencia: archiva para corregirlo" : "Editar"} aria-label="Editar" onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil size={15} /></button>
              <button aria-label="Archivar" title="Archivar" onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          </>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <form aria-busy={saveAction.saving} onSubmit={e => { e.preventDefault(); void save(); }} className="space-y-4">
          <div>
            <label htmlFor="incomes-field-3" className="block text-sm font-medium mb-1">Propiedad</label>
            <select id="incomes-field-3" value={form.propertyId ?? ''} onChange={e => setForm({ ...form, propertyId: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sin propiedad</option>
              {properties.map(p => <option key={p.id} value={p.id}>{propertyLabel(p)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="incomes-field-4" className="block text-sm font-medium mb-1">Importe</label>
            <input id="incomes-field-4" type="number" step="0.01" min="0.01" value={form.amount ?? ''} onChange={e => setForm({ ...form, amount: e.target.value === '' ? null : Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label htmlFor="incomes-field-5" className="block text-sm font-medium mb-1">Descripción</label>
            <input id="incomes-field-5" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label htmlFor="incomes-field-6" className="block text-sm font-medium mb-1">Fecha</label>
            <input id="incomes-field-6" type="date" max={todayLocal()} value={form.incomeDate} onChange={e => setForm({ ...form, incomeDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="incomes-field-7" className="block text-sm font-medium mb-1">Tipo</label>
              <select id="incomes-field-7" value={form.incomeType} onChange={e => setForm({ ...form, incomeType: e.target.value as IncomeForm['incomeType'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {incomeTypes.map(t => <option key={t} value={t}>{incomeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="incomes-field-8" className="block text-sm font-medium mb-1">Método de pago</label>
              <select id="incomes-field-8" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as IncomeForm['paymentMethod'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {paymentMethods.map(m => <option key={m} value={m}>{paymentLabels[m]}</option>)}
              </select>
            </div>
          </div>
          {saveAction.error && <Notice>{saveAction.error}</Notice>}
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <button type="button" disabled={saveAction.saving} onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={saveAction.saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{saveAction.saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
