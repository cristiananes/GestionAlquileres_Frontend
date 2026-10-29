export interface DateRange { from: string; to: string }
export type Period = 'all' | 'month' | 'year' | 'custom';

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function periodRange(period: Period, now = new Date()): DateRange {
  const year = now.getFullYear();
  if (period === 'month') return {
    from: dateString(new Date(year, now.getMonth(), 1)),
    to: dateString(new Date(year, now.getMonth() + 1, 0)),
  };
  if (period === 'year') return { from: `${year}-01-01`, to: `${year}-12-31` };
  return { from: '', to: '' };
}

export const invalidRange = ({ from, to }: DateRange) => Boolean(from && to && from > to);
export const inDateRange = (date: string, { from, to }: DateRange) =>
  (!from || date.slice(0, 10) >= from) && (!to || date.slice(0, 10) <= to);
