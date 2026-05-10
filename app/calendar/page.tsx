'use client';

import { useEffect, useState } from 'react';
import { calendarEventApi, propertyApi } from '@/lib/api';
import type { CalendarEvent, CalendarEventForm, Property } from '@/types';
import Modal from '@/components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const eventTypes = ['VIEWING', 'PAYMENT_DUE', 'MAINTENANCE', 'INSPECTION', 'CONTRACT_END', 'REMINDER', 'OTHER'] as const;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [form, setForm] = useState<CalendarEventForm>({ propertyId: null, title: '', description: '', startDateTime: '', endDateTime: '', eventType: 'REMINDER', color: '#3b82f6', allDay: false });

  const load = async () => {
    const from = startOfWeek(startOfMonth(currentMonth));
    const to = endOfWeek(endOfMonth(currentMonth));
    const [e, p] = await Promise.all([
      calendarEventApi.getAll({ from: from.toISOString(), to: to.toISOString() }),
      propertyApi.getAll()
    ]);
    setEvents(e);
    setProperties(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentMonth]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const openCreate = (date?: Date) => {
    const d = date || new Date();
    setEditing(null);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
    setForm({ propertyId: null, title: '', description: '', startDateTime: format(d, "yyyy-MM-dd'T'09:00"), endDateTime: format(d, "yyyy-MM-dd'T'10:00"), eventType: 'REMINDER', color: '#3b82f6', allDay: false });
    setModalOpen(true);
  };

  const openEdit = (item: CalendarEvent) => {
    setEditing(item);
    setForm({ propertyId: item.propertyId, title: item.title, description: item.description || '', startDateTime: item.startDateTime, endDateTime: item.endDateTime, eventType: item.eventType, color: item.color || '#3b82f6', allDay: item.allDay });
    setModalOpen(true);
  };

  const save = async () => {
    if (editing) await calendarEventApi.update(editing.id, form);
    else await calendarEventApi.create(form);
    setModalOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar este evento?')) { await calendarEventApi.delete(id); load(); }
  };

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.startDateTime), day));

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <button onClick={() => openCreate()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Nuevo evento
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">&larr; Anterior</button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Siguiente &rarr;</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 text-center text-sm font-medium">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => <div key={d} className="p-2 border-b">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => openCreate(day)}
                className={`min-h-[100px] p-1.5 border-b border-r text-sm cursor-pointer transition-colors hover:bg-blue-50 ${
                  !isSameMonth(day, currentMonth) ? 'text-gray-300' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 text-xs rounded-full ${
                  isToday(day) ? 'bg-blue-600 text-white font-bold' : ''
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); openEdit(ev); }}
                      className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium"
                      style={{ backgroundColor: ev.color || '#3b82f6' }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 3} más</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar evento' : 'Nuevo evento'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
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
              <label className="block text-sm font-medium mb-1">Inicio</label>
              <input type="datetime-local" value={form.startDateTime.slice(0, 16)} onChange={e => setForm({ ...form, startDateTime: e.target.value + ':00' })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fin</label>
              <input type="datetime-local" value={form.endDateTime.slice(0, 16)} onChange={e => setForm({ ...form, endDateTime: e.target.value + ':00' })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value as CalendarEventForm['eventType'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-9 border rounded-lg" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="rounded" />
            Todo el día
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
