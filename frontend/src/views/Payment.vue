<template>
  <div class="flex gap-16 p-5 bg-slate-950 min-h-[calc(100vh-80px)]">
    <div class="flex-[3]">
      <h1 class="text-2xl mb-5 font-medium text-slate-100">Select Payment Method</h1>
      <div class="flex gap-5 mb-5">
        <div class="flex-1 border border-slate-700 rounded-xl p-8 flex flex-col items-center transition-all duration-300 bg-slate-900 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/10 cursor-pointer group">
          <img src="/assets/cash.png" alt="money" class="w-20 h-20 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
          <p class="text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Cash on delivery</p>
        </div>

        <!-- Extra Note Section -->
        <div class="flex-1 bg-amber-900/10 rounded-xl p-8 border border-amber-900/30">
          <p class="text-base leading-relaxed text-amber-500 m-0">Sorry, currently there is no other payment method and you might be wondering why? Well, cause I ain't
            coding
            all that, kindly pay in cash, don't make it too hard for me muah😘😘</p>
        </div>
      </div>

      <div class="bg-slate-900 rounded-xl p-10 border border-slate-800 shadow-sm">
        <ul class="list-none pl-0 m-0 mb-8">
          <li class="text-base text-slate-400 pl-8 relative mb-5 before:content-['•'] before:text-blue-500 before:absolute before:left-0Before">You may pay in cash to our courier upon receiving your parcel at the doorstep.</li>
        </ul>

        <button @click="showMessage()" class="bg-blue-600 text-white border-none py-3.5 px-6 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 shadow-md shadow-blue-900/20">Confirm Order</button>
      </div>
    </div>

    <!-- ORDER SUMMARY (with KHALTI integrated here) -->
    <div class="flex-1 mt-10">
      <div class="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-sm sticky top-24">
        <h3 class="text-lg font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Order Summary</h3>
        <div class="flex justify-between mb-4 text-base text-slate-400 font-medium">
          <p>Subtotal ({{ cartStore.total_buying_item }})</p>
          <span class="text-slate-200">Rs. {{ cartStore.subTotal }}</span>
        </div>

        <div class="flex justify-between mb-4 text-base text-slate-400 font-medium">
          <p>Shipping Fee</p>
          <span class="text-slate-200">Rs. {{ cartStore.shippingCost }}</span>
        </div>

        <div class="flex justify-between mb-6 text-base pt-4 border-t border-slate-800 mt-4 text-slate-100 font-bold">
          <p>Total:</p>
          <span class="text-blue-500 text-xl">Rs. {{ cartStore.totalCost }}</span>
        </div>

        <!-- ⭐ Integrated Khalti Payment -->
        <div style="margin-top: 20px;">
          <h3 class="text-lg font-medium mb-4 text-slate-200">eSewa Payment</h3>
          <EsewaButton :amount="totalAmount" :productId="'order_123'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cartStore';
import { useToast } from 'vue-toastification';
import EsewaButton from '@/components/EsewaButton.vue';

const cartStore = useCartStore();
const toast = useToast();

// link totalAmount to store
const totalAmount = cartStore.totalCost;

const showMessage = () => {
  toast.success(" Thank you valued customer! Do visit us again if you need anything else.", {
    toastClassName: "relative top-[50px] bg-white text-black font-medium rounded shadow-lg",
    timeout: 1500,
    hideProgressBar: true,
  });
};
</script>



