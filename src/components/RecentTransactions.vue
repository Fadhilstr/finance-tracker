<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore.js';
import { formatRupiah } from '../utils/currency.js';
import { formatDateIndo } from '../utils/date.js';
import { ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-vue-next';

const store = useTransactionStore();

const emit = defineEmits(['add-click', 'view-all-click', 'item-click']);

const recentList = computed(() => store.recentTransactions);
</script>

<template>
  <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs flex flex-col h-full">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <Clock class="w-4 h-4 text-slate-500" />
          Transaksi Terbaru
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          5 catatan keuangan terkini
        </p>
      </div>

      <button
        v-if="recentList.length > 0"
        type="button"
        class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition"
        @click="emit('view-all-click')"
      >
        Lihat Semua
      </button>
    </div>

    <!-- List -->
    <div v-if="recentList.length > 0" class="mt-4 flex-1 divide-y divide-slate-100">
      <div
        v-for="tx in recentList"
        :key="tx.id"
        class="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 -mx-2 rounded-xl transition cursor-pointer"
        @click="emit('item-click', tx)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            :class="[
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
              tx.type === 'income'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            ]"
          >
            <ArrowUpRight v-if="tx.type === 'income'" class="w-4 h-4" :stroke-width="2.25" />
            <ArrowDownRight v-else class="w-4 h-4" :stroke-width="2.25" />
          </div>

          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800 truncate">
              {{ tx.category }}
            </p>
            <p v-if="tx.description" class="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
              {{ tx.description }}
            </p>
            <p class="text-[10px] text-slate-400">
              {{ formatDateIndo(tx.date) }}
            </p>
          </div>
        </div>

        <div class="text-right shrink-0">
          <p
            :class="[
              'text-xs sm:text-sm font-extrabold tracking-tight',
              tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
            ]"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatRupiah(tx.amount) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="mt-6 flex-1 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-slate-50/70 border border-dashed border-slate-200"
    >
      <p class="text-xs font-medium text-slate-500">
        Belum ada aktivitas transaksi.
      </p>
      <button
        type="button"
        class="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition flex items-center gap-1.5"
        @click="emit('add-click')"
      >
        <Plus class="w-3.5 h-3.5" />
        Tambah Baru
      </button>
    </div>
  </div>
</template>
