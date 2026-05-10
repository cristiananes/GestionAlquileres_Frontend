'use client';

import { useEffect, useState } from 'react';
import { taskApi, propertyApi } from '@/lib/api';
import type { Task, TaskForm, Property } from '@/types';
import Modal from '@/components/Modal';
import { Plus, Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';
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

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tareas</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 w-10"></th>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Propiedad</th>
              <th className="p-3 font-medium">Prioridad</th>
              <th className="p-3 font-medium">Vence</th>
              <th className="p-3 font-medium w-24">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">Sin tareas</td></tr>}
            {filtered.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${item.completed ? 'opacity-60' : ''}`}>
                <td className="p-3">
                  <button onClick={() => toggle(item.id)} className="text-blue-600 hover:text-blue-800">
                    {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                </td>
                <td className={`p-3 font-medium ${item.completed ? 'line-through' : ''}`}>{item.title}</td>
                <td className="p-3 text-gray-600">{item.propertyName || '-'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                    item.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }`}>{item.priority}</span>
                </td>
                <td className="p-3 text-gray-600">{item.dueDate ? format(new Date(item.dueDate), 'dd/MM/yyyy') : '-'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
