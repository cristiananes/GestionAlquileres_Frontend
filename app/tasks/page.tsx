'use client';

import { useEffect, useState } from 'react';
import { taskApi, propertyApi } from '@/lib/api';
import type { Task, TaskForm, Property } from '@/types';
import Modal from '@/components/Modal';
import ResponsiveTable from '@/components/ResponsiveTable';
import { Plus, Pencil, Trash2, CheckCircle, Circle, CheckSquare } from 'lucide-react';
import { SkeletonTable } from '@/components/Skeleton';
import { format } from 'date-fns';

const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState<TaskForm>({ propertyId: null, title: '', description: '', completed: false, dueDate: '', priority: 'MEDIUM' });

  const load = async () => {
    const [t, p] = await Promise.all([taskApi.getAll(), propertyApi.getAll()]);
    setItems(t);
    setProperties(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ propertyId: null, title: '', description: '', completed: false, dueDate: '', priority: 'MEDIUM' }); setModalOpen(true); };
  const openEdit = (item: Task) => { setEditing(item); setForm({ propertyId: item.propertyId, title: item.title, description: item.description || '', completed: item.completed, dueDate: item.dueDate || '', priority: item.priority }); setModalOpen(true); };

  const save = async () => {
    if (editing) await taskApi.update(editing.id, form);
    else await taskApi.create(form);
    setModalOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar esta tarea?')) { await taskApi.delete(id); load(); }
  };

  const toggle = async (id: number) => {
    await taskApi.toggle(id);
    load();
  };

  const filtered = filter === 'all' ? items : items.filter(t => filter === 'done' ? t.completed : !t.completed);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <SkeletonTable />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tareas</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-3 py-1.5 text-sm rounded-lg border dark:border-gray-600 transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      <ResponsiveTable
        columns={[
          { key: 'toggle', label: '', render: (item) => (
            <button onClick={() => toggle(item.id)} className="text-blue-600 hover:text-blue-800">
              {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>
          )},
          { key: 'title', label: 'Título', render: (item) => (
            <span className={`font-medium ${item.completed ? 'line-through opacity-60' : ''}`}>{item.title}</span>
          )},
          { key: 'property', label: 'Propiedad', render: (item) => <span className="text-gray-600">{item.propertyName || '-'}</span> },
          { key: 'priority', label: 'Prioridad', render: (item) => (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              item.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
              item.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}>{item.priority}</span>
          )},
          { key: 'dueDate', label: 'Vence', render: (item) => <span className="text-gray-600">{item.dueDate ? format(new Date(item.dueDate), 'dd/MM/yyyy') : '-'}</span> },
          { key: 'actions', label: 'Acción', render: (item) => (
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          )},
        ]}
        data={filtered}
        emptyMessage="Sin tareas"
        mobileCard={(item) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => toggle(item.id)} className="text-blue-600 hover:text-blue-800 shrink-0">
                  {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                <span className={`text-sm font-medium truncate ${item.completed ? 'line-through opacity-60' : ''}`}>{item.title}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                item.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                item.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                'bg-green-50 text-green-700'
              }`}>{item.priority}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{item.propertyName || '-'}</span>
              {item.dueDate && <span>Vence: {format(new Date(item.dueDate), 'dd/MM/yyyy')}</span>}
            </div>
            <div className="flex justify-end gap-1 pt-1 border-t">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
            </div>
          </>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar tarea' : 'Nueva tarea'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Propiedad</label>
            <select value={form.propertyId ?? ''} onChange={e => setForm({ ...form, propertyId: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sin propiedad</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskForm['priority'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
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
