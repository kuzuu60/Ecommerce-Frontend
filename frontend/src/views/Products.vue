<template>
  <div class="bg-slate-950 min-h-screen text-slate-100">
    <div class="max-w-[1600px] mx-auto px-6 lg:px-12 py-12" v-if="isValid">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-[0.35em] text-blue-400 mb-3">Curated catalog</p>
          <h2 class="text-3xl font-semibold">{{ categoryTitle }}</h2>
          <p class="text-slate-400 mt-2">{{ filteredProducts.length }} products ready to explore</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <label class="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-3 min-w-[240px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input v-model="searchQuery" placeholder="Search products" class="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500" />
          </label>

          <div class="relative" ref="sortMenuRef">
            <button type="button" @click.stop="toggleSortOpen" class="flex items-center justify-between min-w-[220px] rounded-full border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-600">
              <span>{{ currentSortLabel }}</span>
              <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="sortOpen" class="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-900/70">
              <button
                v-for="option in sortOptions"
                :key="option.value"
                type="button"
                @click="selectSort(option.value)"
                class="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-900/90"
                :class="sortOption === option.value ? 'bg-slate-900 text-white font-semibold' : 'text-slate-300'"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-12 gap-x-8">
        <div v-for="(product, index) in filteredProducts" :key="product.id" class="appear-animation" :style="{ animationDelay: `${index * 50}ms` }">
          <div class="group relative bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 flex flex-col h-full overflow-hidden cursor-pointer border border-slate-800/50"
               @click="goToProduct(product.id, selectedTab)">
            <div class="relative h-[320px] p-8 bg-slate-800/50 flex items-center justify-center overflow-hidden">
              <div class="absolute inset-0 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] m-2"></div>
              <img :src="product.thumbnail" :alt="product.title" class="relative h-full w-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ease-out" />

              <div class="absolute top-6 right-6 flex flex-col gap-2 z-10">
                <div class="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-200 shadow-sm border border-slate-700/50">
                  {{ product.category.toUpperCase() }}
                </div>
                <div v-if="product.discountPercentage > 0" class="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider shadow-sm shadow-blue-900/50">
                  -{{ Math.round(product.discountPercentage) }}%
                </div>
              </div>
            </div>

            <div class="px-6 pb-6 pt-6 flex flex-col flex-1 z-20 bg-slate-900">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-lg font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">{{ product.title }}</h3>
              </div>

              <div class="flex flex-wrap items-center gap-2 mb-6">
                <span class="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Warranty: {{ product.warrantyInformation || 'No warranty' }}
                </span>
                <span v-if="product.stock <= 0" class="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded ml-2">OUT OF STOCK</span>
              </div>

              <div class="mt-auto flex items-end justify-between">
                <div>
                  <span class="block text-xs text-slate-500 font-medium mb-1">Price</span>
                  <div class="flex items-center gap-2">
                    <p class="text-2xl font-extrabold text-slate-50 tracking-tight">Rs. {{ getDiscountedPrice(product) }}</p>
                    <p v-if="product.discountPercentage > 0" class="text-sm text-slate-500 line-through">Rs. {{ product.price }}</p>
                  </div>
                </div>

                <button
                  class="relative overflow-hidden bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-500/50 hover:bg-blue-500 active:scale-95 transition-all duration-300 flex items-center justify-center group/btn z-30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  :disabled="product.stock <= 0"
                  @click.stop="addToCart(product.id, product.title, product.thumbnail, getDiscountedPrice(product))"
                >
                  <svg class="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:-translate-y-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <svg class="w-5 h-5 absolute z-10 translate-y-8 transition-transform duration-300 group-hover/btn:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rounded-[2rem] border border-slate-800/70 bg-slate-900/70 p-10 text-center">
        <h3 class="text-xl font-semibold text-slate-100">No products match your search</h3>
        <p class="text-slate-400 mt-2">Try a different keyword or reset the filters to browse this category again.</p>
        <button @click="searchQuery = ''; sortOption = 'featured'" class="mt-6 rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-500 transition-colors">Reset filters</button>
      </div>
    </div>

    <div v-else class="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950">
      <div class="relative mb-8 group cursor-pointer" @click="router.push('/')">
        <div class="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img src="/assets/page-not-found.png" alt="pagenotfound" class="relative w-[320px] h-auto opacity-75 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 group-hover:scale-105">
      </div>
      <h2 class="text-3xl font-extrabold text-slate-100 mb-3 tracking-tight">Category Not Found</h2>
      <p class="text-slate-500 text-lg max-w-md text-center mb-8">It seems like the category you are looking for has been moved or doesn't exist.</p>
      <button @click="router.push('/')" class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-95 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Return Home
      </button>
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
  "laptops", "smartphones", "tablets", "mobile-accessories",
  "home-decoration", "furniture", "kitchen-accessories",
  "sports-accessories", "sunglasses", "deals"
];

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: highest to lowest', value: 'price-high' },
  { label: 'Price: lowest to highest', value: 'price-low' }
];

