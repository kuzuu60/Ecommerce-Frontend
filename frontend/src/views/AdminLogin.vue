<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-900/50">
      <button @click="router.push('/')" class="mb-6 text-sm text-slate-400 transition-colors hover:text-blue-400">
        ← Back to storefront
      </button>
      <h1 class="text-3xl font-semibold text-white mb-2 text-center">{{ isRegistering ? 'Create Admin' : 'Admin Login' }}</h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        {{ isRegistering ? 'Create an administrator account using the setup key.' : 'Sign in to manage the Luxe storefront.' }}
      </p>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Username</label>
          <input v-model.trim="username" type="text" autocomplete="username" required class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Password</label>
          <input v-model="password" type="password" :autocomplete="isRegistering ? 'new-password' : 'current-password'" required class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" />
        </div>
        <div v-if="isRegistering">
          <label class="block text-sm font-medium text-slate-400 mb-2">Admin setup key</label>
          <input v-model="setupKey" type="password" autocomplete="off" required class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" />
        </div>
        <button type="submit" :disabled="loading" class="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
          {{ loading ? 'Please wait...' : isRegistering ? 'Create admin account' : 'Sign in' }}
        </button>
      </form>
      <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
      <p class="mt-6 text-center text-sm text-slate-500">
        {{ isRegistering ? 'Already have an admin account?' : 'Need to create an admin account?' }}
        <button type="button" @click="toggleRegistration" class="text-blue-400 hover:text-blue-300 font-semibold ml-1">
          {{ isRegistering ? 'Sign in' : 'Create admin' }}
        </button>
      </p>
      <p class="mt-3 text-center text-xs text-slate-600">Only authorized users with the setup key can create administrators.</p>
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
const setupKey = ref('');
const isRegistering = ref(false);
const loading = ref(false);
const error = ref(null);

const toggleRegistration = () => {
  isRegistering.value = !isRegistering.value;
  password.value = '';
  setupKey.value = '';
  error.value = null;
};

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const endpoint = isRegistering.value ? 'admin-register' : 'login';
    const body = isRegistering.value
      ? { username: username.value, password: password.value, setupKey: setupKey.value }
      : { username: username.value, password: password.value };
    const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const data = await res.json();
      error.value = data.message || 'Login failed';
      return;
    }

    const data = await res.json();
    adminStore.setAdmin(data.token, data.user);
    toast.success(isRegistering.value ? 'Admin account created successfully' : 'Logged in successfully');
    await router.replace('/admin');
  } catch (err) {
    console.error(err);
    error.value = 'Unable to login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
