<script setup>
import { ref, computed, watch } from 'vue';
import { useTransactionStore } from '../stores/transactionStore.js';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../db/database.js';
import { getCurrentDateString } from '../utils/date.js';
import { formatRupiah, parseRupiah } from '../utils/currency.js';
import { X, ArrowUpCircle, ArrowDownCircle, Check, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  transactionToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const store = useTransactionStore();

const isEditMode = computed(() => !!props.transactionToEdit);

// Form state
const type = ref('expense'); // 'income' | 'expense'
const rawAmount = ref(''); // formatted string or user input
const category = ref('');
const date = ref(getCurrentDateString());
const description = ref('');
const isSubmitting = ref(false);

// Validation errors
const errors = ref({
  amount: '',
  category: '',
  date: ''
});

// Category options depending on selected type
const availableCategories = computed(() => {
  return type.value === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
});

// Parsed numeric amount
const numericAmount = computed(() => parseRupiah(rawAmount.value));

// Formatted amount preview
const formattedPreview = computed(() => {
  if (!numericAmount.value) return '';
  return formatRupiah(numericAmount.value);
});

// Sync form with edit data or reset to default
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errors.value = { amount: '', category: '', date: '' };
      if (props.transactionToEdit) {
        type.value = props.transactionToEdit.type || 'expense';
        rawAmount.value = String(props.transactionToEdit.amount || '');
        category.value = props.transactionToEdit.category || '';
        date.value = props.transactionToEdit.date || getCurrentDateString();
        description.value = props.transactionToEdit.description || '';
      } else {
        type.value = 'expense';
        rawAmount.value = '';
        category.value = DEFAULT_EXPENSE_CATEGORIES[0];
        date.value = getCurrentDateString();
        description.value = '';
      }
    }
  },
  { immediate: true }
);

// When type changes, ensure valid category selection
watch(type, (newType) => {
  const options = newType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  if (!options.includes(category.value)) {
    category.value = options[0];
  }
});

function handleAmountInput(e) {
  const val = e.target.value;
  const digits = val.replace(/[^\d]/g, '');
  rawAmount.value = digits;
  if (errors.value.amount) errors.value.amount = '';
}

function validate() {
  let isValid = true;
  errors.value = { amount: '', category: '', date: '' };

  if (!rawAmount.value || numericAmount.value <= 0) {
    errors.value.amount = 'Nominal harus lebih dari 0.';
    isValid = false;
  }

  if (!category.value || !category.value.trim()) {
    errors.value.category = 'Kategori wajib dipilih.';
    isValid = false;
  }

  if (!date.value) {
    errors.value.date = 'Tanggal transaksi wajib diisi.';
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const payload = {
      type: type.value,
      amount: numericAmount.value,
      category: category.value,
      description: description.value,
      date: date.value
    };

    if (isEditMode.value) {
      await store.updateTransaction(props.transactionToEdit.id, payload);
    } else {
      await store.addTransaction(payload);
    }

    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Error saving transaction:', err);
  } finally {
    isSubmitting.value = false;
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
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      @keydown="handleKeydown"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 my-8 transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Baru' }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ isEditMode ? 'Perbarui informasi transaksi Anda' : 'Catat pemasukan atau pengeluaran baru' }}
            </p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
            @click="emit('close')"
            aria-label="Tutup form"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="mt-5 space-y-4">
          <!-- Type Toggle (Income / Expense) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipe Transaksi
            </label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition active:scale-98',
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs border border-rose-100'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
                @click="type = 'expense'"
              >
                <ArrowDownCircle class="w-4 h-4" />
                Pengeluaran
              </button>
              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition active:scale-98',
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
                @click="type = 'income'"
              >
                <ArrowUpCircle class="w-4 h-4" />
                Pemasukan
              </button>
            </div>
          </div>

          <!-- Nominal Field -->
          <div>
            <label for="amount-input" class="block text-xs font-semibold text-slate-700 mb-1.5">
              Nominal (Rp) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span class="text-sm font-bold text-slate-400">Rp</span>
              </div>
              <input
                id="amount-input"
                type="text"
                inputmode="numeric"
                :value="rawAmount"
                @input="handleAmountInput"
                placeholder="50.000"
                class="w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden transition"
                :class="errors.amount ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-100'"
                autofocus
              />
            </div>
            <!-- Live Preview -->
            <p v-if="formattedPreview && !errors.amount" class="mt-1 text-xs font-medium text-slate-500">
              Format: <span class="font-bold text-slate-700">{{ formattedPreview }}</span>
            </p>
            <p v-if="errors.amount" class="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle class="w-3.5 h-3.5" />
              {{ errors.amount }}
            </p>
          </div>

          <!-- Category Selection -->
          <div>
            <label for="category-select" class="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori <span class="text-rose-500">*</span>
            </label>
            <select
              id="category-select"
              v-model="category"
              class="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-white focus:outline-hidden transition"
              :class="errors.category ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-100'"
            >
              <option disabled value="">Pilih Kategori...</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
            <p v-if="errors.category" class="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle class="w-3.5 h-3.5" />
              {{ errors.category }}
            </p>
          </div>

          <!-- Date Field -->
          <div>
            <label for="date-input" class="block text-xs font-semibold text-slate-700 mb-1.5">
              Tanggal <span class="text-rose-500">*</span>
            </label>
            <input
              id="date-input"
              type="date"
              v-model="date"
              class="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-white focus:outline-hidden transition"
              :class="errors.date ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-100'"
            />
            <p v-if="errors.date" class="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle class="w-3.5 h-3.5" />
              {{ errors.date }}
            </p>
          </div>

          <!-- Description Field (Optional) -->
          <div>
            <label for="desc-input" class="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan <span class="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              id="desc-input"
              type="text"
              v-model="description"
              placeholder="Contoh: Makan siang nasi padang, bayar wifi bulanan"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:ring-2 focus:ring-slate-100 focus:outline-hidden transition"
            />
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
              @click="emit('close')"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Check class="w-4 h-4" />
              {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Transaksi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

