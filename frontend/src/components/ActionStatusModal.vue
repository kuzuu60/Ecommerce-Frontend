<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" max-width="sm">
    <div class="p-8 text-center">
      <div 
        class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        :class="type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'"
      >
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <h3 class="text-2xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-slate-400 mb-8">{{ message }}</p>
      
      <button 
        @click="$emit('close')"
        class="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
      >
        Dismiss
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';

defineProps({
  isOpen: Boolean,
  type: {
    type: String,
    default: 'success'
  },
  title: String,
  message: String
});

defineEmits(['close']);
</script>
