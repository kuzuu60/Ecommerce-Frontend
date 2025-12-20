<template>
  <button @click="payWithEsewa" class="bg-[#41A124] text-white py-2 px-5 rounded border-none cursor-pointer font-bold text-lg hover:bg-[#368a1e]">
    Pay with eSewa
  </button>
</template>

<script setup>
import { initiateEsewaPayment } from '@/services/esewaService';

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  productId: {
    type: String,
    required: true
  }
});

const payWithEsewa = () => {
    initiateEsewaPayment(props.amount, props.productId);
};
</script>


