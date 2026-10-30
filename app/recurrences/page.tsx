'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Occurrence, Property, RecurringRule } from '@/types';
import { archiveApi, propertyApi, recurrenceApi } from '@/lib/api';
import { errorMessage, useSaveAction } from '@/hooks/useSaveAction';
import { formatCurrency, formatDate, frequencyLabels, occurrenceLabels, propertyLabel, todayLocal } from '@/lib/presentation';
import { periodRange, invalidRange } from '@/lib/period';
import Modal from '@/components/Modal';
import RecurringRuleForm from '@/components/RecurringRuleForm';
import { Field, Notice, inputClass, primaryClass, secondaryClass, panelClass } from '@/components/Fields';

function PaymentForm({ item, onSaved, onCancel }: { item: Occurrence; onSaved: () => void; onCancel: () => void }) {
  const [amount, setAmount] = useState(item.remaining);
  const [date, setDate] = useState(todayLocal());
  const save = useSaveAction();
  return <form className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(async () => {
    await recurrenceApi.pay(item.ruleId, { dueDate: item.dueDate, paymentDate: date, amount, clientRequestId: save.requestId() }); onSaved();
  }); }}>
    <p>{item.description} · Vencimiento {formatDate(item.dueDate)}</p>
    <p className="text-sm">Pendiente: {formatCurrency(item.remaining)}. Puedes registrar un importe parcial. Esta acción registra el movimiento; no realiza una transferencia bancaria.</p>
    <Field label="Importe recibido o pagado (€)"><input className={inputClass} type="number" required min="0.01" max={item.remaining} step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} /></Field>
    <Field label="Fecha real del movimiento"><input className={inputClass} type="date" required max={todayLocal()} value={date} onChange={e => setDate(e.target.value)} /></Field>
    {save.error && <Notice>{save.error}</Notice>}
    <div className="flex justify-end gap-2"><button type="button" className={secondaryClass} disabled={save.saving} onClick={onCancel}>Cancelar</button><button className={primaryClass} disabled={save.saving}>{save.saving ? 'Guardando…' : 'Confirmar movimiento'}</button></div>
  </form>;
}
export default function RecurrencesPage() {
  const [range, setRange] = useState(() => periodRange('month'));
  const [property, setProperty] = useState('');
  const [status, setStatus] = useState('ALL');
  const [items, setItems] = useState<Occurrence[]>([]);
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [create, setCreate] = useState(false);
  const [payment, setPayment] = useState<Occurrence | null>(null);
  const action = useSaveAction();
  const sequence = useRef(0);
  const load = useCallback(() => {
    const seq = ++sequence.current;
    if (!range.from || !range.to || invalidRange(range)) return Promise.resolve().then(() => { setLoading(false); setItems([]); });
    return Promise.all([recurrenceApi.occurrences(range.from, range.to, property ? Number(property) : undefined), recurrenceApi.rules(property ? Number(property) : undefined), propertyApi.getAll()])
      .then(([items, rules, properties]) => { if (seq === sequence.current) { setItems(items); setRules(rules); setProperties(properties); setError(''); } })
      .catch(e => { if (seq === sequence.current) setError(errorMessage(e)); }).finally(() => { if (seq === sequence.current) setLoading(false); });
  }, [range, property]);
  useEffect(() => { void load(); }, [load]);
  const filtered = items.filter(i => status === 'ALL' || (status === 'OPEN' ? i.remaining > 0 : i.status === status));
  const invalid = !range.from || !range.to || invalidRange(range);
  const pending = (kind: string) => items.filter(i => i.kind === kind).reduce((s,i) => s + i.remaining, 0);
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3"><h1 className="text-2xl font-bold">Recurrencias y vencimientos</h1><button disabled={loading || !!error} className={primaryClass} onClick={() => setCreate(true)}>Nueva recurrencia</button></div>
    <p className="text-sm text-gray-600 dark:text-gray-300">Los movimientos puntuales se registran en Ingresos o Gastos. Aquí se planifican los recurrentes y se confirman los importes realmente cobrados o pagados.</p>
    <div className={panelClass}><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Field label="Desde"><input className={inputClass} type="date" required value={range.from} onChange={e => { setLoading(true); setRange({ ...range, from: e.target.value }); }} /></Field>
      <Field label="Hasta"><input className={inputClass} type="date" required min={range.from} value={range.to} onChange={e => { setLoading(true); setRange({ ...range, to: e.target.value }); }} /></Field>
      <Field label="Propiedad"><select className={inputClass} value={property} onChange={e => { setLoading(true); setProperty(e.target.value); }}><option value="">Todas</option>{properties.map(p => <option key={p.id} value={p.id}>{propertyLabel(p)}</option>)}</select></Field>
      <Field label="Estado"><select className={inputClass} value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">Todos</option><option value="OPEN">Todo lo pendiente</option>{Object.entries(occurrenceLabels).map(([v,label]) => <option value={v} key={v}>{label}</option>)}</select></Field>
    </div>{invalid && <Notice>Indica un intervalo válido de hasta diez años.</Notice>}</div>
    {error && <Notice>{error} <button className="underline" onClick={load}>Reintentar</button></Notice>}
    {action.error && <Notice>{action.error}</Notice>}
    {loading ? <p role="status">Cargando vencimientos…</p> : !invalid && !error && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className={panelClass}><h2>Pendiente de cobrar en el periodo</h2><p className="text-xl font-bold">{formatCurrency(pending('INCOME'))}</p></div><div className={panelClass}><h2>Pendiente de pagar en el periodo</h2><p className="text-xl font-bold">{formatCurrency(pending('EXPENSE'))}</p></div></div>
      <div className="space-y-3">{filtered.map(i => <article className={panelClass} key={`${i.ruleId}:${i.dueDate}`}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{i.description}</h2><p className="text-sm text-gray-600 dark:text-gray-300">{i.propertyName || 'Sin propiedad'}{i.propertyId ? ` (#${i.propertyId})` : ''} · {formatDate(i.dueDate)} · {i.kind === 'INCOME' ? 'Ingreso' : 'Gasto'}</p></div><span className={i.status === 'OVERDUE' ? 'text-red-600 dark:text-red-300' : ''}>{occurrenceLabels[i.status]}</span></div><div className="flex flex-wrap gap-4 text-sm"><span>Previsto: {formatCurrency(i.amount)}</span><span>Confirmado: {formatCurrency(i.paidAmount)}</span><span>Pendiente: {formatCurrency(i.remaining)}</span></div>{i.remaining > 0 && <button className={primaryClass} onClick={() => setPayment(i)}>{i.kind === 'INCOME' ? 'Registrar cobro' : 'Registrar pago'}</button>}</article>)}{filtered.length === 0 && <p>No hay vencimientos para estos filtros.</p>}</div>
    </>}
    {!loading && !error && <section className={panelClass}><h2 className="text-lg font-semibold">Reglas recurrentes</h2><p className="text-sm">Finalizar detiene los vencimientos futuros; conserva el historial y lo pendiente hasta hoy. Para cambiar un importe, finaliza la regla y crea otra con la nueva fecha.</p>{rules.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t dark:border-gray-700 pt-3"><div><p>{r.description} · {formatCurrency(r.amount)} · {frequencyLabels[r.frequency]}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.startDate)} — {r.endDate ? formatDate(r.endDate) : 'Sin fecha de fin'}</p></div><div className="flex gap-2"><button className={secondaryClass} disabled={action.saving} onClick={() => { if (confirm('¿Finalizar esta recurrencia a partir de hoy?')) void action.run(async () => { await recurrenceApi.finish(r.id); await load(); }); }}>Finalizar</button><button className={secondaryClass} disabled={action.saving} onClick={() => { if (confirm('¿Archivar esta regla? Sus movimientos reales se conservan.')) void action.run(async () => { await archiveApi.archive('recurrences',r.id); await load(); }); }}>Archivar</button></div></div>)}</section>}
    <Modal open={create} onClose={() => setCreate(false)} title="Nueva recurrencia">{create && <RecurringRuleForm properties={properties} onSaved={() => { setCreate(false); void load(); }} onCancel={() => setCreate(false)} />}</Modal>
    <Modal open={payment !== null} onClose={() => setPayment(null)} title="Confirmar cobro o pago">{payment && <PaymentForm item={payment} onSaved={() => { setPayment(null); void load(); }} onCancel={() => setPayment(null)} />}</Modal>
  </div>;
}
