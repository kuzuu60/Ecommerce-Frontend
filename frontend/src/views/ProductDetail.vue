<template>
  <div class="flex justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
    <div v-if="product" class="w-full max-w-6xl bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800 flex flex-col md:flex-row relative">
      <button @click="goBack" class="absolute top-4 left-4 z-10 p-2 bg-slate-800/80 backdrop-blur-md text-slate-200 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-slate-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <!-- Image Section -->
      <div class="md:w-1/2 bg-slate-800/50 p-8 flex flex-col items-center justify-center border-r border-slate-800 relative group">
        <div class="w-full h-[400px] flex items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-700">
          <img :src="product.thumbnail" :alt="product.title" class="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
        </div>
        <!-- Optional Thumbnails or Color Picker could go here -->
      </div>
      
      <!-- Details Section -->
      <div class="md:w-1/2 p-8 md:p-12 flex flex-col">
        <div class="mb-auto">
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">{{ product.category }}</span>
            
            <span v-if="product.stock > 10" class="text-emerald-400 bg-emerald-900/30 border-emerald-500/20 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border">
               In Stock ({{ product.stock }})
            </span>
            <span v-else-if="product.stock > 0" class="text-amber-400 bg-amber-900/30 border-amber-500/20 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border">
               Low Stock ({{ product.stock }})
            </span>
            <span v-else class="text-red-400 bg-red-900/30 border-red-500/20 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border">
               Out of Stock
            </span>
          </div>
          
          <h2 class="text-4xl sm:text-5xl font-extrabold text-slate-100 mb-6 leading-tight tracking-tight">{{ product.title }}</h2>
          
          <p class="text-lg text-slate-400 leading-relaxed mb-8">{{ product.description }}</p>
          
          <div class="border-t border-b border-slate-800 py-6 mb-8 flex items-center justify-between">
             <div>
                <p class="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">Price</p>
                <p class="text-4xl font-black text-blue-500">Rs. {{ product.price }}</p>
             </div>
             
            <div class="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <button @click="quantity--" :disabled="quantity <= 1" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 transition-all font-bold text-lg">-</button>
              <span class="w-12 text-center text-xl font-bold text-slate-200">{{ quantity }}</span>
              <button @click="quantity++" :disabled="quantity >= product.stock" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 transition-all font-bold text-lg">+</button>
            </div>
          </div>
        </div>

        <div class="mt-auto space-y-4">
          <button 
            class="w-full bg-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed" 
            :disabled="product.stock <= 0"
            @click="addToCart(product.title, product.thumbnail, product.price)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
          </button>
          
          <p class="text-center text-sm text-slate-500 font-medium border-t border-slate-800 pt-4 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            {{ product.shippingInformation }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "vue-toastification";
const toast = useToast();
import { computed, inject, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";

// Store & Route
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter(); // Ensure useRouter is imported and assigned

// Navigation
const goBack = () => {
  if (product.value && product.value.category) {
    router.push(`/${product.value.category}`);
  } else {
    router.push('/');
  }
};

// Reactive Variables
const quantity = ref(1);
const products = inject("products");


// Computed Property: Find the product by ID
const product = computed(() => {
  const selectedId = Number(route.params.id);
  return products.value?.find((p) => p.id === selectedId) || null;
});

// Function to Add Product to Cart
const addToCart = (title, thumbnail, price) => {
  cartStore.addToCart(quantity.value, route.params.id, title, thumbnail, price);
  cartStore.totalQuantity();
  showMessage();
};

const showMessage = () => {
  toast.success(`${quantity.value} item added to cart`, {
    toastClassName: "relative flex items-center gap-3 bg-white text-slate-800 font-medium rounded-xl shadow-xl border border-slate-100 p-4 ring-1 ring-black/5", 
    timeout: 2000, 
    hideProgressBar: true,
  });
}

</script>


