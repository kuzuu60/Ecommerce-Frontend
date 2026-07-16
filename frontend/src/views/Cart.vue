<template>
  <div style="background: var(--cream-50); min-height: 100vh; padding-top: 7rem;">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
      <div class="mb-8">
        <p class="section-label mb-2">Your order</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(2rem,4vw,2.8rem); color: var(--stone-900); font-weight:400; letter-spacing:-0.02em;">Shopping Cart</h1>
      </div>

      <div v-if="cartProducts.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Cart Items -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div v-for="item in cartProducts" :key="item.id" class="cart-item">
            <div class="flex items-center gap-4">
              <input type="checkbox" v-model="item.checked"
                @click="cartStore.updateChecked(item.id)"
                class="w-4 h-4 cursor-pointer rounded" />
              <div class="cart-img-wrap">
                <img :src="item.image" :alt="item.title" class="cart-img" />
              </div>
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 class="cart-name">{{ item.title }}</h3>
                <p class="cart-price">Rs. {{ Number(item.price).toLocaleString() }}</p>
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="qty-row">
                  <button @click="updateQuan(item, item.quantity, 'sub')" :disabled="item.quantity === 1" class="qty-btn">−</button>
                  <span class="qty-num">{{ item.quantity }}</span>
                  <button @click="updateQuan(item, item.quantity, 'add')" class="qty-btn">+</button>
                </div>
                <button @click="deleteItem(item)" class="del-btn" title="Remove">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="order-summary-card sticky top-24">
          <h2 class="order-summary-title">Order Summary</h2>
          <div class="summary-lines">
            <div class="summary-line">
              <span>Subtotal ({{ cartStore.total_buying_item }})</span>
              <span>Rs. {{ cartStore.subTotal }}</span>
            </div>
            <div class="summary-line">
              <span>Shipping</span>
              <span v-if="cartStore.subTotal >= FREE_SHIPPING_THRESHOLD && cartStore.subTotal > 0" class="free-shipping">Free</span>
              <span v-else>Rs. {{ cartStore.shippingCost }}</span>
            </div>
            <div class="summary-line">
              <span>Discount</span>
              <span style="color: #16A34A;">− Rs. {{ cartStore.discountAmount }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>Rs. {{ cartStore.totalCost }}</span>
          </div>

          <p v-if="cartStore.subTotal > 0 && cartStore.subTotal < FREE_SHIPPING_THRESHOLD" class="shipping-note">
            Add Rs. {{ (FREE_SHIPPING_THRESHOLD - cartStore.subTotal).toLocaleString('en-IN') }} for free shipping.
          </p>
          <p v-else-if="cartStore.subTotal >= FREE_SHIPPING_THRESHOLD" class="shipping-note free-shipping">
            Free shipping applied.
          </p>

          <!-- Promo -->
          <div class="promo-box">
            <label class="promo-label">Promo Code</label>
            <div class="flex gap-2 mt-2">
              <input type="text" v-model="discountPercentage" placeholder="Enter code"
                class="promo-input flex-1" />
              <button @click="cartStore.promoDiscountCalculation(discountPercentage)"
                :disabled="cartStore.promoButton" class="promo-btn">Apply</button>
            </div>
          </div>

          <button class="checkout-btn" @click="paymentPage">
            Proceed to Checkout ({{ cartStore.total_buying_item }})
          </button>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="empty-cart">
        <div class="empty-icon">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h2 style="font-family: var(--font-display); font-size: 2rem; color: var(--stone-800); font-weight: 400;">Your cart is empty</h2>
        <p style="color: var(--stone-500);">Looks like you haven't added anything yet.</p>
        <button @click="router.push('/')" class="rounded-full px-6 py-3 text-sm font-semibold transition-all"
          style="background: var(--stone-900); color: var(--cream-50);">Start Shopping</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { FREE_SHIPPING_THRESHOLD, useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const cartProducts = ref(cartStore.item_details);
const discountPercentage = ref('');

const deleteItem = (item) => { cartStore.removeItem(item.id); cartStore.totalQuantity(); };
const updateQuan = (item, quantity, action) => {
  cartStore.updateQuantity(item.id, action === 'add' ? quantity + 1 : quantity - 1);
  cartStore.totalQuantity();
};
const paymentPage = () => {
  if (cartStore.total_buying_item <= 0) return;
  if (!authStore.isAuthenticated) {
    toast.info('Please sign in before purchasing.', { timeout: 2000, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: '/payment' } });
    return;
  }
  router.push('/payment');
};
</script>

<style scoped>
.cart-item {
  display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
  background: white; border: 1px solid var(--cream-200);
  border-radius: 16px; transition: box-shadow 0.2s;
}
.cart-item:hover { box-shadow: var(--shadow-sm); }
.cart-img-wrap {
  width: 80px; height: 80px; border-radius: 12px; overflow: hidden;
  background: var(--cream-100); border: 1px solid var(--cream-200);
  display: flex; align-items: center; justify-content: center; padding: 8px; flex-shrink: 0;
}
.cart-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.cart-name {
  font-size: 0.9rem; font-weight: 600; color: var(--stone-800);
  line-height: 1.4; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;
}
.cart-price { font-size: 1.05rem; font-weight: 700; color: var(--stone-900); letter-spacing: -0.02em; }
.qty-row { display: flex; align-items: center; border: 1px solid var(--cream-200); border-radius: 10px; overflow: hidden; }
.qty-btn {
  width: 34px; height: 34px; background: transparent; border: none;
  color: var(--stone-500); font-size: 1rem; cursor: pointer; transition: background 0.15s;
}
.qty-btn:hover:not(:disabled) { background: var(--cream-100); }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-num { width: 38px; text-align: center; font-size: 0.9rem; font-weight: 700; color: var(--stone-800); }
.del-btn {
  padding: 8px; border-radius: 8px; border: none; background: transparent;
  color: var(--stone-400); cursor: pointer; transition: all 0.2s;
}
.del-btn:hover { color: #DC2626; background: rgba(220,38,38,0.06); }
.order-summary-card {
  background: white; border: 1px solid var(--cream-200);
  border-radius: 20px; padding: 1.75rem;
  box-shadow: var(--shadow-md);
}
.order-summary-title {
  font-family: var(--font-display); font-size: 1.4rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 1.25rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--cream-200);
}
.summary-lines { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.summary-line {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.875rem; color: var(--stone-500); font-weight: 500;
}
.summary-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 0; border-top: 1px solid var(--cream-200); margin-bottom: 1.25rem;
  font-size: 1.15rem; font-weight: 700; color: var(--stone-900);
}
.promo-box {
  background: var(--cream-100); border-radius: 12px; padding: 1rem;
  border: 1px solid var(--cream-200); margin-bottom: 1.25rem;
}
.promo-label { font-size: 0.75rem; font-weight: 700; color: var(--stone-500); text-transform: uppercase; letter-spacing: 0.1em; }
.promo-input {
  border: 1px solid var(--cream-200); border-radius: 8px; padding: 0.6rem 0.875rem;
  font-size: 0.875rem; color: var(--stone-800); background: white; outline: none;
  transition: border-color 0.2s; font-family: var(--font-body);
}
.promo-input:focus { border-color: var(--stone-400); }
.promo-btn {
  padding: 0.6rem 1rem; border-radius: 8px; border: none; cursor: pointer;
  font-size: 0.8rem; font-weight: 700; transition: background 0.2s;
  background: var(--stone-900); color: var(--cream-50);
}
.promo-btn:hover:not(:disabled) { background: var(--stone-700); }
.promo-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.checkout-btn {
  width: 100%; padding: 1rem; border-radius: 14px; border: none;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.18);
}
.checkout-btn:hover { background: var(--stone-700); transform: translateY(-1px); }
.empty-cart {
  min-height: 60vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.25rem;
  text-align: center;
}
.empty-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--cream-100); border: 1px solid var(--cream-200);
  display: flex; align-items: center; justify-content: center;
  color: var(--stone-400);
}
.shipping-note { color: var(--stone-400); font-size: 0.72rem; margin: -0.5rem 0 1rem; }
.free-shipping { color: #16A34A; font-weight: 700; }
</style>
