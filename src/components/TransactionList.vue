<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore.js';
import { formatRupiah } from '../utils/currency.js';
import { formatDateIndo, formatMonthYearIndo } from '../utils/date.js';
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  Inbox,
  Plus
} from 'lucide-vue-next';

const store = useTransactionStore();

const emit = defineEmits(['add-click', 'edit-click', 'delete-click']);

const currentType = computed(() => store.selectedType);
const currentMonth = computed(() => store.selectedMonth);
const availableMonths = computed(() => store.availableMonths);
const transactions = computed(() => store.filteredTransactions);

function setType(type) {
  store.setTypeFilter(type);
}

function onMonthChange(e) {
  store.setMonthFilter(e.target.value);
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs">
    <!-- Header with Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
      <div>
        <h3 class="text-base font-bold text-slate-800">
          Riwayat Transaksi
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Kelola seluruh pemasukan dan pengeluaran Anda
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Month Filter -->
        <div class="relative">
          <select
            :value="currentMonth"
            @change="onMonthChange"
            class="pl-8 pr-7 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-hidden transition cursor-pointer appearance-none"
            aria-label="Filter berdasarkan bulan"
          >
            <option value="all">Semua Bulan</option>
            <option v-for="m in availableMonths" :key="m" :value="m">
              {{ formatMonthYearIndo(m) }}
            </option>
          </select>
          <Calendar class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
        </div>

        <!-- Type Filter Pills -->
        <div class="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95',
              currentType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="setType('all')"
          >
            Semua
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95',
              currentType === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="setType('income')"
          >
            Pemasukan
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95',
              currentType === 'expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="setType('expense')"
          >
            Pengeluaran
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction List -->
    <div v-if="transactions.length > 0" class="mt-4 divide-y divide-slate-100">
      <div
        v-for="tx in transactions"
        :key="tx.id"
        class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 -mx-2 rounded-xl transition group"
      >
        <!-- Left: Icon + Category + Description + Date -->
        <div class="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
              tx.type === 'income'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            ]"
          >
            <ArrowUpRight v-if="tx.type === 'income'" class="w-5 h-5" :stroke-width="2.25" />
            <ArrowDownRight v-else class="w-5 h-5" :stroke-width="2.25" />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-800">
                {{ tx.category }}
              </span>
              <span
                :class="[
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  tx.type === 'income'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                ]"
              >
                {{ tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
              </span>
            </div>

            <p v-if="tx.description" class="text-xs text-slate-600 mt-0.5 truncate max-w-xs sm:max-w-md">
              {{ tx.description }}
            </p>

            <p class="text-[11px] text-slate-400 mt-0.5">
              {{ formatDateIndo(tx.date) }}
            </p>
          </div>
        </div>

        <!-- Right: Amount + Action Buttons -->
        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div class="text-left sm:text-right">
            <p
              :class="[
                'text-sm sm:text-base font-extrabold tracking-tight',
                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              ]"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatRupiah(tx.amount) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 sm:opacity-75 sm:group-hover:opacity-100 transition">
            <button
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition"
              @click="emit('edit-click', tx)"
              title="Edit transaksi"
              aria-label="Edit transaksi"
            >
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition"
              @click="emit('delete-click', tx)"
              title="Hapus transaksi"
              aria-label="Hapus transaksi"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="mt-6 flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-slate-50/70 border border-dashed border-slate-200"
    >
      <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-3">
        <Inbox class="w-6 h-6" :stroke-width="1.75" />
      </div>
      <h4 class="text-sm font-bold text-slate-800">
        Belum ada transaksi
      </h4>
      <p class="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
        Mulai catat pemasukan atau pengeluaran untuk melihat kondisi keuangan kamu.
      </p>
      <button
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition flex items-center gap-1.5"
        @click="emit('add-click')"
      >
        <Plus class="w-4 h-4" />
        Tambah Transaksi
      </button>
    </div>
  </div>
</template>
