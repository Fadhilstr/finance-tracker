<script setup>
import { ref, onMounted } from 'vue';
import { useTransactionStore } from './stores/transactionStore.js';
import DashboardSummary from './components/DashboardSummary.vue';
import ExpensePieChart from './components/ExpensePieChart.vue';
import RecentTransactions from './components/RecentTransactions.vue';
import TransactionList from './components/TransactionList.vue';
import TransactionFormModal from './components/TransactionFormModal.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import DataBackupModal from './components/DataBackupModal.vue';
import {
  Plus,
  Database,
  Coins,
  AlertCircle
} from 'lucide-vue-next';

const store = useTransactionStore();

// Modals state
const isFormModalOpen = ref(false);
const transactionToEdit = ref(null);

const isConfirmDialogOpen = ref(false);
const transactionToDelete = ref(null);

const isBackupModalOpen = ref(false);

// Initialize database on mount
onMounted(async () => {
  await store.fetchTransactions();
});

// Modal triggers
function openAddModal() {
  transactionToEdit.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(tx) {
  transactionToEdit.value = { ...tx };
  isFormModalOpen.value = true;
}

function openDeleteDialog(tx) {
  transactionToDelete.value = tx;
  isConfirmDialogOpen.value = true;
}

async function confirmDelete() {
  if (transactionToDelete.value) {
    await store.deleteTransaction(transactionToDelete.value.id);
    transactionToDelete.value = null;
  }
  isConfirmDialogOpen.value = false;
}

function cancelDelete() {
  transactionToDelete.value = null;
  isConfirmDialogOpen.value = false;
}

function scrollToTransactions() {
  const el = document.getElementById('transaction-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-800">
    <!-- Top Navigation Bar -->
    <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Brand Logo & Title -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Coins class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-extrabold tracking-tight text-slate-900">
                Finora
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100/60">
                Offline First
              </span>
            </div>
            <p class="text-[11px] text-slate-500 leading-none">
              Persfin Personal Finance
            </p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition flex items-center gap-1.5"
            @click="isBackupModalOpen = true"
            title="Cadangkan atau pulihkan data"
          >
            <Database class="w-3.5 h-3.5 text-slate-500" />
            <span class="hidden sm:inline">Cadangan</span>
          </button>

          <button
            type="button"
            class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition flex items-center gap-1.5"
            @click="openAddModal"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Global Error Banner if any -->
    <div
      v-if="store.errorMessage"
      class="bg-rose-50 border-b border-rose-200 px-4 py-3 text-xs text-rose-700 flex items-center justify-between"
    >
      <div class="max-w-6xl mx-auto flex items-center gap-2 w-full">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ store.errorMessage }}</span>
        <button
          type="button"
          class="ml-auto underline font-semibold text-rose-800"
          @click="store.clearError()"
        >
          Tutup
        </button>
      </div>
    </div>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <!-- Section 1: Financial Summary Cards -->
      <section aria-label="Ringkasan Keuangan">
        <DashboardSummary />
      </section>

      <!-- Section 2: Visual Insights (Pie Chart) & Recent Activity -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" aria-label="Visualisasi dan Aktivitas">
        <!-- Expense Pie Chart (7 cols on lg) -->
        <div class="lg:col-span-7">
          <ExpensePieChart />
        </div>

        <!-- Recent Transactions (5 cols on lg) -->
        <div class="lg:col-span-5">
          <RecentTransactions
            @add-click="openAddModal"
            @view-all-click="scrollToTransactions"
            @item-click="openEditModal"
          />
        </div>
      </section>

      <!-- Section 3: Full Filterable Transaction List -->
      <section id="transaction-section" aria-label="Daftar Lengkap Transaksi">
        <TransactionList
          @add-click="openAddModal"
          @edit-click="openEditModal"
          @delete-click="openDeleteDialog"
        />
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-6 border-t border-slate-200/80 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          Finora — Aplikasi Pencatatan Keuangan Pribadi (100% Client-Side)
        </p>
        <p class="text-slate-400">
          Data tersimpan di browser Anda menggunakan IndexedDB
        </p>
      </div>
    </footer>

    <!-- Transaction Form Modal (Add / Edit) -->
    <TransactionFormModal
      :is-open="isFormModalOpen"
      :transaction-to-edit="transactionToEdit"
      @close="isFormModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      title="Hapus Transaksi"
      :message="transactionToDelete ? `Apakah Anda yakin ingin menghapus transaksi '${transactionToDelete.category}' sebesar Rp ${transactionToDelete.amount.toLocaleString('id-ID')}? Tindakan ini tidak dapat dibatalkan.` : 'Apakah Anda yakin ingin menghapus transaksi ini?'"
      confirm-text="Hapus Transaksi"
      cancel-text="Batal"
      :is-destructive="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Backup & Restore Modal -->
    <DataBackupModal
      :is-open="isBackupModalOpen"
      @close="isBackupModalOpen = false"
    />
  </div>
</template>

