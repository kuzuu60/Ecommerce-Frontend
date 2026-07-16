<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/60 lg:hidden" @click="mobileOpen = false"></div>

    <aside :class="['fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="flex h-24 items-center border-b border-slate-800 px-7">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Luxe Commerce</p>
          <h1 class="mt-1 text-xl font-bold text-white">Admin Console</h1>
        </div>
        <button class="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" @click="mobileOpen = false" aria-label="Close menu">×</button>
      </div>

      <div class="border-b border-slate-800 px-7 py-5">
        <p class="text-xs uppercase tracking-wider text-slate-500">Signed in as</p>
        <p class="mt-1 truncate font-semibold text-slate-200">{{ adminStore.user?.username || 'Administrator' }}</p>
      </div>

      <nav class="flex-1 space-y-2 p-5">
        <router-link v-for="item in navigation" :key="item.path" :to="item.path" @click="mobileOpen = false" :class="navClass(item.path)">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sm">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>

        <div class="my-5 border-t border-slate-800"></div>
        <router-link to="/" @click="mobileOpen = false" class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-100">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">↗</span>
          View storefront
        </router-link>
      </nav>

      <div class="border-t border-slate-800 p-5">
        <button @click="logout" class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">↪</span>
          Sign out
        </button>
      </div>
    </aside>

    <div class="lg:ml-72">
      <header class="sticky top-0 z-30 flex h-16 items-center border-b border-slate-800 bg-slate-950/90 px-5 backdrop-blur lg:hidden">
        <button @click="mobileOpen = true" class="rounded-xl bg-slate-900 px-3 py-2 text-xl text-slate-200" aria-label="Open menu">☰</button>
        <span class="ml-3 font-semibold text-white">Admin Console</span>
      </header>
      <main class="min-h-[calc(100vh-4rem)]">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/store/adminStore';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const mobileOpen = ref(false);
const navigation = [
  { label: 'Dashboard', path: '/admin', icon: '⌂' },
  { label: 'Orders', path: '/admin/orders', icon: '▣' },
  { label: 'Users', path: '/admin/users', icon: '◎' },
];

const navClass = (path) => [
  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
  route.path === path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
];

const logout = () => {
  adminStore.clearAdmin();
  router.push('/');
};
</script>
