<template>
  <div style="background: var(--cream-50); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
    <div class="failure-card appear-animation">
      <div class="status-icon failure-icon">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #DC2626;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <p class="section-label mt-6 mb-2">Something went wrong</p>
      <h2 class="status-title">Payment Failed</h2>
      <p class="status-desc">Your transaction could not be completed. Please try again or choose a different payment method.</p>

      <div class="status-badge failure-badge">
        <span class="badge-dot failure-dot"></span>
        Transaction Declined
      </div>

      <div class="flex flex-col gap-3 w-full">
        <button @click="router.push('/payment')" class="status-btn">
          Try Again
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
        <button @click="router.push('/')" class="ghost-btn">Return Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped>
.failure-card {
  background: white;
  border: 1px solid var(--cream-200);
  border-radius: 28px;
  padding: 3rem 2.5rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}
.status-icon {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.failure-icon { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); }
.status-title {
  font-family: var(--font-display);
  font-size: 2.2rem; font-weight: 400;
  color: var(--stone-900); letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
}
.status-desc {
  font-size: 0.9rem; color: var(--stone-500);
  line-height: 1.7; margin-bottom: 1.75rem;
}
.status-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 100px;
  font-size: 0.8rem; font-weight: 600;
  margin-bottom: 2rem;
}
.failure-badge {
  background: rgba(220,38,38,0.06);
  border: 1px solid rgba(220,38,38,0.15);
  color: #DC2626;
}
.badge-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.failure-dot { background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
.status-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0.875rem 1.75rem; border-radius: 100px; border: none;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; width: 100%;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.16);
}
.status-btn:hover { background: var(--stone-700); transform: translateY(-1px); }
.ghost-btn {
  padding: 0.875rem 1.75rem; border-radius: 100px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; width: 100%;
  background: transparent; color: var(--stone-500);
  border: 1.5px solid var(--cream-200);
  transition: all 0.2s;
}
.ghost-btn:hover { background: var(--cream-100); color: var(--stone-700); }
</style>
