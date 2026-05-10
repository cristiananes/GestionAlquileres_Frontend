'use client';

import { useEffect, useState } from 'react';
import { incomeApi, propertyApi } from '@/lib/api';
import type { Income, IncomeForm, Property } from '@/types';
import Modal from '@/components/Modal';
import ResponsiveTable from '@/components/ResponsiveTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const incomeTypes = ['RENT', 'DEPOSIT', 'LATE_FEE', 'OTHER'] as const;
const paymentMethods = ['CASH', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'OTHER'] as const;

export default function IncomesPage() {
  const [items, setItems] = useState<Income[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState<IncomeForm>({ propertyId: null, amount: 0, description: '', incomeDate: '', incomeType: 'RENT', paymentMethod: 'TRANSFER' });

  const load = async () => {
    const [i, p] = await Promise.all([incomeApi.getAll(), propertyApi.getAll()]);
    setItems(i);
    setProperties(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ propertyId: null, amount: 0, description: '', incomeDate: new Date().toISOString().slice(0, 10), incomeType: 'RENT', paymentMethod: 'TRANSFER' }); setModalOpen(true); };
  const openEdit = (item: Income) => { setEditing(item); setForm({ propertyId: item.propertyId, amount: item.amount, description: item.description, incomeDate: item.incomeDate, incomeType: item.incomeType, paymentMethod: item.paymentMethod }); setModalOpen(true); };

  const save = async () => {
    if (editing) await incomeApi.update(editing.id, form);
    else await incomeApi.create(form);
    setModalOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar este ingreso?')) { await incomeApi.delete(id); load(); }
  };

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingresos</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      <ResponsiveTable
        columns={[
          { key: 'date', label: 'Fecha', render: (item) => format(new Date(item.incomeDate), 'dd/MM/yyyy') },
          { key: 'desc', label: 'Descripción', render: (item) => item.description },
          { key: 'property', label: 'Propiedad', render: (item) => <span className="text-gray-600">{item.propertyName || '-'}</span> },
          { key: 'type', label: 'Tipo', render: (item) => <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{item.incomeType}</span> },
          { key: 'method', label: 'Método', render: (item) => <span className="text-gray-600">{item.paymentMethod || '-'}</span> },
          { key: 'amount', label: 'Monto', render: (item) => <span className="font-medium text-green-600">${item.amount.toLocaleString()}</span> },
          { key: 'actions', label: 'Acción', render: (item) => (
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          )},
        ]}
        data={items}
        emptyMessage="Sin ingresos"
        mobileCard={(item) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{item.description}</span>
              <span className="font-medium text-green-600 shrink-0">${item.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <span>{format(new Date(item.incomeDate), 'dd/MM/yyyy')}</span>
              <span>{item.propertyName || '-'}</span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{item.incomeType}</span>
            </div>
            <div className="flex justify-end gap-1 pt-1 border-t">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          </>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar ingreso' : 'Nuevo ingreso'}>
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
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" value={form.incomeDate} onChange={e => setForm({ ...form, incomeDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={form.incomeType} onChange={e => setForm({ ...form, incomeType: e.target.value as IncomeForm['incomeType'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {incomeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Método de pago</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as IncomeForm['paymentMethod'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
