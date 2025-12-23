<template>
  <div :class="[showCart ? 'h-[100dvh] w-full overflow-hidden' : '']">
    <div class="flex flex-col min-h-screen font-sans text-slate-800">
      <div v-if="showCart" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" @click="handleClickOverlay()"></div>
      <nav class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-6 lg:px-12 h-[90px] transition-all duration-300">
        <!-- Logo -->
        <div class="h-14 cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/')">
          <img src="/assets/final5.png" alt="Luxe Logo" class="h-full object-contain" />
        </div>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8 font-medium tracking-wide text-[15px] absolute left-1/2 -translate-x-1/2">
          <!-- Home Button -->
           <button class="px-3 py-2 rounded-full text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 transition-all duration-300 pointer-events-auto" @click="router.push('/')">
             Home
          </button>
          
          <button class="px-3 py-2 rounded-full text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 transition-all duration-300 pointer-events-auto" @click="router.push('/admin')">
             Admin
          </button>
          
          <div class="relative group h-[90px] flex items-center" v-for="category in categories" :key="category.id"
            @click="goToContact(category.name)">
            
            <button class="px-3 py-2 rounded-full text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 transition-all duration-300 flex items-center gap-1">
              {{ category.name }}
              <svg v-if="category.subcategories" class="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform duration-300 group-hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <div v-if="category.subcategories" class="absolute left-1/2 -translate-x-1/2 top-[80px] w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 ring-1 ring-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top -translate-y-4 group-hover:translate-y-0 z-50 overflow-hidden">
              <div class="p-2 grid gap-1 relative">
                 <div class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
                 <div v-for="item in category.subcategories" :key="item.id" 
                  class="relative px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-blue-400 cursor-pointer text-sm font-medium transition-all duration-200 flex items-center justify-between group/item"
                  @click.stop="navigateToCategory(item)">
                  {{ item?.label }}
                  <svg class="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Hover Indicator -->
             <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-blue-500 rounded-t-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </div>
        </div>

        <!-- Cart Icon -->
        <div class="ml-auto flex items-center">
           <button class="relative group p-3 rounded-full hover:bg-slate-800 transition-all duration-300" @click="showCart = true">
             <div class="relative">
               <svg class="w-7 h-7 text-slate-300 group-hover:text-blue-400 transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               <span v-if="cartStore.totalItem > 0" class="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full ring-2 ring-slate-900 shadow-sm animate-bounce-active">
                 {{ cartStore.totalItem }}
               </span>
             </div>
           </button>
        </div>
      </nav>

      <!-- Cart Sidebar -->
      <div v-if="showCart">
        <div class="fixed top-0 right-0 h-[100dvh] w-full sm:w-[500px] bg-slate-900 shadow-2xl shadow-black/50 z-[100] transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-800">
          <!-- Cart Header -->
          <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 z-10">
            <h2 class="text-2xl font-bold text-slate-100">Your Cart <span class="text-base font-normal text-slate-400 ml-2">({{ cartStore.totalItem }} items)</span></h2>
            <button class="p-2 -mr-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-colors" @click="showCart = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div v-if="cartStore.totalItem == 0" class="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <svg class="w-20 h-20 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p class="text-lg font-medium">Your shopping cart is empty</p>
              <button @click="showCart = false" class="mt-2 text-blue-500 font-semibold hover:text-blue-400 hover:underline">Start Shopping</button>
            </div>

            <div v-for="item in cartStore.item_details" :key="item.id" class="flex gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors group">
              <div class="flex items-center gap-3">
                 <input type="checkbox" v-model="item.checked" class="w-5 h-5 text-blue-600 rounded border-slate-600 bg-slate-700 focus:ring-blue-500 cursor-pointer" @click="cartStore.updateChecked(item.id)" />
                 <div class="w-24 h-24 bg-white rounded-lg overflow-hidden border border-slate-700 shrink-0 p-2">
                    <img :src="item.image" :alt="item.title" class="w-full h-full object-contain" />
                 </div>
              </div>
              
              <div class="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 class="text-base font-semibold text-slate-200 line-clamp-1 mb-1">{{ item.title }}</h3>
                  <p class="text-lg font-bold text-blue-400">Rs. {{ item.price }}</p>
                </div>
                
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    <button @click="updatePositive(item, item.quantity, 'sub')" 
                      class="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 transition-colors"
                      :disabled="item.quantity === 1">-</button>
                    <span class="w-8 text-center text-sm font-semibold text-slate-300">{{ item.quantity }}</span>
                    <button @click="updatePositive(item, item.quantity, 'add')" 
                      class="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors">+</button>
                  </div>
                  
                  <button @click="deleteItem(item)" class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Remove Item">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Footer -->
          <div class="p-6 border-t border-slate-800 bg-slate-900/50">
             <div class="flex items-center justify-between mb-4">
                <span class="text-slate-400 font-medium">Subtotal</span>
                <span class="text-2xl font-bold text-slate-100">Rs. {{ cartStore.totalCost || '0.00' }}</span>
             </div>
             <div class="flex gap-4">
                <button class="flex-1 py-3.5 px-4 bg-transparent border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-slate-500 transition-all focus:ring-2 focus:ring-slate-700 focus:ring-offset-1 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed" @click="goToCart()" :disabled="cartStore.totalItem == 0">
                   View Cart
                </button>
                <button class="flex-[2] py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:shadow-blue-500/20 active:translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed" @click="goToCheckout()" :disabled="cartStore.totalItem == 0">
                   Checkout
                </button>
             </div>
          </div>
        </div>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useToast } from 'vue-toastification';

