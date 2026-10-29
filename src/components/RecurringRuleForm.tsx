'use client';
import { useState } from 'react';
import type { MovementKind, Property, RecurringRuleForm as RuleForm } from '@/types';
import { recurrenceApi } from '@/lib/api';
import { useSaveAction } from '@/hooks/useSaveAction';
import { frequencyLabels, incomeLabels, paymentLabels, categoryLabels, propertyLabel, todayLocal } from '@/lib/presentation';
import { Field, Notice, inputClass, primaryClass, secondaryClass } from '@/components/Fields';
export default function RecurringRuleForm({ properties, kind = 'INCOME', propertyId = null, onSaved, onCancel }: {
  properties: Property[]; kind?: MovementKind; propertyId?: number | null; onSaved: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<RuleForm>({ propertyId, kind, frequency: 'MONTHLY', amount: 0, description: '', startDate: todayLocal(), endDate: null, incomeType: 'RENT', paymentMethod: 'TRANSFER', category: 'MAINTENANCE' });
  const save = useSaveAction();
  const set = <K extends keyof RuleForm>(key: K, value: RuleForm[K]) => setForm({ ...form, [key]: value });
  return <form aria-busy={save.saving} className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(async () => {
    if (form.endDate && form.endDate < form.startDate) throw new Error('Fechas invertidas');
    await recurrenceApi.create({ ...form, clientRequestId: save.requestId() }); onSaved();
  }); }}>
    <p className="text-sm text-gray-600 dark:text-gray-300">Se crearán vencimientos previstos. El dinero contará en el balance cuando confirmes cada cobro o pago.</p>
    <Field label="Movimiento"><select className={inputClass} value={form.kind} onChange={e => set('kind', e.target.value as MovementKind)}><option value="INCOME">Ingreso recurrente</option><option value="EXPENSE">Gasto recurrente</option></select></Field>
    <Field label="Propiedad"><select className={inputClass} value={form.propertyId ?? ''} onChange={e => set('propertyId', e.target.value ? Number(e.target.value) : null)}><option value="">Sin propiedad</option>{properties.map(p => <option key={p.id} value={p.id}>{propertyLabel(p)}</option>)}</select></Field>
    <Field label="Concepto"><input className={inputClass} required maxLength={250} value={form.description} onChange={e => set('description', e.target.value)} /></Field>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Importe (€)"><input className={inputClass} type="number" required min="0.01" step="0.01" value={form.amount || ''} onChange={e => set('amount', Number(e.target.value))} /></Field>
      <Field label="Frecuencia"><select className={inputClass} value={form.frequency} onChange={e => set('frequency', e.target.value as RuleForm['frequency'])}>{Object.entries(frequencyLabels).map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select></Field>
      <Field label="Primer vencimiento"><input className={inputClass} type="date" required value={form.startDate} onChange={e => set('startDate', e.target.value)} /></Field>
      <Field label="Último vencimiento (opcional)"><input className={inputClass} type="date" min={form.startDate} value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value || null)} /></Field>
    </div>
    {form.kind === 'INCOME' ? <><Field label="Tipo"><select className={inputClass} value={form.incomeType} onChange={e => set('incomeType', e.target.value as RuleForm['incomeType'])}>{Object.entries(incomeLabels).map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select></Field><Field label="Método de pago"><select className={inputClass} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value as RuleForm['paymentMethod'])}>{Object.entries(paymentLabels).map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select></Field></> : <Field label="Categoría"><select className={inputClass} value={form.category} onChange={e => set('category', e.target.value as RuleForm['category'])}>{Object.entries(categoryLabels).map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select></Field>}
    {form.incomeType === 'DEPOSIT' && form.kind === 'INCOME' && <p className="text-sm">Las fianzas no se incluyen en la rentabilidad.</p>}
    {save.error && <Notice>{save.error}</Notice>}
    <div className="flex justify-end gap-2"><button type="button" disabled={save.saving} className={secondaryClass} onClick={onCancel}>Cancelar</button><button disabled={save.saving} className={primaryClass}>{save.saving ? 'Guardando…' : 'Crear recurrencia'}</button></div>
  </form>;
}
