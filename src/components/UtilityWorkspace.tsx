'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Property, Lease, Income, Expense, UtilityBill, UtilityShare, Room } from '@/types';
import { propertyApi, leaseApi, incomeApi, expenseApi, documentApi, utilityApi, roomApi, downloadBlob } from '@/lib/api';
import { errorMessage, useSaveAction } from '@/hooks/useSaveAction';
import { formatCurrency, formatDate } from '@/lib/presentation';
import { utilityMessage, utilityShareLinks } from '@/lib/utility-messages';
import { Field, Notice, inputClass, primaryClass, secondaryClass, panelClass } from '@/components/Fields';
import Modal from '@/components/Modal';
import UtilityBillForm from './UtilityBillForm';
import UtilityPaymentForm from './UtilityPaymentForm';

type Data = { bills: UtilityBill[]; leases: Lease[]; incomes: Income[]; expenses: Expense[]; rooms: Room[] };
type Selection = { type: 'new' } | { type: 'payment'; bill: UtilityBill; share: UtilityShare | null } | { type: 'message'; bill: UtilityBill; share: UtilityShare };
const statuses = { OWNER: 'A tu cargo', PAID: 'Pagado', PARTIAL: 'Pago parcial', OVERDUE: 'Vencido', PENDING: 'Pendiente' };
const methods = { EQUAL: 'Partes iguales', PERCENT: 'Porcentajes', DAYS: 'Habitación y días' };
function ShareMessage({ bill, share }: { bill: UtilityBill; share: UtilityShare }) {
  const [message, setMessage] = useState(() => utilityMessage(bill, share));
  const [notice, setNotice] = useState('');
  const links = utilityShareLinks(message, share.email || '', share.phone || '');
  return <div className="space-y-4"><p className="text-sm">Revisa el texto y el destinatario antes de compartirlo. WhatsApp y tu aplicación de correo te permiten confirmar el envío. No se adjunta el recibo automáticamente: puedes descargarlo y adjuntarlo por separado.</p><Field label="Mensaje para este destinatario"><textarea className={inputClass} rows={13} value={message} onChange={e => { setNotice(''); setMessage(e.target.value); }} /></Field><p className="text-sm">{share.email || 'Sin email'} · {share.phone || 'Sin teléfono: elige el destinatario en WhatsApp'}</p><div className="flex flex-wrap gap-2"><button className={secondaryClass} onClick={async () => { try { await navigator.clipboard.writeText(message); setNotice('Mensaje copiado.'); } catch { setNotice('No se pudo copiar automáticamente. Selecciona el texto para copiarlo.'); } }}>Copiar mensaje</button><a className={primaryClass} href={links.whatsapp} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a><a className={secondaryClass} href={links.email}>Preparar correo</a></div>{notice && <p role="status" className="text-sm">{notice}</p>}<p className="text-xs">El justificante permanece privado. El mensaje solo incluye los datos de este destinatario.</p></div>;
}
export default function UtilityWorkspace({ propertyId }: { propertyId?: number }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState(propertyId ? String(propertyId) : '');
  const [archived, setArchived] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [propertiesError, setPropertiesError] = useState('');
  const [modal, setModal] = useState<Selection | null>(null);
  const action = useSaveAction(); const sequence = useRef(0);
  const id = Number(selected); const property = properties.find(p => p.id === id);
  const loadProperties = useCallback(() => propertyApi.getAll().then(setProperties).then(() => setPropertiesError('')).catch(e => setPropertiesError(errorMessage(e))), []);
  useEffect(() => { void loadProperties(); }, [loadProperties]);
  const load = useCallback(() => {
    const seq = ++sequence.current;
    if (!Number.isSafeInteger(id) || id <= 0) return Promise.resolve();
    return Promise.all([utilityApi.list(id, archived), leaseApi.list(id), incomeApi.getAll({ propertyId: id }), expenseApi.getAll({ propertyId: id }), roomApi.list(id)])
      .then(([bills, leases, incomes, expenses, rooms]) => { if (seq === sequence.current) { setData({ bills, leases, incomes, expenses, rooms }); setError(''); } })
      .catch(e => { if (seq === sequence.current) { setData(null); setError(errorMessage(e)); } });
  }, [id, archived]);
  useEffect(() => { void load(); const current = sequence; return () => { current.current++; }; }, [load]);
  const saved = () => { setModal(null); action.reset(); setData(null); setError(''); void load(); };
  const pending = data?.bills.flatMap(b => b.shares).reduce((sum, s) => sum + s.pending, 0) ?? 0;
  const owner = data?.bills.flatMap(b => b.shares).filter(s => s.owner).reduce((sum, s) => sum + s.amount, 0) ?? 0;
  return <div className="space-y-6">
    {propertyId && <Link href={`/properties/${propertyId}`} className="text-blue-600 dark:text-blue-300 text-sm">← Ficha de la propiedad</Link>}
    <header className="flex flex-wrap justify-between gap-3 items-start"><div><h1 className="text-2xl font-bold">Recibos y suministros</h1><p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Luz, agua y otros recibos. Un reparto claro para cada inquilino.</p></div><button className={primaryClass} disabled={!data || !property || archived || !!error || !!modal || action.saving} onClick={() => { action.reset(); setModal({ type: 'new' }); }}>Nuevo recibo</button></header>
    <section className={panelClass}><Field label="Propiedad"><select className={inputClass} value={selected} disabled={!!modal || action.saving} onChange={e => { sequence.current++; setData(null); setSelected(e.target.value); action.reset(); }}><option value="">Selecciona una propiedad</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name} · {p.address}</option>)}</select></Field><label className="flex gap-2 text-sm"><input type="checkbox" disabled={!!modal || action.saving} checked={archived} onChange={e => { sequence.current++; setData(null); setArchived(e.target.checked); action.reset(); }} />Ver recibos archivados</label><p className="text-xs text-gray-500 dark:text-gray-400">Guardar y repartir un recibo no modifica los totales. El gasto y los reembolsos cuentan cuando confirmas su pago o vinculas un movimiento existente. No los registres de nuevo en Ingresos o Gastos.</p></section>
    {propertiesError && <Notice>{propertiesError} <button className="underline" onClick={() => void loadProperties()}>Reintentar propiedades</button></Notice>}
    {(error || action.error) && <Notice>{error || action.error} <button className="underline" onClick={() => { action.reset(); setError(''); setData(null); void load(); }}>Reintentar carga</button></Notice>}
    {!selected ? <p>Elige una propiedad para consultar sus recibos.</p> : !data && !error ? <p role="status">Cargando recibos…</p> : data && <>
      {!archived && <div className="grid sm:grid-cols-2 gap-3"><section className={panelClass}><p className="text-sm">Pendiente de reembolso</p><strong className="text-2xl">{formatCurrency(pending)}</strong></section><section className={panelClass}><p className="text-sm">Parte a tu cargo</p><strong className="text-2xl">{formatCurrency(owner)}</strong><p className="text-xs">Asignada en los recibos activos; no es un gasto adicional.</p></section></div>}
      {!data.bills.length && <section className={panelClass}><h2 className="font-semibold">{archived ? 'No hay recibos archivados' : 'Todavía no hay recibos'}</h2><p className="text-sm">{archived ? 'Los recibos archivados se conservan aquí para poder restaurarlos.' : 'Añade el primer recibo, indica sus fechas y revisa cuánto corresponde a cada persona.'}</p></section>}
      {data.bills.map(bill => <article key={bill.id} className={panelClass}><header className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-semibold">{bill.supply} · {bill.provider}</h2><p className="text-sm">{bill.reference} · {formatDate(bill.periodFrom)} — {formatDate(bill.periodTo)}</p><p className="text-xs">{methods[bill.method]} · Fecha solicitada de pago: {formatDate(bill.dueDate)}</p></div><strong className="text-2xl">{formatCurrency(bill.amount)}</strong></header>
        <div className="flex flex-wrap gap-2">{bill.documentId && <button className={secondaryClass} disabled={action.saving} onClick={() => void action.run(async () => downloadBlob(await documentApi.download(bill.documentId!), bill.filename || 'recibo.pdf'))}>Descargar recibo privado</button>}{!bill.archived && (!bill.expenseId ? <button className={secondaryClass} onClick={() => setModal({ type: 'payment', bill, share: null })}>Registrar o vincular gasto pagado</button> : <p className="text-sm self-center">Gasto #{bill.expenseId}: {bill.expensePaid ? 'pagado y registrado' : 'archivado; puedes restaurarlo desde Archivados'}</p>)}</div>
        <div className="space-y-3">{bill.shares.map(share => <section key={share.id} className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{share.name}{share.room ? ` · ${share.room}` : ''}</h3><p className="text-xs">{statuses[share.status]}{bill.method === 'DAYS' && !share.owner && share.from && share.to ? ` · ${formatDate(share.from)} al ${formatDate(share.to)}` : ''}</p></div><strong>{formatCurrency(share.amount)}</strong></div>{!share.owner && <><p className="text-sm">Cobrado: {formatCurrency(share.paid)} · Pendiente: <strong>{formatCurrency(share.pending)}</strong></p>{!bill.archived && <div className="flex flex-wrap gap-2">{share.pending > 0 && <button className={primaryClass} onClick={() => setModal({ type: 'payment', bill, share })}>Registrar cobro</button>}<button className={secondaryClass} onClick={() => setModal({ type: 'message', bill, share })}>Preparar mensaje</button></div>}{share.payments.map(payment => <div key={payment.incomeId} className="flex flex-wrap gap-2 justify-between items-center text-xs"><span>{formatDate(payment.date)} · {formatCurrency(payment.amount)} · Ingreso #{payment.incomeId}</span>{!bill.archived && <button className="underline" disabled={action.saving} onClick={() => { if (confirm('¿Archivar este cobro? Se retirará de los ingresos y volverá a quedar pendiente en el recibo.')) void action.run(async () => { await incomeApi.delete(payment.incomeId); await load(); }); }}>Corregir: archivar cobro</button>}</div>)}</>}</section>)}</div>
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap gap-3 items-center"><button className={secondaryClass} disabled={action.saving} onClick={() => { if (confirm(bill.archived ? '¿Restaurar este recibo? Los movimientos archivados se restauran por separado.' : '¿Archivar este recibo? Para corregirlo, primero deben estar archivados sus cobros y gasto vinculados.')) void action.run(async () => { await utilityApi.archive(bill.id, !bill.archived); await load(); }); }}>{bill.archived ? 'Restaurar recibo' : 'Archivar recibo'}</button>{!bill.archived && bill.expensePaid && bill.expenseId && <button className="text-xs underline" disabled={action.saving} onClick={() => { if (confirm('¿Archivar el gasto de este recibo? Se retirará del total de gastos.')) void action.run(async () => { await expenseApi.delete(bill.expenseId!); await load(); }); }}>Corregir: archivar gasto #{bill.expenseId}</button>}</footer>
      </article>)}
    </>}
    <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'new' ? 'Nuevo recibo y reparto' : modal?.type === 'message' ? 'Revisar mensaje individual' : modal?.type === 'payment' && modal.share ? 'Registrar reembolso recibido' : 'Registrar gasto pagado'}>
      {modal?.type === 'new' && data && property && <UtilityBillForm propertyId={id} leases={data.leases} rooms={data.rooms} bedrooms={property.bedrooms} onSaved={saved} onCancel={() => setModal(null)} />}
      {modal?.type === 'payment' && data && <UtilityPaymentForm bill={modal.bill} share={modal.share} incomes={data.incomes} expenses={data.expenses} onSaved={saved} onCancel={() => setModal(null)} />}
      {modal?.type === 'message' && <ShareMessage bill={modal.bill} share={modal.share} />}
    </Modal>
  </div>;
}
