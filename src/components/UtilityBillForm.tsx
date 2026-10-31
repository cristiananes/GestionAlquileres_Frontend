'use client';
import { useState } from 'react';
import type { Lease, UtilityBillForm as BillForm, UtilityRecipient, UtilityPart } from '@/types';
import { utilityApi } from '@/lib/api';
import { useSaveAction } from '@/hooks/useSaveAction';
import { formatCurrency, formatDate, todayLocal } from '@/lib/presentation';
import { Field, Notice, inputClass, primaryClass, secondaryClass, panelClass } from '@/components/Fields';

const recipient = (): UtilityRecipient => ({ name: '', room: '', email: '', phone: '', roomNumber: 1, from: null, to: null, percent: null, owner: false });
export default function UtilityBillForm({ propertyId, leases, bedrooms, onSaved, onCancel }: { propertyId: number; leases: Lease[]; bedrooms: number | null; onSaved: () => void; onCancel: () => void }) {
  const today = todayLocal();
  const [form, setForm] = useState<BillForm>({ propertyId, clientRequestId: '', supply: 'Luz', provider: '', reference: '', amount: 0, periodFrom: today.slice(0, 7) + '-01', periodTo: today, dueDate: today, method: 'EQUAL', roomCount: bedrooms || 1, vacancy: 'OWNER', recipients: [recipient()] });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState<{ parts: UtilityPart[]; payload: BillForm } | null>(null);
  const action = useSaveAction();
  const change = <K extends keyof BillForm>(key: K, value: BillForm[K]) => { setPreview(null); action.reset(); setForm(f => ({ ...f, [key]: value })); };
  const person = (index: number, patch: Partial<UtilityRecipient>) => change('recipients', form.recipients.map((p, i) => i === index ? { ...p, ...patch } : p));
  const relevant = leases.filter(l => !l.archived && l.startDate <= form.periodTo && (!l.endDate || l.endDate >= form.periodFrom));
  return <form aria-busy={action.saving} className="space-y-5" onSubmit={e => { e.preventDefault(); if (fileError) return; void action.run(async () => {
    const payload = { ...form, clientRequestId: action.requestId() };
    setPreview({ parts: await utilityApi.preview(payload), payload });
  }); }}>
    <p className="text-sm text-gray-600 dark:text-gray-300">Introduce los datos del recibo y revisa el reparto antes de confirmar. No se registra dinero ni se envían mensajes en este paso.</p>
    <fieldset disabled={action.saving} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Suministro"><select className={inputClass} value={form.supply} onChange={e => change('supply', e.target.value)}>{['Luz', 'Agua', 'Gas', 'Internet', 'Otros suministros'].map(v => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Proveedor"><input required maxLength={120} className={inputClass} value={form.provider} onChange={e => change('provider', e.target.value)} /></Field>
        <Field label="Referencia o número de factura"><input required maxLength={100} className={inputClass} value={form.reference} onChange={e => change('reference', e.target.value)} /></Field>
        <Field label="Importe total (€)"><input required type="number" min="0.01" max="9999999.99" step="0.01" className={inputClass} value={form.amount || ''} onChange={e => change('amount', Number(e.target.value))} /></Field>
        <Field label="Periodo desde (incluido)"><input required type="date" max={form.periodTo} className={inputClass} value={form.periodFrom} onChange={e => change('periodFrom', e.target.value)} /></Field>
        <Field label="Periodo hasta (incluido)"><input required type="date" min={form.periodFrom} className={inputClass} value={form.periodTo} onChange={e => change('periodTo', e.target.value)} /></Field>
        <Field label="Fecha solicitada de pago"><input required type="date" className={inputClass} value={form.dueDate} onChange={e => change('dueDate', e.target.value)} /></Field>
        <Field label="Recibo PDF o foto (opcional, máximo 5 MB)"><input type="file" accept="application/pdf,image/png,image/jpeg" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); setPreview(null); setFileError(f && (f.size === 0 || f.size > 5 * 1024 * 1024) ? 'El archivo debe tener entre 1 byte y 5 MB.' : ''); }} /></Field>
      </div>
      <Field label="Cómo repartir"><select className={inputClass} value={form.method} onChange={e => { const method = e.target.value as BillForm['method']; setPreview(null); action.reset(); setForm(f => ({ ...f, method, recipients: method === 'DAYS' ? f.recipients.filter(p => !p.owner) : f.recipients })); }}><option value="EQUAL">A partes iguales · piso entero o habitaciones</option><option value="PERCENT">Por porcentajes acordados</option><option value="DAYS">Por habitación y días de estancia</option></select></Field>
      {form.method === 'DAYS' && <div className="grid sm:grid-cols-2 gap-3"><Field label="Número total de habitaciones a repartir"><input type="number" min="1" max="50" required className={inputClass} value={form.roomCount} onChange={e => change('roomCount', Number(e.target.value))} /></Field><Field label="Parte de las habitaciones vacías"><select className={inputClass} value={form.vacancy} onChange={e => change('vacancy', e.target.value as BillForm['vacancy'])}><option value="OWNER">La asumo yo</option><option value="OCCUPANTS">Se reparte entre las ocupadas</option></select></Field><p className="sm:col-span-2 text-xs">Cada habitación pesa lo mismo. Se calcula día a día, incluyendo entrada y salida. No puede haber dos estancias solapadas en una habitación; para un contrato conjunto usa un único destinatario. Los días sin ocupantes los asumes tú.</p></div>}
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">Destinatarios</h3><button type="button" className={secondaryClass} disabled={!relevant.length} onClick={() => change('recipients', relevant.map((l, i) => ({ name: l.tenantName, email: l.tenantEmail || '', phone: l.tenantPhone || '', room: `Habitación ${i + 1}`, roomNumber: i + 1, from: l.startDate, to: l.endDate || form.periodTo, percent: null, owner: false })))}>Cargar {relevant.length} contratos del periodo</button></div>
      <p className="text-xs">Revisa los nombres, habitaciones y fechas importados. Puedes introducir un destinatario conjunto para un piso entero. En porcentajes o partes iguales, añade tu propia parte si asumes una cantidad.</p>
      {form.recipients.map((p, i) => <fieldset key={i} className={panelClass}><legend className="text-sm font-medium px-1">Destinatario {i + 1}</legend><div className="grid sm:grid-cols-2 gap-3">
        <Field label="Nombre o destinatario conjunto"><input required maxLength={120} className={inputClass} value={p.name} onChange={e => person(i, { name: e.target.value })} /></Field>
        <Field label="Habitación / descripción"><input maxLength={120} className={inputClass} value={p.room} onChange={e => person(i, { room: e.target.value })} /></Field>
        {!p.owner && <><Field label="Email (opcional)"><input type="email" maxLength={180} className={inputClass} value={p.email} onChange={e => person(i, { email: e.target.value })} /></Field><Field label="Teléfono con prefijo internacional (opcional)"><input type="tel" placeholder="+34…" maxLength={40} className={inputClass} value={p.phone} onChange={e => person(i, { phone: e.target.value })} /></Field></>}
        {form.method === 'PERCENT' && <Field label="Porcentaje del total"><input required type="number" min="0" max="100" step="0.0001" className={inputClass} value={p.percent ?? ''} onChange={e => person(i, { percent: e.target.value === '' ? null : Number(e.target.value) })} /></Field>}
        {form.method === 'DAYS' && <><Field label="Número de habitación"><input required type="number" min="1" max={form.roomCount} className={inputClass} value={p.roomNumber ?? ''} onChange={e => person(i, { roomNumber: Number(e.target.value) })} /></Field><Field label="Entrada (incluida)"><input required type="date" max={p.to ?? undefined} className={inputClass} value={p.from ?? ''} onChange={e => person(i, { from: e.target.value })} /></Field><Field label="Salida o fin de periodo (incluido)"><input required type="date" min={p.from ?? undefined} className={inputClass} value={p.to ?? ''} onChange={e => person(i, { to: e.target.value })} /></Field></>}
      </div><div className="flex flex-wrap gap-3 items-center mt-3">{form.method !== 'DAYS' && <label className="text-sm flex gap-2"><input type="checkbox" checked={p.owner} onChange={e => person(i, { owner: e.target.checked })} />Esta parte la asumo yo</label>}<button type="button" className={secondaryClass} disabled={form.recipients.length <= 1} onClick={() => change('recipients', form.recipients.filter((_, n) => i !== n))}>Quitar destinatario</button></div></fieldset>)}
      <button type="button" className={secondaryClass} disabled={form.recipients.length >= 100} onClick={() => change('recipients', [...form.recipients, recipient()])}>Añadir destinatario</button>
    </fieldset>
    {(action.error || fileError) && <Notice>{fileError || action.error}</Notice>}
    {preview && <section className="rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3" aria-label="Revisión del reparto"><h3 className="font-semibold">Revisa el reparto · {formatCurrency(form.amount)}</h3><p className="text-sm">Del {formatDate(form.periodFrom)} al {formatDate(form.periodTo)}. Los céntimos sobrantes se asignan por restos mayores, con desempate en el orden mostrado.</p>{preview.parts.map((part, i) => <div key={i} className="flex justify-between gap-2 text-sm"><span>{part.recipient.name}{part.recipient.room ? ` · ${part.recipient.room}` : ''}{part.recipient.owner ? ' (a tu cargo)' : ''}</span><strong>{formatCurrency(part.amount)}</strong></div>)}<p className="text-xs">Al confirmar se conserva esta versión. Comprueba que el reparto se ajusta a lo pactado con los inquilinos. Para corregirlo después, archiva sus movimientos y el recibo antes de crear el correcto.</p><button type="button" className={primaryClass} disabled={action.saving} onClick={() => void action.run(async () => { await utilityApi.create({ ...preview.payload, clientRequestId: action.requestId() }, file); onSaved(); })}>{action.saving ? 'Guardando…' : 'Confirmar y guardar recibo'}</button></section>}
    <div className="flex flex-wrap gap-2"><button className={primaryClass} disabled={action.saving || !!fileError}>{action.saving ? 'Calculando…' : preview ? 'Recalcular reparto' : 'Revisar reparto'}</button><button type="button" className={secondaryClass} disabled={action.saving} onClick={onCancel}>Cancelar</button></div>
  </form>;
}
