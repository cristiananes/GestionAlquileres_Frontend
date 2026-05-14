'use client';

import { useEffect, useState } from 'react';
import { expenseApi, propertyApi } from '@/lib/api';
import type { Expense, ExpenseForm, Property } from '@/types';
import Modal from '@/components/Modal';
import ResponsiveTable from '@/components/ResponsiveTable';
import { Plus, Pencil, Trash2, TrendingDown, FileDown } from 'lucide-react';
import { SkeletonTable } from '@/components/Skeleton';
import { format } from 'date-fns';
import { reportApi } from '@/lib/api';

const categories = ['REPAIR', 'MAINTENANCE', 'TAXES', 'UTILITIES', 'INSURANCE', 'CLEANING', 'COMMISSION', 'LEGAL', 'ADMINISTRATION', 'OTHER'] as const;

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>({ propertyId: null, amount: null, description: '', expenseDate: '', category: 'MAINTENANCE' });
  const [showPdfPicker, setShowPdfPicker] = useState(false);
  const [pdfFrom, setPdfFrom] = useState('');
  const [pdfTo, setPdfTo] = useState('');

  const load = async () => {
    const [e, p] = await Promise.all([expenseApi.getAll(), propertyApi.getAll()]);
    setItems(e);
    setProperties(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ propertyId: null, amount: null, description: '', expenseDate: new Date().toISOString().slice(0, 10), category: 'MAINTENANCE' }); setModalOpen(true); };
  const openEdit = (item: Expense) => { setEditing(item); setForm({ propertyId: item.propertyId, amount: item.amount, description: item.description, expenseDate: item.expenseDate, category: item.category }); setModalOpen(true); };

  const save = async () => {
    if (form.amount === null) return alert('El monto es obligatorio');
    const data = { ...form, amount: form.amount as number };
    if (editing) await expenseApi.update(editing.id, data);
    else await expenseApi.create(data);
    setModalOpen(false);
    load();
  };

  const downloadPDF = async () => {
    try {
      const blob = await reportApi.downloadExpenses(pdfFrom || undefined, pdfTo || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gastos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      setShowPdfPicker(false);
    } catch {
      alert('Error al descargar el reporte');
    }
  };

  const togglePdfPicker = () => {
    setShowPdfPicker(!showPdfPicker);
    if (!showPdfPicker) {
      setPdfFrom('');
      setPdfTo('');
    }
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar este gasto?')) { await expenseApi.delete(id); load(); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <SkeletonTable />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="flex items-center gap-2">
          <button onClick={togglePdfPicker} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shrink-0">
            <FileDown size={16} /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
            <Plus size={16} /> <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {showPdfPicker && (
        <div className="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium mb-1">Desde</label>
            <input type="date" value={pdfFrom} onChange={e => setPdfFrom(e.target.value)} className="border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Hasta</label>
            <input type="date" value={pdfTo} onChange={e => setPdfTo(e.target.value)} className="border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
          </div>
          <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Descargar</button>
        </div>
      )}

      <ResponsiveTable
        columns={[
          { key: 'date', label: 'Fecha', render: (item) => format(new Date(item.expenseDate), 'dd/MM/yyyy') },
          { key: 'desc', label: 'Descripción', render: (item) => item.description },
          { key: 'property', label: 'Propiedad', render: (item) => <span className="text-gray-600">{item.propertyName || '-'}</span> },
          { key: 'category', label: 'Categoría', render: (item) => <span className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">{item.category}</span> },
          { key: 'amount', label: 'Monto', render: (item) => <span className="font-medium text-red-600">${item.amount.toLocaleString()}</span> },
          { key: 'actions', label: 'Acción', render: (item) => (
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          )},
        ]}
        data={items}
        emptyMessage="Sin gastos"
        mobileCard={(item) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{item.description}</span>
              <span className="font-medium text-red-600 shrink-0">${item.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <span>{format(new Date(item.expenseDate), 'dd/MM/yyyy')}</span>
              <span>{item.propertyName || '-'}</span>
              <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded-full">{item.category}</span>
            </div>
            <div className="flex justify-end gap-1 pt-1 border-t">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          </>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar gasto' : 'Nuevo gasto'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Propiedad</label>
            <select value={form.propertyId ?? ''} onChange={e => setForm({ ...form, propertyId: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sin propiedad</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input type="number" value={form.amount ?? ''} onChange={e => setForm({ ...form, amount: e.target.value === '' ? null : Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExpenseForm['category'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
