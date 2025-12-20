<template>
  <div class="w-full bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-700">
    <div class="flex justify-between items-center mb-4 text-slate-400 font-medium">
      <p>Subtotal ({{ cartStore.total_buying_item }})</p>
      <span class="text-slate-200">Rs. {{ cartStore.subTotal }}</span>
    </div>

    <div class="flex justify-between items-center mb-4 text-slate-400 font-medium">
      <p>Shipping Fee</p>
      <span class="text-slate-200">Rs. {{ cartStore.shippingCost }}</span>
    </div>

    <div class="flex justify-between items-center mb-6 text-slate-400 font-medium">
      <p>Discount</p>
      <span class="text-slate-200">Rs. {{ cartStore.discountAmount }}</span>
    </div>

    <div class="flex justify-between items-center pt-4 border-t border-slate-700 mb-6">
      <p class="text-lg font-bold text-slate-100">Total:</p>
      <span class="text-xl font-bold text-blue-500">Rs. {{ cartStore.totalCost }}</span>
    </div>

    <button 
      class="w-full bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:shadow-blue-500/20 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
      @click="paymentPage(cartStore.total_buying_item)"
    >
      Proceed to Checkout ({{ cartStore.total_buying_item }})
    </button>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const cartStore = useCartStore();

const paymentPage = (item) => {
  if(item > 0){
    router.push('/payment');
  }
}
</script>