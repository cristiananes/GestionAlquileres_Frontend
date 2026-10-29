'use client';
import { useState } from 'react';
import type { Property } from '@/types';
import { propertyApi } from '@/lib/api';
import { useSaveAction } from '@/hooks/useSaveAction';
import { Field, Notice, inputClass, primaryClass, secondaryClass } from '@/components/Fields';
const fields = { purchasePrice: 'Precio de compra', purchaseCosts: 'Impuestos y gastos de compra', renovationCosts: 'Reforma inicial', furnitureCosts: 'Mobiliario inicial', cashInvested: 'Dinero propio aportado (opcional)' } as const;
export default function InvestmentForm({ property, onSaved, onCancel }: { property: Property; onSaved: () => void; onCancel: () => void }) {
  const [values, setValues] = useState(() => Object.fromEntries(Object.keys(fields).map(key => [key, property[key as keyof typeof fields] ?? null])) as Record<keyof typeof fields, number | null>);
  const save = useSaveAction();
  return <form aria-busy={save.saving} className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(async () => {
    await propertyApi.updateInvestment(property.id, values); onSaved();
  }); }}><p className="text-sm text-gray-600 dark:text-gray-300">La inversión total suma compra, gastos de compra, reforma y mobiliario. Deja la compra vacía si aún no la sabes. No vuelvas a sumar como coste operativo la inversión inicial registrada aquí.</p>
    {Object.entries(fields).map(([key,label]) => <Field label={`${label} (€)`} key={key}><input className={inputClass} type="number" min="0" step="0.01" value={values[key as keyof typeof fields] ?? ''} onChange={e => setValues({ ...values, [key]: e.target.value === '' ? null : Number(e.target.value) })} /></Field>)}
    <p className="text-sm">El dinero propio aportado se usa para la rentabilidad de caja sobre tu aportación. La inversión total del inmueble se muestra siempre por separado.</p>
    {save.error && <Notice>{save.error}</Notice>}<div className="flex justify-end gap-2"><button className={secondaryClass} disabled={save.saving} type="button" onClick={onCancel}>Cancelar</button><button className={primaryClass} disabled={save.saving}>{save.saving ? 'Guardando…' : 'Guardar inversión'}</button></div>
  </form>;
}
