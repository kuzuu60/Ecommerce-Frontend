<template>
  <div class="min-h-screen lg:h-screen lg:overflow-hidden pt-[120px] lg:pt-8 pb-20 lg:pb-8 px-6 max-w-7xl mx-auto lg:flex lg:flex-col">
    <div class="mb-10 lg:mb-6 shrink-0">
      <h1 class="text-4xl font-bold tracking-tight text-white font-display">Admin Dashboard</h1>
      <p class="mt-2 text-slate-400">Manage your storefront, customers, and orders.</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-12 lg:flex-1 lg:min-h-0">
      <!-- Add Product Form -->
      <div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl lg:h-full lg:overflow-y-auto self-start">
        <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <span class="w-1 h-8 bg-blue-600 rounded-full"></span>
          {{ isEditing ? 'Edit Product' : 'Add New Product' }}
        </h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
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
                <label class="text-sm font-medium text-slate-400">Stock</label>
                <input v-model="newProduct.stock" type="number" required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="100" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Main Category</label>
              <select v-model="selectedMainCategory" required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                <option value="" disabled>Select Section</option>
                <option v-for="(subcats, main) in categoryGroups" :key="main" :value="main">{{ main }}</option>
              </select>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Sub Category</label>
              <select v-model="newProduct.category" :disabled="!selectedMainCategory" required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="" disabled>Select Type</option>
                <option v-for="sub in availableSubCategories" :key="sub" :value="sub">
                  {{ sub.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Discount (%)</label>
              <input v-model.number="newProduct.discountPercentage" type="number" min="0" max="100"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="0" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Description</label>
            <textarea v-model="newProduct.description" rows="3"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Product details..."></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Specifications</label>
            <input v-model="newProduct.specs" type="text"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. i5, 16GB RAM, 512GB SSD" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Warranty</label>
            <input v-model="newProduct.warrantyInformation" type="text"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. 2 year warranty or No warranty" />
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium text-slate-400">Product Image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              @change="handleImageUpload"
              class="block w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400 file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-blue-500"
            />
            <p class="text-xs text-slate-500">Upload a JPG, PNG, WEBP, or GIF image.</p>
            <div v-if="imagePreview || newProduct.image" class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
              <img :src="imagePreview || newProduct.image" alt="Product preview" class="h-20 w-20 rounded-lg bg-white object-contain p-1" />
              <p class="truncate text-sm text-slate-300">{{ imageFile?.name || 'Current product image' }}</p>
            </div>
          </div>

            <div class="flex gap-4">
                <button type="submit" :disabled="loading"
                    class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product') }}
                </button>
                <button v-if="isEditing" type="button" @click="cancelEdit"
                    class="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 rounded-xl transition-all">
                    Cancel
                </button>
            </div>
        </form>
      </div>

      <!-- Product List -->
      <div class="space-y-6 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:pr-3">
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-2xl font-semibold text-white flex items-center gap-3">
            <span class="w-1 h-8 bg-purple-600 rounded-full"></span>
            Manage Inventory
            <span class="text-sm font-normal text-slate-500 ml-2">({{ filteredInventoryProducts.length }}{{ inventorySearch ? ` of ${products.length}` : '' }} items)</span>
          </h2>
          <div class="relative w-full sm:w-72">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <input
              v-model="inventorySearch"
              type="search"
              placeholder="Search inventory to edit..."
              aria-label="Search inventory"
              class="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-10 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-purple-500"
            />
            <button
              v-if="inventorySearch"
              type="button"
              @click="inventorySearch = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
              aria-label="Clear inventory search"
            >
              <span class="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div v-if="products.length === 0" class="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            No products found. Add one to get started!
        </div>

        <div v-else-if="filteredInventoryProducts.length === 0" class="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            No inventory products match “{{ inventorySearch }}”.
        </div>

        <div v-else class="space-y-4">
          <div v-for="product in filteredInventoryProducts" :key="product.id"
            class="bg-slate-900/30 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-5 hover:bg-slate-800/50 transition-colors group">
            
            <div class="w-20 h-20 bg-white p-2 rounded-xl shrink-0 overflow-hidden">
              <img :src="product.thumbnail || product.images?.[0] || product.image" :alt="product.title" class="w-full h-full object-contain" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-200 font-medium truncate">{{ product.title }}</h3>
              <div class="flex flex-wrap items-center gap-3 mt-1">
                <span class="text-blue-400 font-bold">Rs. {{ product.price }}</span>
                <span v-if="product.discountPercentage > 0" class="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                  {{ product.discountPercentage }}% off
                </span>
                <span class="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700 capitalize">{{ product.category }}</span>
                 <span class="text-xs px-2 py-0.5 text-slate-300 rounded-full border border-slate-700" :class="product.stock > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'">
                     Stock: {{ product.stock }}
                 </span>
              </div>
            </div>

            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="editProduct(product)"
                class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit Product">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button @click="deleteProduct(product)" 
                class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete Product">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Improved Popups -->
  <ConfirmModal 
    :is-open="showDeleteConfirm"
    title="Delete Product"
    :message="`Are you sure you want to delete '${productToDelete?.title}'? This action cannot be undone.`"
    @confirm="handleDeleteConfirm"
    @cancel="showDeleteConfirm = false"
  />

  <ActionStatusModal
    :is-open="statusModal.show"
    :type="statusModal.type"
    :title="statusModal.title"
    :message="statusModal.message"
    @close="statusModal.show = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import ConfirmModal from '../components/ConfirmModal.vue';
import ActionStatusModal from '../components/ActionStatusModal.vue';
import { API_BASE_URL } from '@/config/api';

const toast = useToast();
const products = ref([]);
const loading = ref(false);
const inventorySearch = ref('');

const filteredInventoryProducts = computed(() => {
  const query = inventorySearch.value.trim().toLowerCase();
  if (!query) return products.value;

  return products.value.filter((product) => [
    product.title,
    product.category,
    product.brand,
    product.sku,
    product.id
  ].some((value) => String(value ?? '').toLowerCase().includes(query)));
});

const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const result = await response.json();
    products.value = result.products.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error(error);
    showStatus('error', 'Loading Failed', 'There was an error loading the product inventory.');
  }
};

