'use client';
import { useState } from 'react';
import type { Expense, Income, UtilityBill, UtilityShare } from '@/types';
import { utilityApi } from '@/lib/api';
import { useSaveAction } from '@/hooks/useSaveAction';
import { formatCurrency, formatDate, todayLocal, paymentLabels } from '@/lib/presentation';
import { Field, Notice, inputClass, primaryClass, secondaryClass } from '@/components/Fields';
export default function UtilityPaymentForm({ bill, share, incomes, expenses, onSaved, onCancel }: { bill: UtilityBill; share: UtilityShare | null; incomes: Income[]; expenses: Expense[]; onSaved: () => void; onCancel: () => void }) {
  const [amount, setAmount] = useState(share ? share.pending : bill.amount);
  const [date, setDate] = useState(todayLocal());
  const [movement, setMovement] = useState('');
  const [method, setMethod] = useState<Income['paymentMethod']>('TRANSFER');
  const action = useSaveAction();
  const candidates = share ? incomes.filter(i => !i.archived && !i.utilityShareId && !i.occurrenceId && (i.incomeType === 'OTHER' || i.incomeType === 'UTILITY_REIMBURSEMENT')).map(i => ({ id: i.id, description: i.description, amount: i.amount, date: i.incomeDate })) : expenses.filter(e => !e.archived && !e.utilityBillId && !e.occurrenceId && e.category === 'UTILITIES').map(e => ({ id: e.id, description: e.description, amount: e.amount, date: e.expenseDate }));
  const reset = () => { action.reset(); setMovement(''); };
  return <form aria-busy={action.saving} className="space-y-4" onSubmit={e => { e.preventDefault(); void action.run(async () => { const data = { amount, date, clientRequestId: action.requestId(), paymentMethod: method, movementId: movement ? Number(movement) : undefined }; if (share) await utilityApi.pay(bill.id, share.id, data); else await utilityApi.expense(bill.id, data); onSaved(); }); }}>
    <p className="text-sm">{share ? `${share.name} · Pendiente: ${formatCurrency(share.pending)}. Solo confirma dinero que ya has recibido.` : `Confirma que has pagado el recibo completo de ${formatCurrency(bill.amount)}. Si ya lo registraste en Gastos, vincúlalo para evitar duplicarlo.`}</p>
    <fieldset disabled={action.saving} className="space-y-3"><Field label="Importe (€)"><input type="number" min="0.01" max={share ? share.pending : bill.amount} step="0.01" required readOnly={!share} className={inputClass} value={amount || ''} onChange={e => { reset(); setAmount(Number(e.target.value)); }} /></Field><Field label={share ? 'Fecha real del cobro' : 'Fecha real del pago'}><input type="date" required max={todayLocal()} className={inputClass} value={date} onChange={e => { reset(); setDate(e.target.value); }} /></Field><Field label="Registro contable"><select className={inputClass} value={movement} onChange={e => { action.reset(); setMovement(e.target.value); }}><option value="">Crear {share ? 'un ingreso de reembolso' : 'un gasto de suministros'}</option>{candidates.filter(m => Math.abs(m.amount - amount) < 0.005 && m.date === date).map(m => <option key={m.id} value={m.id}>Vincular #{m.id} · {m.description} · {formatDate(m.date)}</option>)}</select></Field><p className="text-xs">Se muestran movimientos de esta propiedad con la misma fecha e importe. Los cobros deben ser de tipo Otro o Reembolso; los gastos, de Suministros. El servidor comprueba que no estén ya vinculados.</p></fieldset>
    {share && !movement && <Field label="Forma de cobro"><select className={inputClass} value={method} disabled={action.saving} onChange={e => { action.reset(); setMethod(e.target.value as Income['paymentMethod']); }}>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>}
    {action.error && <Notice>{action.error}</Notice>}<div className="flex flex-wrap gap-2"><button className={primaryClass} disabled={action.saving}>{action.saving ? 'Guardando…' : movement ? 'Vincular movimiento existente' : share ? 'Confirmar cobro recibido' : 'Confirmar gasto pagado'}</button><button type="button" className={secondaryClass} disabled={action.saving} onClick={onCancel}>Cancelar</button></div>
  </form>;
}
