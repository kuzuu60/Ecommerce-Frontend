<template>
  <div class="p-6 bg-slate-950 min-h-screen text-slate-100">
    <h1 class="text-3xl font-bold mb-8 text-blue-400">Customer Orders</h1>
    
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
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
              ]">
                {{ order.status }}
              </span>
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

const orders = ref([]);
const loading = ref(true);
const toast = useToast();

const fetchOrders = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
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

onMounted(() => {
    fetchOrders();
});
</script>
