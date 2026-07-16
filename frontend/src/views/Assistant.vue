<template>
  <div class="bg-slate-950 min-h-screen text-slate-100 py-12 px-6 lg:px-12">
    <div class="max-w-4xl mx-auto flex flex-col h-[80vh] bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-slate-800 bg-slate-900/80 flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-100">Product Recommendation Assistant</h2>
          <p class="text-xs text-slate-400">Describe your needs and find matching products from our catalog.</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-8 space-y-6" ref="chatContainerRef">
        <div v-for="(msg, index) in messages" :key="index" :class="['flex gap-4 max-w-[85%] animate-fade-in', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : '']">
          <!-- Avatar -->
          <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0', msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700']">
            {{ msg.sender === 'user' ? 'U' : 'CB' }}
          </div>

          <!-- Bubble Content -->
          <div class="space-y-4">
            <div :class="['px-5 py-3.5 rounded-2xl text-sm leading-relaxed border', msg.sender === 'user' ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' : 'bg-slate-900 text-slate-300 border-slate-800 rounded-tl-none']">
              <p class="whitespace-pre-line">{{ msg.text }}</p>
              <div v-if="msg.provider" class="text-[10px] text-slate-500 mt-2 block text-right">Powered by {{ msg.provider }}</div>
            </div>

            <!-- Recommended Products Grid -->
            <div v-if="msg.products && msg.products.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="product in msg.products" :key="product.id" class="group bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col">
                <!-- Thumbnail -->
                <div class="h-40 bg-white p-4 flex items-center justify-center relative overflow-hidden shrink-0" @click="goToProduct(product)">
                  <img :src="product.thumbnail" :alt="product.title" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer" />
                  <div class="absolute top-3 right-3 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider" v-if="product.discountPercentage > 0">
                    -{{ Math.round(product.discountPercentage) }}%
                  </div>
                </div>

                <!-- Info -->
                <div class="p-4 flex flex-col flex-1">
                  <h4 class="text-sm font-bold text-slate-100 line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors duration-200 cursor-pointer" @click="goToProduct(product)">
                    {{ product.title }}
                  </h4>
                  <p class="text-xs text-slate-400 mb-3 font-semibold">{{ product.category }}</p>
                  <p class="text-[10px] text-slate-500 mb-3">Warranty: {{ product.warrantyInformation || 'No warranty' }}</p>

                  <div class="mt-auto flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm font-extrabold text-slate-100">Rs. {{ getDiscountedPrice(product) }}</span>
                        <span class="text-[10px] text-slate-500 line-through" v-if="product.discountPercentage > 0">Rs. {{ product.price }}</span>
                      </div>
                    </div>

                    <!-- Cart button -->
                    <button 
                      class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/30 transition active:scale-95 disabled:opacity-50"
                      :disabled="product.stock <= 0"
                      @click="addToCart(product)"
                      title="Add to Cart"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Loading -->
        <div v-if="loading" class="flex gap-4 max-w-[85%]">
          <div class="w-9 h-9 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-sm font-bold">CB</div>
          <div class="px-5 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-75"></div>
            <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150"></div>
            <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300"></div>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <form @submit.prevent="sendMessage" class="px-8 py-5 border-t border-slate-800 bg-slate-900/80 flex gap-4 items-center">
        <input 
          v-model="inputQuery"
          type="text" 
          placeholder="Ask me to recommend something... (e.g. 'I want a laptop under Rs. 150000')" 
          class="flex-1 bg-slate-950 border border-slate-800 rounded-full px-6 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
          :disabled="loading"
        />
        <button 
          type="submit" 
          :disabled="loading || !inputQuery.trim()" 
          class="bg-blue-600 text-white rounded-full px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-900/30 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-2"
        >
          <span>Send</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'vue-toastification';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const cartStore = useCartStore();
const authStore = useAuthStore();

const messages = ref([
  {
    sender: 'ai',
    text: "Tell me what you're looking for, including your budget, preferences, or category, and I will find the closest matches from our store."
  }
]);

const inputQuery = ref('');
const loading = ref(false);
const chatContainerRef = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const getDiscountedPrice = (product) => {
  const discount = Number(product.discountPercentage || 0);
  if (discount <= 0) return Number(product.price);
  return Number((product.price * (1 - discount / 100)).toFixed(2));
};

const goToProduct = (product) => {
  router.push(`/${product.category}/${product.id}`);
};

const addToCart = (product) => {
  if (!authStore.isAuthenticated) {
    toast.info("Please sign in or sign up before adding items to your cart.", {
      timeout: 2500,
      hideProgressBar: true,
    });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  const price = getDiscountedPrice(product);
  cartStore.addToCart(1, product.id, product.title, product.thumbnail, price);
  cartStore.totalQuantity();
  toast.success(`1 item added to cart`, {
    toastClassName: "relative flex items-center gap-3 bg-white text-slate-800 font-medium rounded-xl shadow-xl border border-slate-100 p-4 ring-1 ring-black/5",
    timeout: 2000,
    hideProgressBar: true,
    icon: false,
  });
};

const sendMessage = async () => {
  if (!inputQuery.value.trim() || loading.value) return;

  const userText = inputQuery.value.trim();
  messages.value.push({ sender: 'user', text: userText });
  inputQuery.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    const res = await fetch('http://localhost:5000/api/qa/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requirements: userText })
    });

    if (!res.ok) {
      throw new Error('Recommendation service failed to respond.');
    }

    const data = await res.json();
    messages.value.push({
      sender: 'ai',
      text: data.answer || "I've checked our catalog but couldn't find matches fitting your exact requirement.",
      products: data.recommendedProducts || [],
      provider: data.provider
    });
  } catch (err) {
    console.error('Recommendation Error:', err);
    messages.value.push({
      sender: 'ai',
      text: 'Sorry, I encountered an issue processing your request. Please check your backend connection.'
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
