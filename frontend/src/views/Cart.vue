<template>
  <div class="flex gap-8 p-8 min-h-[calc(100vh-80px)] bg-slate-950">
    <div v-if="cartProducts.length > 0" class="flex-[3] flex flex-col gap-4 overflow-y-auto pr-2">
      <div v-for="item in cartProducts" :key="item.id">
        <div class="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4 flex items-center gap-6 hover:bg-slate-800 transition-colors">
          <div class="flex items-center gap-6 flex-1">
             <input type="checkbox" v-model="item.checked" @click="cartStore.updateChecked(item.id)" class="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer" />
             <div class="w-28 h-28 bg-white rounded-lg p-2 border border-slate-700 flex items-center justify-center cursor-pointer" @click="cartStore.updateChecked(item.id)">
               <img :src="item.image" :alt="item.title" class="max-w-full max-h-full object-contain" />
             </div>
             <h3 class="text-lg font-medium text-slate-100 line-clamp-2 w-64">{{ item.title }}</h3>
          </div>
          
          <div class="flex items-center justify-between w-48">
            <p class="text-xl font-bold text-blue-500">Rs. {{ item.price }}</p>
            <button @click="deleteItem(item)" class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          
          <div class="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button @click="updateQuan(item, item.quantity, 'sub')" :disabled="item.quantity === 1"
              class="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 rounded shadow-sm text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold">-</button>
            <p class="w-24 text-center font-medium text-slate-300">Qty: {{ item.quantity }}</p>
            <button @click="updateQuan(item, item.quantity, 'add')" class="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 rounded shadow-sm text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all font-bold">+</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col gap-6">
      <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 sticky top-24">
         <OrderSummary />
         
         <div class="mt-8 bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-700">
            <h2 class="text-lg font-bold text-slate-100 mb-1">Apply a Promotion Code</h2>
            <p class="text-sm text-slate-400 mb-4">Remove any spaces or dashes before hitting apply</p>
            <div class="flex gap-2">
              <input type="text" v-model="discountPercentage" placeholder="Enter your code" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 text-slate-200" />
              <button @click="cartStore.promoDiscountCalculation(discountPercentage)" :disabled="cartStore.promoButton" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors">Apply</button>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OrderSummary from '@/components/OrderSummary.vue';
import { ref } from 'vue';
import { useCartStore } from '@/store/cartStore';

const cartStore = useCartStore();
const cartProducts = ref(cartStore.item_details)
const discountPercentage= ref(``)

const deleteItem = (item) => {
  cartStore.removeItem(item.id)
  cartStore.totalQuantity();
}

const updateQuan = (item, quantity, action) => {
  cartStore.updateQuantity(item.id, action === "add" ? quantity + 1 : quantity - 1)
  cartStore.totalQuantity();
}

</script>

<style scoped lang="scss">
.overall-page {
  display: flex;
  padding: 20px;
  gap: 20px;
  height: 92dvh;

  .cart-container {
    display: flex;
    flex: 11;
    flex-direction: column;
    gap: 10px;
    overflow: scroll hidden;
    .items {
      box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;
      display: flex;
      gap: 10px;
      align-items: center;

      .check-img-title {
        padding: 10px 0;
        display: flex;
        width: 500px;
        align-items: center;
        justify-content: space-around;

        h3 {
          font-size: 1.7rem;
          font-weight: 500;
          width: 300px;
        }

        img {
          background-color: oklch(97% 0 0);
          border-radius: 5px;
          width: 120px;
          height: 110px;
          cursor: pointer;
        }

        input[type="checkbox"] {
          transform: scale(1.2);
          accent-color: red;
          cursor: pointer;
        }
      }

      .price-del {
        width: 200px;
        justify-content: space-between;
        display: flex;
        align-items: center;

        p {
          font-size: 1.7rem;
          color: red;
          color: orange;
        }

        img {
          width: 25px;
          height: 25px;
          cursor: pointer;
          align-self: center;
          filter: hue-rotate(110deg);
        }
      }

      .quantity {
        font-size: 1.6rem;
        display: flex;
        padding: 0 15px;

        p {
          font-size: 1.7rem;
          width: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        button {
          width: 30px;
          height: 30px;
          background-color: #f0f0f0;
          border: none;
          cursor: pointer;

          &:hover {
            background-color: #e1e0e0;
          }
        }

        .decrease-btn:disabled {
          cursor: not-allowed;
        }
      }
    }
  }

  .summary-container {
    flex-grow: 1;
    height: 100%;
    background-color: #FAFAFA;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .content-below {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      background-color: white;
      border-radius: 4px;
      width: 400px;
      padding: 20px;
      font-size: 1.6rem;
      margin-top: 20px;

      h2 {
        font-size: 1.8rem;
        font-weight: 500;
        margin-bottom: 5px;
      }

      p {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 12px;
      }

      .but-input {
        display: flex;
        gap: 10px;

        input {
          border: solid 1px lightgray;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 1.3rem;

          &:hover {
            border: solid 1px #757575;
          }

          &:focus {
            border: solid 1px #232F3E;
          }

          &::placeholder {
            font-size: 1.2rem;
            color: gray;
          }
        }

        button {
          color: white;
          border: none;
          font-size: 1.3rem;
          font-weight: bold;
          background: #232F3E;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;

          &:disabled{
            cursor: not-allowed;
            background: #324256;
          }
        }
      }
    }
  }
}
</style>
