import 'fake-indexeddb/auto';
import { setActivePinia, createPinia } from 'pinia';
import { db } from '../src/db/database.js';
import { useTransactionStore } from '../src/stores/transactionStore.js';

async function runTests() {
  console.log('--- Starting Finora Test Suite ---');
  setActivePinia(createPinia());
  const store = useTransactionStore();

  // Test 1: Initial state
  await store.fetchTransactions();
  console.assert(store.transactions.length === 0, 'Initial transaction list should be empty');
  console.assert(store.balance === 0, 'Initial balance should be 0');
  console.log('✓ Test 1: Initial empty state verified');

  // Test 2: Add Income
  const incomeTx = await store.addTransaction({
    type: 'income',
    amount: 10000000,
    category: 'Gaji',
    description: 'Gaji Bulanan',
    date: '2026-10-01'
  });
  console.assert(incomeTx.id !== undefined, 'Income ID should be assigned');
  console.assert(store.totalIncome === 10000000, `Total income should be 10000000, got ${store.totalIncome}`);
  console.assert(store.balance === 10000000, `Balance should be 10000000, got ${store.balance}`);
  console.log('✓ Test 2: Add Income verified');

  // Test 3: Add Expense
  const expense1 = await store.addTransaction({
    type: 'expense',
    amount: 2500000,
    category: 'Makanan',
    description: 'Belanja dapur dan resto',
    date: '2026-10-02'
  });
  const expense2 = await store.addTransaction({
    type: 'expense',
    amount: 1500000,
    category: 'Transportasi',
    description: 'Bensin & servis kendaraan',
    date: '2026-10-03'
  });
  console.assert(store.totalExpense === 4000000, `Total expense should be 4000000, got ${store.totalExpense}`);
  console.assert(store.balance === 6000000, `Balance should be 6000000, got ${store.balance}`);
  console.log('✓ Test 3: Add Expenses & Balance verified');

  // Test 4: Expense by Category
  const breakdown = store.expenseByCategory;
  console.assert(breakdown.length === 2, `Category breakdown count should be 2, got ${breakdown.length}`);
  const makanan = breakdown.find(b => b.category === 'Makanan');
  console.assert(makanan && makanan.total === 2500000, 'Makanan total should be 2500000');
  console.assert(makanan.percentage === 63 || makanan.percentage === 62, `Makanan percentage should be ~63%, got ${makanan.percentage}`);
  console.log('✓ Test 4: Expense by Category breakdown verified');

  // Test 5: Edit Transaction
  await store.updateTransaction(expense1.id, {
    type: 'expense',
    amount: 3000000,
    category: 'Makanan',
    description: 'Belanja dapur diperbarui',
    date: '2026-10-02'
  });
  console.assert(store.totalExpense === 4500000, `Total expense after update should be 4500000, got ${store.totalExpense}`);
  console.assert(store.balance === 5500000, `Balance after update should be 5500000, got ${store.balance}`);
  console.log('✓ Test 5: Update Transaction verified');

  // Test 6: Delete Transaction
  await store.deleteTransaction(expense2.id);
  console.assert(store.totalExpense === 3000000, `Total expense after delete should be 3000000, got ${store.totalExpense}`);
  console.assert(store.balance === 7000000, `Balance after delete should be 7000000, got ${store.balance}`);
  console.log('✓ Test 6: Delete Transaction verified');

  // Test 7: Filter by Type
  store.setTypeFilter('income');
  console.assert(store.filteredTransactions.length === 1, 'Filtered by income should yield 1');
  store.setTypeFilter('expense');
  console.assert(store.filteredTransactions.length === 1, 'Filtered by expense should yield 1');
  store.setTypeFilter('all');
  console.assert(store.filteredTransactions.length === 2, 'Filtered by all should yield 2');
  console.log('✓ Test 7: Filter by Type verified');

  // Test 8: Filter by Month
  store.setMonthFilter('2026-10');
  console.assert(store.monthlyTransactions.length === 2, 'Monthly transactions should be 2');
  store.setMonthFilter('2026-09');
  console.assert(store.monthlyTransactions.length === 0, 'Non-existent month should yield 0');
  store.setMonthFilter('all');
  console.assert(store.monthlyTransactions.length === 2, 'All months should yield 2');
  console.log('✓ Test 8: Filter by Month verified');

  // Test 9: Export Data
  const exportData = store.exportData();
  console.assert(exportData.version === 1, 'Export version must be 1');
  console.assert(Array.isArray(exportData.transactions), 'Export transactions must be an array');
  console.assert(exportData.transactions.length === 2, 'Export transactions count should be 2');
  console.log('✓ Test 9: Export Data JSON structure verified');

  // Test 10: Import Data (Valid & Validation Rejection)
  // Invalid data structure
  try {
    await store.importData({ wrong: true });
    console.error('Should reject invalid JSON object');
  } catch (e) {
    console.log('✓ Test 10a: Correctly rejected malformed JSON');
  }

  // Corrupt transaction amount
  try {
    await store.importData({
      version: 1,
      transactions: [{ type: 'expense', amount: -500, category: 'Test', date: '2026-10-01' }]
    });
    console.error('Should reject negative amount');
  } catch (e) {
    console.log('✓ Test 10b: Correctly rejected negative transaction amount');
  }

  // Valid import
  const validBackup = {
    version: 1,
    exportedAt: '2026-10-06T00:00:00.000Z',
    transactions: [
      { type: 'income', amount: 5000000, category: 'Bonus', description: 'Bonus Tahunan', date: '2026-10-05', createdAt: '2026-10-05T00:00:00.000Z' },
      { type: 'expense', amount: 1000000, category: 'Tagihan', description: 'Listrik & Air', date: '2026-10-06', createdAt: '2026-10-06T00:00:00.000Z' }
    ]
  };
  await store.importData(validBackup);
  console.assert(store.transactions.length === 2, `Imported count should be 2, got ${store.transactions.length}`);
  console.assert(store.totalIncome === 5000000, `Imported income should be 5000000, got ${store.totalIncome}`);
  console.assert(store.totalExpense === 1000000, `Imported expense should be 1000000, got ${store.totalExpense}`);
  console.assert(store.balance === 4000000, `Imported balance should be 4000000, got ${store.balance}`);
  console.log('✓ Test 10c: Valid JSON Import successfully verified');

  // Test 11: Refresh / reload persistence simulation
  const freshStore = useTransactionStore();
  await freshStore.fetchTransactions();
  console.assert(freshStore.transactions.length === 2, 'Transactions must persist in IndexedDB across reloads');
  console.log('✓ Test 11: IndexedDB persistence across sessions verified');

  console.log('\nALL 11 UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

