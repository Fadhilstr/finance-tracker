<script setup>
import { ref } from 'vue';
import { useTransactionStore } from '../stores/transactionStore.js';
import { getCurrentDateString } from '../utils/date.js';
import {
  X,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileJson,
  ShieldCheck
} from 'lucide-vue-next';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'import-success']);
const store = useTransactionStore();

const fileInputRef = ref(null);
const errorMessage = ref('');
const successMessage = ref('');
const isProcessing = ref(false);

function triggerFileInput() {
  errorMessage.value = '';
  successMessage.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
}

function handleExport() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const data = store.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-backup-${getCurrentDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    successMessage.value = `Berhasil mengekspor ${data.transactions.length} transaksi ke file JSON!`;
  } catch (err) {
    console.error('Export error:', err);
    errorMessage.value = 'Gagal membuat file export: ' + err.message;
  }
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  errorMessage.value = '';
  successMessage.value = '';
  isProcessing.value = true;

  try {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('File bukan merupakan format JSON yang valid.');
    }

    await store.importData(parsed);
    successMessage.value = `Berhasil mengimpor ${parsed.transactions.length} transaksi ke IndexedDB!`;
    emit('import-success');
  } catch (err) {
    console.error('Import error:', err);
    errorMessage.value = 'Gagal mengimpor data: ' + err.message;
  } finally {
    isProcessing.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close');
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      @keydown="handleKeydown"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div
        class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileJson class="w-5 h-5 text-emerald-600" />
              Cadangkan & Pulihkan Data
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Kelola data keuangan lokal browser Anda
            </p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
            @click="emit('close')"
            aria-label="Tutup modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Feedback Alert Messages -->
        <div v-if="successMessage" class="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          {{ errorMessage }}
        </div>

        <!-- Body Content -->
        <div class="mt-5 space-y-4">
          <!-- Export Section -->
          <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ekspor Data (JSON)
            </h4>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Unduh seluruh catatan transaksi Finora ke dalam berkas JSON untuk disimpan secara aman di komputer Anda.
            </p>
            <button
              type="button"
              class="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold shadow-2xs active:scale-98 transition flex items-center justify-center gap-2"
              @click="handleExport"
            >
              <Download class="w-4 h-4 text-slate-600" />
              Unduh Berkas Cadangan (.json)
            </button>
          </div>

          <!-- Import Section -->
          <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Impor Data (JSON)
            </h4>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Pulihkan catatan transaksi dari berkas cadangan JSON yang telah Anda simpan sebelumnya.
            </p>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,application/json"
              class="hidden"
              @change="handleFileSelected"
            />
            <button
              type="button"
              :disabled="isProcessing"
              class="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              @click="triggerFileInput"
            >
              <Upload class="w-4 h-4" />
              {{ isProcessing ? 'Memproses Berkas...' : 'Pilih Berkas Cadangan (.json)' }}
            </button>
          </div>

          <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% data tersimpan lokal di browser Anda tanpa server eksternal.</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            @click="emit('close')"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
