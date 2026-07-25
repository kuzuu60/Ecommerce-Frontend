<template>
  <div style="background: var(--cream-50); min-height: 100vh; position: relative; overflow: hidden; padding-top: 8rem;">
    <!-- Decorative Orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <div class="max-w-[1100px] mx-auto px-6 lg:px-8 pb-20 relative z-10">
      <div class="mb-10 text-center">
        <p class="section-label mb-2 mx-auto" style="color: var(--amber-600);">Secure Checkout</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(2.5rem,5vw,3.5rem); color: var(--stone-900); font-weight:400; letter-spacing:-0.03em; line-height: 1.1;">Complete your<br /><em>order.</em></h1>
      </div>

      <div class="checkout-grid">
        <!-- Left: Form & Methods -->
        <div class="flex flex-col gap-6">
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
              <div class="field sm:col-span-2">
                <label class="field-label">Delivery Address</label>
                <input type="text" v-model="customerDetails.address" placeholder="Street, City, District" class="field-input" required />
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
                {{ isMockEsewa ? 'Demo eSewa mode is active. Payment will be verified locally for this demonstration.' : 'You will be redirected to the eSewa portal to complete your secure payment.' }}
              </p>
            </div>

            <button @click="handlePayment"
              class="pay-btn" :class="selectedPayment === 'esewa' ? 'pay-btn-esewa' : ''">
              {{ selectedPayment === 'esewa' ? (isMockEsewa ? 'Complete Demo eSewa Payment' : 'Pay with eSewa') : 'Confirm Order' }}
            </button>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="pay-card summary-card sticky top-28">
          <h2 class="pay-card-title">Order Summary</h2>
          <div class="summary-lines">
            <div class="summary-line">
              <span>Subtotal ({{ cartStore.total_buying_item }} items)</span>
              <span>Rs. {{ cartStore.subTotal.toLocaleString('en-IN') }}</span>
            </div>
            <div class="summary-line">
              <span>Shipping</span>
              <span v-if="cartStore.subTotal >= FREE_SHIPPING_THRESHOLD && cartStore.subTotal > 0" class="free-shipping">Free</span>
              <span v-else>Rs. {{ cartStore.shippingCost.toLocaleString('en-IN') }}</span>
            </div>
          </div>
          <p v-if="cartStore.subTotal > 0 && cartStore.subTotal < FREE_SHIPPING_THRESHOLD" class="shipping-note">
            Add Rs. {{ (FREE_SHIPPING_THRESHOLD - cartStore.subTotal).toLocaleString('en-IN') }} for free shipping.
          </p>
          <p v-else-if="cartStore.subTotal >= FREE_SHIPPING_THRESHOLD" class="shipping-note free-shipping">
            Free shipping applied.
          </p>

          <div class="summary-total">
            <span>Total</span>
            <span style="color: var(--amber-600);">Rs. {{ cartStore.totalCost.toLocaleString('en-IN') }}</span>
          </div>
          
          <!-- Cart items preview -->
          <div class="mt-5 pt-5 flex flex-col gap-4" style="border-top: 1px dashed var(--cream-200);">
            <div v-for="item in cartStore.item_details.filter(i => i.checked)" :key="item.id" class="flex items-center gap-4 group">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style="background: white; border: 1px solid var(--cream-200); padding: 4px; box-shadow: var(--shadow-sm);">
                <img :src="item.image" :alt="item.title" class="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate" style="color: var(--stone-800);">{{ item.title }}</p>
                <p class="text-[11px] font-bold uppercase tracking-widest mt-0.5" style="color: var(--stone-400);">Qty: {{ item.quantity }}</p>
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
import { FREE_SHIPPING_THRESHOLD, useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'vue-toastification';
import { initiateEsewaPayment } from '@/services/esewaService';
import { API_BASE_URL, ESEWA_MODE } from '@/config/api';

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();
const selectedPayment = ref('cash');
const customerDetails = ref({ fullName: '', address: '', phone: '' });
const totalAmount = cartStore.totalCost;
const isMockEsewa = ESEWA_MODE !== 'live';

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
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({ items: orderItems, customerInfo: customerDetails.value })
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.message || "Order Failed"); return false; }
    if (!isEsewa) {
      toast.success("Order placed successfully!", { timeout: 2000, hideProgressBar: true });
      cartStore.clearCart(true);
      setTimeout(() => { window.location.href = '/'; }, 2000);
    }
    return true;
  } catch { toast.error("Network Error. Please try again."); return false; }
};
const handleEsewa = async () => {
  const orderItems = cartStore.item_details.filter(i => i.checked).map(i => ({ id: i.id, quantity: i.quantity }));
  if (!orderItems.length) { toast.warning("Please select items first."); return; }
  localStorage.setItem('pending_order', JSON.stringify({ items: orderItems, customerInfo: customerDetails.value }));
  try {
    const result = await initiateEsewaPayment(totalAmount, String(orderItems[0].id));
    if (result?.mode === 'mock') {
      window.location.href = `/success?transaction_uuid=${encodeURIComponent(result.transaction_uuid)}`;
    }
  } catch (error) {
    toast.error(error.message || 'Unable to start payment. Please try again.');
  }
};
</script>

