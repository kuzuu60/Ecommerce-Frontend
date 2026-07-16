<template>
  <BaseModal :is-open="isOpen" @close="$emit('cancel')" max-width="sm">
    <div class="p-8 text-center">
      <div class="modal-danger-icon">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #DC2626;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-desc">{{ message }}</p>
      <div class="flex gap-3">
        <button @click="$emit('cancel')" class="modal-cancel-btn">Cancel</button>
        <button @click="$emit('confirm')" class="modal-danger-btn">Delete</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: 'This action cannot be undone.' }
});
defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-danger-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
}
.modal-title {
  font-family: var(--font-display); font-size: 1.6rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 0.625rem;
}
.modal-desc { font-size: 0.875rem; color: var(--stone-500); line-height: 1.6; margin-bottom: 1.75rem; }
.modal-cancel-btn {
  flex: 1; padding: 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;
  border: 1.5px solid var(--cream-200); background: transparent; color: var(--stone-600); cursor: pointer;
  transition: all 0.2s;
}
.modal-cancel-btn:hover { background: var(--cream-100); color: var(--stone-800); }
.modal-danger-btn {
  flex: 1; padding: 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 700;
  border: none; background: #DC2626; color: white; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(220,38,38,0.2);
}
.modal-danger-btn:hover { background: #B91C1C; transform: translateY(-1px); }
</style>
