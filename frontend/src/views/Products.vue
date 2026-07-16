<template>
  <div style="background: var(--cream-50); min-height: 100vh;">
    <!-- Page Header -->
    <div class="pt-32 pb-12 px-6 lg:px-12" style="background: var(--cream-100); border-bottom: 1px solid var(--cream-200);">
      <div class="max-w-7xl mx-auto">
        <p class="section-label mb-3">Browse catalog</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(2.2rem,5vw,3.2rem); color: var(--stone-900); font-weight:400; letter-spacing:-0.02em;">
          {{ categoryTitle }}
        </h1>
        <p class="mt-2 text-sm" style="color: var(--stone-500);">{{ filteredProducts.length }} products in this collection</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-10" v-if="isValid">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div class="flex gap-3 w-full sm:w-auto">
          <!-- Search -->
          <label class="flex items-center gap-2 rounded-full px-4 py-2.5 flex-1 sm:min-w-[260px]"
            style="background: white; border: 1px solid var(--cream-200); box-shadow: var(--shadow-sm);">
            <svg class="w-4 h-4 shrink-0" style="color: var(--stone-400);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchQuery" placeholder="Search products…"
              class="w-full bg-transparent outline-none text-sm" style="color: var(--stone-800); font-family: var(--font-body);" />
          </label>

          <!-- Sort -->
          <div class="relative" ref="sortMenuRef">
            <button type="button" @click.stop="toggleSortOpen"
              class="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all sm:min-w-[200px]"
              style="background: white; border: 1px solid var(--cream-200); color: var(--stone-700); box-shadow: var(--shadow-sm);">
              <span class="flex-1 text-left">{{ currentSortLabel }}</span>
              <svg class="w-4 h-4 shrink-0 transition-transform" :style="sortOpen ? 'transform:rotate(180deg)' : ''" style="color: var(--stone-400);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div v-if="sortOpen" class="absolute right-0 z-50 mt-2 w-full overflow-hidden"
              style="background: white; border: 1px solid var(--cream-200); border-radius: 16px; box-shadow: var(--shadow-lg);">
              <button v-for="option in sortOptions" :key="option.value" type="button"
                @click="selectSort(option.value)"
                class="w-full px-4 py-3 text-left text-sm transition-colors"
                :style="sortOption === option.value
                  ? 'background: var(--cream-100); color: var(--stone-900); font-weight: 600;'
                  : 'color: var(--stone-600);'"
                @mouseover="sortOption !== option.value && ($event.currentTarget.style.background='var(--cream-50)')"
                @mouseleave="sortOption !== option.value && ($event.currentTarget.style.background='transparent')">
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Grid -->
      <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
        <div v-for="(product, index) in filteredProducts" :key="product.id" class="appear-animation" :style="`animation-delay: ${index * 40}ms`">
          <div class="product-card group" @click="goToProduct(product.id, selectedTab)">
            <!-- Image -->
            <div class="product-img-wrap">
              <img :src="product.thumbnail" :alt="product.title" class="product-img" />
              <div class="product-badge-row">
                <span class="cat-badge">{{ product.category.replace(/-/g,' ') }}</span>
                <span v-if="product.discountPercentage > 0" class="discount-badge">-{{ Math.round(product.discountPercentage) }}%</span>
              </div>
              <span v-if="product.stock <= 0" class="oos-badge">Out of stock</span>
            </div>
            <!-- Info -->
            <div class="product-body">
              <p class="product-brand">{{ product.brand || product.category }}</p>
              <h3 class="product-name">{{ product.title }}</h3>
              <p class="product-warranty">{{ product.warrantyInformation || 'No warranty' }}</p>
              <div class="product-foot">
                <div>
                  <p class="product-price">Rs. {{ getDiscountedPrice(product).toLocaleString() }}</p>
                  <p v-if="product.discountPercentage > 0" class="product-original">Rs. {{ product.price }}</p>
                </div>
                <button class="add-btn"
                  :disabled="product.stock <= 0"
                  @click.stop="addToCart(product.id, product.title, product.thumbnail, getDiscountedPrice(product))">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-20 flex flex-col items-center text-center gap-5">
        <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: var(--cream-100); color: var(--stone-400);">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h3 class="text-lg font-semibold" style="color: var(--stone-800); font-family: var(--font-display);">No products match your search</h3>
        <p class="text-sm" style="color: var(--stone-500);">Try a different keyword or reset the filters.</p>
        <button @click="searchQuery = ''; sortOption = 'featured'" class="mt-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
          style="background: var(--stone-900); color: var(--cream-50);">Reset filters</button>
      </div>
    </div>

    <!-- Invalid Category -->
    <div v-else class="min-h-[70vh] flex flex-col items-center justify-center gap-6">
      <img src="/assets/page-not-found.png" alt="Not found" class="w-56 h-auto opacity-40" />
      <h2 class="text-2xl font-semibold" style="color: var(--stone-800); font-family: var(--font-display);">Category Not Found</h2>
      <p class="text-sm" style="color: var(--stone-500);">This category doesn't exist or has been moved.</p>
      <button @click="router.push('/')" class="rounded-full px-6 py-3 text-sm font-semibold transition-all"
        style="background: var(--stone-900); color: var(--cream-50);">Return Home</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject, watchEffect, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const selectedTab = ref(route.meta.isDeals ? 'deals' : route.params.category);
