<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" max-width="sm">
    <div class="p-8 text-center">
      <div class="status-icon" :class="type === 'success' ? 'success' : 'error'">
        <svg v-if="type === 'success'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #16A34A;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #DC2626;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-desc">{{ message }}</p>
      <button @click="$emit('close')" class="dismiss-btn" :class="type === 'success' ? 'dismiss-success' : 'dismiss-error'">
        Dismiss
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
defineProps({ isOpen: Boolean, type: { type: String, default: 'success' }, title: String, message: String });
defineEmits(['close']);
</script>

<style scoped>
.status-icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
}
.success { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); }
.error   { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); }
.modal-title {
  font-family: var(--font-display); font-size: 1.6rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em; margin-bottom: 0.625rem;
}
.modal-desc { font-size: 0.875rem; color: var(--stone-500); line-height: 1.6; margin-bottom: 1.75rem; }
.dismiss-btn {
  width: 100%; padding: 0.875rem; border-radius: 12px;
  font-size: 0.875rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;
}
.dismiss-success { background: var(--stone-900); color: var(--cream-50); box-shadow: 0 4px 12px rgba(28,25,23,0.16); }
.dismiss-success:hover { background: var(--stone-700); transform: translateY(-1px); }
.dismiss-error { background: #DC2626; color: white; box-shadow: 0 4px 12px rgba(220,38,38,0.2); }
.dismiss-error:hover { background: #B91C1C; transform: translateY(-1px); }
</style>
