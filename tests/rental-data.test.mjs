import test from 'node:test';
import assert from 'node:assert/strict';
import { occupancyRecipients, settlementCandidates } from '../src/lib/rental-data.ts';
import { requiredBackendFeature } from '../src/lib/backend-compatibility.ts';
test('room imports preserve actual room and occupancy rather than assigning by list position',()=>{
 const leases=[{tenantName:'Ana',startDate:'2026-01-01',endDate:null,occupancyFrom:'2026-10-15',occupancyTo:'2026-10-20',rentalScope:'ROOM',roomName:'Azul',roomNumber:5},{tenantName:'Piso entero',startDate:'2026-01-01',endDate:null,rentalScope:'ENTIRE_PROPERTY'},{tenantName:'Viejo',startDate:'2026-01-01',endDate:'2026-09-30',rentalScope:'ROOM',roomNumber:2}];
 const r=occupancyRecipients(leases,'2026-10-01','2026-10-31','DAYS');assert.equal(r.length,1);assert.equal(r[0].roomNumber,5);assert.equal(r[0].room,'Azul');assert.equal(r[0].from,'2026-10-15');assert.equal(r[0].to,'2026-10-20');
 assert.equal(occupancyRecipients(leases,'2026-10-21','2026-10-31','DAYS').length,0);
});
test('settlement selection excludes deposits, frozen cash, generated fees and archived movements',()=>{
 const incomes=[{id:1,incomeType:'RENT',incomeDate:'2026-10-01'},{id:2,incomeType:'DEPOSIT',incomeDate:'2026-10-01'},{id:3,incomeType:'UTILITY_REIMBURSEMENT',incomeDate:'2026-10-31'},{id:4,incomeType:'OTHER',incomeDate:'2026-10-01',archived:true}];
 const expenses=[{id:1,category:'COMMISSION',expenseDate:'2026-10-01',ownerSettlementId:7},{id:2,category:'DEPOSIT_REFUND',expenseDate:'2026-10-01'},{id:3,category:'UTILITIES',expenseDate:'2026-10-31'}];
 const statement={status:'CONFIRMED',lines:[{kind:'INCOME',movementId:1}]};
 const r=settlementCandidates(incomes,expenses,[statement],'2026-10-01','2026-10-31');assert.deepEqual(r.incomes.map(i=>i.id),[3]);assert.deepEqual(r.expenses.map(e=>e.id),[3]);
 assert.deepEqual(settlementCandidates(incomes,expenses,[{...statement,status:'CANCELLED'}],'2026-10-01','2026-10-31').incomes.map(i=>i.id),[1,3]);
});
test('room assignments, new contracts and every settlement operation require their own capability',()=>{
 for(const url of ['/properties/1/rooms','/properties/1/rooms/2/restore','/leases/1/occupancy','/properties/1/leases'])assert.equal(requiredBackendFeature(url,'post'),'rooms');
 for(const url of ['/properties/1/management','/properties/1/settlements','/settlements/preview','/settlements/1/paid'])assert.equal(requiredBackendFeature(url,'post'),'owner-settlements');
});
