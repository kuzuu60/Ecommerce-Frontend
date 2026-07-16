<template>
  <div style="background: var(--cream-50); min-height: 100vh; padding-top: 5.5rem;">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style="height: calc(100vh - 5.5rem);">

      <!-- Header -->
      <div class="assistant-header mb-4">
        <div class="ai-avatar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--amber-600);">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <h1 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;">Product Assistant</h1>
          <p style="font-size: 0.75rem; color: var(--stone-400); font-weight: 500;">Describe your needs and we'll find matching products from our catalog</p>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="chat-shell flex-1 flex flex-col overflow-hidden">
        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5" ref="chatContainerRef">
          <div v-for="(msg, i) in messages" :key="i"
            :class="['flex gap-3 msg-animate', msg.sender === 'user' ? 'justify-end' : 'justify-start']">

            <!-- AI Avatar -->
            <div v-if="msg.sender !== 'user'" class="msg-avatar ai-msg-avatar shrink-0">AI</div>

            <div class="flex flex-col gap-3 max-w-[82%]">
              <!-- Text Bubble -->
              <div :class="[msg.sender === 'user' ? 'user-bubble' : 'ai-bubble', i === 0 ? 'ai-intro-bubble' : '']">
                <p class="whitespace-pre-line text-sm leading-relaxed">{{ msg.text }}</p>
                <span v-if="msg.provider" class="provider-tag">via {{ msg.provider }}</span>
              </div>

              <!-- Product Cards -->
              <div v-if="msg.products && msg.products.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[500px]">
                <div v-for="product in msg.products" :key="product.id"
                  class="rec-card group" @click="goToProduct(product)">
                  <div class="rec-img-wrap">
                    <img :src="product.thumbnail" :alt="product.title" class="rec-img" />
                    <span v-if="product.discountPercentage > 0" class="rec-discount">-{{ Math.round(product.discountPercentage) }}%</span>
                  </div>
                  <div class="rec-body">
                    <p class="rec-category">{{ product.category }}</p>
                    <h4 class="rec-name">{{ product.title }}</h4>
                    <div class="rec-foot">
                      <div>
                        <p class="rec-price">Rs. {{ getDiscountedPrice(product).toLocaleString() }}</p>
                        <p v-if="product.discountPercentage > 0" class="rec-original">Rs. {{ product.price }}</p>
                      </div>
                      <button class="rec-add" :disabled="product.stock <= 0" @click.stop="addToCart(product)" title="Add to Cart">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Avatar -->
            <div v-if="msg.sender === 'user'" class="msg-avatar user-msg-avatar shrink-0">U</div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="loading" class="flex gap-3 justify-start">
            <div class="msg-avatar ai-msg-avatar shrink-0">AI</div>
            <div class="ai-bubble">
              <div class="flex items-center gap-1.5">
                <div class="typing-dot" style="animation-delay: 0ms;"></div>
                <div class="typing-dot" style="animation-delay: 150ms;"></div>
                <div class="typing-dot" style="animation-delay: 300ms;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Suggestion Chips + Input -->
        <div class="chat-input-wrapper">
          <!-- Chips: only show when input is empty and not focused -->
          <Transition name="chips">
            <div v-if="!inputQuery && !isFocused && !loading" class="chips-row">
              <button
                v-for="chip in suggestionChips"
                :key="chip"
                type="button"
                class="chip"
                @click="useChip(chip)"
              >
                {{ chip }}
              </button>
            </div>
          </Transition>

          <form @submit.prevent="sendMessage" class="chat-input-bar">
            <input
              v-model="inputQuery"
              type="text"
              placeholder="Ask anything — budget, category, use case…"
              class="chat-input"
              :disabled="loading"
              @focus="isFocused = true"
              @blur="isFocused = false"
              ref="chatInputRef"
            />
            <button type="submit" :disabled="loading || !inputQuery.trim()" class="chat-send">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'vue-toastification';
import { API_BASE_URL } from '@/config/api';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const cartStore = useCartStore();
const authStore = useAuthStore();
const messages = ref([{ sender: 'ai', text: "Tell me what you're looking for — budget, category, or specific needs — and I'll find the closest matches from our catalog." }]);
const inputQuery = ref('');
const loading = ref(false);
const isFocused = ref(false);
const chatContainerRef = ref(null);
const chatInputRef = ref(null);

const suggestionChips = [
  'Laptop under Rs. 100,000',
  'Best smartphones this week',
  'Home decor ideas',
  'Sports gear under Rs. 5,000',
  'Kitchen essentials',
];