const selectedProductList = ref([]);
const products = inject('products');
const searchQuery = ref('');
const sortOption = ref('featured');

const availableCategories = [
  "laptops","smartphones","tablets","mobile-accessories",
  "home-decoration","furniture","kitchen-accessories",
  "sports-accessories","sunglasses","deals"
];
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: High → Low', value: 'price-high' },
  { label: 'Price: Low → High', value: 'price-low' }
];
const sortOpen = ref(false);
const sortMenuRef = ref(null);
const toggleSortOpen = () => { sortOpen.value = !sortOpen.value; };
const selectSort = (value) => { sortOption.value = value; sortOpen.value = false; };
const isValid = computed(() => availableCategories.includes(selectedTab.value));
const categoryTitle = computed(() => {
  if (selectedTab.value === 'deals') return 'Special Offers';
  const label = selectedTab.value?.replace(/-/g, ' ');
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Products';
});
const currentSortLabel = computed(() => sortOptions.find(o => o.value === sortOption.value)?.label || 'Sort');
const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const filtered = selectedProductList.value.filter(p =>
    !query || [p.title, p.category, p.description].filter(Boolean).some(v => v.toString().toLowerCase().includes(query))
  );
  return [...filtered].sort((a, b) => {
    if (sortOption.value === 'price-low') return a.price - b.price;
    if (sortOption.value === 'price-high') return b.price - a.price;
    return b.id - a.id;
  });
});
const getDiscountedPrice = (product) => {
  const d = Number(product.discountPercentage || 0);
  return d <= 0 ? Number(product.price) : Number((product.price * (1 - d / 100)).toFixed(2));
};
const goToProduct = (id, tab) => {
  const product = products.value?.find(p => p.id === id);
  router.push(`/${product ? product.category : tab}/${id}`);
};
const addToCart = (id, title, thumbnail, price) => {
  if (!authStore.isAuthenticated) {
    toast.info("Please sign in before adding items to your cart.", { timeout: 2500, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  cartStore.addToCart(1, id, title, thumbnail, price);
  cartStore.totalQuantity();
  toast.success(`Added to cart`, { timeout: 1800, hideProgressBar: true, icon: false });
};
const getNewProductList = () => {
  selectedProductList.value = selectedTab.value === 'deals'
    ? products.value.filter(p => Number(p.discountPercentage || 0) > 10)
    : products.value.filter(p => p.category === selectedTab.value);
};
const handleClickOutside = (e) => {
  if (sortOpen.value && sortMenuRef.value && !sortMenuRef.value.contains(e.target)) sortOpen.value = false;
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
watchEffect(() => { selectedTab.value = route.meta.isDeals ? 'deals' : route.params.category; getNewProductList(); });
watch(products, (np) => { if (np) getNewProductList(); });
</script>

<style scoped>
.product-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  overflow: hidden;
  background: white;
  border: 1px solid var(--cream-200);
  transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
}
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
  border-color: var(--cream-300);
}
.product-img-wrap {
  position: relative;
  aspect-ratio: 1;
  background: var(--cream-100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  overflow: hidden;
}
.product-img {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;
}
.product-card:hover .product-img { transform: scale(1.06); }
.product-badge-row {
  position: absolute; top: 10px; right: 10px;
  display: flex; flex-direction: column; gap: 4px; align-items: flex-end;
}
.cat-badge {
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 100px;
  background: rgba(250,249,246,0.9); color: var(--stone-600);
  border: 1px solid rgba(28,25,23,0.08);
  backdrop-filter: blur(8px);
}
.discount-badge {
  font-size: 0.6rem; font-weight: 700; padding: 3px 8px; border-radius: 100px;
  background: var(--amber-600); color: white;
}
.oos-badge {
  position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 100px;
  background: rgba(220,38,38,0.1); color: #DC2626;
  border: 1px solid rgba(220,38,38,0.2);
}
.product-body { padding: 1rem 1.1rem 1.1rem; display: flex; flex-direction: column; flex: 1; }
.product-brand {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--amber-600); margin: 0 0 0.3rem;
}
.product-name {
  font-size: 0.85rem; font-weight: 500; color: var(--stone-800);
  line-height: 1.45; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin: 0 0 0.35rem; flex: 1;
}
.product-warranty {
  font-size: 0.68rem; color: var(--stone-400); margin: 0 0 0.9rem;
}
.product-foot { display: flex; align-items: flex-end; justify-content: space-between; }
.product-price { font-size: 1rem; font-weight: 700; color: var(--stone-900); letter-spacing: -0.02em; }
.product-original { font-size: 0.72rem; color: var(--stone-400); text-decoration: line-through; }
.add-btn {
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid var(--cream-200);
  background: transparent; color: var(--stone-500);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.product-card:hover .add-btn:not(:disabled) {
  background: var(--stone-900); color: var(--cream-50); border-color: var(--stone-900);
}
</style>
