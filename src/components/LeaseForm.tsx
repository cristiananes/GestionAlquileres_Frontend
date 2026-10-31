'use client';
import { useEffect, useState } from 'react';
import type { LeaseForm as LeaseData, Room } from '@/types';
import { leaseApi, roomApi } from '@/lib/api';
import { todayLocal } from '@/lib/presentation';
import { errorMessage, useSaveAction } from '@/hooks/useSaveAction';
import { Field, Notice, inputClass, primaryClass, secondaryClass } from '@/components/Fields';
export default function LeaseForm({ propertyId, hasRentRule, onSaved, onCancel }: { propertyId: number; hasRentRule: boolean; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<LeaseData>({ rentalScope: 'ENTIRE_PROPERTY', roomId: null, tenantName: '', tenantEmail: '', tenantPhone: '', startDate: todayLocal(), endDate: null, monthlyRent: 0, depositAmount: null, paymentDay: 1, generateRecurrence: !hasRentRule });
  const [rooms, setRooms] = useState<Room[]>([]); const [roomError, setRoomError] = useState('');
  useEffect(() => { let active = true; roomApi.list(propertyId).then(r => { if(active) setRooms(r); }).catch(e => { if(active) setRoomError(errorMessage(e)); }); return () => { active = false; }; }, [propertyId]);
  const save = useSaveAction();
  const set = <K extends keyof LeaseData>(key: K, value: LeaseData[K]) => setForm({ ...form, [key]: value });
  return <form aria-busy={save.saving} className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(async () => { await leaseApi.create(propertyId, { ...form, clientRequestId: save.requestId() }); onSaved(); }); }}>
    <Field label="Qué se alquila"><select className={inputClass} value={form.rentalScope} onChange={e => setForm({ ...form, rentalScope: e.target.value as LeaseData['rentalScope'], roomId: null })}><option value="ENTIRE_PROPERTY">Piso completo</option><option value="ROOM">Una habitación</option></select></Field>
    {form.rentalScope === 'ROOM' && <Field label="Habitación del contrato"><select className={inputClass} required value={form.roomId ?? ''} onChange={e => set('roomId', Number(e.target.value))}><option value="">Selecciona una habitación</option>{rooms.map(r => <option key={r.id} value={r.id}>#{r.number} · {r.name}</option>)}</select><p className="text-xs">Crea las habitaciones en la ficha de la propiedad antes de asignarlas.</p></Field>}
    {roomError && <Notice>{roomError}</Notice>}
    <p className="text-xs">La estancia inicial usa las fechas del contrato, ambas incluidas. Después puedes ajustarla desde Habitaciones y ocupación. Se comprueba que no se solape con otros contratos asignados.</p>
    <Field label="Nombre del inquilino"><input className={inputClass} required maxLength={200} value={form.tenantName} onChange={e => set('tenantName',e.target.value)} /></Field>
    <Field label="Email (opcional)"><input className={inputClass} type="email" value={form.tenantEmail} onChange={e => set('tenantEmail',e.target.value)} /></Field>
    <Field label="Teléfono (opcional)"><input className={inputClass} type="tel" maxLength={40} value={form.tenantPhone} onChange={e => set('tenantPhone',e.target.value)} /></Field>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Field label="Inicio"><input className={inputClass} type="date" required value={form.startDate} onChange={e => set('startDate',e.target.value)} /></Field><Field label="Fin (opcional)"><input className={inputClass} type="date" min={form.startDate} value={form.endDate ?? ''} onChange={e => set('endDate',e.target.value || null)} /></Field><Field label="Renta mensual (€)"><input className={inputClass} type="number" required min="0.01" step="0.01" value={form.monthlyRent || ''} onChange={e => set('monthlyRent',Number(e.target.value))} /></Field><Field label="Fianza (€)"><input className={inputClass} type="number" min="0" step="0.01" value={form.depositAmount ?? ''} onChange={e => set('depositAmount',e.target.value === '' ? null : Number(e.target.value))} /></Field></div>
    <Field label="Día de cobro mensual"><input className={inputClass} type="number" required min="1" max="31" value={form.paymentDay} onChange={e => set('paymentDay',Number(e.target.value))} /></Field>
    {hasRentRule && <p className="text-sm text-amber-700 dark:text-amber-300">Esta propiedad ya tiene una regla de alquiler. Comprueba que no estés planificando el mismo cobro dos veces.</p>}
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.generateRecurrence} onChange={e => set('generateRecurrence',e.target.checked)} />Crear vencimientos mensuales de esta renta</label>
    <p className="text-sm text-gray-600 dark:text-gray-300">La fianza y los alquileres no se marcan como cobrados automáticamente. Si indicas un fin, se creará un único recordatorio en el calendario. Esto guarda los datos del contrato; no firma ni genera un contrato legal.</p>
    {save.error && <Notice>{save.error}</Notice>}<div className="flex justify-end gap-2"><button className={secondaryClass} type="button" disabled={save.saving} onClick={onCancel}>Cancelar</button><button className={primaryClass} disabled={save.saving}>{save.saving ? 'Guardando…' : 'Guardar contrato'}</button></div>
  </form>;
}
