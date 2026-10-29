'use client';
import { useState } from 'react';
import type { LeaseForm as LeaseData } from '@/types';
import { leaseApi } from '@/lib/api';
import { todayLocal } from '@/lib/presentation';
import { useSaveAction } from '@/hooks/useSaveAction';
import { Field, Notice, inputClass, primaryClass, secondaryClass } from '@/components/Fields';
export default function LeaseForm({ propertyId, hasRentRule, onSaved, onCancel }: { propertyId: number; hasRentRule: boolean; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<LeaseData>({ tenantName: '', tenantEmail: '', tenantPhone: '', startDate: todayLocal(), endDate: null, monthlyRent: 0, depositAmount: null, paymentDay: 1, generateRecurrence: !hasRentRule });
  const save = useSaveAction();
  const set = <K extends keyof LeaseData>(key: K, value: LeaseData[K]) => setForm({ ...form, [key]: value });
  return <form aria-busy={save.saving} className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(async () => { await leaseApi.create(propertyId, { ...form, clientRequestId: save.requestId() }); onSaved(); }); }}>
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
