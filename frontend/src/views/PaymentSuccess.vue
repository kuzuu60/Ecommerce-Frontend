<template>
  <div style="background: var(--cream-50); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
    <div class="success-card appear-animation">
      <div class="status-icon success-icon">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #16A34A;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <p class="section-label mt-6 mb-2">Order confirmed</p>
      <h2 class="status-title">Payment Successful</h2>
      <p class="status-desc">Thank you for your purchase. Your order has been placed and will be delivered to you shortly.</p>

      <div class="status-badge success-badge">
        <span class="badge-dot success-dot"></span>
        Transaction Completed
      </div>

      <button @click="goHome" class="status-btn">
        Continue Shopping
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, inject } from 'vue';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const fetchProducts = inject('fetchProducts');
const goHome = () => { window.location.href = '/'; };

onMounted(async () => {
  const pendingOrder = localStorage.getItem('pending_order');
  if (pendingOrder) {
    try {
      const pendingData = JSON.parse(pendingOrder);
      const items = Array.isArray(pendingData) ? pendingData : pendingData.items;
      const customerInfo = pendingData.customerInfo || {};
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
        body: JSON.stringify({ items, customerInfo, status: 'Paid' })
      });
      localStorage.removeItem('pending_order');
    } catch (err) { console.error("eSewa order error:", err); }
  }
  cartStore.item_details = [];
  cartStore.totalQuantity();
  cartStore.costCalculation();
  if (fetchProducts) fetchProducts();
});
</script>

<style scoped>
.success-card {
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
.success-icon { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); }
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
.success-badge {
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  color: #16A34A;
}
.badge-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.success-dot { background: #16A34A; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
.status-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0.875rem 1.75rem; border-radius: 100px; border: none;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.16);
}
.status-btn:hover { background: var(--stone-700); transform: translateY(-1px); }
</style>
