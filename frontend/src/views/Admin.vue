<template>
  <div class="min-h-screen pt-[120px] pb-20 px-6 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold text-white mb-10 tracking-tight font-display">Admin Dashboard</h1>

    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Add Product Form -->
      <div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl h-fit sticky top-32">
        <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <span class="w-1 h-8 bg-blue-600 rounded-full"></span>
          Add New Product
        </h2>
        
        <form @submit.prevent="addProduct" class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Product Title</label>
            <input v-model="newProduct.title" type="text" required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Premium Leather Jacket" />
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Price (Rs.)</label>
              <input v-model="newProduct.price" type="number" step="0.01" required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="0.00" />
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Category</label>
              <select v-model="newProduct.category" required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                <option value="" disabled>Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="home-living">Home & Living</option>
                <option value="sports">Sports</option>
                <!-- Add more as needed -->
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Image URL</label>
            <input v-model="newProduct.image" type="url" required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://example.com/image.jpg" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Description</label>
            <textarea v-model="newProduct.description" rows="3"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Product details..."></textarea>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Adding...' : 'Add Product' }}
          </button>
        </form>
      </div>

      <!-- Product List -->
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <span class="w-1 h-8 bg-purple-600 rounded-full"></span>
          Manage Inventory <span class="text-sm font-normal text-slate-500 ml-2">({{ products.length }} items)</span>
        </h2>

        <div v-if="products.length === 0" class="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            No products found. Add one to get started!
        </div>

        <div v-else class="space-y-4">
          <div v-for="product in products" :key="product.id" 
            class="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-5 hover:bg-slate-800/50 transition-colors group">
            
            <div class="w-20 h-20 bg-white p-2 rounded-xl shrink-0 overflow-hidden">
              <img :src="product.image" :alt="product.title" class="w-full h-full object-contain" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-200 font-medium truncate">{{ product.title }}</h3>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-blue-400 font-bold">Rs. {{ product.price }}</span>
                <span class="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700 capitalize">{{ product.category }}</span>
              </div>
            </div>

            <button @click="deleteProduct(product.id)" 
              class="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Delete Product">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const products = ref([]);
const loading = ref(false);

const newProduct = ref({
  title: '',
  price: '',
  description: '',
  category: '',
  image: ''
});

const fetchProducts = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    // Sort by ID descending to show newest first
    products.value = data.products.sort((a, b) => b.id - a.id);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load products");
  }
};

const addProduct = async () => {
  loading.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct.value)
    });

    if (!res.ok) throw new Error('Failed to add');

    const added = await res.json();
    products.value.unshift(added);
    toast.success("Product Added Successfully!");
    
    // Reset form
    newProduct.value = { title: '', price: '', description: '', category: '', image: '' };
  } catch (err) {
    console.error(err);
    toast.error("Error adding product");
  } finally {
    loading.value = false;
  }
};

const deleteProduct = async (id) => {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Failed to delete');

    products.value = products.value.filter(p => p.id !== id);
    toast.success("Product Deleted");
  } catch (err) {
    console.error(err);
    toast.error("Error deleting product");
  }
};

onMounted(fetchProducts);
</script>