const newProduct = ref({
  title: '',
  price: '',
  description: '',
  specs: '',
  warrantyInformation: '',
  category: '',
  image: '',
  stock: '',
  discountPercentage: 0
});

// Modal States
const showDeleteConfirm = ref(false);
const productToDelete = ref(null);
const statusModal = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

const showStatus = (type, title, message) => {
  statusModal.value = { show: true, type, title, message };
};

// Category Logic
const categoryGroups = {
  "Electronics": ["laptops", "smartphones", "tablets", "mobile-accessories"],
  "Home & Living": ["home-decoration", "furniture", "kitchen-accessories"],
  "Sports": ["sports-accessories", "sunglasses"]
};

const selectedMainCategory = ref("");

const availableSubCategories = computed(() => {
  return selectedMainCategory.value ? categoryGroups[selectedMainCategory.value] : [];
});

const imageFile = ref(null);
const imagePreview = ref('');

const handleImageUpload = (event) => {
  const file = event.target.files?.[0];
  imageFile.value = file || null;
  imagePreview.value = file ? URL.createObjectURL(file) : '';
};

// Edit State
const isEditing = ref(false);
const editId = ref(null);

const editProduct = (product) => {
  isEditing.value = true;
  editId.value = product.id;
  newProduct.value = {
    title: product.title,
    price: product.price,
    description: product.description,
    specs: product.specs || '',
    warrantyInformation: product.warrantyInformation || '',
    category: product.category,
    image: product.thumbnail || product.images?.[0] || '',
    stock: product.stock,
    discountPercentage: product.discountPercentage || 0
  };
  imageFile.value = null;
  imagePreview.value = newProduct.value.image;
  // Handle Main Category selection for Edit
  for (const [main, subs] of Object.entries(categoryGroups)) {
    if (subs.includes(product.category)) {
      selectedMainCategory.value = main;
      break;
    }
  }
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
    isEditing.value = false;
    editId.value = null;
    imageFile.value = null;
    imagePreview.value = '';
    selectedMainCategory.value = "";
    newProduct.value = { title: '', price: '', description: '', specs: '', warrantyInformation: '', category: '', image: '', stock: '', discountPercentage: 0 };
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
};

const handleSubmit = async () => {
  if (isEditing.value) {
    await updateProduct();
  } else {
    await addProduct();
  }
};

const updateProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('title', newProduct.value.title);
    formData.append('price', newProduct.value.price);
    formData.append('description', newProduct.value.description);
    formData.append('specs', newProduct.value.specs);
    formData.append('warrantyInformation', newProduct.value.warrantyInformation);
    formData.append('category', newProduct.value.category);
    formData.append('stock', newProduct.value.stock);
    formData.append('discountPercentage', newProduct.value.discountPercentage || 0);

    if (imageFile.value) {
        formData.append('image', imageFile.value);
    } else if (newProduct.value.image) {
        formData.append('image', newProduct.value.image);
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/api/products/${editId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    if (!res.ok) throw new Error('Failed to update');

    const updated = await res.json();
    
    // Update local list
    const index = products.value.findIndex(p => p.id === editId.value);
    if (index !== -1) {
        products.value[index] = updated;
    }
    
    // toast.success("Product Updated Successfully!");
    showStatus('success', 'Product Updated', `Successfully updated ${updated.title}`);
    cancelEdit();

  } catch (err) {
    console.error(err);
    // toast.error("Error updating product");
    showStatus('error', 'Update Failed', 'There was an error updating the product.');
  } finally {
    loading.value = false;
  }
};

const addProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('title', newProduct.value.title);
    formData.append('price', newProduct.value.price);
    formData.append('description', newProduct.value.description);
    formData.append('specs', newProduct.value.specs);
    formData.append('warrantyInformation', newProduct.value.warrantyInformation);
    formData.append('category', newProduct.value.category);
    formData.append('stock', newProduct.value.stock || 100);
    formData.append('discountPercentage', newProduct.value.discountPercentage || 0);
    
    if (imageFile.value) {
        formData.append('image', imageFile.value);
    } else if (newProduct.value.image) {
        formData.append('image', newProduct.value.image);
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: formData // No Content-Type header, let browser set boundary
    });

    if (!res.ok) throw new Error('Failed to add');

    const added = await res.json();
    products.value.unshift(added);
    // toast.success("Product Added Successfully!");
    showStatus('success', 'Product Added', `Successfully added ${added.title} to inventory`);
    cancelEdit();
    
  } catch (err) {
    console.error(err);
    // toast.error("Error adding product");
    showStatus('error', 'Addition Failed', 'There was an error adding the product.');
  } finally {
    loading.value = false;
  }
};

const deleteProduct = (product) => {
  productToDelete.value = product;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  const id = productToDelete.value.id;
  showDeleteConfirm.value = false;
  
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    if (!res.ok) throw new Error('Failed to delete');

    products.value = products.value.filter(p => p.id !== id);
    // toast.success("Product Deleted");
    showStatus('success', 'Product Deleted', 'The product has been removed from your inventory.');
  } catch (err) {
    console.error(err);
    // toast.error("Error deleting product");
    showStatus('error', 'Deletion Failed', 'There was an error deleting the product.');
  } finally {
    productToDelete.value = null;
  }
};

onMounted(fetchProducts);
</script>
