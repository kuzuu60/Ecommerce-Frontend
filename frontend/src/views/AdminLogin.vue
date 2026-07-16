<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-900/50">
      <h1 class="text-3xl font-semibold text-white mb-6 text-center">Admin Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Username</label>
          <input v-model="username" type="text" required class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Password</label>
          <input v-model="password" type="password" required class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" />
        </div>
        <button type="submit" :disabled="loading" class="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
      <p class="mt-6 text-sm text-slate-500">Only authorized admin users can access the dashboard.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/store/adminStore';
import { useToast } from 'vue-toastification';

const router = useRouter();
const adminStore = useAdminStore();
const toast = useToast();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });

    if (!res.ok) {
      const data = await res.json();
      error.value = data.message || 'Login failed';
      return;
    }

    const data = await res.json();
    adminStore.setAdmin(data.token, data.user);
    toast.success('Logged in successfully');
    router.push('/admin');
  } catch (err) {
    console.error(err);
    error.value = 'Unable to login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
