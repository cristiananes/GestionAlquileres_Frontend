import type { CalendarEvent, Expense, Income, Property, Task } from '@/types';

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

export const incomeLabels: Record<Income['incomeType'], string> = {
  RENT: 'Alquiler', DEPOSIT: 'Fianza', LATE_FEE: 'Recargo por demora', OTHER: 'Otro',
};
export const paymentLabels: Record<Income['paymentMethod'], string> = {
  CASH: 'Efectivo', TRANSFER: 'Transferencia', CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito', CHECK: 'Cheque', OTHER: 'Otro',
};
export const categoryLabels: Record<Expense['category'], string> = {
  REPAIR: 'Reparación', MAINTENANCE: 'Mantenimiento', TAXES: 'Impuestos',
  UTILITIES: 'Suministros', INSURANCE: 'Seguro', CLEANING: 'Limpieza',
  COMMISSION: 'Comisión', LEGAL: 'Gastos legales', ADMINISTRATION: 'Administración', OTHER: 'Otro',
};
export const priorityLabels: Record<Task['priority'], string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };
export const eventLabels: Record<CalendarEvent['eventType'], string> = {
  VIEWING: 'Visita', PAYMENT_DUE: 'Vencimiento de pago', MAINTENANCE: 'Mantenimiento',
  INSPECTION: 'Inspección', CONTRACT_END: 'Fin de contrato', REMINDER: 'Recordatorio', OTHER: 'Otro',
};
export const propertyLabel = (property: Pick<Property, 'id' | 'name' | 'address'>) =>
  `${property.name} · ${property.address} (#${property.id})`;
