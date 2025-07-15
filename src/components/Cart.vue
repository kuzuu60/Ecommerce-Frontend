<template>
  <div class="overall-page">
    <div v-if="cartProducts.length > 0" class="cart-container">
      <div v-for="item in cartProducts" :key="item.id">
        <div class="items">
          <div class="check-img-title">
            <input type="checkbox" v-model="item.checked" @click="cartStore.updateChecked(item.id)" />
            <img :src="item.image" :alt="item.title" class="product-img" @click="cartStore.updateChecked(item.id)" />
            <h3>{{ item.title }}</h3>
          </div>
          <div class="price-del">
            <p>Price: ${{ item.price }}</p>
            <img src="/assets/delete.svg" alt="deleteicon" @click="deleteItem(item)" />
          </div>
          <div class="quantity">
            <button @click="updateQuan(item, item.quantity, 'sub')" :disabled="item.quantity === 1"
              class="decrease-btn">-</button>
            <p>Quantity: {{ item.quantity }}</p>
            <button @click="updateQuan(item, item.quantity, 'add')">+</button>
          </div>
        </div>
      </div>
    </div>
    <div class="summary-container">
      <OrderSummary />
      <div class="content-below">
        <h2>Apply a Promotion Code</h2>
        <p>Remove any spaces or dashes before hitting apply</p>
        <div class="but-input">
          <input type="text" v-model="discountPercentage" placeholder="Enter your code here" />
          <button @click="cartStore.promoDiscountCalculation(discountPercentage)" :disabled="cartStore.promoButton">Apply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OrderSummary from './OrderSummary.vue';
import { ref } from 'vue';
import { useCartStore } from './store/cartStore';

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
