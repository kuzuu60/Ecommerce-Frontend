<template>
  <div class="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center p-4">
    <div class="bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-slate-800 appear-animation">
      <div class="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/20">
        <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h2 class="text-3xl font-extrabold text-slate-100 mb-2">Payment Successful!</h2>
      <p class="text-slate-400 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>
      
      <div class="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700">
        <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Transaction Status</p>
        <p class="text-lg font-bold text-emerald-500">Completed</p>
      </div>
      
      <button @click="goHome" class="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-blue-900/20 hover:shadow-emerald-500/30">
        Continue Shopping
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, inject } from 'vue';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { verifyEsewaPayment } from '@/services/esewaService';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const fetchProducts = inject('fetchProducts');

const goHome = () => {
    window.location.href = '/';
};

onMounted(async () => {
  // Check for pending order from eSewa
  const pendingOrder = localStorage.getItem('pending_order');
  if (pendingOrder) {
    try {
      const pendingData = JSON.parse(pendingOrder);
      
      // Handle both old format (array) and new format (object) just in case
      let items = [];
      let customerInfo = {};

      if (Array.isArray(pendingData)) {
          items = pendingData;
      } else {
          items = pendingData.items;
          customerInfo = pendingData.customerInfo;
      }

      const encodedResponse = new URLSearchParams(window.location.search).get('data');
      if (!encodedResponse) {
          throw new Error('Missing eSewa payment response');
      }

      const payment = await verifyEsewaPayment(encodedResponse);
      if (pendingData.amount !== undefined && Number(payment.total_amount) !== Number(pendingData.amount)) {
          throw new Error('eSewa payment amount does not match the order');
      }

      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ items, customerInfo, status: 'Paid' })
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json().catch(() => ({}));
        throw new Error(orderError.message || 'Unable to create paid order');
      }

      localStorage.removeItem('pending_order');
    } catch (err) {
      console.error("Error deducting stock for eSewa order:", err);
      localStorage.removeItem('pending_order');
      router.replace('/failure');
    }
  }

  // Clear cart
  cartStore.item_details = [];
  cartStore.totalQuantity();
  cartStore.costCalculation();

  // Refresh global product data
  if (fetchProducts) fetchProducts();
});
</script>
