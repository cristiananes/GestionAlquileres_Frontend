import type { UtilityBill, UtilityShare } from '@/types';
const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = (value: string) => value.slice(0,10).split('-').reverse().join('/');
export function utilityMessage(bill: UtilityBill, share: UtilityShare): string {
  return `Hola, ${share.name}.\n\nRecibo de ${bill.supply} · ${bill.provider}\nReferencia: ${bill.reference}\nPropiedad: ${bill.propertyName}${share.room ? ` · ${share.room}` : ''}\nPeriodo: ${formatDate(bill.periodFrom)} al ${formatDate(bill.periodTo)}\nTotal del recibo: ${formatCurrency(bill.amount)}\nTu parte: ${formatCurrency(share.amount)}\nPagado: ${formatCurrency(share.paid)}\nPendiente: ${formatCurrency(share.pending)}\nFecha solicitada de pago: ${formatDate(bill.dueDate)}\n\nSi necesitas el justificante, te lo comparto por separado. Gracias.`;
}
// Share only this recipient's text; never expose a public document URL or other tenants.
export function utilityShareLinks(message: string, email: string, phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  return {
    whatsapp: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
    email: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Reparto de suministros')}&body=${encodeURIComponent(message)}`,
  };
}