const useChip = (chip) => {
  inputQuery.value = chip;
  isFocused.value = true;
  nextTick(() => chatInputRef.value?.focus());
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
};
const getDiscountedPrice = (p) => {
  const d = Number(p.discountPercentage || 0);
  return d <= 0 ? Number(p.price) : Number((p.price * (1 - d / 100)).toFixed(2));
};
const goToProduct = (p) => router.push(`/${p.category}/${p.id}`);
const addToCart = (product) => {
  if (!authStore.isAuthenticated) {
    toast.info("Please sign in before adding items.", { timeout: 2500, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: route.fullPath } });
    return;
  }
  cartStore.addToCart(1, product.id, product.title, product.thumbnail, getDiscountedPrice(product));
  cartStore.totalQuantity();
  toast.success('Added to cart', { timeout: 1800, hideProgressBar: true, icon: false });
};
const sendMessage = async () => {
  if (!inputQuery.value.trim() || loading.value) return;
  const userText = inputQuery.value.trim();
  messages.value.push({ sender: 'user', text: userText });
  inputQuery.value = '';
  loading.value = true;
  await scrollToBottom();
  try {
    const res = await fetch(`${API_BASE_URL}/api/qa/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements: userText })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'The assistant could not complete that request.');
    }
    const data = await res.json();
    messages.value.push({
      sender: 'ai',
      text: data.answer || "I checked our catalog but couldn't find exact matches.",
      products: data.recommendedProducts || [],
      provider: data.provider
    });
  } catch (error) {
    console.error('Assistant request failed:', error);
    messages.value.push({ sender: 'ai', text: error.message || 'Sorry, I encountered an issue. Please check your connection and try again.' });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
.assistant-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.25rem;
  background: white; border: 1px solid var(--cream-200);
  border-radius: 16px; box-shadow: var(--shadow-sm);
}
.ai-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.chat-shell {
  background: white; border: 1px solid var(--cream-200);
  border-radius: 20px; overflow: hidden;
  box-shadow: var(--shadow-md);
}
.msg-animate { animation: msgIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.msg-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 800;
  letter-spacing: 0.04em; margin-top: 2px;
}
.ai-msg-avatar { background: var(--cream-100); color: var(--stone-600); border: 1px solid var(--cream-200); }
.user-msg-avatar { background: var(--stone-900); color: var(--cream-50); }
.user-bubble {
  padding: 0.875rem 1.1rem; border-radius: 18px 18px 4px 18px;
  background: var(--stone-900); color: var(--cream-50);
  font-size: 0.875rem; max-width: 420px;
}
.ai-bubble {
  padding: 0.875rem 1.1rem; border-radius: 18px 18px 18px 4px;
  background: var(--cream-100); color: var(--stone-700);
  border: 1px solid var(--cream-200); max-width: 420px;
}
.ai-intro-bubble { color: var(--stone-600); }
.provider-tag { display: block; font-size: 0.65rem; color: var(--stone-400); margin-top: 6px; text-align: right; }
/* Product recs */
.rec-card {
  background: white; border: 1px solid var(--cream-200); border-radius: 14px;
  overflow: hidden; cursor: pointer; transition: box-shadow 0.25s, transform 0.25s;
  display: flex; flex-direction: column;
}
.rec-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.rec-img-wrap {
  height: 120px; background: var(--cream-100);
  display: flex; align-items: center; justify-content: center;
  padding: 0.875rem; position: relative; overflow: hidden;
}
.rec-img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.4s; }
.rec-card:hover .rec-img { transform: scale(1.06); }
.rec-discount {
  position: absolute; top: 8px; right: 8px;
  font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 100px;
  background: var(--amber-600); color: white;
}
.rec-body { padding: 0.875rem; flex: 1; display: flex; flex-direction: column; }
.rec-category { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--amber-600); margin-bottom: 3px; }
.rec-name { font-size: 0.8rem; font-weight: 600; color: var(--stone-800); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: auto; padding-bottom: 0.75rem; }
.rec-foot { display: flex; align-items: center; justify-content: space-between; }
.rec-price { font-size: 0.9rem; font-weight: 700; color: var(--stone-900); }
.rec-original { font-size: 0.68rem; color: var(--stone-400); text-decoration: line-through; }
.rec-add {
  width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--cream-200);
  background: transparent; color: var(--stone-500); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.rec-card:hover .rec-add:not(:disabled) { background: var(--stone-900); color: var(--cream-50); border-color: var(--stone-900); }
.rec-add:disabled { opacity: 0.3; cursor: not-allowed; }
/* Typing */
.typing-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--stone-400); animation: typingBounce 1.2s infinite ease-in-out;
}
@keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
/* Input */
.chat-input-bar {
  display: flex; gap: 10px; padding: 1rem 1.25rem;
  border-top: 1px solid var(--cream-200); background: var(--cream-50);
}
.chat-input {
  flex: 1; border-radius: 100px; padding: 0.75rem 1.25rem;
  border: 1px solid var(--cream-200); background: white;
  color: var(--stone-800); font-family: var(--font-body); font-size: 0.875rem;
  outline: none; transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--stone-400); }
.chat-input::placeholder { color: var(--stone-500); opacity: 0.62; }
.chat-send {
  width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.chat-send:hover:not(:disabled) { background: var(--stone-700); transform: scale(1.05); }
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* Recommendation chips */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.9rem 1.25rem 0.15rem;
}
.chip {
  border: 1px solid var(--cream-200);
  border-radius: 999px;
  background: var(--cream-50);
  color: var(--stone-600);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.55rem 0.85rem;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}
.chip:hover {
  border-color: var(--cream-300);
  background: var(--cream-100);
  color: var(--stone-800);
  transform: translateY(-1px);
}
.chips-enter-active, .chips-leave-active { transition: opacity 0.2s, transform 0.2s; }
.chips-enter-from, .chips-leave-to { opacity: 0; transform: translateY(5px); }
</style>
