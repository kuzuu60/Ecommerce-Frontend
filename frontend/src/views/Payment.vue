<template>
  <div style="background: var(--cream-50); min-height: 100vh; padding-top: 7rem;">
    <div class="max-w-6xl mx-auto px-6 lg:px-12 pb-16">
      <div class="mb-8">
        <p class="section-label mb-2">Checkout</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(2rem,4vw,2.8rem); color: var(--stone-900); font-weight:400; letter-spacing:-0.02em;">Payment</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Left: Form & Methods -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Customer Details -->
          <div class="pay-card">
            <h2 class="pay-card-title">Customer Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="field">
                <label class="field-label">Full Name</label>
                <input type="text" v-model="customerDetails.fullName" placeholder="Jane Doe" class="field-input" />
              </div>
              <div class="field">
                <label class="field-label">Phone Number</label>
                <input type="tel" v-model="customerDetails.phone" placeholder="98XXXXXXXX" class="field-input" />
              </div>
              <div class="field md:col-span-2">
                <label class="field-label">Delivery Address</label>
                <input type="text" v-model="customerDetails.address" placeholder="Street, City, District" class="field-input" />
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="pay-card">
            <h2 class="pay-card-title">Payment Method</h2>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <!-- Cash -->
              <div @click="selectedPayment = 'cash'"
                class="method-card" :class="selectedPayment === 'cash' ? 'selected' : ''">
                <div class="method-icon">
                  <img src="/assets/cash.png" alt="Cash" class="w-10 h-10 object-contain" />
                </div>
                <p class="method-name" :style="selectedPayment === 'cash' ? 'color: var(--stone-900);' : ''">Cash on Delivery</p>
                <div v-if="selectedPayment === 'cash'" class="method-check">✓</div>
              </div>
              <!-- eSewa -->
              <div @click="selectedPayment = 'esewa'"
                class="method-card" :class="selectedPayment === 'esewa' ? 'selected-esewa' : ''">
                <div class="method-icon esewa-icon">
                  <span style="color: #41A124; font-weight: 800; font-size: 1rem; letter-spacing: -0.02em;">eSewa</span>
                </div>
                <p class="method-name" :style="selectedPayment === 'esewa' ? 'color: #41A124;' : ''">eSewa Wallet</p>
                <div v-if="selectedPayment === 'esewa'" class="method-check esewa-check">✓</div>
              </div>
            </div>

            <div class="method-info">
              <p v-if="selectedPayment === 'cash'" class="method-desc">
                Pay in cash to our courier upon receiving your parcel at the doorstep.
              </p>
              <p v-else class="method-desc">
                You will be redirected to the eSewa portal to complete your secure payment.
              </p>
            </div>

            <button @click="handlePayment"
              class="pay-btn" :class="selectedPayment === 'esewa' ? 'pay-btn-esewa' : ''">
              {{ selectedPayment === 'esewa' ? 'Pay with eSewa' : 'Confirm Order' }}
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="pay-card sticky top-24">
          <h2 class="pay-card-title">Order Summary</h2>
          <div class="summary-lines">
            <div class="summary-line">
              <span>Subtotal ({{ cartStore.total_buying_item }})</span>
              <span>Rs. {{ cartStore.subTotal }}</span>
            </div>
            <div class="summary-line">
              <span>Shipping</span>
              <span>Rs. {{ cartStore.shippingCost }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>Rs. {{ cartStore.totalCost }}</span>
          </div>
          <!-- Cart items preview -->
          <div class="mt-4 pt-4 flex flex-col gap-3" style="border-top: 1px solid var(--cream-200);">
            <div v-for="item in cartStore.item_details.filter(i => i.checked)" :key="item.id" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background: var(--cream-100); border: 1px solid var(--cream-200); padding: 4px;">
                <img :src="item.image" :alt="item.title" class="w-full h-full object-contain" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate" style="color: var(--stone-700);">{{ item.title }}</p>
                <p class="text-[10px]" style="color: var(--stone-400);">Qty: {{ item.quantity }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'vue-toastification';
import { initiateEsewaPayment } from '@/services/esewaService';

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();
const selectedPayment = ref('cash');
const customerDetails = ref({ fullName: '', address: '', phone: '' });
const totalAmount = cartStore.totalCost;

const validateForm = () => {
  if (!customerDetails.value.fullName || !customerDetails.value.address || !customerDetails.value.phone) {
    toast.warning("Please fill in all customer details.");
    return false;
  }
  return true;
};
const handlePayment = () => {
  if (!validateForm()) return;
  selectedPayment.value === 'esewa' ? handleEsewa() : processOrder();
};
const processOrder = async (isEsewa = false) => {
  try {
    const orderItems = cartStore.item_details.filter(i => i.checked).map(i => ({ id: i.id, quantity: i.quantity }));
    if (!orderItems.length) { toast.warning("Please select items first."); return false; }
    const res = await fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({ items: orderItems, customerInfo: customerDetails.value })
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.message || "Order Failed"); return false; }
    if (!isEsewa) {
      toast.success("Order placed successfully!", { timeout: 2000, hideProgressBar: true });
      cartStore.item_details = []; cartStore.totalQuantity(); cartStore.costCalculation();
      setTimeout(() => { window.location.href = '/'; }, 2000);
    }
    return true;
  } catch { toast.error("Network Error. Please try again."); return false; }
};
const handleEsewa = () => {
  const orderItems = cartStore.item_details.filter(i => i.checked).map(i => ({ id: i.id, quantity: i.quantity }));
  if (!orderItems.length) { toast.warning("Please select items first."); return; }
  localStorage.setItem('pending_order', JSON.stringify({ items: orderItems, customerInfo: customerDetails.value }));
  initiateEsewaPayment(totalAmount, String(orderItems[0].id));
};
</script>