<style scoped>
/* ── Layout & Orbs ───────────────────────────────────────── */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 860px) { .checkout-grid { grid-template-columns: 1fr; } }

.orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none; z-index: 0;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(251,191,36,0.12), transparent 70%);
  top: -50px; right: 10%;
}
.orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(28,25,23,0.05), transparent 70%);
  bottom: 10%; left: -40px;
}

/* ── Cards ────────────────────────────────────────────────── */
.pay-card {
  background: white; border: 1px solid var(--cream-200);
  border-radius: 24px; padding: 2.25rem;
  box-shadow: var(--shadow-md);
}
.summary-card { background: var(--cream-100); border-color: var(--cream-200); }

.pay-card-title {
  font-family: var(--font-display); font-size: 1.4rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 1.5rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--cream-200);
}

/* ── Form Fields ──────────────────────────────────────────── */
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 0.72rem; font-weight: 700; color: var(--stone-500); text-transform: uppercase; letter-spacing: 0.12em; }
.field-input {
  border: 1px solid var(--cream-200); border-radius: 12px; padding: 0.8rem 1rem;
  font-size: 0.9rem; color: var(--stone-800); background: var(--cream-50);
  outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; font-family: var(--font-body);
  width: 100%;
}
.field-input:focus { border-color: var(--stone-400); background: white; box-shadow: 0 0 0 3px rgba(28,25,23,0.05); }
.field-input::placeholder { color: var(--stone-400); }

/* ── Payment Methods ──────────────────────────────────────── */
.method-card {
  position: relative; border-radius: 16px; padding: 1.25rem;
  border: 1.5px solid var(--cream-200); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 0.875rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); background: var(--cream-50);
}
.method-card:hover { border-color: var(--cream-300); background: white; transform: translateY(-2px); }
.method-card.selected { border-color: var(--stone-800); background: white; box-shadow: 0 4px 12px rgba(28,25,23,0.08); }
.method-card.selected-esewa { border-color: #41A124; background: white; box-shadow: 0 4px 12px rgba(65,161,36,0.15); }
.method-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: white; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--cream-200); box-shadow: var(--shadow-sm);
}
.esewa-icon { background: rgba(65,161,36,0.08); border-color: rgba(65,161,36,0.2); }
.method-name { font-size: 0.85rem; font-weight: 700; color: var(--stone-600); text-align: center; letter-spacing: -0.01em; }
.method-check {
  position: absolute; top: 12px; right: 12px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--stone-900); color: white;
  font-size: 0.65rem; font-weight: 900; display: flex; align-items: center; justify-content: center;
}
.method-check.esewa-check { background: #41A124; }
.method-info {
  background: var(--cream-50); border-radius: 12px; padding: 1.25rem;
  border: 1px solid var(--cream-200); margin-bottom: 1.5rem; text-align: center;
}
.method-desc { font-size: 0.875rem; color: var(--stone-600); line-height: 1.6; }

/* ── Buttons ──────────────────────────────────────────────── */
.pay-btn {
  width: 100%; padding: 1.1rem; border-radius: 100px; border: none;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.18);
}
.pay-btn:hover { background: var(--stone-700); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(28,25,23,0.22); }
.pay-btn.pay-btn-esewa { background: #41A124; box-shadow: 0 4px 16px rgba(65,161,36,0.25); }
.pay-btn.pay-btn-esewa:hover { background: #368a1e; box-shadow: 0 8px 24px rgba(65,161,36,0.3); }

/* ── Order Summary ────────────────────────────────────────── */
.summary-lines { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: 1.25rem; }
.summary-line { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--stone-600); font-weight: 500; }
.summary-total {
  display: flex; justify-content: space-between; padding: 1.25rem 0 0;
  border-top: 1px solid var(--cream-200); font-size: 1.2rem; font-weight: 700; color: var(--stone-900);
}
.shipping-note { color: var(--stone-400); font-size: 0.72rem; margin: -0.5rem 0 1.25rem; }
.free-shipping { color: #16A34A; font-weight: 700; }
</style>
