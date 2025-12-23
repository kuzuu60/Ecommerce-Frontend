<template>
  <div class="min-h-screen pt-[120px] pb-20 px-6 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold text-white mb-10 tracking-tight font-display">Admin Dashboard</h1>

    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Add Product Form -->
      <div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl h-fit sticky top-32">
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

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400">Product Image</label>
              <div class="flex gap-4 items-center">
                  <div class="flex-1">
                      <input type="file" @change="handleImageUpload" accept="image/*"
                      class="w-full text-sm text-slate-400
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-500
                        cursor-pointer file:cursor-pointer" />
                  </div>
                  <span class="text-slate-500 font-medium">OR</span>
                   <div class="flex-1">
                      <input v-model="newProduct.image" type="url"
                        class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Image URL (optional)" />
                   </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400">Description</label>
            <textarea v-model="newProduct.description" rows="3"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Product details..."></textarea>
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
              <img :src="product.thumbnail || product.images?.[0] || product.image" :alt="product.title" class="w-full h-full object-contain" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-200 font-medium truncate">{{ product.title }}</h3>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-blue-400 font-bold">Rs. {{ product.price }}</span>
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
import { ref, onMounted, computed, inject } from 'vue';
import { useToast } from 'vue-toastification';
import ConfirmModal from '../components/ConfirmModal.vue';
import ActionStatusModal from '../components/ActionStatusModal.vue';

const toast = useToast();
const products = inject('products');
const fetchProducts = inject('fetchProducts');
const loading = ref(false);

const newProduct = ref({
  title: '',
  price: '',
  description: '',
  category: '',
  image: '',
  stock: ''
});

// fetchProducts is now injected from Layout.vue

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

const handleImageUpload = (event) => {
  imageFile.value = event.target.files[0];
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
    category: product.category,
    image: product.thumbnail || product.images?.[0] || '',
    stock: product.stock
  };
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
    selectedMainCategory.value = "";
    newProduct.value = { title: '', price: '', description: '', category: '', image: '', stock: '' };
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
    formData.append('category', newProduct.value.category);
    formData.append('stock', newProduct.value.stock);

    if (imageFile.value) {
        formData.append('image', imageFile.value);
    } else if (newProduct.value.image) {
        formData.append('image', newProduct.value.image);
    }

    const res = await fetch(`http://localhost:5000/api/products/${editId.value}`, {
      method: 'PUT',
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
    formData.append('category', newProduct.value.category);
    formData.append('stock', newProduct.value.stock || 100);
    
    if (imageFile.value) {
        formData.append('image', imageFile.value);
    } else if (newProduct.value.image) {
        formData.append('image', newProduct.value.image);
    }

    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
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
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE'
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
