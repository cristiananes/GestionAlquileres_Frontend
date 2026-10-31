import test from 'node:test';
import assert from 'node:assert/strict';
import { utilityMessage, utilityShareLinks } from '../src/lib/utility-messages.ts';
import { requiredBackendFeature, assertBackendFeature } from '../src/lib/backend-compatibility.ts';

test('a utility message contains only the selected recipient and no private download links', () => {
  const bill = { supply: 'Luz', provider: 'Proveedor', reference: 'A&B #1', propertyName: 'Piso', amount: 60, periodFrom: '2026-10-01', periodTo: '2026-10-31', dueDate: '2026-11-10', documentId: 123, shares: [{name:'Otra inquilina'}] };
  const message = utilityMessage(bill, {name:'Ana',room:'Habitación 1',amount:30,paid:10,pending:20});
  assert.match(message, /Ana/); assert.match(message, /Pendiente: 20,00/);
  assert.match(message, /01\/10\/2026 al 31\/10\/2026/);
  assert.doesNotMatch(message, /Otra inquilina|123|https?:|\/documents/);
  const links = utilityShareLinks(message, 'ana+alquiler@example.com', '+34 600 123 456');
  const whatsapp = new URL(links.whatsapp);
  assert.equal(whatsapp.pathname, '/34600123456'); assert.equal(whatsapp.searchParams.get('text'), message);
  assert.match(links.email, /^mailto:ana%2Balquiler%40example.com\?/);
  assert.equal(new URLSearchParams(links.email.split('?')[1]).get('body'), message);
});

test('every utility operation requires its own capability, including writes and restores', () => {
  for (const [url,method] of [['/utility-bills','get'],['/utility-bills/preview','post'],['/utility-bills/1/shares/2/payments','post'],['/utility-bills/1/restore','post']]) assert.equal(requiredBackendFeature(url,method), 'utility-bills');
  assert.throws(() => assertBackendFeature({apiVersion:2,features:['safe-writes','soft-archive']},'utility-bills'));
});