<style scoped>
.pay-card {
  background: white; border: 1px solid var(--cream-200);
  border-radius: 20px; padding: 1.75rem;
  box-shadow: var(--shadow-sm);
}
.pay-card-title {
  font-family: var(--font-display); font-size: 1.3rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 1.25rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--cream-200);
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--stone-500); text-transform: uppercase; letter-spacing: 0.1em; }
.field-input {
  border: 1px solid var(--cream-200); border-radius: 10px; padding: 0.75rem 1rem;
  font-size: 0.9rem; color: var(--stone-800); background: var(--cream-50);
  outline: none; transition: border-color 0.2s; font-family: var(--font-body);
}
.field-input:focus { border-color: var(--stone-400); background: white; }
.field-input::placeholder { color: var(--stone-400); }
.method-card {
  position: relative; border-radius: 14px; padding: 1.25rem;
  border: 1.5px solid var(--cream-200); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  transition: all 0.2s; background: var(--cream-50);
}
.method-card:hover { border-color: var(--cream-300); background: white; }
.method-card.selected { border-color: var(--stone-800); background: white; }
.method-card.selected-esewa { border-color: #41A124; background: white; }
.method-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--cream-100); display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--cream-200);
}
.esewa-icon { background: rgba(65,161,36,0.08); border-color: rgba(65,161,36,0.2); }
.method-name { font-size: 0.8rem; font-weight: 700; color: var(--stone-600); text-align: center; }
.method-check {
  position: absolute; top: 10px; right: 10px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--stone-900); color: white;
  font-size: 0.6rem; font-weight: 900; display: flex; align-items: center; justify-content: center;
}
.method-check.esewa-check { background: #41A124; }
.method-info {
  background: var(--cream-100); border-radius: 10px; padding: 1rem;
  border: 1px solid var(--cream-200); margin-bottom: 1.25rem;
}
.method-desc { font-size: 0.875rem; color: var(--stone-600); line-height: 1.6; }
.pay-btn {
  width: 100%; padding: 1rem; border-radius: 14px; border: none;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s;
}
.pay-btn:hover { background: var(--stone-700); transform: translateY(-1px); }
.pay-btn.pay-btn-esewa { background: #41A124; }
.pay-btn.pay-btn-esewa:hover { background: #368a1e; }
.summary-lines { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.summary-line { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--stone-500); font-weight: 500; }
.summary-total {
  display: flex; justify-content: space-between; padding: 1rem 0;
  border-top: 1px solid var(--cream-200); font-size: 1.1rem; font-weight: 700; color: var(--stone-900);
}
</style>
