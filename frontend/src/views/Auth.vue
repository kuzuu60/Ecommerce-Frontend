<template>
  <div style="min-height: calc(100vh - 80px); background: var(--cream-50);">
    <!-- Page Header -->
    <div class="pt-32 pb-16 px-6 lg:px-12" style="background: var(--cream-100); border-bottom: 1px solid var(--cream-200);">
      <div class="max-w-7xl mx-auto">
        <p class="section-label mb-3">Your account</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(2.5rem,5vw,3.5rem); color: var(--stone-900); font-weight:400; letter-spacing:-0.02em;">
          {{ isSignUp ? 'Create account' : 'Welcome back' }}
        </h1>
        <p class="mt-3 text-base" style="color: var(--stone-500);">
          {{ isSignUp ? 'Sign up to add products to your cart and place orders.' : 'Sign in to continue with your purchase.' }}
        </p>
      </div>
    </div>

    <!-- Auth Card -->
    <div class="max-w-md mx-auto px-6 py-12">
      <div class="rounded-3xl p-8" style="background: white; border: 1px solid var(--cream-200); box-shadow: var(--shadow-md);">

        <!-- Back -->
        <button @click="router.push('/')" class="flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style="color: var(--stone-400);"
          @mouseover="$event.currentTarget.style.color='var(--stone-700)'"
          @mouseleave="$event.currentTarget.style.color='var(--stone-400)'">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to shopping
        </button>

        <!-- Tab Toggle -->
        <div class="grid grid-cols-2 p-1 rounded-xl mb-8" style="background: var(--cream-100);">
          <button @click="setMode(false)" :style="tabStyle(!isSignUp)" class="rounded-lg py-2.5 text-sm font-semibold transition-all">Sign in</button>
          <button @click="setMode(true)" :style="tabStyle(isSignUp)" class="rounded-lg py-2.5 text-sm font-semibold transition-all">Sign up</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="space-y-5">
          <div v-if="isSignUp" class="space-y-2">
            <label for="fullName" class="text-sm font-medium" style="color: var(--stone-700);">Full name</label>
            <input id="fullName" v-model.trim="form.fullName" type="text" autocomplete="name" required placeholder="Your name" class="auth-input" />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium" style="color: var(--stone-700);">Email address</label>
            <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required placeholder="you@example.com" class="auth-input" />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium" style="color: var(--stone-700);">Password</label>
            <input id="password" v-model="form.password" type="password" :autocomplete="isSignUp ? 'new-password' : 'current-password'" required placeholder="At least 6 characters" class="auth-input" />
          </div>

          <div v-if="errorMessage" class="rounded-xl px-4 py-3 text-sm" style="background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.2); color: #DC2626;">
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="loading"
            class="w-full rounded-xl py-3.5 font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style="background: var(--stone-900); color: var(--cream-50);"
            @mouseover="!loading && ($event.currentTarget.style.background='var(--stone-700)')"
            @mouseleave="$event.currentTarget.style.background='var(--stone-900)'">
            {{ loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-sm mt-7" style="color: var(--stone-400);">
          {{ isSignUp ? 'Already have an account?' : 'New to Luxe?' }}
          <button @click="setMode(!isSignUp)" class="font-semibold ml-1 transition-colors"
            style="color: var(--stone-700); background: none; border: none; cursor: pointer;"
            @mouseover="$event.currentTarget.style.color='var(--stone-900)'"
            @mouseleave="$event.currentTarget.style.color='var(--stone-700)'">
            {{ isSignUp ? 'Sign in' : 'Create an account' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/store/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
const isSignUp = ref(route.query.mode === 'signup');
const loading = ref(false);
const errorMessage = ref('');
const form = reactive({ fullName: '', email: '', password: '' });

const tabStyle = (active) =>
  active
    ? 'background: white; color: var(--stone-900); box-shadow: var(--shadow-sm);'
    : 'background: transparent; color: var(--stone-500);';

const setMode = (signUp) => {
  isSignUp.value = signUp;
  errorMessage.value = '';
  router.replace({ query: { ...route.query, mode: signUp ? 'signup' : undefined } });
};

const getRedirectPath = () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  return redirect.startsWith('/') ? redirect : '/';
};

const submitForm = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const endpoint = isSignUp.value ? 'register' : 'user-login';
    const body = isSignUp.value
      ? { fullName: form.fullName, email: form.email, password: form.password }
      : { email: form.email, password: form.password };
    const response = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Unable to authenticate. Please try again.';
      return;
    }
    authStore.setUser(data.token, data.user);
    toast.success(isSignUp.value ? 'Account created.' : 'Signed in.', { timeout: 1800, hideProgressBar: true });
    router.push(getRedirectPath());
  } catch (error) {
    errorMessage.value = 'Unable to connect. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--cream-200);
  background: var(--cream-50);
  padding: 0.8rem 1rem;
  color: var(--stone-800);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.auth-input::placeholder { color: var(--stone-400); }
.auth-input:focus {
  border-color: var(--stone-400);
  box-shadow: 0 0 0 3px rgba(28,25,23,0.06);
}
</style>
