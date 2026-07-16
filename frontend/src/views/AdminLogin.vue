<template>
  <div class="admin-login min-h-screen flex items-center justify-center px-4 py-12">
    <div class="admin-login-card w-full max-w-md rounded-[2rem] p-8 sm:p-10">
      <button @click="router.push('/')" class="mb-8 flex items-center gap-2 text-sm font-semibold text-stone-500 transition-colors hover:text-amber-600">
        ← Back to storefront
      </button>
      <p class="section-label mb-3">Luxe Commerce</p>
      <h1 class="admin-login-title mb-3">Admin Login</h1>
      <p class="mb-8 text-sm text-stone-500">Enter your administrator credentials to manage the storefront.</p>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="admin-field-label">Username</label>
          <input v-model="username" type="text" required class="admin-field-input" />
        </div>
        <div>
          <label class="admin-field-label">Password</label>
          <input v-model="password" type="password" required class="admin-field-input" />
        </div>
        <button type="submit" :disabled="loading" class="admin-login-button">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      <p v-if="error" class="admin-login-error mt-4">{{ error }}</p>
      <p class="mt-7 text-xs leading-relaxed text-stone-400">Only authorized administrators can access the dashboard.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/store/adminStore';
import { useToast } from 'vue-toastification';
import { API_BASE_URL } from '@/config/api';

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
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
    await router.replace('/admin');
  } catch (err) {
    console.error(err);
    error.value = 'Unable to login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login {
  background:
    radial-gradient(circle at 15% 15%, rgba(217, 119, 6, 0.1), transparent 28rem),
    var(--cream-50);
}

.admin-login-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--cream-200);
  box-shadow: var(--shadow-lg);
}

.admin-login-title {
  color: var(--stone-900);
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
}

.admin-field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--stone-600);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.admin-field-input {
  width: 100%;
  border: 1px solid var(--cream-200);
  border-radius: 0.9rem;
  background: var(--cream-50);
  color: var(--stone-800);
  outline: none;
  padding: 0.85rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.admin-field-input:focus {
  border-color: var(--stone-500);
  box-shadow: 0 0 0 4px rgba(28, 25, 23, 0.06);
}

.admin-login-button {
  width: 100%;
  border: 0;
  border-radius: 999px;
  background: var(--stone-900);
  color: var(--cream-50);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 1rem;
  transition: background 0.2s, transform 0.2s;
}

.admin-login-button:hover:not(:disabled) {
  background: var(--stone-700);
  transform: translateY(-1px);
}

.admin-login-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.admin-login-error {
  border: 1px solid rgba(220, 38, 38, 0.16);
  border-radius: 0.8rem;
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
  font-size: 0.85rem;
  padding: 0.75rem 1rem;
}
</style>
