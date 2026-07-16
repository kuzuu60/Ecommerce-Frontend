<template>
  <div class="min-h-screen bg-slate-950 p-6 text-slate-100">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-blue-400">Admin</p>
          <h1 class="mt-2 text-3xl font-bold text-white">User Management</h1>
        </div>
        <p class="text-sm text-slate-400">Search customers, review their order history, and manage account access.</p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <section class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div class="mb-5 flex flex-col gap-3 md:flex-row">
            <div class="flex flex-1 gap-2">
              <input v-model="search" @keyup.enter="fetchUsers" type="search" placeholder="Search by name or email" class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500" />
              <button @click="fetchUsers" class="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500">Search</button>
            </div>
            <select v-model="statusFilter" @change="fetchUsers" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-blue-500">
              <option value="all">All users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div v-if="loading" class="py-12 text-center text-slate-400">Loading users...</div>
          <div v-else-if="users.length === 0" class="rounded-xl border border-dashed border-slate-700 py-12 text-center text-slate-400">No users found.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[650px] text-left">
              <thead class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-3 py-3">Customer</th>
                  <th class="px-3 py-3">Joined</th>
                  <th class="px-3 py-3">Orders</th>
                  <th class="px-3 py-3">Spent</th>
                  <th class="px-3 py-3">Status</th>
                  <th class="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="user in users" :key="user.id" :class="['cursor-pointer transition hover:bg-slate-800/60', selectedUser?.id === user.id ? 'bg-blue-500/10' : '']" @click="selectUser(user)">
                  <td class="px-3 py-4">
                    <p class="font-semibold text-slate-100">{{ user.fullName }}</p>
                    <p class="text-sm text-slate-400">{{ user.email }}</p>
                  </td>
                  <td class="px-3 py-4 text-sm text-slate-400">{{ formatDate(user.createdAt) }}</td>
                  <td class="px-3 py-4 text-slate-300">{{ user.orderCount }}</td>
                  <td class="px-3 py-4 font-semibold text-blue-400">Rs. {{ user.totalSpent.toFixed(2) }}</td>
                  <td class="px-3 py-4"><StatusBadge :active="user.isActive" /></td>
                  <td class="px-3 py-4 text-right"><span class="text-sm font-semibold text-blue-400">View</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div v-if="detailLoading" class="py-12 text-center text-slate-400">Loading customer...</div>
          <div v-else-if="!selectedUser" class="py-12 text-center text-slate-500">Select a customer to view details.</div>
          <template v-else>
            <div class="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 class="text-2xl font-bold text-white">{{ selectedUser.fullName }}</h2>
                <p class="mt-1 text-sm text-slate-400">{{ selectedUser.email }}</p>
                <p class="mt-2 text-xs text-slate-500">Customer since {{ formatDate(selectedUser.createdAt) }}</p>
              </div>
              <StatusBadge :active="selectedUser.isActive" />
            </div>

            <div class="grid grid-cols-2 gap-3 py-5">
              <div class="rounded-xl bg-slate-950 p-4"><p class="text-xs uppercase text-slate-500">Orders</p><p class="mt-1 text-2xl font-bold text-slate-100">{{ selectedUser.orderCount }}</p></div>
              <div class="rounded-xl bg-slate-950 p-4"><p class="text-xs uppercase text-slate-500">Total spent</p><p class="mt-1 text-xl font-bold text-blue-400">Rs. {{ selectedUser.totalSpent.toFixed(2) }}</p></div>
            </div>

            <button @click="toggleStatus" :disabled="statusUpdating" :class="['mb-6 w-full rounded-xl py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', selectedUser.isActive ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20']">
              {{ statusUpdating ? 'Updating...' : selectedUser.isActive ? 'Suspend account' : 'Activate account' }}
            </button>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-white">Order history</h3>
              <div v-if="customerOrders.length === 0" class="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">No orders yet.</div>
              <div v-else class="space-y-3">
                <div v-for="order in customerOrders" :key="order.id" class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <span class="font-mono text-xs text-slate-400">{{ order.id }}</span>
                    <span class="text-xs font-semibold text-blue-400">{{ order.status }}</span>
                  </div>
                  <div class="mt-3 flex items-center justify-between text-sm">
                    <span class="text-slate-500">{{ formatDate(order.createdAt) }}</span>
                    <span class="font-bold text-slate-200">Rs. {{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useAdminStore } from '@/store/adminStore';
import { API_BASE_URL } from '@/config/api';

const toast = useToast();
const adminStore = useAdminStore();
const users = ref([]);
const search = ref('');
const statusFilter = ref('all');
const loading = ref(true);
const detailLoading = ref(false);
const statusUpdating = ref(false);
const selectedUser = ref(null);
const customerOrders = ref([]);

const authHeaders = computed(() => ({ Authorization: `Bearer ${adminStore.token}` }));

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({ search: search.value, status: statusFilter.value });
    const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, { headers: authHeaders.value });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load users');
    users.value = data;

    if (selectedUser.value) {
      const refreshedUser = users.value.find(user => user.id === selectedUser.value.id);
      if (refreshedUser) selectedUser.value = { ...selectedUser.value, ...refreshedUser };
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message || 'Could not load users');
  } finally {
    loading.value = false;
  }
};

const selectUser = async (user) => {
  selectedUser.value = user;
  customerOrders.value = [];
  detailLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, { headers: authHeaders.value });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load customer');
    selectedUser.value = data.user;
    customerOrders.value = data.orders;
  } catch (error) {
    console.error(error);
    toast.error(error.message || 'Could not load customer details');
  } finally {
    detailLoading.value = false;
  }
};

const toggleStatus = async () => {
  if (!selectedUser.value) return;
  statusUpdating.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.value.id}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders.value, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !selectedUser.value.isActive })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update account');
    selectedUser.value = { ...selectedUser.value, isActive: data.user.isActive };
    await fetchUsers();
    toast.success(data.message, { timeout: 1600, hideProgressBar: true });
  } catch (error) {
    console.error(error);
    toast.error(error.message || 'Could not update account');
  } finally {
    statusUpdating.value = false;
  }
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const StatusBadge = defineComponent({
  props: { active: Boolean },
  setup(props) {
    return () => h('span', {
      class: props.active
        ? 'rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400'
        : 'rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400'
    }, props.active ? 'Active' : 'Suspended');
  }
});

onMounted(fetchUsers);
</script>
