import type { CalendarEvent, Expense, Income, Property, Task } from '@/types';

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

export function formatBalanceRatio(totalIncomes: number, balance: number) {
  if (totalIncomes <= 0) return 'No calculable';
  return new Intl.NumberFormat('es-ES', {
    style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(balance / totalIncomes);
}

export const incomeLabels: Record<Income['incomeType'], string> = {
  RENT: 'Alquiler', DEPOSIT: 'Fianza', LATE_FEE: 'Recargo por demora', OTHER: 'Otro',
};
export const paymentLabels: Record<Income['paymentMethod'], string> = {
  CASH: 'Efectivo', TRANSFER: 'Transferencia', CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito', CHECK: 'Cheque', OTHER: 'Otro',
};
export const categoryLabels: Record<Expense['category'], string> = {
  DEPOSIT_REFUND: 'Devolución de fianza', INVESTMENT: 'Inversión inicial', FINANCING: 'Cuota de financiación',
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

export const frequencyLabels = { WEEKLY: 'Semanal', MONTHLY: 'Mensual', QUARTERLY: 'Trimestral', YEARLY: 'Anual' };
export const occurrenceLabels = { PENDING: 'Pendiente', OVERDUE: 'Vencido', PARTIAL: 'Parcial', PAID: 'Completado' };
export const formatReturn = (value: number | null | undefined) => value == null ? 'Sin datos de inversión' : new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 2 }).format(value / 100);
export const formatDate = (value: string) => value.slice(0,10).split('-').reverse().join('/');
export const todayLocal = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; };
