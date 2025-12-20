<template>
  <div class="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center p-4">
    <div class="bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-slate-800 appear-animation">
      <div class="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      
      <h2 class="text-3xl font-extrabold text-slate-100 mb-2">Payment Failed</h2>
      <p class="text-slate-400 mb-8">Something went wrong with your transaction. Please try again.</p>
      
      <div class="flex flex-col gap-3">
        <button @click="router.push('/payment')" class="w-full bg-slate-100 text-slate-900 py-3.5 px-6 rounded-xl font-bold hover:bg-white transition-colors shadow-lg shadow-black/20">
          Try Again
        </button>
        <button @click="router.push('/')" class="w-full bg-transparent text-slate-400 border border-slate-700 py-3.5 px-6 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-200 transition-colors">
          Return to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
