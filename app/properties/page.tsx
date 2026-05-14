'use client';

import { useEffect, useState, useRef } from 'react';
import { propertyApi } from '@/lib/api';
import type { Property, PropertyForm } from '@/types';
import Modal from '@/components/Modal';
import { Plus, Pencil, Trash2, Building2, MapPin, Ruler, BedDouble, Bath, Check, X, Home, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonCard } from '@/components/Skeleton';

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
    hasElevator: null, hasParking: null, description: '', imageUrl: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => propertyApi.getAll().then(setItems).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', propertyType: '', areaM2: null, bedrooms: null, bathrooms: null, condition: '', hasElevator: null, hasParking: null, description: '', imageUrl: '' });
    setSelectedFiles([]);
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
      imageUrl: item.imageUrl || '',
    });
    setSelectedFiles([]);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageUrl: string) => {
    if (!editing) return;
    const imgIndex = editing.images?.indexOf(imageUrl) ?? -1;
    if (imgIndex === -1) return;
    const imageId = imgIndex + 1;
    try {
      const updated = await propertyApi.deleteImage(editing.id, imageId);
      setEditing(updated);
      setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch {
      alert('Error al eliminar la imagen');
    }
  };

  const save = async () => {
    setUploading(true);
    try {
      let property: Property;
      if (editing) {
        property = await propertyApi.update(editing.id, form);
      } else {
        property = await propertyApi.create(form);
      }
      for (const file of selectedFiles) {
        property = await propertyApi.uploadImage(property.id, file);
      }
      setModalOpen(false);
      load();
    } catch {
      alert('Error al guardar la propiedad');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar esta propiedad?')) { await propertyApi.delete(id); load(); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  const allImages = (property: Property) => {
    const imgs = property.images?.length ? property.images : (property.imageUrl ? [property.imageUrl] : []);
    return imgs;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Propiedades</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
            <Home size={48} className="mb-3" />
            <p className="text-sm">Sin propiedades</p>
          </div>
        )}
        {items.map((item) => {
          const imgs = allImages(item);
          return (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden card-hover">
            <div className="relative">
              {imgs[0] ? (
                <img src={imgs[0]} alt={item.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  <Building2 size={32} />
                </div>
              )}
              {imgs.length > 1 && (
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgs.length} fotos
                </span>
              )}
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base md:text-lg truncate">{item.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={12} className="shrink-0" />{item.address}{item.city ? `, ${item.city}` : ''}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {item.propertyType && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Building2 size={11} />{labels[item.propertyType] || item.propertyType}</span>}
                {item.condition && <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full">{labels[item.condition] || item.condition}</span>}
              </div>

              <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 flex-wrap">
                {item.areaM2 && <span className="flex items-center gap-1"><Ruler size={13} />{item.areaM2} m²</span>}
                {item.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={13} />{item.bedrooms} hab</span>}
                {item.bathrooms != null && <span className="flex items-center gap-1"><Bath size={13} />{item.bathrooms} baños</span>}
              </div>

              <div className="flex gap-3 text-xs">
                {item.hasElevator != null && <span className="flex items-center gap-1">{item.hasElevator ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-red-400" />} Ascensor</span>}
                {item.hasParking != null && <span className="flex items-center gap-1">{item.hasParking ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-red-400" />} Garaje</span>}
              </div>

              {item.description && <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>}
            </div>
          </div>
          );
        })}
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
              <label className="flex items-center gap-2 text-sm border dark:border-gray-600 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input type="checkbox" checked={form.hasElevator === true} onChange={e => setForm({ ...form, hasElevator: e.target.checked || (form.hasElevator === false ? null : true) })} />
                Ascensor
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm border dark:border-gray-600 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input type="checkbox" checked={form.hasParking === true} onChange={e => setForm({ ...form, hasParking: e.target.checked || (form.hasParking === false ? null : true) })} />
                Garaje
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Imágenes</label>
              {editing && editing.images && editing.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {editing.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-20 object-cover rounded-lg border dark:border-gray-600" />
                      <button onClick={() => deleteExistingImage(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ImageIcon size={16} /> {selectedFiles.length > 0 ? 'Añadir más' : 'Seleccionar imágenes'}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                      <span className="truncate max-w-[200px]">{f.name}</span>
                      <button onClick={() => removeSelectedFile(i)} className="text-red-500 hover:text-red-700 shrink-0 ml-2">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
            <button onClick={save} disabled={uploading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
