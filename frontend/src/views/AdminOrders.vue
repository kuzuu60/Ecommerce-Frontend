<template>
  <div class="p-6 bg-slate-950 min-h-screen text-slate-100">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-blue-400">Customer Orders</h1>
      <p class="mt-2 text-slate-400">Review orders and update their fulfillment status.</p>
    </div>
    
    <div v-if="loading" class="text-center py-10">
      <p class="text-slate-400">Loading orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-10 bg-slate-900 rounded-xl border border-slate-800">
      <p class="text-slate-400 text-lg">No orders found.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse rounded-xl overflow-hidden">
        <thead class="bg-slate-900 text-slate-400 uppercase text-sm font-semibold">
          <tr>
            <th class="p-4 border-b border-slate-800">Order ID</th>
            <th class="p-4 border-b border-slate-800">Date</th>
            <th class="p-4 border-b border-slate-800">Customer Info</th>
            <th class="p-4 border-b border-slate-800">Items</th>
            <th class="p-4 border-b border-slate-800">Total</th>
            <th class="p-4 border-b border-slate-800">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-900/50 transition-colors">
            <td class="p-4 text-slate-300 font-mono text-xs">{{ order.id }}</td>
            <td class="p-4 text-slate-300">{{ formatDate(order.createdAt) }}</td>
            <td class="p-4">
              <div class="flex flex-col gap-1">
                <span class="font-medium text-slate-200">{{ order.customerInfo.fullName }}</span>
                <span class="text-sm text-slate-400">{{ order.customerInfo.phone }}</span>
                <span class="text-sm text-slate-400 truncate max-w-[200px]">{{ order.customerInfo.address }}</span>
              </div>
            </td>
            <td class="p-4">
               <ul class="list-disc list-inside text-sm text-slate-300">
                 <li v-for="item in order.items" :key="item.id">
                   Qty: {{ item.quantity }} (ID: {{ item.id }})
                 </li>
               </ul>
            </td>
            <td class="p-4 font-bold text-blue-400">Rs. {{ order.totalAmount }}</td>
            <td class="p-4">
              <select v-model="order.status" @change="updateOrderStatus(order)" :disabled="updatingOrderId === order.id" class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-blue-500 disabled:opacity-50">
                <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { API_BASE_URL } from '@/config/api';

const orders = ref([]);
const loading = ref(true);
const toast = useToast();
const orderStatuses = ['Pending', 'Paid', 'Confirmed', 'Shipped', 'Delivered'];
const updatingOrderId = ref(null);

const fetchOrders = async () => {
    try {
        const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        // Sort by newest first
        orders.value = data.sort((a, b) => b.id - a.id);
    } catch (err) {
        console.error(err);
        toast.error("Could not load orders");
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const updateOrderStatus = async (order) => {
    updatingOrderId.value = order.id;
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE_URL}/api/orders/${order.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ status: order.status })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to update order status');
        toast.success('Order status updated', { timeout: 1500, hideProgressBar: true });
    } catch (err) {
        console.error(err);
        toast.error(err.message || 'Could not update order status');
        await fetchOrders();
    } finally {
        updatingOrderId.value = null;
    }
};

onMounted(() => {
    fetchOrders();
});
</script>
