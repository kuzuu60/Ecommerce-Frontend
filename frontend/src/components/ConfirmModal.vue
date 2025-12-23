<template>
  <BaseModal :is-open="isOpen" @close="$emit('cancel')" max-width="md">
    <div class="p-8 text-center">
      <div class="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 class="text-2xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-slate-400 mb-8">{{ message }}</p>
      
      <div class="flex gap-4">
        <button 
          @click="$emit('cancel')"
          class="flex-1 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
        >
          Cancel
        </button>
        <button 
          @click="$emit('confirm')"
          class="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
        >
          Delete
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';

defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Are you sure?'
  },
  message: {
    type: String,
    default: 'This action cannot be undone.'
  }
});

defineEmits(['confirm', 'cancel']);
</script>
