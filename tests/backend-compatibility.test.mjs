import test from 'node:test';
import assert from 'node:assert/strict';
import { BackendCompatibilityError, assertBackendFeature, requiredBackendFeature, requireBackendFeature, confirmedArchivedEntries } from '../src/lib/backend-compatibility.ts';

test('legacy list responses are never treated as proof of archive state', () => {
  assert.throws(() => confirmedArchivedEntries([{ id: 1, description: 'Active income' }]), BackendCompatibilityError);
  assert.throws(() => confirmedArchivedEntries([{ id: 1, archived: false }]), BackendCompatibilityError);
  assert.deepEqual(confirmedArchivedEntries([{ id: 1, archived: true }]), [{ id: 1, archived: true }]);
  assert.deepEqual(confirmedArchivedEntries([]), []);
});

test('a failed legacy capability probe stops the write before dispatch', async () => {
  let dispatched = false;
  await assert.rejects(async () => {
    await requireBackendFeature(async () => { throw { response: { status: 500, data: { error: 'Internal server error: No static resource api/capabilities' } } }; }, 'soft-archive');
    dispatched = true;
  }, BackendCompatibilityError);
  assert.equal(dispatched, false);
});

test('destructive actions, restores, filtered reports and new sections are gated', () => {
  assert.equal(requiredBackendFeature('/incomes/1', 'delete'), 'soft-archive');
  assert.equal(requiredBackendFeature('/properties/1/restore', 'post'), 'soft-archive');
  assert.equal(requiredBackendFeature('/incomes/1/archive', 'post'), 'soft-archive');
  assert.equal(requiredBackendFeature('/incomes', 'get', true), 'soft-archive');
  assert.equal(requiredBackendFeature('/incomes', 'post'), 'safe-writes');
  assert.equal(requiredBackendFeature('/properties/1/investment'), 'investment');
  assert.equal(requiredBackendFeature('/properties/1/documents'), 'documents');
  assert.equal(requiredBackendFeature('/properties/1/leases'), 'leases');
  assert.equal(requiredBackendFeature('/recurrences/occurrences'), 'recurrences');
  assert.equal(requiredBackendFeature('/reports/incomes'), 'filtered-reports');
  assert.equal(requiredBackendFeature('/auth/login', 'post'), null);
  assert.equal(requiredBackendFeature('/capabilities'), null);
  assert.equal(requiredBackendFeature('/incomes'), null);
});

test('a failed probe can recover after deployment; network failures retain their cause', async () => {
  let value = {};
  const read = async () => value;
  await assert.rejects(() => requireBackendFeature(read, 'soft-archive'), BackendCompatibilityError);
  value = { apiVersion: 2, features: ['soft-archive'] };
  await requireBackendFeature(read, 'soft-archive');
  assert.throws(() => assertBackendFeature(value, 'investment'), BackendCompatibilityError);
  const network = new Error('Network disconnected');
  await assert.rejects(() => requireBackendFeature(async () => { throw network; }, 'soft-archive'), e => e === network);
});
