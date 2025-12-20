<template>
  <div class="bg-slate-950 min-h-screen">
    <div class="max-w-[1600px] mx-auto px-6 lg:px-12 py-12" v-if="isValid">
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-12 gap-x-8">
        <li v-for="(product, index) in selectedProductList" :key="product.id" 
            class="appear-animation" :style="{ animationDelay: `${index * 50}ms` }">
          <div class="group relative bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 flex flex-col h-full overflow-hidden cursor-pointer border border-slate-800/50" 
               @click="goToProduct(product.id, selectedTab)">
            
            <!-- Image Area -->
            <div class="relative h-[320px] p-8 bg-slate-800/50 flex items-center justify-center overflow-hidden">
               <div class="absolute inset-0 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] m-2"></div>
              <img
                :src="product.thumbnail"
                :alt="product.title"
                class="relative h-full w-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ease-out"
              />
              
              <!-- Badges -->
               <div class="absolute top-6 right-6 flex flex-col gap-2 z-10">
                 <div class="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-200 shadow-sm border border-slate-700/50">
                    {{ product.category.toUpperCase() }}
                 </div>
                 <div v-if="product.discountPercentage > 10" class="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider shadow-sm shadow-blue-900/50">
                    -{{ Math.round(product.discountPercentage) }}%
                 </div>
               </div>
            </div>

            <!-- Content Area -->
            <div class="px-6 pb-6 pt-6 flex flex-col flex-1 z-20 bg-slate-900">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-lg font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">{{ product.title }}</h3>
              </div>
              
              <div class="flex items-center gap-2 mb-6">
                 <div class="flex text-amber-400 text-sm tracking-tight">
                    <span v-for="n in 5" :key="n" :class="n <= Math.round(product.rating) ? 'fill-current' : 'text-slate-700'">★</span>
                 </div>
                 <span class="text-xs text-slate-400 font-medium pb-0.5">({{ product.rating.toFixed(1) }})</span>
              </div>
              
              <div class="mt-auto flex items-end justify-between">
                <div>
                   <span class="block text-xs text-slate-500 font-medium mb-1">Price</span>
                   <p class="text-2xl font-extrabold text-slate-50 tracking-tight">Rs. {{ product.price }}</p>
                </div>
                
                <button 
                  class="relative overflow-hidden bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-500/50 hover:bg-blue-500 active:scale-95 transition-all duration-300 flex items-center justify-center group/btn z-30" 
                  @click.stop="addToCart(product.id, product.title, product.thumbnail, product.price)"
                >
                  <svg class="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:-translate-y-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <svg class="w-5 h-5 absolute z-10 translate-y-8 transition-transform duration-300 group-hover/btn:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
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
import { ref, watch, inject, watchEffect, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "vue-toastification";

const toast = useToast();
// Vue Router
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
// Reactive Variables
const selectedTab = ref(route.params.category);
const selectedProductList = ref([]);
const products = inject('products');

const availableCategories = [
  "beauty", "skin-care", "fragrances",
  "laptops", "smartphones", "tablets", "mobile-accessories",
  "mens-shirts", "mens-shoes", "mens-watches",
  "womens-dresses", "tops", "womens-shoes", "womens-watches", "womens-jewellery", "womens-bags",
  "home-decoration", "furniture", "kitchen-accessories",
  "sports-accessories", "sunglasses"
];

// Computed Property
const isValid = computed(() => availableCategories.includes(selectedTab.value));

// Methods
const getNewProductList = () => {
  selectedProductList.value = products.value.filter(
    (product) => product.category === selectedTab.value
  );
};

const goToProduct = (id, selectedTab) => {
  router.push(`/${selectedTab}/${id}`);
};

const getStars = (rating) => {
  const fullStars = "★".repeat(Math.floor(rating)); // Full stars
  const emptyStars = "☆".repeat(5 - Math.floor(rating)); // Empty stars
  return fullStars + emptyStars;
};

const addToCart = (id, title, thumbnail, price) => {
  cartStore.addToCart(1, id, title, thumbnail, price);
  cartStore.totalQuantity();
  showMessage();
};

const showMessage = () => {
  toast.success(`1 item added to cart`, {
    toastClassName: "relative flex items-center gap-3 bg-white text-slate-800 font-medium rounded-xl shadow-xl border border-slate-100 p-4 ring-1 ring-black/5", 
    timeout: 2000, 
    hideProgressBar: true,
    icon: false, // We can disable default icon and provide custom if needed, or leave it
  });
};

// Watchers
watchEffect(() => {
  selectedTab.value = route.params.category;
  getNewProductList();
});

watch(products, (newProducts) => {
  if (newProducts) {
    getNewProductList();
  }
});
</script>
