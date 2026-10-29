'use client';
import { useCallback, useEffect, useState } from 'react';
import { archiveApi, ArchiveKind } from '@/lib/api';
import { errorMessage, useSaveAction } from '@/hooks/useSaveAction';
import { Field, Notice, inputClass, secondaryClass, panelClass } from '@/components/Fields';
const labels = { properties: 'Propiedades', incomes: 'Ingresos', expenses: 'Gastos', tasks: 'Tareas', 'calendar-events': 'Eventos', recurrences: 'Reglas recurrentes' } as const;
export default function ArchivePage() {
  const [kind, setKind] = useState<keyof typeof labels>('incomes');
  const [items, setItems] = useState<Awaited<ReturnType<typeof archiveApi.list>>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const action = useSaveAction();
  const load = useCallback(() => archiveApi.list(kind).then(items => { setItems(items); setError(''); }).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)), [kind]);
  useEffect(() => { void load(); }, [load]);
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Archivados</h1><p className="text-sm">Archivar conserva los datos. Restaura un registro para que vuelva a sus listados y cálculos. Los contratos y justificantes archivados se recuperan desde la ficha de su propiedad.</p><div className={panelClass}><Field label="Tipo de registro"><select className={inputClass} value={kind} onChange={e => { setKind(e.target.value as keyof typeof labels); setLoading(true); }}>{Object.entries(labels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></Field></div>
    {(error || action.error) && <Notice>{error || action.error}</Notice>}{loading ? <p role="status">Cargando…</p> : items.map(i => <article className={`${panelClass} flex flex-wrap justify-between gap-3`} key={i.id}><div><p>{i.name || i.title || i.description || `Registro #${i.id}`}</p><p className="text-xs text-gray-500 dark:text-gray-400">{i.propertyName} · #{i.id}</p></div><button className={secondaryClass} disabled={action.saving} onClick={() => void action.run(async () => { await archiveApi.restore(kind as ArchiveKind,i.id); await load(); })}>Restaurar</button></article>)}{!loading && !error && !items.length && <p>No hay registros archivados de este tipo.</p>}
  </div>;
}
