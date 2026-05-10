'use client';

import { useEffect, useState } from 'react';
import { propertyApi } from '@/lib/api';
import type { Property, PropertyForm } from '@/types';
import Modal from '@/components/Modal';
import { Plus, Pencil, Trash2, Building2, MapPin, Ruler, BedDouble, Bath, Check, X } from 'lucide-react';

const propertyTypes = ['APARTMENT', 'HOUSE', 'LOCAL', 'OFFICE', 'GARAGE', 'OTHER'] as const;
const conditions = ['READY_TO_MOVE', 'NEEDS_RENOVATION', 'UNDER_RENOVATION'] as const;

const labels: Record<string, string> = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', LOCAL: 'Local',
  OFFICE: 'Oficina', GARAGE: 'Garaje', OTHER: 'Otro',
  READY_TO_MOVE: 'Entrar a vivir', NEEDS_RENOVATION: 'Para reformar', UNDER_RENOVATION: 'En reformas',
};

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyForm>({
    name: '', address: '', city: '', propertyType: '',
    areaM2: null, bedrooms: null, bathrooms: null, condition: '',
    hasElevator: null, hasParking: null, description: '',
  });

  const load = () => propertyApi.getAll().then(setItems).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', propertyType: '', areaM2: null, bedrooms: null, bathrooms: null, condition: '', hasElevator: null, hasParking: null, description: '' });
    setModalOpen(true);
  };

  const openEdit = (item: Property) => {
    setEditing(item);
    setForm({
      name: item.name, address: item.address, city: item.city || '',
      propertyType: item.propertyType || '', areaM2: item.areaM2,
      bedrooms: item.bedrooms, bathrooms: item.bathrooms,
      condition: item.condition || '', hasElevator: item.hasElevator,
      hasParking: item.hasParking, description: item.description || '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (editing) await propertyApi.update(editing.id, form);
    else await propertyApi.create(form);
    setModalOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar esta propiedad?')) { await propertyApi.delete(id); load(); }
  };

  if (loading) return <div className="text-gray-500 text-sm text-center py-12">Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Propiedades</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && <div className="col-span-full text-center text-gray-500 py-12">Sin propiedades</div>}
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border p-4 md:p-5 space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base md:text-lg truncate">{item.name}</h3>
                <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={12} className="shrink-0" />{item.address}{item.city ? `, ${item.city}` : ''}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={14} /></button>
                <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {item.propertyType && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Building2 size={11} />{labels[item.propertyType] || item.propertyType}</span>}
              {item.condition && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{labels[item.condition] || item.condition}</span>}
            </div>

            <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
              {item.areaM2 && <span className="flex items-center gap-1"><Ruler size={13} />{item.areaM2} m²</span>}
              {item.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={13} />{item.bedrooms} hab</span>}
              {item.bathrooms != null && <span className="flex items-center gap-1"><Bath size={13} />{item.bathrooms} baños</span>}
            </div>

            <div className="flex gap-3 text-xs">
              {item.hasElevator != null && <span className="flex items-center gap-1">{item.hasElevator ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-red-400" />} Ascensor</span>}
              {item.hasParking != null && <span className="flex items-center gap-1">{item.hasParking ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-red-400" />} Garaje</span>}
            </div>

            {item.description && <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{item.description}</p>}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar propiedad' : 'Nueva propiedad'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Dirección *</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value as PropertyForm['propertyType'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar</option>
                {propertyTypes.map(t => <option key={t} value={t}>{labels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">m²</label>
              <input type="number" value={form.areaM2 ?? ''} onChange={e => setForm({ ...form, areaM2: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as PropertyForm['condition'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar</option>
                {conditions.map(c => <option key={c} value={c}>{labels[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Habitaciones</label>
              <input type="number" value={form.bedrooms ?? ''} onChange={e => setForm({ ...form, bedrooms: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Baños</label>
              <input type="number" value={form.bathrooms ?? ''} onChange={e => setForm({ ...form, bathrooms: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form.hasElevator === true} onChange={e => setForm({ ...form, hasElevator: e.target.checked || (form.hasElevator === false ? null : true) })} />
                Ascensor
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form.hasParking === true} onChange={e => setForm({ ...form, hasParking: e.target.checked || (form.hasParking === false ? null : true) })} />
                Garaje
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
