import test from 'node:test';
import assert from 'node:assert/strict';
import { periodRange, inDateRange, invalidRange } from '../src/lib/period.ts';
import { formatBalanceRatio, formatCurrency, propertyLabel, incomeLabels, paymentLabels } from '../src/lib/presentation.ts';

test('periods include the entire local month, including leap day', () => {
  assert.deepEqual(periodRange('month', new Date(2024, 1, 15)), { from: '2024-02-01', to: '2024-02-29' });
  assert.deepEqual(periodRange('year', new Date(2026, 9, 29)), { from: '2026-01-01', to: '2026-12-31' });
  assert.deepEqual(periodRange('all'), { from: '', to: '' });
});

test('date filters are inclusive and allow either boundary', () => {
  assert.equal(inDateRange('2026-10-01', { from: '2026-10-01', to: '2026-10-31' }), true);
  assert.equal(inDateRange('2026-10-31', { from: '2026-10-01', to: '2026-10-31' }), true);
  assert.equal(inDateRange('2026-09-30', { from: '2026-10-01', to: '' }), false);
  assert.equal(inDateRange('2026-11-01', { from: '', to: '2026-10-31' }), false);
  assert.equal(invalidRange({ from: '2026-11-01', to: '2026-10-01' }), true);
});

test('amounts use Spanish euros, including decimal and negative amounts', () => {
  assert.match(formatCurrency(870.5), /^870,50\s€$/);
  assert.match(formatCurrency(-10), /^-10,00\s€$/);
  assert.equal(incomeLabels.RENT, 'Alquiler');
  assert.equal(paymentLabels.TRANSFER, 'Transferencia');
});

test('same-name properties remain distinguishable even at the same address', () => {
  const property = { name: 'Piso', address: 'Calle Mayor 1' };
  assert.notEqual(propertyLabel({ ...property, id: 1 }), propertyLabel({ ...property, id: 2 }));
});

test('balance ratio has no value without positive income and uses Spanish percentages', () => {
  assert.equal(formatBalanceRatio(0, -10), 'No calculable');
  assert.equal(formatBalanceRatio(0, 0), 'No calculable');
  assert.equal(formatBalanceRatio(-10, -20), 'No calculable');
  assert.match(formatBalanceRatio(870, 860), /^98,9\s%$/);
  assert.match(formatBalanceRatio(100, -10), /^-10,0\s%$/);
});
