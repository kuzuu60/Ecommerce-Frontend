<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0" style="background: rgba(28,25,23,0.4); backdrop-filter: blur(8px);" @click="$emit('close')"></div>
      <!-- Content -->
      <div class="relative w-full transition-all" :class="maxWidthClass">
        <div style="background: white; border: 1px solid var(--cream-200); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 64px rgba(28,25,23,0.14);">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ isOpen: Boolean, maxWidth: { type: String, default: 'md' } });
defineEmits(['close']);
const maxWidthClass = computed(() => ({ sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' }[props.maxWidth]));
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.92) translateY(16px); }
</style>
