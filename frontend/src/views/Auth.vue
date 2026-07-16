<template>
  <div class="min-h-[calc(100vh-90px)] bg-slate-950 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <button @click="router.push('/')" class="text-sm text-slate-400 hover:text-blue-400 transition-colors mb-8">
        ← Back to shopping
      </button>

      <div class="mb-8">
        <p class="text-sm uppercase tracking-[0.3em] text-blue-400 mb-3">Your account</p>
        <h1 class="text-3xl font-bold text-slate-100">{{ isSignUp ? 'Create an account' : 'Welcome back' }}</h1>
        <p class="text-slate-400 mt-2">
          {{ isSignUp ? 'Sign up to add products to your cart and place orders.' : 'Sign in to continue with your purchase.' }}
        </p>
      </div>

      <div class="grid grid-cols-3 bg-slate-950 rounded-xl p-1 mb-7">
        <button @click="setMode(false)" :class="tabClass(!isSignUp)">Sign in</button>
        <button @click="setMode(true)" :class="tabClass(isSignUp)">Sign up</button>
        <button @click="router.push('/admin/login')" class="rounded-lg py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">Admin</button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-5">
        <div v-if="isSignUp" class="space-y-2">
          <label for="fullName" class="text-sm font-medium text-slate-300">Full name</label>
          <input id="fullName" v-model.trim="form.fullName" type="text" autocomplete="name" required placeholder="Your name" class="auth-input" />
        </div>

        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-slate-300">Email address</label>
          <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required placeholder="you@example.com" class="auth-input" />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-slate-300">Password</label>
          <input id="password" v-model="form.password" type="password" :autocomplete="isSignUp ? 'new-password' : 'current-password'" required placeholder="At least 6 characters" class="auth-input" />
        </div>

        <div v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="loading" class="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
          {{ loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-7">
        {{ isSignUp ? 'Already have an account?' : 'New to Luxe?' }}
        <button @click="setMode(!isSignUp)" class="text-blue-400 hover:text-blue-300 font-semibold ml-1">
          {{ isSignUp ? 'Sign in' : 'Create an account' }}
        </button>
      </p>
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

const tabClass = (active) => [
  'rounded-lg py-2.5 text-sm font-semibold transition-colors',
  active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200',
];

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
    const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
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
    toast.success(isSignUp.value ? 'Account created successfully.' : 'Signed in successfully.', {
      timeout: 1800,
      hideProgressBar: true,
    });
    router.push(getRedirectPath());
  } catch (error) {
    console.error('Customer authentication error:', error);
    errorMessage.value = 'Unable to connect to the server. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(51 65 85);
  background: rgb(2 6 23);
  padding: 0.8rem 1rem;
  color: rgb(241 245 249);
  outline: none;
  transition: border-color 0.2s ease;
}

.auth-input:focus {
  border-color: rgb(59 130 246);
}
</style>
