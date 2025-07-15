<template>
  <div class="order-summary">
    <div class="summary-item">
      <p>Subtotal ({{ cartStore.total_buying_item }})</p>
      <span>{{ cartStore.subTotal }}</span>
    </div>

    <div class="summary-item">
      <p>Shipping Fee</p>
      <span>{{ cartStore.shippingCost }}</span>
    </div>

    <div class="discount summary-item">
      <p>Discount</p>
      <span>{{ cartStore.discountAmount }}</span>
    </div>
    <div class="summary-item total">
      <p><strong>Total:</strong></p>
      <span><strong>{{ cartStore.totalCost }}</strong></span>
    </div>
    <button class="checkout" @click="paymentPage(cartStore.total_buying_item)">Procced to Checkout ({{ cartStore.total_buying_item }})</button>
  </div>
</template>

<script setup>

import { useCartStore } from './store/cartStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const cartStore = useCartStore();

const paymentPage=(item)=>{
  if(item>0){
    router.push('/payment')
  }
}

</script>

<style scoped lang="scss">
.order-summary {
  font-size: 1.6rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
  background-color: white;
  width: 400px;
  padding: 20px;
  border-radius: 4px;
  // margin-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 12px; 
  font-weight: 500;
}

.total {
  border-top: 2px solid #ddd; 
  padding-top: 12px;
}

.checkout {
  color: white;
  margin-top: 12px;
  border: none;
  width: 100%; 
  font-size: 1.6rem;
  font-weight: bold;
  background: red;
  padding: 14px;
  border-radius: 4px;
  cursor: pointer;

  &:hover{
    background: rgb(198, 0, 0);
  }
}


</style>