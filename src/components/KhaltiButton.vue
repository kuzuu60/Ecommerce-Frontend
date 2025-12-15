<template>
  <button @click="payWithKhalti" class="khalti-btn">
    Pay with Khalti
  </button>
</template>

<script setup>
import { initiateKhaltiPayment } from '@/services/khaltiServices';

const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
});

const payWithKhalti = () => {
  initiateKhaltiPayment(
    props.amount * 100, // convert to paisa
    (success) => {
      alert('Payment Successful! ' + JSON.stringify(success));
    },
    (error) => {
      alert('Payment Failed! ' + JSON.stringify(error));
    }
  );
};
</script>

<style scoped>
.khalti-btn {
  background-color: #5932ea;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
.khalti-btn:hover {
  background-color: #4725b1;
}
</style>
