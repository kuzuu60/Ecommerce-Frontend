<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm transition-all duration-300" @click.self="$emit('close')">
    <div class="relative w-full max-w-2xl scale-100 transform rounded-2xl bg-white p-6 opacity-100 shadow-2xl transition-all duration-300 sm:p-10">
      
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex flex-col gap-8 md:flex-row">
        <!-- Image Section -->
        <div class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 p-4">
          <img :src="product.thumbnail" :alt="product.title" class="max-h-[300px] w-auto object-contain transition-transform duration-500 hover:scale-105" />
        </div>

        <!-- Content Section -->
        <div class="flex flex-1 flex-col justify-between">
          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">{{ product.category }}</span>
              <div class="flex items-center gap-1 text-amber-400">
                <span>★</span>
                <span class="font-medium text-gray-700">{{ product.rating }}</span>
              </div>
            </div>
            
            <h2 class="mb-2 text-3xl font-bold text-gray-800 leading-tight">{{ product.title }}</h2>
            <p class="mb-6 text-3xl font-extrabold text-blue-600">${{ product.price }}</p>
            
            <p class="mb-6 text-gray-600 leading-relaxed text-sm">
              Discover the quality and style of our {{ product.title }}. Perfect for your needs and designed to last.
              <!-- Placeholder description as generic product object might not have one, or we can use product.description if available -->
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
             <button 
              @click="$emit('addToCart', product)"
              class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
            <button 
              @click="$emit('close')"
              class="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  }
});

defineEmits(['close', 'addToCart']);
</script>
