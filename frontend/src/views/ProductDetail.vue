<template>
  <div style="background: var(--cream-50); min-height: 100vh;">
    <div v-if="product" class="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 mb-10 text-xs" style="color: var(--stone-400);">
        <button @click="router.push('/')" class="hover-text transition-colors">Home</button>
        <span>›</span>
        <button @click="router.push(`/${product.category}`)" class="hover-text transition-colors capitalize">{{ product.category.replace(/-/g,' ') }}</button>
        <span>›</span>
        <span class="truncate max-w-[200px]" style="color: var(--stone-600);">{{ product.title }}</span>
      </div>

      <!-- Main Card -->
      <div class="product-detail-card">
        <!-- Left: Image -->
        <div class="detail-image-side">
          <button @click="goBack" class="back-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back
          </button>
          <div class="detail-img-frame">
            <img :src="product.thumbnail" :alt="product.title" class="detail-img" />
          </div>
          <p class="detail-shipping">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            {{ product.shippingInformation }}
          </p>
        </div>

        <!-- Right: Details -->
        <div class="detail-info-side">
          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-2 mb-5">
            <span class="meta-pill">{{ product.category.replace(/-/g,' ') }}</span>
            <span v-if="product.stock > 10" class="stock-pill in">In Stock ({{ product.stock }})</span>
            <span v-else-if="product.stock > 0" class="stock-pill low">Low Stock ({{ product.stock }})</span>
            <span v-else class="stock-pill out">Out of Stock</span>
          </div>

          <h2 class="detail-title">{{ product.title }}</h2>
          <p class="detail-desc">{{ product.description }}</p>

          <div v-if="product.specs" class="detail-spec">
            <p class="spec-label">Specifications</p>
            <p class="spec-val">{{ product.specs }}</p>
          </div>
          <div class="detail-spec">
            <p class="spec-label">Warranty</p>
            <p class="spec-val">{{ product.warrantyInformation || 'No warranty included' }}</p>
          </div>

          <!-- Price & Quantity -->
          <div class="price-row">
            <div>
              <p class="price-label">Price</p>
              <div class="flex items-center gap-3">
                <p class="detail-price">Rs. {{ getDiscountedPrice(product).toLocaleString() }}</p>
                <span v-if="product.discountPercentage > 0" class="original-price">Rs. {{ product.price }}</span>
                <span v-if="product.discountPercentage > 0" class="discount-chip">-{{ Math.round(product.discountPercentage) }}%</span>
              </div>
            </div>
            <div class="qty-control">
              <button @click="quantity--" :disabled="quantity <= 1" class="qty-btn">−</button>
              <span class="qty-val">{{ quantity }}</span>
              <button @click="quantity++" :disabled="quantity >= product.stock" class="qty-btn">+</button>
            </div>
          </div>

          <!-- Add to Cart -->
          <button class="add-to-cart-btn" :disabled="product.stock <= 0"
            @click="addToCart(product.title, product.thumbnail, getDiscountedPrice(product))">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
          </button>

          <!-- Q&A Section -->
          <div class="qa-box">
            <h3 class="qa-title">Ask about this product</h3>
            <textarea v-model="qaQuestion" rows="3" placeholder="Ask about price, stock, shipping, warranty, or specifications…" class="qa-textarea"></textarea>
            <div class="flex items-center gap-3 mt-3">
              <button @click="askQuestion" :disabled="qaLoading || !qaQuestion.trim()" class="qa-btn">
                {{ qaLoading ? 'Checking…' : 'Ask AI' }}
              </button>
              <span v-if="!qaLoading && qaProvider" class="text-xs" style="color: var(--stone-400);">via {{ qaProvider }}</span>
            </div>
            <div v-if="qaError" class="mt-3 text-sm" style="color: #DC2626;">{{ qaError }}</div>
            <div v-if="qaAnswer" class="qa-answer">
              <p class="text-xs font-semibold mb-2" style="color: var(--stone-500);">Answer</p>
              <p class="text-sm leading-relaxed whitespace-pre-line" style="color: var(--stone-700);">{{ qaAnswer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Similar Products -->
      <section class="mt-16">
        <!-- Skeleton while loading -->
        <div v-if="recsLoading">
          <div class="mb-6 pb-4" style="border-bottom: 1px solid var(--cream-200);">
            <p class="section-label mb-1">You may also like</p>
            <h3 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--stone-900); font-weight: 400; letter-spacing: -0.02em;">Similar Products</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <div v-for="n in 4" :key="n" class="sim-skeleton">
              <div class="skel-img"></div>
              <div class="skel-body">
                <div class="skel-line short"></div>
                <div class="skel-line"></div>
                <div class="skel-line medium"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-else-if="similarProducts.length">
          <div class="mb-6 pb-4" style="border-bottom: 1px solid var(--cream-200);">
            <p class="section-label mb-1">You may also like</p>
            <h3 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--stone-900); font-weight: 400; letter-spacing: -0.02em;">Similar Products</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <article v-for="rec in similarProducts.slice(0, 4)" :key="rec.productId"
              class="sim-card group" @click="router.push(`/${rec.category}/${rec.productId}`)">
              <div class="sim-img-wrap">
                <img :src="rec.thumbnail" :alt="rec.name" class="sim-img" />
                <!-- Quick Add overlay -->
                <div class="sim-add-overlay" @click.stop="quickAddToCart(rec)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Add to Cart
                </div>
              </div>
              <div class="sim-body">
                <span :class="badgeClass(rec.reason)" class="sim-badge">{{ badgeLabel(rec.reason) }}</span>
                <h4 class="sim-name">{{ rec.name }}</h4>
                <p class="sim-reason">{{ cleanReason(rec.reason) }}</p>
                <p class="sim-price">Rs. {{ getDiscountedPrice(rec).toLocaleString() }}</p>
                <p v-if="rec.discountPercentage > 0" class="sim-original-price">Rs. {{ Number(rec.price).toLocaleString() }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

    </div>

    <!-- Not Found -->
    <div v-else class="min-h-[80vh] flex items-center justify-center">
      <div class="text-center">
        <p style="color: var(--stone-400);" class="text-sm mb-4">Product not found</p>
        <button @click="router.push('/')" class="rounded-full px-6 py-3 text-sm font-semibold"
          style="background: var(--stone-900); color: var(--cream-50);">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "vue-toastification";
const toast = useToast();
import { computed, inject, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from '@/config/api';

const cartStore = useCartStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const quantity = ref(1);
const products = inject("products");
const product = computed(() => {
  const id = Number(route.params.id);
  return products.value?.find(p => p.id === id) || null;
});
const goBack = () => router.push(product.value?.category ? `/${product.value.category}` : '/');
const getDiscountedPrice = (p) => {
  const d = Number(p.discountPercentage || 0);
  return d <= 0 ? Number(p.price) : Number((p.price * (1 - d / 100)).toFixed(2));
};
const addToCart = (title, thumbnail, price) => {
  if (!authStore.isAuthenticated) {
    toast.info("Please sign in before adding items to your cart.", { timeout: 2500, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  cartStore.addToCart(quantity.value, route.params.id, title, thumbnail, price);
  cartStore.totalQuantity();
  toast.success(`${quantity.value} item added to cart`, { timeout: 2000, hideProgressBar: true, icon: false });
};
const qaQuestion = ref('');
const qaAnswer = ref('');
const qaProvider = ref('');
const qaLoading = ref(false);
const qaError = ref(null);
const similarProducts = ref([]);
const recsLoading = ref(false);
let recommendationsRequestId = 0;
const fetchRecommendations = async (productId) => {
  const requestId = ++recommendationsRequestId;
  similarProducts.value = [];
  recsLoading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${productId}/recommendations`);
    if (!res.ok) throw new Error('Failed to load similar products');
    const recommendations = await res.json();
    if (requestId === recommendationsRequestId) similarProducts.value = recommendations;
  } catch {
    if (requestId === recommendationsRequestId) similarProducts.value = [];
  } finally {
    if (requestId === recommendationsRequestId) recsLoading.value = false;
  }
};

// Badge helpers for similar product cards
const badgeLabel = (reason) => {
  if (!reason) return 'Similar';
  if (reason.includes('same category')) return 'Same Category';
  if (reason.includes('same department')) return 'Related';
  return 'Similar';
};
const badgeClass = (reason) => {
  if (!reason) return 'badge-similar';
  if (reason.includes('same category')) return 'badge-same';
  if (reason.includes('same department')) return 'badge-related';
  return 'badge-similar';
};
const cleanReason = (reason) => {
  if (!reason) return '';
  // Only show the shared features part, formatted nicely
  const match = reason.match(/shared features?: ([^;]+)/i);
  if (match) {
    const features = match[1].split(',').map(f => f.trim()).slice(0, 3);
    return features.join(' · ');
  }
  if (reason.includes('similar price range')) return 'Similar price range';
  return '';
};
const quickAddToCart = (rec) => {
  if (!authStore.isAuthenticated) {
    toast.info('Please sign in before adding items to your cart.', { timeout: 2500, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  cartStore.addToCart(1, rec.productId, rec.name, rec.thumbnail, getDiscountedPrice(rec));
  cartStore.totalQuantity();
  toast.success(`${rec.name} added to cart`, { timeout: 2000, hideProgressBar: true, icon: false });
};
const askQuestion = async () => {
  if (!qaQuestion.value.trim() || !product.value) return;
  qaLoading.value = true; qaError.value = null; qaAnswer.value = ''; qaProvider.value = '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.value.id, question: qaQuestion.value.trim() })
    });
    const data = await res.json();
    if (!res.ok) { qaError.value = data.message || 'Unable to get an answer'; return; }
    qaAnswer.value = data.answer || 'No answer returned.';
    qaProvider.value = data.provider || '';
  } catch { qaError.value = 'Failed to get answer. Please try again.'; }
  finally { qaLoading.value = false; }
};
watch(product, (p) => {
  if (p) fetchRecommendations(p.id);
  else {
    recommendationsRequestId += 1;
    similarProducts.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.hover-text:hover { color: var(--stone-700) !important; }
.product-detail-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border: 1px solid var(--cream-200);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
@media (max-width: 900px) {
  .product-detail-card { grid-template-columns: 1fr; }
}
.detail-image-side {
  background: var(--cream-100);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-right: 1px solid var(--cream-200);
  position: relative;
}
@media (max-width: 900px) { .detail-image-side { border-right: none; border-bottom: 1px solid var(--cream-200); } }
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
  background: rgba(250,249,246,0.9); border: 1px solid var(--cream-200);
  padding: 6px 14px; border-radius: 100px; color: var(--stone-600);
  transition: all 0.2s; backdrop-filter: blur(8px);
  align-self: flex-start;
}
.back-btn:hover { background: white; color: var(--stone-900); }
.detail-img-frame {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 2rem; min-height: 320px;
}
.detail-img {
  max-width: 100%; max-height: 380px;
  object-fit: contain; transition: transform 0.5s ease;
}
.detail-img-frame:hover .detail-img { transform: scale(1.05); }
.detail-shipping {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; color: var(--stone-500); font-weight: 500;
  justify-content: center;
}
.detail-info-side { padding: 2.5rem; display: flex; flex-direction: column; gap: 0; }
.meta-pill {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; padding: 4px 12px; border-radius: 100px;
  background: var(--cream-100); color: var(--stone-600);
  border: 1px solid var(--cream-200);
}
.stock-pill {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; padding: 4px 12px; border-radius: 100px; border: 1px solid;
}
.stock-pill.in { background: rgba(34,197,94,0.08); color: #16A34A; border-color: rgba(34,197,94,0.2); }
.stock-pill.low { background: rgba(245,158,11,0.08); color: var(--amber-600); border-color: rgba(245,158,11,0.2); }
.stock-pill.out { background: rgba(220,38,38,0.06); color: #DC2626; border-color: rgba(220,38,38,0.15); }
.detail-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: var(--stone-900); font-weight: 400;
  line-height: 1.15; letter-spacing: -0.02em;
  margin: 0 0 1rem;
}
.detail-desc {
  font-size: 0.95rem; line-height: 1.7;
  color: var(--stone-500); margin: 0 0 1.5rem;
}
.detail-spec { margin-bottom: 1rem; }
.spec-label {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--stone-400); margin-bottom: 4px;
}
.spec-val { font-size: 0.875rem; color: var(--stone-700); line-height: 1.6; }
.price-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 0; margin: 1rem 0;
  border-top: 1px solid var(--cream-200); border-bottom: 1px solid var(--cream-200);
}
.price-label {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--stone-400); margin-bottom: 6px;
}
.detail-price {
  font-size: 2rem; font-weight: 700; color: var(--stone-900);
  letter-spacing: -0.03em; font-family: var(--font-display);
}
.original-price { font-size: 0.9rem; color: var(--stone-400); text-decoration: line-through; }
.discount-chip {
  font-size: 0.7rem; font-weight: 700; padding: 3px 9px;
  border-radius: 100px; background: var(--amber-600); color: white;
}
.qty-control {
  display: flex; align-items: center;
  border: 1px solid var(--cream-200); border-radius: 12px; overflow: hidden;
}
.qty-btn {
  width: 40px; height: 40px; background: transparent; border: none;
  font-size: 1.1rem; font-weight: 500; cursor: pointer;
  color: var(--stone-500); transition: all 0.2s;
}
.qty-btn:hover:not(:disabled) { background: var(--cream-100); color: var(--stone-900); }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-val { width: 44px; text-align: center; font-weight: 700; font-size: 1rem; color: var(--stone-900); }
.add-to-cart-btn {
  width: 100%; padding: 1rem; border-radius: 14px; border: none;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.18);
  margin-bottom: 1.5rem;
}
.add-to-cart-btn:hover:not(:disabled) {
  background: var(--stone-700); transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(28,25,23,0.22);
}
.add-to-cart-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.qa-box {
  background: var(--cream-100); border-radius: 16px; padding: 1.5rem;
  border: 1px solid var(--cream-200);
}
.qa-title {
  font-size: 1rem; font-weight: 600; color: var(--stone-800);
  margin-bottom: 0.875rem; font-family: var(--font-body);
}
.qa-textarea {
  width: 100%; border-radius: 10px; padding: 0.75rem 1rem;
  border: 1px solid var(--cream-200); background: white;
  color: var(--stone-800); font-family: var(--font-body);
  font-size: 0.875rem; line-height: 1.6; resize: none;
  outline: none; transition: border-color 0.2s;
}
.qa-textarea:focus { border-color: var(--stone-400); }
.qa-textarea::placeholder { color: var(--stone-400); }
.qa-btn {
  padding: 8px 20px; border-radius: 100px; border: none; cursor: pointer;
  font-size: 0.8rem; font-weight: 700;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s;
}
.qa-btn:hover:not(:disabled) { background: var(--stone-700); }
.qa-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qa-answer {
  margin-top: 1rem; padding: 1rem; border-radius: 10px;
  background: white; border: 1px solid var(--cream-200);
}
/* Similar products */
.sim-card {
  cursor: pointer; border-radius: 16px; overflow: hidden; background: white;
  border: 1px solid var(--cream-200); transition: box-shadow 0.3s, transform 0.3s;
  display: flex; flex-direction: column;
}
.sim-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.sim-img-wrap {
  height: 160px; background: var(--cream-100);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  position: relative; overflow: hidden;
}
.sim-img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.4s; }
.sim-card:hover .sim-img { transform: scale(1.06); }
/* Quick Add overlay */
.sim-add-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(28, 25, 23, 0.82); color: var(--cream-50);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 10px; backdrop-filter: blur(4px);
  transform: translateY(100%); transition: transform 0.28s ease;
}
.sim-card:hover .sim-add-overlay { transform: translateY(0); }
.sim-body { padding: 1rem; flex: 1; }
/* Smart badges */
.sim-badge {
  display: inline-block;
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; padding: 2px 9px; border-radius: 100px;
  margin-bottom: 6px;
}
.badge-same { background: rgba(34,197,94,0.1); color: #16A34A; border: 1px solid rgba(34,197,94,0.2); }
.badge-related { background: rgba(245,158,11,0.1); color: var(--amber-600); border: 1px solid rgba(245,158,11,0.2); }
.badge-similar { background: var(--cream-100); color: var(--stone-500); border: 1px solid var(--cream-200); }
.sim-name { font-size: 0.85rem; font-weight: 600; color: var(--stone-800); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; }
.sim-reason { font-size: 0.7rem; color: var(--stone-400); line-height: 1.5; margin-bottom: 8px; min-height: 1rem; }
.sim-price { font-size: 1rem; font-weight: 700; color: var(--stone-900); }
.sim-original-price { font-size: 0.7rem; color: var(--stone-400); text-decoration: line-through; }
/* Loading skeleton */
.sim-skeleton {
  border-radius: 16px; overflow: hidden; background: white;
  border: 1px solid var(--cream-200); display: flex; flex-direction: column;
}
.skel-img {
  height: 160px; background: var(--cream-100);
  animation: shimmer 1.4s ease-in-out infinite;
}
.skel-body { padding: 1rem; display: flex; flex-direction: column; gap: 8px; }
.skel-line {
  height: 12px; border-radius: 6px; background: var(--cream-200);
  animation: shimmer 1.4s ease-in-out infinite;
}
.skel-line.short { width: 50%; }
.skel-line.medium { width: 70%; }
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
