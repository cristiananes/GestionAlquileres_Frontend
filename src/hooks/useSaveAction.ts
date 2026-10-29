'use client';
import { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (Array.isArray(data?.details)) return data.details.join('. ');
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.message === 'string') return data.message;
    if (error.response?.status === 401) return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
    if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.';
  }
  return 'No se pudo completar la operación. Comprueba la conexión y vuelve a intentarlo.';
}
export function useSaveAction() {
  const locked = useRef(false);
  const key = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestId = () => key.current ?? (key.current = crypto.randomUUID());
  const reset = () => { if (!locked.current) { key.current = null; setError(''); } };
  const run = async (action: () => Promise<unknown>) => {
    if (locked.current) return false;
    locked.current = true; setSaving(true); setError('');
    try { await action(); key.current = null; return true; }
    catch (error) { setError(errorMessage(error)); return false; }
    finally { locked.current = false; setSaving(false); }
  };
  return { saving, error, run, requestId, reset };
}
