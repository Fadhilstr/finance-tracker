<script setup>
import { AlertTriangle, X } from 'lucide-vue-next';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Konfirmasi Tindakan'
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
  },
  confirmText: {
    type: String,
    default: 'Hapus'
  },
  cancelText: {
    type: String,
    default: 'Batal'
  },
  isDestructive: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('cancel');
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
        class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        @click.stop
      >
        <div class="flex items-start gap-4">
          <div
            v-if="isDestructive"
            class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"
          >
            <AlertTriangle class="w-5 h-5" :stroke-width="2" />
          </div>
          <div
            v-else
            class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"
          >
            <AlertTriangle class="w-5 h-5" :stroke-width="2" />
          </div>

          <div class="flex-1">
            <h3 class="text-lg font-bold text-slate-800 leading-tight">
              {{ title }}
            </h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              {{ message }}
            </p>
          </div>

          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            @click="emit('cancel')"
            aria-label="Tutup dialog"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs active:scale-95 transition',
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            ]"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
