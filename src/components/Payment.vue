<template>
  <div class="overall-page">
    <div class="content1">
      <h1>Select Payment Method</h1>
      <div class="payment-methods">
        <div class="cash-delivery">
          <img src="/assets/cash.png" alt="money" class="payment-image">
          <p>Cash on delivery</p>
        </div>
        <div class="other-method">
          <p>Sorry, currently there is no other payment method and you might be wondering why? Well, cause I ain't
            coding
            all that, kindly pay in cash, don't make it too hard for me muah😘😘</p>
        </div>
      </div>
      <div class="description">
        <ul>
          <li>You may pay in cash to our courier upon receiving your parcel at the doorstep.</li>
          <li>Before agreeing to receive the parcel, check if your delivery status has been updated to 'Out for
            Delivery'.</li>
          <li>Before receiving, confirm that the airway bill shows that the parcel is from Daraz.</li>
          <li>Before you make payment to the courier, confirm your order number, sender information, and tracking number
            on the parcel.</li>
        </ul>
        <button @click="showMessage()">Confirm Order</button>
      </div>
    </div>
    <div class="content2">
      <div class="order-summary">
        <div class="summary-item">
          <p>Subtotal ({{ cartStore.total_buying_item }})</p>
          <span>{{ cartStore.subTotal }}</span>
        </div>
        <div class="summary-item">
          <p>Shipping Fee</p>
          <span>{{ cartStore.shippingCost }}</span>
        </div>
        <div class="summary-item total">
          <p><strong>Total:</strong></p>
          <span><strong>{{ cartStore.totalCost }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from './store/cartStore';
import { useToast } from 'vue-toastification';
const cartStore = useCartStore();
const toast = useToast()

const showMessage = () => {
  toast.success("Arigato my lovely clients, please keep on coming😘", {
    toastClassName: "my-custom-toast", timeout: 1500, hideProgressBar: true,
  });
}
</script>

<style scoped lang="scss">
.overall-page {
  padding: 20px;
  display: flex;
  gap: 4rem;

  .content1 {
    flex: 3;

    h1 {
      font-size: 2.4rem;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .payment-methods {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .cash-delivery {
        flex: 1;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s ease;
        background: #f8fafc;

        &:hover {
          border-color: #37ba9a;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        img {
          width: 80px;
          height: 80px;
          margin-bottom: 1.5rem;
        }

         p {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1a202c;
        }
      }
    }
  }

  .content2 {
    flex: 1;
    margin-top: 40px;
  }
}


.other-method {
  flex: 1;
  background: #fff4e6;
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid #ffe8cc;
}

.other-method p {
  font-size: 1.6rem;
  line-height: 1.6;
  color: #663d00;
  margin: 0;
}

.description {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  border: 2px solid #e2e8f0;
}

.description ul {
  list-style: none;
  padding-left: 0;
  margin: 0 0 2rem 0;
}

.description li {
  font-size: 1.6rem;
  color: #4a5568;
  padding-left: 2rem;
  position: relative;
  margin-bottom: 1.2rem;
}

.description li::before {
  content: '•';
  color: #37ba9a;
  position: absolute;
  left: 0;
}

.description button {
  background: #37ba9a;
  color: white;
  border: none;
  padding: 1.4rem 2.4rem;
  border-radius: 8px;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: auto;
}

.description button:hover {
  background: #2e9f84;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(55, 186, 154, 0.2);
}


.order-summary {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  color: #4a5568;
}

.summary-item.total {
  padding-top: 1.6rem;
  border-top: 2px solid #e2e8f0;
  margin-top: 1.6rem;
  color: #1a202c;
  font-weight: 600;
}

.summary-item.total span {
  color: #37ba9a;
  font-size: 1.8rem;
}
</style>
