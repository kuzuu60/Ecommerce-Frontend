<template>
  <div class="full-page">
    <div v-if="product" class="product-container">
      <div class="img-container">
        <div class="image">
          <img :src="product.thumbnail" :alt="product.title" />
        </div>
        <div class="color-options">
          <button class="color-circle red"></button>
          <button class="color-circle green"></button>
          <button class="color-circle blue"></button>
        </div>
      </div>
      <div class="details">
        <h2>{{ product.title }}</h2>
        <p class="discription">{{ product.description }}</p>
        <p class="price"><span>Price:</span> ${{ product.price }}</p>
        <div class="quantity">
          Quantity
          <button @click="quantity--" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="quantity++">+</button>
        </div>
        <p class="stock">{{ product.availabilityStatus }}</p>
        <button class="add-to-cart" @click="addToCart(product.title, product.thumbnail, product.price) ">
          Add to Cart
        </button>
        <p class="shipping">{{ product.shippingInformation }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "vue-toastification";
const toast = useToast();
import { computed, inject, ref } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "./store/cartStore";

// Store & Route
const cartStore = useCartStore();
const route = useRoute();

// Reactive Variables
const quantity = ref(1);
const products = inject("products");


// Computed Property: Find the product by ID
const product = computed(() => {
  const selectedId = Number(route.params.id);
  return products.value?.find((p) => p.id === selectedId) || null;
});

// Function to Add Product to Cart
const addToCart = (title, thumbnail, price) => {
  cartStore.addToCart(quantity.value, route.params.id, title, thumbnail, price);
  cartStore.totalQuantity();
  showMessage();
};

const showMessage = () => {
  toast.success(`${quantity.value} item added to cart`, {
    toastClassName: "my-custom-toast", timeout: 1500, hideProgressBar: true,
  });
}

</script>

<style scoped lang="scss">
.full-page {
  display: flex;
  justify-content: center;
  // height: 89vh;
  // align-items: center;
  margin-top: 20px;
  justify-content: center;

  .product-container {
    // height: 600px;
    width:1000px;
    padding: 40px;
    display: flex;
    gap: 10px;
    border: solid 1px lightgray;
    // box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);

    .img-container {
      flex-basis: 30%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      background-color: rgb(235, 235, 235);
      // box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
      padding: 12px;
      // border: solid 1px black;

      .image {
        // border: solid 1px black;
        height: 250px;
        width: 250px;
        border-radius: 5px;
      }

      .color-options {
        // border: solid 1px black;
        display: flex;
        gap: 20px;
        justify-content: center;

        .color-circle {
          width: 19px;
          height: 19px;
          border: 1px solid white;
          border-radius: 50%;
          box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            transform: scale(1.1);
          }

          &:focus,
          &:active {
            border: 2px solid green;
            outline: none;
          }
        }

        .red {
          background-color: #e74c3c;
        }

        .green {
          background-color: #2ecc71;
        }

        .blue {
          background-color: #3498db;
        }
      }
    }


    .details {
      flex-basis: 70%;
      // border: solid 1px green;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      h2 {
        font-size: 3rem;
        font-weight: 500;
        // border: solid 1px black;
      }

      .discription {
        font-size: 1.5rem;
        line-height: 1.3;
        color: rgb(79, 77, 77);
        // border: solid 1px black;
      }

      .price {
        color: black;
        font-weight: normal;
        // border: solid 1px black;
        font-size: 1.8rem;

        span {
          color: red;
          font-weight: 600;
        }
      }

      .quantity {
        font-size: 1.8rem;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        // font-weight: 400;
        // border: solid 1px black;
        
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
        
        span {
          color: #333;
          width: 30px;
          font-weight: 500;
          text-align: center;
        }
      }

      .add-to-cart {
        background: red;
        color: white;
        padding: 14px;
        font-size: 2rem;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;

        &:hover {
          background: rgb(198, 0, 0)
        }

      }

      .stock {
        font-size: 1.8rem;
        color: #22c55e ;
        // color: #2ecc71;
        // border: solid 1px black;
      }

      .shipping {
        font-size: 1.8rem;
        color: #64748b;
        // border: solid 1px black;
        // color: #3498db; 
      }
    }
  }
}
</style>
