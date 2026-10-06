import { defineStore } from 'pinia';
import { db } from '../db/database.js';
import { getCurrentMonthString } from '../utils/date.js';

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    isLoading: false,
    errorMessage: null,
    // Filters
    selectedType: 'all', // 'all' | 'income' | 'expense'
    selectedMonth: getCurrentMonthString(), // 'all' or 'YYYY-MM', default to current month
  }),

  getters: {
    /**
     * Transactions filtered by the selected month (used for monthly summary & chart).
     */
    monthlyTransactions: (state) => {
      if (state.selectedMonth === 'all') {
        return state.transactions;
      }
      return state.transactions.filter(t => t.date && t.date.startsWith(state.selectedMonth));
    },

    /**
     * Transactions filtered by both month and type (used for transaction list view).
     */
    filteredTransactions: (state) => {
      let list = state.transactions;

      // Filter by month
      if (state.selectedMonth !== 'all') {
        list = list.filter(t => t.date && t.date.startsWith(state.selectedMonth));
      }

      // Filter by type
      if (state.selectedType !== 'all') {
        list = list.filter(t => t.type === state.selectedType);
      }

      return list;
    },

    /**
     * Recent transactions (last 5 most recent across all or active month).
     */
    recentTransactions: (state) => {
      return [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date) || (b.createdAt > a.createdAt ? 1 : -1))
        .slice(0, 5);
    },

    /**
     * Total Income for the current active filter view.
     */
    totalIncome: (state) => {
      const source = state.selectedMonth === 'all' 
        ? state.transactions 
        : state.transactions.filter(t => t.date && t.date.startsWith(state.selectedMonth));
      return source
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    /**
     * Total Expense for the current active filter view.
     */
    totalExpense: (state) => {
      const source = state.selectedMonth === 'all' 
        ? state.transactions 
        : state.transactions.filter(t => t.date && t.date.startsWith(state.selectedMonth));
      return source
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    /**
     * Balance (Income - Expense).
     */
    balance: (state) => {
      const source = state.selectedMonth === 'all' 
        ? state.transactions 
        : state.transactions.filter(t => t.date && t.date.startsWith(state.selectedMonth));
      const income = source.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = source.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return income - expense;
    },

    /**
     * Breakdown of expenses by category for the pie chart.
     * Returns an array: [{ category: string, total: number, percentage: number }]
     */
    expenseByCategory: (state) => {
      const source = state.selectedMonth === 'all' 
        ? state.transactions 
        : state.transactions.filter(t => t.date && t.date.startsWith(state.selectedMonth));
      
      const expenseItems = source.filter(t => t.type === 'expense');
      const totalExpenseSum = expenseItems.reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const categoryMap = {};
      for (const item of expenseItems) {
        const cat = item.category || 'Lainnya';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.amount || 0);
      }

      const result = Object.entries(categoryMap).map(([category, total]) => ({
        category,
        total,
        percentage: totalExpenseSum > 0 ? Math.round((total / totalExpenseSum) * 100) : 0
      }));

      // Sort descending by total amount
      return result.sort((a, b) => b.total - a.total);
    },

    /**
     * Unique months extracted from transaction dates, combined with current month.
     */
    availableMonths: (state) => {
      const set = new Set();
      set.add(getCurrentMonthString());
      for (const t of state.transactions) {
        if (t.date && t.date.length >= 7) {
          set.add(t.date.substring(0, 7));
        }
      }
      return Array.from(set).sort().reverse();
    },

    /**
     * Returns true if there is at least one transaction in database.
     */
    hasTransactions: (state) => {
      return state.transactions.length > 0;
    }
  },

  actions: {
    /**
     * Load all transactions from IndexedDB.
     */
    async fetchTransactions() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const all = await db.transactions.toArray();
        // Sort descending: by date first, then by createdAt
        all.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);
          if (dateDiff !== 0) return dateDiff;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        this.transactions = all;
      } catch (err) {
        console.error('Failed to load transactions from IndexedDB:', err);
        this.errorMessage = 'Gagal memuat data keuangan dari penyimpanan lokal browser.';
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Add a new transaction.
     */
    async addTransaction(payload) {
      this.errorMessage = null;
      try {
        const newRecord = {
          type: payload.type,
          amount: Number(payload.amount),
          category: payload.category.trim(),
          description: (payload.description || '').trim(),
          date: payload.date,
          createdAt: new Date().toISOString()
        };

        const id = await db.transactions.add(newRecord);
        newRecord.id = id;

        // Insert at right sorted position
        this.transactions.unshift(newRecord);
        this.transactions.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);
          if (dateDiff !== 0) return dateDiff;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        return newRecord;
      } catch (err) {
        console.error('Failed to add transaction:', err);
        this.errorMessage = 'Gagal menyimpan transaksi ke database lokal.';
        throw err;
      }
    },

    /**
     * Update an existing transaction.
     */
    async updateTransaction(id, payload) {
      this.errorMessage = null;
      try {
        const updatedFields = {
          type: payload.type,
          amount: Number(payload.amount),
          category: payload.category.trim(),
          description: (payload.description || '').trim(),
          date: payload.date
        };

        await db.transactions.update(id, updatedFields);

        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            ...updatedFields
          };
          this.transactions.sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) return dateDiff;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
          });
        }
      } catch (err) {
        console.error('Failed to update transaction:', err);
        this.errorMessage = 'Gagal memperbarui transaksi di database lokal.';
        throw err;
      }
    },

    /**
     * Delete a transaction by ID.
     */
    async deleteTransaction(id) {
      this.errorMessage = null;
      try {
        await db.transactions.delete(id);
        this.transactions = this.transactions.filter(t => t.id !== id);
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        this.errorMessage = 'Gagal menghapus transaksi dari database lokal.';
        throw err;
      }
    },

    /**
     * Set type filter.
     */
    setTypeFilter(type) {
      this.selectedType = type;
    },

    /**
     * Set month filter.
     */
    setMonthFilter(month) {
      this.selectedMonth = month;
    },

    /**
     * Clear error state.
     */
    clearError() {
      this.errorMessage = null;
    },

    /**
     * Export all transactions to JSON data object.
     */
    exportData() {
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        transactions: this.transactions.map(t => ({
          type: t.type,
          amount: Number(t.amount),
          category: t.category,
          description: t.description || '',
          date: t.date,
          createdAt: t.createdAt || new Date().toISOString()
        }))
      };
    },

    /**
     * Import transactions from JSON object.
     */
    async importData(importedData) {
      this.errorMessage = null;
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Format file JSON tidak valid.');
      }
      if (!Array.isArray(importedData.transactions)) {
        throw new Error('Data transaksi tidak ditemukan dalam file JSON.');
      }

      // Validate each transaction
      const validItems = [];
      for (const item of importedData.transactions) {
        if (!['income', 'expense'].includes(item.type)) {
          throw new Error(`Tipe transaksi tidak valid: ${item.type}`);
        }
        const amt = Number(item.amount);
        if (isNaN(amt) || amt <= 0) {
          throw new Error(`Nominal transaksi tidak valid: ${item.amount}`);
        }
        if (!item.category || typeof item.category !== 'string') {
          throw new Error('Kategori transaksi wajib diisi.');
        }
        if (!item.date || typeof item.date !== 'string') {
          throw new Error('Format tanggal transaksi tidak valid.');
        }

        validItems.push({
          type: item.type,
          amount: amt,
          category: item.category.trim(),
          description: (item.description || '').trim(),
          date: item.date,
          createdAt: item.createdAt || new Date().toISOString()
        });
      }

      try {
        // Clear existing transactions and insert imported records
        await db.transactions.clear();
        await db.transactions.bulkAdd(validItems);
        await this.fetchTransactions();
      } catch (err) {
        console.error('Failed to import transactions:', err);
        this.errorMessage = 'Gagal mengimpor data ke IndexedDB.';
        throw err;
      }
    }
  }
});
