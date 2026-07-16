<template>
  <div class="w-full rounded-2xl p-5" style="background: white; border: 1px solid var(--cream-200); box-shadow: var(--shadow-sm);">
    <h3 style="font-family: var(--font-display); font-size: 1.2rem; color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--cream-200);">
      Order Summary
    </h3>

    <div class="flex flex-col gap-3 mb-4">
      <div class="summary-row">
        <span>Subtotal ({{ cartStore.total_buying_item }} items)</span>
        <span>Rs. {{ cartStore.subTotal }}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>Rs. {{ cartStore.shippingCost }}</span>
      </div>
      <div class="summary-row" style="color: #16A34A;">
        <span>Discount</span>
        <span>− Rs. {{ cartStore.discountAmount }}</span>
      </div>
    </div>

    <div class="total-row">
      <span>Total</span>
      <span>Rs. {{ cartStore.totalCost }}</span>
    </div>

    <button class="checkout-btn" @click="paymentPage(cartStore.total_buying_item)" :disabled="cartStore.total_buying_item <= 0">
      Proceed to Checkout ({{ cartStore.total_buying_item }})
    </button>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'vue-toastification';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

const paymentPage = (item) => {
  if (item <= 0) return;
  if (!authStore.isAuthenticated) {
    toast.info('Please sign in before purchasing.', { timeout: 2000, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: '/payment' } });
    return;
  }
  router.push('/payment');
};
</script>

<style scoped>
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.875rem; font-weight: 500; color: var(--stone-500);
}
.total-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 1.1rem; font-weight: 700; color: var(--stone-900);
  padding: 1rem 0; border-top: 1px solid var(--cream-200);
  border-bottom: 1px solid var(--cream-200); margin-bottom: 1.25rem;
}
.checkout-btn {
  width: 100%; padding: 0.875rem; border-radius: 12px; border: none;
  font-size: 0.875rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(28,25,23,0.16);
}
.checkout-btn:hover:not(:disabled) { background: var(--stone-700); transform: translateY(-1px); }
.checkout-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
</style>
