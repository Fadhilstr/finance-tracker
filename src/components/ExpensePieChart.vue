<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useTransactionStore } from '../stores/transactionStore.js';
import { formatRupiah } from '../utils/currency.js';
import { CATEGORY_COLORS } from '../db/database.js';
import { PieChart as PieIcon, Info } from 'lucide-vue-next';

Chart.register(...registerables);

const store = useTransactionStore();
const chartCanvas = ref(null);
let chartInstance = null;

const expenseData = computed(() => store.expenseByCategory);
const hasExpense = computed(() => expenseData.value.length > 0);

// Default palette fallback generator for unknown categories
function getCategoryColor(category, index) {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  const fallbackColors = ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
  return fallbackColors[index % fallbackColors.length];
}

function initChart() {
  if (!chartCanvas.value || !hasExpense.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const labels = expenseData.value.map(d => d.category);
  const data = expenseData.value.map(d => d.total);
  const backgroundColors = expenseData.value.map((d, i) => getCategoryColor(d.category, i));

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = backgroundColors;
    chartInstance.update('active');
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // We render our own polished, accessible, responsive list legend!
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '600' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label(context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ${context.label}: ${formatRupiah(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '10%' // Slight donut feel or full pie (subtle inner border)
    }
  });
}

// Watch data updates reactively
watch(
  () => store.expenseByCategory,
  async () => {
    await nextTick();
    initChart();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <div class="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs flex flex-col h-full">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <PieIcon class="w-4 h-4 text-slate-500" />
          Komposisi Pengeluaran
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Distribusi pengeluaran berdasarkan kategori
        </p>
      </div>
      <span
        v-if="hasExpense"
        class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
      >
        {{ expenseData.length }} Kategori
      </span>
    </div>

    <!-- State when expenses exist -->
    <div v-if="hasExpense" class="mt-4 flex-1 flex flex-col md:flex-row items-center gap-6">
      <!-- Chart Area -->
      <div class="relative w-full md:w-1/2 h-56 sm:h-64 flex items-center justify-center">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Legend & Breakdown List -->
      <div class="w-full md:w-1/2 flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="(item, index) in expenseData"
          :key="item.category"
          class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              :style="{ backgroundColor: getCategoryColor(item.category, index) }"
            ></span>
            <div class="truncate">
              <p class="text-xs font-semibold text-slate-800 truncate">
                {{ item.category }}
              </p>
              <p class="text-[11px] text-slate-400">
                {{ item.percentage }}% dari total
              </p>
            </div>
          </div>
          <span class="text-xs font-bold text-slate-700 shrink-0 ml-2">
            {{ formatRupiah(item.total) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State for Pie Chart -->
    <div
      v-else
      class="mt-6 flex-1 flex flex-col items-center justify-center text-center p-8 rounded-xl bg-slate-50/70 border border-dashed border-slate-200"
    >
      <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-3">
        <PieIcon class="w-6 h-6" :stroke-width="1.75" />
      </div>
      <h4 class="text-sm font-bold text-slate-700">
        Belum Ada Data Pengeluaran
      </h4>
      <p class="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
        Belum ada transaksi pengeluaran pada periode ini. Tambahkan pengeluaran untuk melihat visualisasi kategori.
      </p>
    </div>
  </div>
</template>
