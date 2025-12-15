<template>
  <button @click="payWithKhalti" class="khalti-btn">
    Pay with Khalti
  </button>
</template>

<script>
import { initiateKhaltiPayment } from '@/services/khaltiService';

export default {
  props: {
    amount: {
      type: Number,
      required: true
    }
  },
  methods: {
    payWithKhalti() {
      initiateKhaltiPayment(
        this.amount * 100, // convert to paisa
        (success) => {
          alert('Payment Successful! ' + JSON.stringify(success));
        },
        (error) => {
          alert('Payment Failed! ' + JSON.stringify(error));
        }
      );
    }
  }
}
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