const sortOpen = ref(false);
const sortMenuRef = ref(null);

const toggleSortOpen = () => {
  sortOpen.value = !sortOpen.value;
};

const selectSort = (value) => {
  sortOption.value = value;
  sortOpen.value = false;
};

const closeSort = () => {
  sortOpen.value = false;
};

const isValid = computed(() => availableCategories.includes(selectedTab.value));
const categoryTitle = computed(() => {
  if (selectedTab.value === 'deals') return 'Special Offers';
  const label = selectedTab.value?.replace(/-/g, ' ');
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Products';
});

const currentSortLabel = computed(() => {
  const option = sortOptions.find(o => o.value === sortOption.value);
  return option ? option.label : 'Sort';
});

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const filtered = selectedProductList.value.filter((product) => {
    if (!query) return true;
    return [product.title, product.category, product.description]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(query));
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (sortOption.value) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return b.id - a.id;
    }
  });

  return sorted;
});

const getNewProductList = () => {
  if (selectedTab.value === 'deals') {
    selectedProductList.value = products.value.filter(
      (product) => Number(product.discountPercentage || 0) > 10
    );
  } else {
    selectedProductList.value = products.value.filter(
      (product) => product.category === selectedTab.value
    );
  }
};

const getDiscountedPrice = (product) => {
  const discount = Number(product.discountPercentage || 0);
  if (discount <= 0) return Number(product.price);
  return Number((product.price * (1 - discount / 100)).toFixed(2));
};

const goToProduct = (id, selectedTab) => {
  const product = products.value?.find((p) => p.id === id);
  const category = product ? product.category : selectedTab;
  router.push(`/${category}/${id}`);
};

const addToCart = (id, title, thumbnail, price) => {
  if (!authStore.isAuthenticated) {
    toast.info("Please sign in or sign up before adding items to your cart.", {
      timeout: 2500,
      hideProgressBar: true,
    });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  cartStore.addToCart(1, id, title, thumbnail, price);
  cartStore.totalQuantity();
  showMessage();
};

const showMessage = () => {
  toast.success(`1 item added to cart`, {
    toastClassName: "relative flex items-center gap-3 bg-white text-slate-800 font-medium rounded-xl shadow-xl border border-slate-100 p-4 ring-1 ring-black/5",
    timeout: 2000,
    hideProgressBar: true,
    icon: false,
  });
};

const handleClickOutside = (event) => {
  if (sortOpen.value && sortMenuRef.value && !sortMenuRef.value.contains(event.target)) {
    sortOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watchEffect(() => {
  selectedTab.value = route.meta.isDeals ? 'deals' : route.params.category;
  getNewProductList();
});

watch(products, (newProducts) => {
  if (newProducts) {
    getNewProductList();
  }
});
</script>
