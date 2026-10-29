'use client';

import { useSaveAction } from '@/hooks/useSaveAction';
import { Notice } from '@/components/Fields';

import { useCallback, useEffect, useState } from 'react';
import { eventLabels, propertyLabel } from '@/lib/presentation';
import { calendarEventApi, propertyApi } from '@/lib/api';
import type { CalendarEvent, CalendarEventForm, Property } from '@/types';
import Modal from '@/components/Modal';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const eventTypes = ['VIEWING', 'PAYMENT_DUE', 'MAINTENANCE', 'INSPECTION', 'CONTRACT_END', 'REMINDER', 'OTHER'] as const;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<CalendarEventForm>({ propertyId: null, title: '', description: '', startDateTime: '', endDateTime: '', eventType: 'REMINDER', color: '#3b82f6', allDay: false });

  const [loadError, setLoadError] = useState('');
  const load = useCallback(() => {
    const from = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return Promise.all([
      calendarEventApi.getAll({ from: format(from, "yyyy-MM-dd'T'HH:mm:ss"), to: format(to, "yyyy-MM-dd'T'HH:mm:ss") }),
      propertyApi.getAll()
    ]).then(([e, p]) => { setEvents(e); setProperties(p); setLoadError(''); })
      .catch(() => setLoadError('No se pudo cargar el calendario.'))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  useEffect(() => { load(); }, [load]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const openCreate = (date?: Date) => {
    const d = date || new Date();
    saveAction.reset(); setEditing(null);
    setForm({ propertyId: null, title: '', description: '', startDateTime: format(d, "yyyy-MM-dd'T'09:00"), endDateTime: format(d, "yyyy-MM-dd'T'10:00"), eventType: 'REMINDER', color: '#3b82f6', allDay: false });
    setModalOpen(true);
  };

  const openEdit = (item: CalendarEvent) => {
    saveAction.reset(); setEditing(item);
    setForm({ propertyId: item.propertyId, title: item.title, description: item.description || '', startDateTime: item.startDateTime, endDateTime: item.endDateTime, eventType: item.eventType, color: item.color || '#3b82f6', allDay: item.allDay });
    setModalOpen(true);
  };

  const saveAction = useSaveAction();
  const save = () => saveAction.run(async () => {
    if (editing) await calendarEventApi.update(editing.id, form);
    else {
      const duplicate = events.some(event => event.title.trim() === form.title.trim() && event.propertyId === form.propertyId && event.startDateTime.slice(0,16) === form.startDateTime.slice(0,16));
      if (duplicate && !confirm("Ya existe un evento con el mismo título, propiedad y fecha. ¿Crear otro de todos modos?")) return;
      await calendarEventApi.create({ ...form, clientRequestId: saveAction.requestId() });
    }
    setModalOpen(false);
    load();
  });

  const remove = (id: number) => saveAction.run(async () => {
    if (confirm('¿Archivar este evento?')) { await calendarEventApi.delete(id); load(); }
  });

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.startDateTime), day));

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    if (window.innerWidth >= 768) openCreate(day);
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse-skeleton" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse-skeleton" />
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 animate-pulse-skeleton">
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {saveAction.error && <Notice>{saveAction.error}</Notice>}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <button aria-label="Nuevo evento" onClick={() => openCreate()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo evento</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-2 md:px-3 py-1.5 text-xs md:text-sm border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0">&larr; <span className="hidden sm:inline">Anterior</span></button>
        <h2 className="text-sm md:text-lg font-semibold text-center truncate">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-2 md:px-3 py-1.5 text-xs md:text-sm border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0"><span className="hidden sm:inline">Siguiente</span> &rarr;</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 text-center text-[10px] md:text-sm font-medium">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="p-1 md:p-2 border-b">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-[36px] md:min-h-[100px] p-0.5 md:p-1.5 border-b border-r text-xs md:text-sm cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                  !isSameMonth(day, currentMonth) ? 'text-gray-300' : ''
                } ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/30' : ''} ${isSelected ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-[10px] md:text-xs rounded-full ${
                  isToday(day) ? 'bg-blue-600 text-white font-bold' : ''
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-0.5 md:mt-1 space-y-0.5 hidden md:block">
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
                {/* Mobile: show dot indicator if events exist */}
                {dayEvents.length > 0 && (
                  <div className="flex md:hidden justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dayEvents[0].color || '#3b82f6' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: selected day events list */}
      {selectedDay && (
        <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {format(selectedDay, "d 'de' MMMM", { locale: es })}
            </h3>
            <button onClick={() => openCreate(selectedDay)} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              <Plus size={14} /> Nuevo
            </button>
          </div>
          {getEventsForDay(selectedDay).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-gray-400">
              <CalendarIcon size={24} className="mb-1" />
              <p className="text-sm">Sin eventos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getEventsForDay(selectedDay).map(ev => (
                <div key={ev.id} onClick={() => openEdit(ev)} className="flex items-center gap-2 p-2 rounded-lg border dark:border-gray-700 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{ev.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(ev.startDateTime), 'HH:mm')} &middot; {eventLabels[ev.eventType]}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(ev); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><Pencil size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); remove(ev.id); }} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loadError && <p role="alert" className="text-red-600 dark:text-red-400">{loadError} <button onClick={load}>Reintentar</button></p>}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar evento' : 'Nuevo evento'}>
        <form aria-busy={saveAction.saving} onSubmit={e => { e.preventDefault(); void save(); }} className="space-y-4">
          <div>
            <label htmlFor="calendar-field-1" className="block text-sm font-medium mb-1">Título</label>
            <input id="calendar-field-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label htmlFor="calendar-field-2" className="block text-sm font-medium mb-1">Descripción</label>
            <textarea id="calendar-field-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label htmlFor="calendar-field-3" className="block text-sm font-medium mb-1">Propiedad</label>
            <select id="calendar-field-3" value={form.propertyId ?? ''} onChange={e => setForm({ ...form, propertyId: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sin propiedad</option>
              {properties.map(p => <option key={p.id} value={p.id}>{propertyLabel(p)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="calendar-field-4" className="block text-sm font-medium mb-1">Inicio</label>
              <input id="calendar-field-4" type="datetime-local" value={form.startDateTime.slice(0, 16)} onChange={e => setForm({ ...form, startDateTime: e.target.value + ':00' })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="calendar-field-5" className="block text-sm font-medium mb-1">Fin</label>
              <input id="calendar-field-5" type="datetime-local" value={form.endDateTime.slice(0, 16)} onChange={e => setForm({ ...form, endDateTime: e.target.value + ':00' })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="calendar-field-6" className="block text-sm font-medium mb-1">Tipo</label>
              <select id="calendar-field-6" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value as CalendarEventForm['eventType'] })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {eventTypes.map(t => <option key={t} value={t}>{eventLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="calendar-field-7" className="block text-sm font-medium mb-1">Color</label>
              <input id="calendar-field-7" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-9 border rounded-lg" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="rounded" />
            Todo el día
          </label>
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
