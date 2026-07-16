<template>
  <div class="auth-layout">
    <!-- Left: Branding / Image (Hidden on small screens) -->
    <div class="auth-brand">
      <div class="brand-overlay"></div>
      <img src="/assets/hero_cream.png" class="brand-img" alt="Luxe Commerce" />
      <div class="brand-content">
        <h1 class="brand-title">Elevate your<br/><em>lifestyle.</em></h1>
        <p class="brand-desc">Join Luxe today to discover premium, curated collections for the modern aesthetic.</p>
      </div>
    </div>

    <!-- Right: Form Area -->
    <div class="auth-form-area">
      <div class="w-full max-w-md mx-auto">
        <!-- Back -->
        <button @click="router.push('/')" class="back-btn group">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to store
        </button>

        <div class="mb-10">
          <p class="section-label mb-2" style="color: var(--amber-600);">{{ isSignUp ? 'Welcome' : 'Welcome back' }}</p>
          <h2 class="auth-heading">{{ isSignUp ? 'Create an account' : 'Sign in to Luxe' }}</h2>
          <p class="auth-sub">{{ isSignUp ? 'Enter your details below to get started.' : 'Enter your credentials to access your account.' }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="space-y-5">
          
          <div v-if="isSignUp" class="field">
            <label for="fullName" class="field-label">Full Name</label>
            <input id="fullName" v-model.trim="form.fullName" type="text" autocomplete="name" required placeholder="Jane Doe" class="field-input" />
          </div>

          <div class="field">
            <label for="email" class="field-label">Email Address</label>
            <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required placeholder="you@example.com" class="field-input" />
          </div>

          <div class="field relative">
            <label for="password" class="field-label">Password</label>
            <div class="relative">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="isSignUp ? 'new-password' : 'current-password'" required placeholder="••••••••" class="field-input pr-10" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors">
                <!-- Eye Icon -->
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
            
            <!-- Password Strength Meter -->
            <div v-if="isSignUp && form.password" class="mt-3">
              <div class="flex gap-1 h-1.5 mb-1.5">
                <div v-for="i in 4" :key="i" class="flex-1 rounded-full transition-colors duration-300" :style="getStrengthStyle(i)"></div>
              </div>
              <p class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: strengthColor }">{{ strengthLabel }}</p>
            </div>
          </div>

          <div v-if="errorMessage" class="error-msg">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="loading" class="auth-btn">
            {{ loading ? 'Please wait…' : (isSignUp ? 'Create account' : 'Sign in') }}
          </button>
        </form>

        <p class="toggle-text">
          {{ isSignUp ? 'Already have an account?' : 'New to Luxe?' }}
          <button @click="setMode(!isSignUp)" class="toggle-btn">
            {{ isSignUp ? 'Sign in instead' : 'Create an account' }}
          </button>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
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
const showPassword = ref(false);
const form = reactive({ fullName: '', email: '', password: '' });

const setMode = (signUp) => {
  isSignUp.value = signUp;
  errorMessage.value = '';
  form.password = '';
  showPassword.value = false;
  router.replace({ query: { ...route.query, mode: signUp ? 'signup' : undefined } });
};

const getRedirectPath = () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  return redirect.startsWith('/') ? redirect : '/';
};

const passwordStrength = computed(() => {
  const p = form.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score += 1;
  if (p.length >= 10) score += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 1;
  return Math.min(score, 4);
});

const strengthLabel = computed(() => {
  const s = passwordStrength.value;
  if (s === 1) return 'Weak';
  if (s === 2) return 'Fair';
  if (s === 3) return 'Good';
  if (s === 4) return 'Strong';
  return '';
});

const strengthColor = computed(() => {
  const s = passwordStrength.value;
  if (s <= 1) return '#EF4444'; // red
  if (s === 2) return '#F59E0B'; // amber
  if (s === 3) return '#10B981'; // emerald
  return '#059669'; // darker green
});

const getStrengthStyle = (index) => {
  if (index <= passwordStrength.value) {
    return `background: ${strengthColor.value};`;
  }
  return 'background: var(--cream-200);';
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
.auth-layout {
  display: flex;
  min-height: 100vh;
  background: white;
}

/* ── Left Side (Image) ── */
.auth-brand {
  display: none;
  position: relative;
  width: 45%;
  background: var(--cream-100);
  overflow: hidden;
}
@media (min-width: 900px) {
  .auth-brand { display: flex; flex-direction: column; justify-content: flex-end; padding: 4rem; }
}
.brand-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  z-index: 1;
}
.brand-overlay {
  position: absolute; inset: 0; 
  background: linear-gradient(to top, rgba(28,25,23,0.8) 0%, rgba(28,25,23,0.2) 50%, rgba(28,25,23,0) 100%);
  z-index: 2;
}
.brand-content {
  position: relative; z-index: 3; color: white;
}
.brand-title {
  font-family: var(--font-display); font-size: clamp(2.5rem, 4vw, 4rem);
  font-weight: 400; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;
}
.brand-title em { font-style: italic; color: rgba(255,255,255,0.8); }
.brand-desc {
  font-size: 1.05rem; line-height: 1.6; max-width: 400px; color: rgba(255,255,255,0.9);
}

/* ── Right Side (Form) ── */
.auth-form-area {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  padding: 3rem 2rem; background: var(--cream-50);
}
.back-btn {
  display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 600;
  color: var(--stone-500); margin-bottom: 3rem; transition: color 0.2s;
  background: none; border: none; cursor: pointer; padding: 0;
}
.back-btn:hover { color: var(--stone-900); }

.auth-heading {
  font-family: var(--font-display); font-size: clamp(2rem, 3vw, 2.8rem);
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.02em; margin-bottom: 0.5rem;
}
.auth-sub { font-size: 0.95rem; color: var(--stone-500); }

.field { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--stone-600); }
.field-input {
  border: 1px solid var(--cream-200); border-radius: 14px; padding: 0.9rem 1.1rem;
  font-size: 0.95rem; color: var(--stone-800); background: white;
  font-family: var(--font-body); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
}
.field-input::placeholder { color: var(--stone-400); }
.field-input:focus { border-color: var(--stone-400); box-shadow: 0 0 0 4px rgba(28,25,23,0.05); }

.error-msg {
  display: flex; align-items: center; gap: 8px; padding: 1rem; border-radius: 12px;
  background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); color: #DC2626; font-size: 0.85rem; font-weight: 600;
}

.auth-btn {
  width: 100%; padding: 1.1rem; border-radius: 100px; border: none;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.18);
}
.auth-btn:hover:not(:disabled) {
  background: var(--stone-700); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(28,25,23,0.22);
}
.auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.toggle-text { text-align: center; font-size: 0.9rem; color: var(--stone-500); margin-top: 2rem; }
.toggle-btn { font-weight: 700; color: var(--stone-900); margin-left: 6px; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 0; }
.toggle-btn:hover { color: var(--amber-600); }
</style>
