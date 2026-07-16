<template>
  <div class="admin-shell min-h-screen">
    <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm lg:hidden" @click="mobileOpen = false"></div>

    <aside :class="['fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-cream-200 bg-cream-50 transition-transform duration-300 lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="flex h-24 items-center border-b border-cream-200 px-7">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Luxe Commerce</p>
          <h1 class="mt-1 text-xl font-semibold text-stone-900">Admin Console</h1>
        </div>
        <button class="ml-auto rounded-lg p-2 text-stone-500 hover:bg-cream-100 hover:text-stone-900 lg:hidden" @click="mobileOpen = false" aria-label="Close menu">×</button>
      </div>

      <div class="border-b border-cream-200 px-7 py-5">
        <p class="text-xs uppercase tracking-wider text-stone-500">Signed in as</p>
        <p class="mt-1 truncate font-semibold text-stone-800">{{ adminStore.user?.username || 'Administrator' }}</p>
      </div>

      <nav class="flex-1 space-y-2 p-5">
        <router-link v-for="item in navigation" :key="item.path" :to="item.path" @click="mobileOpen = false" :class="navClass(item.path)">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sm">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>

        <div class="my-5 border-t border-cream-200"></div>
        <router-link to="/" @click="mobileOpen = false" class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-500 transition hover:bg-cream-100 hover:text-stone-900">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100">↗</span>
          View storefront
        </router-link>
      </nav>

      <div class="border-t border-cream-200 p-5">
        <button @click="logout" class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">↪</span>
          Sign out
        </button>
      </div>
    </aside>

    <div class="lg:ml-72">
      <header class="sticky top-0 z-30 flex h-16 items-center border-b border-cream-200 bg-cream-50/90 px-5 backdrop-blur lg:hidden">
        <button @click="mobileOpen = true" class="rounded-xl bg-cream-100 px-3 py-2 text-xl text-stone-700" aria-label="Open menu">☰</button>
        <span class="ml-3 font-semibold text-stone-900">Admin Console</span>
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
  route.path === path ? 'border border-cream-200 bg-cream-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-cream-100 hover:text-stone-900',
];

const logout = () => {
  adminStore.clearAdmin();
  router.push('/');
};
</script>

<style scoped>
.admin-shell {
  background: var(--cream-50);
  color: var(--stone-800);
}

.admin-shell :deep([class*="bg-slate-950"]) {
  background-color: var(--cream-50) !important;
}

.admin-shell :deep([class*="bg-slate-900"]) {
  background-color: rgba(255, 255, 255, 0.82) !important;
}

.admin-shell :deep([class*="bg-slate-800"]) {
  background-color: var(--cream-100) !important;
}

.admin-shell :deep([class*="border-slate-800"]),
.admin-shell :deep([class*="border-slate-700"]) {
  border-color: var(--cream-200) !important;
}

.admin-shell :deep([class*="divide-slate-800"] > :not([hidden]) ~ :not([hidden])) {
  border-color: var(--cream-200) !important;
}

.admin-shell :deep([class*="text-white"]),
.admin-shell :deep([class*="text-slate-100"]),
.admin-shell :deep([class*="text-slate-200"]) {
  color: var(--stone-900) !important;
}

.admin-shell :deep([class*="text-slate-300"]),
.admin-shell :deep([class*="text-slate-400"]) {
  color: var(--stone-600) !important;
}

.admin-shell :deep([class*="text-slate-500"]) {
  color: var(--stone-500) !important;
}

.admin-shell :deep([class*="text-blue-400"]),
.admin-shell :deep([class*="text-blue-300"]) {
  color: var(--amber-600) !important;
}

.admin-shell :deep([class*="bg-blue-600"]) {
  background-color: var(--cream-100) !important;
  border: 1px solid var(--cream-200) !important;
  color: var(--stone-900) !important;
}

.admin-shell :deep([class*="hover:bg-blue-500"]:hover) {
  background-color: var(--cream-200) !important;
}

.admin-shell :deep(input),
.admin-shell :deep(select),
.admin-shell :deep(textarea) {
  background-color: var(--cream-50) !important;
  border-color: var(--cream-200) !important;
  color: var(--stone-800) !important;
}

.admin-shell :deep(input::placeholder),
.admin-shell :deep(textarea::placeholder) {
  color: var(--stone-500) !important;
  opacity: 0.62 !important;
}
</style>
