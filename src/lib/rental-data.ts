import type { Income, Expense, Lease, OwnerSettlement, UtilityBillForm, UtilityRecipient } from '@/types';
export function occupancyRecipients(leases: Lease[], from: string, to: string, method: UtilityBillForm['method']): UtilityRecipient[] {
  return leases.filter(l => !l.archived && (l.occupancyFrom || l.startDate) <= to && (!(l.occupancyTo || l.endDate) || (l.occupancyTo || l.endDate)! >= from) && (method !== 'DAYS' || l.rentalScope === 'ROOM'))
    .map(l => ({ name: l.tenantName.slice(0,120), email: l.tenantEmail || '', phone: l.tenantPhone || '', room: l.roomName || (l.rentalScope === 'ENTIRE_PROPERTY' ? 'Piso completo' : ''), roomNumber: l.roomNumber ?? null, from: l.occupancyFrom || l.startDate, to: l.occupancyTo || l.endDate || to, percent: null, owner: false }));
}
export function settlementCandidates(incomes: Income[], expenses: Expense[], settlements: OwnerSettlement[], from: string, to: string) {
  const used = new Set(settlements.filter(s => s.status !== 'CANCELLED').flatMap(s => s.lines.map(l => `${l.kind}:${l.movementId}`)));
  return {
    incomes: incomes.filter(i => !i.archived && i.incomeType !== 'DEPOSIT' && i.incomeDate >= from && i.incomeDate <= to && !used.has(`INCOME:${i.id}`)),
    expenses: expenses.filter(e => !e.archived && e.category !== 'DEPOSIT_REFUND' && !e.ownerSettlementId && e.expenseDate >= from && e.expenseDate <= to && !used.has(`EXPENSE:${e.id}`)),
  };
}
