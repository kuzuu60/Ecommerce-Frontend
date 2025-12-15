<template>
  <button @click="payWithEsewa" class="esewa-btn">
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

<style scoped>
.esewa-btn {
  background-color: #41A124;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
}
.esewa-btn:hover {
  background-color: #368a1e;
}
</style>
