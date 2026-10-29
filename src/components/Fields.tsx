'use client';
import { useId } from 'react';
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return <label id={id} className="block text-sm font-medium min-w-0">{label}<span className="block mt-1">{children}</span></label>;
}
export function Notice({ children }: { children: React.ReactNode }) { return <p role="alert" className="text-sm text-red-700 dark:text-red-300">{children}</p>; }
export const inputClass = 'w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800';
export const primaryClass = 'inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50';
export const secondaryClass = 'inline-flex items-center justify-center gap-2 border dark:border-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50';
export const panelClass = 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 md:p-5 space-y-4';
