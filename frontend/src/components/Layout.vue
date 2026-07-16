<template>
  <div :class="[cartStore.isCartOpen ? 'h-[100dvh] w-full overflow-hidden' : '']">
    <div class="flex flex-col min-h-screen" style="font-family: var(--font-body); background: var(--cream-50); color: var(--stone-800);">
      
      <!-- Cart Overlay -->
      <div v-if="cartStore.isCartOpen" class="fixed inset-0 z-[99]" style="background: rgba(28,25,23,0.35); backdrop-filter: blur(4px);" @click="handleClickOverlay()"></div>

      <!-- ── FLOATING NAVBAR (Cream Glass Pill) ─────────────────── -->
      <header class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-300"
        style="background: rgba(250,249,246,0.88); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(28,25,23,0.08); border-radius: 999px; box-shadow: 0 2px 16px rgba(28,25,23,0.07), 0 1px 3px rgba(28,25,23,0.05);">
        <div class="flex items-center justify-between px-5 py-2.5 gap-4 w-full">
          
          <!-- Left: Logo & Mobile Toggle -->
          <div class="flex items-center gap-3 shrink-0">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-full transition-all" style="color: var(--stone-600);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div class="h-7 cursor-pointer flex items-center" @click="router.push('/')">
              <img src="/assets/final5.png" alt="Luxe Logo" class="h-full object-contain" />
            </div>
          </div>

          <!-- Center: Desktop Nav -->
          <nav class="hidden md:flex items-center justify-center gap-0.5 text-[13px] font-medium" style="color: var(--stone-600);">
            <button class="px-3.5 py-2 rounded-full transition-all duration-200 hover:bg-stone-900/5" style="color: var(--stone-700);" @click="router.push('/')">
              Home
            </button>

            <!-- Shop Mega-Menu -->
            <div class="relative group">
              <button class="flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 hover:bg-stone-900/5" style="color: var(--stone-700);">
                Shop
                <svg class="w-3 h-3 opacity-40 transition-transform duration-300 group-hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <!-- Mega-Dropdown -->
              <div class="absolute left-1/2 -translate-x-1/2 top-full mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -translate-y-1 group-hover:translate-y-0 z-50"
                style="background: rgba(250,249,246,0.99); backdrop-filter: blur(24px); border: 1px solid rgba(28,25,23,0.08); border-radius: 20px; box-shadow: 0 16px 48px rgba(28,25,23,0.14); width: 520px; padding: 1.25rem;">
                <div class="grid grid-cols-3 gap-6">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style="color: var(--amber-600);">Electronics</p>
                    <div class="flex flex-col gap-0.5">
                      <button v-for="item in shopGroups.electronics" :key="item.value"
                        class="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group/item"
                        style="color: var(--stone-600);"
                        @mouseover="$event.currentTarget.style.background='var(--cream-100)'; $event.currentTarget.style.color='var(--stone-900)';"
                        @mouseleave="$event.currentTarget.style.background='transparent'; $event.currentTarget.style.color='var(--stone-600)';"
                        @click.stop="router.push('/' + item.value)">
                        {{ item.label }}
                        <svg class="w-3 h-3 opacity-0 group-hover/item:opacity-60 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style="color: var(--amber-600);">Home & Living</p>
                    <div class="flex flex-col gap-0.5">
                      <button v-for="item in shopGroups.home" :key="item.value"
                        class="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group/item"
                        style="color: var(--stone-600);"
                        @mouseover="$event.currentTarget.style.background='var(--cream-100)'; $event.currentTarget.style.color='var(--stone-900)';"
                        @mouseleave="$event.currentTarget.style.background='transparent'; $event.currentTarget.style.color='var(--stone-600)';"
                        @click.stop="router.push('/' + item.value)">
                        {{ item.label }}
                        <svg class="w-3 h-3 opacity-0 group-hover/item:opacity-60 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style="color: var(--amber-600);">Sports & Style</p>
                    <div class="flex flex-col gap-0.5">
                      <button v-for="item in shopGroups.sports" :key="item.value"
                        class="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group/item"
                        style="color: var(--stone-600);"
                        @mouseover="$event.currentTarget.style.background='var(--cream-100)'; $event.currentTarget.style.color='var(--stone-900)';"
                        @mouseleave="$event.currentTarget.style.background='transparent'; $event.currentTarget.style.color='var(--stone-600)';"
                        @click.stop="router.push('/' + item.value)">
                        {{ item.label }}
                        <svg class="w-3 h-3 opacity-0 group-hover/item:opacity-60 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-4 pt-4 flex items-center justify-between" style="border-top: 1px solid var(--cream-200);">
                  <p class="text-xs font-medium" style="color: var(--stone-400);">✦ Free shipping on orders over Rs. 5,000</p>
                  <button @click.stop="router.push('/deals')" class="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                    style="background: var(--stone-900); color: var(--cream-50);"
                    @mouseover="$event.currentTarget.style.background='var(--stone-700)'"
                    @mouseleave="$event.currentTarget.style.background='var(--stone-900)'">View Deals →</button>
                </div>
              </div>
            </div>

            <button class="px-3.5 py-2 rounded-full transition-all duration-200 hover:bg-stone-900/5" style="color: var(--stone-700);" @click="router.push('/contact')">
              Contact
            </button>
            <button class="px-3.5 py-2 rounded-full transition-all duration-200 hover:bg-stone-900/5 font-semibold" style="color: var(--amber-600);" @click="router.push('/assistant')">
              AI Assistant
            </button>
          </nav>

          <!-- Right: Search, Cart, Auth -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Search -->
            <div class="hidden md:flex relative group">
              <input 
                v-model="searchQuery" 
                @input="handleSearchInput" 
                @focus="showSearchResults = true"
                placeholder="Search..." 
                class="w-28 focus:w-44 rounded-full py-1.5 pl-8 pr-3 text-xs transition-all duration-300 focus:outline-none"
                style="background: rgba(28,25,23,0.04); border: 1px solid rgba(28,25,23,0.08); color: var(--stone-800); font-family: var(--font-body);"
                @focus.native="$event.target.style.background='rgba(28,25,23,0.06)'"
              />
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2" style="color: var(--stone-400);">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <!-- Search Dropdown -->
              <div v-if="showSearchResults && searchResults.length > 0" class="absolute right-0 top-full mt-3 w-72 z-50 overflow-hidden max-h-[360px] overflow-y-auto"
                style="background: rgba(250,249,246,0.98); backdrop-filter: blur(20px); border: 1px solid rgba(28,25,23,0.08); border-radius: 16px; box-shadow: 0 8px 32px rgba(28,25,23,0.12);"
                v-click-outside="closeSearch">
                <div class="p-2 divide-y" style="border-color: var(--cream-200);">
                  <div v-for="product in searchResults" :key="product.id" @click="handleSelectSearchResult(product)"
                    class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors group"
                    @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
                    @mouseleave="$event.currentTarget.style.background='transparent'">
                    <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 p-1 flex items-center justify-center" style="background: var(--cream-100); border: 1px solid var(--cream-200);">
                      <img :src="product.thumbnail" :alt="product.title" class="w-full h-full object-contain" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-xs font-semibold truncate" style="color: var(--stone-800); font-family: var(--font-body);">{{ product.title }}</h4>
                      <p class="text-[10px] font-bold" style="color: var(--amber-600);">Rs. {{ product.price }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cart -->
            <button class="relative p-2 rounded-full transition-all duration-200" style="color: var(--stone-600);"
              @mouseover="$event.currentTarget.style.background='rgba(28,25,23,0.06)'; $event.currentTarget.style.color='var(--stone-900)';"
              @mouseleave="$event.currentTarget.style.background='transparent'; $event.currentTarget.style.color='var(--stone-600)';"
              @click="cartStore.isCartOpen = true">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="cartStore.totalItem > 0"
                class="absolute -top-0.5 -right-0.5 text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full"
                style="background: var(--stone-900); color: var(--cream-50);">
                {{ cartStore.totalItem }}
              </span>
            </button>

            <!-- Auth -->
            <div class="hidden sm:block pl-1">
              <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
                  style="background: var(--stone-900); color: var(--cream-50); border: 1px solid rgba(28,25,23,0.1);"
                  title="Sign Out" @click="signOut">
                  {{ authStore.user?.fullName?.charAt(0) }}
                </button>
              </div>
              <div v-else>
                <button
                  class="rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95"
                  style="background: var(--stone-900); color: var(--cream-50);"
                  @mouseover="$event.currentTarget.style.background='var(--stone-700)';"
                  @mouseleave="$event.currentTarget.style.background='var(--stone-900)';"
                  @click="goToAuth('signin')">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div v-if="mobileMenuOpen" class="fixed inset-0 top-0 left-0 h-[100dvh] w-full z-50 flex flex-col p-6 overflow-y-auto md:hidden"
          style="background: rgba(250,249,246,0.97); backdrop-filter: blur(24px);">
          <div class="flex items-center justify-between mb-8">
            <img src="/assets/final5.png" alt="Luxe Logo" class="h-7 object-contain" />
            <button @click="mobileMenuOpen = false" class="p-2 rounded-full transition-colors" style="color: var(--stone-500); background: var(--cream-100);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="relative mb-8">
            <input v-model="searchQuery" @input="handleSearchInput" placeholder="Search..."
              class="w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
              style="background: var(--cream-100); border: 1px solid var(--cream-200); color: var(--stone-800);" />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--stone-400);">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <div v-if="searchQuery && searchResults.length > 0" class="mt-2 rounded-xl p-2 max-h-60 overflow-y-auto" style="background: var(--cream-100); border: 1px solid var(--cream-200);">
              <div v-for="product in searchResults" :key="product.id" @click="handleSelectSearchResult(product); mobileMenuOpen = false"
                class="p-2 flex items-center gap-3 rounded-lg cursor-pointer"
                @mouseover="$event.currentTarget.style.background='var(--cream-200)'"
                @mouseleave="$event.currentTarget.style.background='transparent'">
                <img :src="product.thumbnail" class="w-8 h-8 object-contain rounded p-0.5" style="background: white;" />
                <span class="text-xs font-semibold truncate flex-1" style="color: var(--stone-800);">{{ product.title }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1 mb-8">
            <button @click="router.push('/'); mobileMenuOpen = false" class="text-left py-3 px-3 rounded-xl text-base font-semibold transition-colors" style="color: var(--stone-700);"
              @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
              @mouseleave="$event.currentTarget.style.background='transparent'">Home</button>
            <div v-for="group in mobileShopGroups" :key="group.title" class="flex flex-col">
              <span class="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.16em]" style="color: var(--amber-600);">{{ group.title }}</span>
              <button v-for="item in group.items" :key="item.value"
                @click="router.push('/' + item.value); mobileMenuOpen = false"
                class="text-left pl-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style="color: var(--stone-700);"
                @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
                @mouseleave="$event.currentTarget.style.background='transparent'">{{ item.label }}</button>
            </div>
            <button @click="router.push('/contact'); mobileMenuOpen = false" class="text-left py-3 px-3 rounded-xl text-base font-semibold transition-colors" style="color: var(--stone-700);"
              @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
              @mouseleave="$event.currentTarget.style.background='transparent'">Contact</button>
            <button @click="router.push('/assistant'); mobileMenuOpen = false" class="text-left py-3 px-3 font-semibold rounded-xl text-base"
              style="color: var(--amber-600);">✦ AI Assistant</button>
          </div>

          <div class="mt-auto pt-6" style="border-top: 1px solid var(--cream-200);">
            <div v-if="authStore.isAuthenticated" class="flex flex-col gap-3">
              <span class="text-sm font-semibold text-center" style="color: var(--stone-700);">{{ authStore.user?.fullName }}</span>
              <button @click="signOut(); mobileMenuOpen = false" class="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                style="background: var(--cream-100); color: #DC2626; border: 1px solid rgba(220,38,38,0.15);">Sign Out</button>
            </div>
            <div v-else>
              <button @click="goToAuth('signin'); mobileMenuOpen = false" class="w-full py-3 rounded-xl text-sm font-semibold"
                style="background: var(--stone-900); color: var(--cream-50);">Sign In</button>
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN ROUTER VIEW -->
      <main class="flex-1" style="background: var(--cream-50);">
        <router-view></router-view>
      </main>

      <!-- CART SIDEBAR -->
      <div v-if="cartStore.isCartOpen">
        <div class="fixed top-0 right-0 h-[100dvh] w-full sm:w-[460px] z-[100] flex flex-col animate-slide-in"
          style="background: var(--cream-50); border-left: 1px solid var(--cream-200); box-shadow: -8px 0 40px rgba(28,25,23,0.08);">
          <!-- Cart Header -->
          <div class="px-6 py-5 flex items-center justify-between" style="border-bottom: 1px solid var(--cream-200);">
            <h2 class="text-lg font-semibold" style="font-family: var(--font-body); color: var(--stone-900); letter-spacing: normal;">
              Cart <span class="font-normal text-sm" style="color: var(--stone-400);">({{ cartStore.totalItem }} items)</span>
            </h2>
            <button class="p-2 rounded-full transition-colors" style="color: var(--stone-400);"
              @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
              @mouseleave="$event.currentTarget.style.background='transparent'"
              @click="cartStore.isCartOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto p-5 space-y-3">
            <div v-if="cartStore.totalItem == 0" class="h-full flex flex-col items-center justify-center gap-4" style="color: var(--stone-400);">
              <svg class="w-16 h-16" style="color: var(--cream-300);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p class="text-sm font-medium" style="color: var(--stone-500);">Your cart is empty</p>
              <button @click="cartStore.isCartOpen = false" class="text-sm font-semibold" style="color: var(--amber-600);">Start Shopping</button>
            </div>

            <div v-for="item in cartStore.item_details" :key="item.id" class="flex gap-4 p-4 rounded-2xl transition-colors animate-fade-in"
              style="background: white; border: 1px solid var(--cream-200);">
              <div class="flex items-start gap-3">
                <input type="checkbox" v-model="item.checked" class="mt-1 w-4 h-4 cursor-pointer rounded" @click="cartStore.updateChecked(item.id)" />
                <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 p-2 flex items-center justify-center" style="background: var(--cream-100); border: 1px solid var(--cream-200);">
                  <img :src="item.image" :alt="item.title" class="w-full h-full object-contain" />
                </div>
              </div>
              <div class="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h3 class="text-sm font-semibold line-clamp-1 mb-0.5" style="color: var(--stone-800); font-family: var(--font-body);">{{ item.title }}</h3>
                  <p class="text-base font-bold" style="color: var(--stone-900);">Rs. {{ item.price }}</p>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center rounded-lg overflow-hidden" style="border: 1px solid var(--cream-200);">
                    <button @click="updatePositive(item, item.quantity, 'sub')" :disabled="item.quantity === 1"
                      class="w-8 h-8 flex items-center justify-center text-sm transition-colors disabled:opacity-30"
                      style="color: var(--stone-500);"
                      @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
                      @mouseleave="$event.currentTarget.style.background='transparent'">-</button>
                    <span class="w-8 text-center text-sm font-semibold" style="color: var(--stone-800);">{{ item.quantity }}</span>
                    <button @click="updatePositive(item, item.quantity, 'add')"
                      class="w-8 h-8 flex items-center justify-center text-sm transition-colors"
                      style="color: var(--stone-500);"
                      @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
                      @mouseleave="$event.currentTarget.style.background='transparent'">+</button>
                  </div>
                  <button @click="deleteItem(item)" class="p-2 rounded-lg transition-all" style="color: var(--stone-400);"
                    @mouseover="$event.currentTarget.style.color='#DC2626'; $event.currentTarget.style.background='rgba(220,38,38,0.05)'"
                    @mouseleave="$event.currentTarget.style.color='var(--stone-400)'; $event.currentTarget.style.background='transparent'">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Footer -->
          <div class="p-5" style="border-top: 1px solid var(--cream-200);">
            <div class="flex items-center justify-between mb-5">
              <span class="text-sm font-medium" style="color: var(--stone-500);">Subtotal</span>
              <span class="text-xl font-bold" style="color: var(--stone-900); font-family: var(--font-display); letter-spacing: -0.01em;">Rs. {{ cartStore.totalCost || '0.00' }}</span>
            </div>
            <div class="flex gap-3">
              <button class="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style="border: 1.5px solid var(--cream-200); color: var(--stone-700);"
                @mouseover="$event.currentTarget.style.background='var(--cream-100)'"
                @mouseleave="$event.currentTarget.style.background='transparent'"
                @click="goToCart()" :disabled="cartStore.totalItem == 0">View Cart</button>
              <button class="flex-[2] py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style="background: var(--stone-900); color: var(--cream-50);"
                @mouseover="$event.currentTarget.style.background='var(--stone-700)'"
                @mouseleave="$event.currentTarget.style.background='var(--stone-900)'"
                @click="goToCheckout()" :disabled="cartStore.totalItem == 0">Checkout</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FOOTER (Minimalist Cream Bar) ──────────────────────── -->
      <footer class="py-8 px-6 lg:px-12 mt-auto" style="background: var(--cream-100); border-top: 1px solid var(--cream-200);">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <img src="/assets/final5.png" alt="Luxe Logo" class="h-5 object-contain" style="opacity: 0.5;" />
            <span class="text-xs" style="color: var(--stone-400); font-weight: 500;">© 2026 Luxe Commerce</span>
          </div>
          <div class="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase" style="color: var(--stone-400);">
            <button @click="router.push('/contact')" class="transition-colors hover-stone">Support</button>
            <button class="transition-colors hover-stone">Privacy</button>
            <button class="transition-colors hover-stone">Terms</button>
          </div>
          <div class="flex items-center gap-4" style="color: var(--stone-400);">
            <a href="#" class="transition-colors" title="Twitter"
              @mouseover="$event.currentTarget.style.color='var(--stone-700)'"
              @mouseleave="$event.currentTarget.style.color='var(--stone-400)'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" class="transition-colors" title="Instagram"
              @mouseover="$event.currentTarget.style.color='var(--stone-700)'"
              @mouseleave="$event.currentTarget.style.color='var(--stone-400)'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, provide } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from 'vue-toastification';

// Router & Store
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast()

// Reactive Variables
const products = ref([]);
const mobileMenuOpen = ref(false);

// Search State
const searchQuery = ref("");
const searchResults = ref([]);
const showSearchResults = ref(false);

// Wishlist & Notifications (Premium Extra Space Elements)
const notificationOpen = ref(false);
const notifications = ref([
  { id: 1, text: "🎉 Welcome to Luxe! Use coupon code LUXE20 for 20% off.", time: "2 hours ago" },
  { id: 2, text: "📦 New premium furniture added to our collection.", time: "1 day ago" }
]);

// Newsletter Email
const newsletterEmail = ref("");

// Shop mega-menu groups
const shopGroups = {
  electronics: [
    { label: 'Laptops', value: 'laptops' },
    { label: 'Smartphones', value: 'smartphones' },
    { label: 'Tablets', value: 'tablets' },
    { label: 'Mobile Accessories', value: 'mobile-accessories' },
  ],
  home: [
    { label: 'Home Decoration', value: 'home-decoration' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Kitchen Accessories', value: 'kitchen-accessories' },
  ],
  sports: [
    { label: 'Sports Gear', value: 'sports-accessories' },
    { label: 'Sunglasses', value: 'sunglasses' },
    { label: 'Deals & Offers', value: 'deals' },
  ],
};

const mobileShopGroups = [
  { title: 'Electronics', items: shopGroups.electronics },
  { title: 'Home & Living', items: shopGroups.home },
  { title: 'Sports & Style', items: shopGroups.sports },
];

// Functions
const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:5001/api/products");
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
  cartStore.isCartOpen = false;
  cartStore.costCalculation();
};

const goToAuth = (mode) => {
  router.push({ path: '/auth', query: mode === 'signup' ? { mode: 'signup' } : undefined });
};

const signOut = () => {
  authStore.clearUser();
  cartStore.item_details = [];
  cartStore.totalQuantity();
  cartStore.costCalculation();
  toast.success('You have been signed out.', { timeout: 1500, hideProgressBar: true });
};

const goToCheckout = () => {
  if (!authStore.isAuthenticated) {
    toast.info('Please sign in or sign up before purchasing.', { timeout: 2000, hideProgressBar: true });
    router.push({ path: '/auth', query: { redirect: '/payment' } });
    cartStore.isCartOpen = false;
    return;
  }
  if (cartStore.total_buying_item > 0) {
    router.push("/payment")
    cartStore.isCartOpen = false
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
  cartStore.isCartOpen = false
}

// Search Logic
const handleSearchInput = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  const query = searchQuery.value.toLowerCase();
  searchResults.value = products.value.filter(p => 
    p.title.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    (p.brand && p.brand.toLowerCase().includes(query))
  ).slice(0, 6);
};

const handleSelectSearchResult = (product) => {
  router.push(`/${product.category}/${product.id}`);
  searchQuery.value = "";
  searchResults.value = [];
  showSearchResults.value = false;
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

const closeSearch = () => {
  showSearchResults.value = false;
};

const closeNotifications = () => {
  notificationOpen.value = false;
};

const clearNotifications = () => {
  notifications.value = [];
  toast.success("Notifications marked as read", { timeout: 1500, hideProgressBar: true });
};

// Newsletter Submit
const handleNewsletterSubmit = () => {
  if (newsletterEmail.value) {
    toast.success(`Thank you for subscribing! Check ${newsletterEmail.value} for details.`, { timeout: 2500, hideProgressBar: true });
    newsletterEmail.value = "";
  }
};

// Custom click outside directive for Vue
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

provide("products", products);
provide("fetchProducts", fetchProducts);

// Lifecycle Hook
onMounted(() => {
  fetchProducts();
  cartStore.costCalculation();
  cartStore.totalQuantity();
});
</script>

<style scoped>
/* Smooth animations */
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-in {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
