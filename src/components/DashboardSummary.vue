<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore.js';
import { formatRupiah } from '../utils/currency.js';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next';

const store = useTransactionStore();

const balance = computed(() => store.balance);
const totalIncome = computed(() => store.totalIncome);
const totalExpense = computed(() => store.totalExpense);

const isBalancePositive = computed(() => balance.value >= 0);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
    <!-- Card 1: Total Saldo -->
    <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Total Saldo</span>
        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Wallet class="w-5 h-5" :stroke-width="2" />
        </div>
      </div>
      <div class="mt-4">
        <h3
          class="text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors"
          :class="isBalancePositive ? 'text-slate-900' : 'text-rose-600'"
        >
          {{ formatRupiah(balance) }}
        </h3>
        <p class="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span
            v-if="isBalancePositive"
            class="inline-flex items-center text-emerald-600 font-semibold"
          >
            Arus Kas Surplus
          </span>
          <span
            v-else
            class="inline-flex items-center text-rose-600 font-semibold"
          >
            Arus Kas Defisit
          </span>
          <span class="text-slate-400">• Saldo saat ini</span>
        </p>
      </div>
    </div>

    <!-- Card 2: Total Pemasukan -->
    <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Total Pemasukan</span>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <TrendingUp class="w-5 h-5" :stroke-width="2" />
        </div>
      </div>
      <div class="mt-4">
        <h3 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-emerald-600">
          {{ formatRupiah(totalIncome) }}
        </h3>
        <p class="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span class="inline-flex items-center text-emerald-600 font-semibold">
            <ArrowUpRight class="w-3.5 h-3.5 mr-0.5" />
            +Masuk
          </span>
          <span class="text-slate-400">• Seluruh pendapatan</span>
        </p>
      </div>
    </div>

    <!-- Card 3: Total Pengeluaran -->
    <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Total Pengeluaran</span>
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <TrendingDown class="w-5 h-5" :stroke-width="2" />
        </div>
      </div>
      <div class="mt-4">
        <h3 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-rose-600">
          {{ formatRupiah(totalExpense) }}
        </h3>
        <p class="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span class="inline-flex items-center text-rose-600 font-semibold">
            <ArrowDownRight class="w-3.5 h-3.5 mr-0.5" />
            -Keluar
          </span>
          <span class="text-slate-400">• Total biaya dibelanjakan</span>
        </p>
      </div>
    </div>
  </div>
</template>