// Router & Store
const router = useRouter();
const cartStore = useCartStore();
const toast = useToast()

// Reactive Variables
const products = ref([]);
const showCart = ref(false);

// Categories Data
const categories = ref([
  {
    id: 1,
    name: "Electronics",
    subcategories: [
      { label: "Laptops", value: "laptops" },
      { label: "Smartphones", value: "smartphones" },
      { label: "Tablets", value: "tablets" },
      { label: "Mobile Accessories", value: "mobile-accessories" }
    ]
  },
  {
    id: 4,
    name: "Home & Living",
    subcategories: [
      { label: "Decoration", value: "home-decoration" },
      { label: "Furniture", value: "furniture" },
      { label: "Kitchen Accessories", value: "kitchen-accessories" }
    ]
  },
  {
    id: 5,
    name: "Sports",
    subcategories: [
      { label: "Accessories", value: "sports-accessories" },
      { label: "Sunglasses", value: "sunglasses" }
    ]
  },
  {
    id: 6,
    name: "Contact Us"
  }
]);

// Functions
const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    if (!response.ok) throw new Error("Failed to fetch");
    const result = await response.json();
    products.value = result.products.sort((a, b) => b.id - a.id);

  } catch (error) {
    console.error(error);
  }
};

const navigateToCategory = (category) => {
  router.push(`/${category.value}`);
};

const goToContact = (category) => {
  if (category == "Contact Us") {
    router.push("/contact")
  }
}


const goToCart = () => {
  router.push("/cart");
  showCart.value = false;
  cartStore.costCalculation();
};

const goToCheckout = () => {
  if (cartStore.total_buying_item > 0) {
    router.push("/payment")
    showCart.value = false
    cartStore.costCalculation();
  }
  else {
    toast.error("you forgot to select an item my lovely client😘", {
      id: "single-toast", timeout: 1500, hideProgressBar: true,
    })
  }
}

const deleteItem = (item) => {
  cartStore.removeItem(item.id)
  cartStore.totalQuantity();
}

const updatePositive = (item, quantity, action) => {
  cartStore.updateQuantity(item.id, action === "add" ? quantity + 1 : quantity - 1)
  cartStore.totalQuantity();
}

const handleClickOverlay = () => {
  showCart.value = false
}

provide("products", products);
provide("fetchProducts", fetchProducts);

// Lifecycle Hook
onMounted(fetchProducts);
</script>

