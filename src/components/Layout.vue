<template>
  <div :class="{ 'page-scroll': showCart }">
    <div class="category">
      <div :class="{ 'page-overlay': showCart }" @click="handleClickOverlay()"></div>
      <nav>
        <div class="my-custom-logo" @click="router.push('/')"><img src="/assets/final5.png" alt="image-logo"></div>
        <div class="navigation">
          <div class="hover-state" v-for="category in categories" :key="category.id"
            @click="goToContact(category.name)">
            {{ category.name }}
            <div class="relative">
              <div class="dropdown">
                <div v-for="item in category.subcategories" :key="item.id" class="list"
                  @click="navigateToCategory(item)">
                  {{ item?.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cart-icon-div" @click="showCart = true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 14h13.14c1.01 0 1.52 0 1.92-.19.36-.17.66-.44.87-.78.23-.38.29-.88.41-1.89l.59-5.26c.03-.3.05-.45-.04-.61-.08-.1-.15-.18-.26-.23C21.57 5 21.42 5 21.1 5H4.5M2 2h1.25c.26 0 .4 0 .5.05.1.05.17.12.22.2.06.1.07.23.08.5l.91 14.5c.02.26.03.39.09.49.05.09.12.16.21.2.1.05.24.05.49.05H19M7.5 21.5h.01M16.5 21.5h.01M8 21.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm9 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
              stroke="#FFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="total-item-icon">{{ cartStore.totalItem }}</div>
        </div>
      </nav>
      <div v-if="showCart">
        <div class="cart-content">
          <div class="cart-upper">
            <p>Shopping Cart Preview</p>
            <div class="close-btn" @click="showCart = false"></div>
          </div>
          <div class="item-containter">
            <div v-if="cartStore.totalItem == 0" class="empty-cart">Your shopping cart is empty.</div>
            <div v-for="item in cartStore.item_details" :key="item.id" class="cart-item">
              <div class="img-checkbox" @click="cartStore.updateChecked(item.id)">
                <input type="checkbox" v-model="item.checked" />
                <img :src="item.image" alt="Product Image" class="cart-img" />
              </div>
              <div class="detailed-info">
                <div class="cart-title">{{ item.title }}</div>
                <p class="price">Price: ${{ item.price }}</p>
                <div class="quantity-delete">
                  <div class="quantity">
                    <button @click="updatePositive(item, item.quantity, 'sub')"
                      :disabled="item.quantity === 1">-</button>
                    <p>{{ item.quantity }}</p>
                    <button @click="updatePositive(item, item.quantity, 'add')">+</button>
                  </div>
                  <img src="/assets/delete.svg" alt="deleteicon" @click="deleteItem(item)" />
                </div>
              </div>
            </div>
          </div>
          <div class="cart-lower">
            <button class="shopping-cart" @click="goToCart()" :disabled="cartStore.totalItem == 0">Shopping
              Cart</button>
            <button class="checkout" @click="goToCheckout()" :disabled="cartStore.totalItem == 0">Checkout</button>
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
import { useCartStore } from "./store/cartStore";
import { useToast } from 'vue-toastification';

// Router & Store
const router = useRouter();
const cartStore = useCartStore();
const toast = useToast()

// Reactive Variables
const products = ref([]);
const showCart = ref(false);
provide("products", products);

// Categories Data
const categories = ref([
  {
    id: 0,
    name: "Beauty",
    subcategories: [
      { label: "Beauty", value: "beauty" },
      { label: "Skin Care", value: "skin-care" },
      { label: "Fragrances", value: "fragrances" }
    ]
  },
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
    id: 2,
    name: "Men's Fashion",
    subcategories: [
      { label: "Shirts", value: "mens-shirts" },
      { label: "Shoes", value: "mens-shoes" },
      { label: "Watches", value: "mens-watches" }
    ]
  },
  {
    id: 3,
    name: "Women's Fashion",
    subcategories: [
      { label: "Dresses", value: "womens-dresses" },
      { label: "Tops", value: "tops" },
      { label: "Shoes", value: "womens-shoes" },
      { label: "Watches", value: "womens-watches" },
      { label: "Jewellery", value: "womens-jewellery" },
      { label: "Bags", value: "womens-bags" }
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
    const response = await fetch("https://dummyjson.com/products?limit=200");
    if (!response.ok) throw new Error("Failed to fetch");
    const result = await response.json();
    products.value = result.products;
    console.log(products.value[1] );
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

// Lifecycle Hook
onMounted(fetchProducts);
</script>

<style scoped lang="scss">
.page-scroll {
  height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.page-overlay {
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
}

.category {

  nav {
    cursor: pointer;
    background-color: #232F3E;
    color: white;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    position: relative;
    height: 60px;

    .cart-icon-div {
      margin-left: auto;
      cursor: pointer;
      position: relative;

      .total-item-icon {
        font-size: 1rem;
        position: absolute;
        background: red;
        width: 20px;
        height: 20px;
        border: solid red 1px;
        border-radius: 50%;
        top: -6px;
        left: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .navigation {
      height: 60px;
      // background: red;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 1;
      gap: 40px;
    }

    .hover-state {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        height: 20px;
        width: 100%;
        // background: red;
      }

      &:hover {
        .dropdown {
          // background: rgb(225, 218, 218);
          background: white;
          border-radius: 4px;
          opacity: 100;
          height: auto;
          pointer-events: all;
          z-index: 100;
        }
      }

      &:last-child {
        position: relative;

        &::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -8px;
          background-color: red;
          border-radius: 1px;
          transform: scale(0, 0);
          transition: 0.3s ease-out;
          transform-origin: 0% 100% 0%;
        }

        &:hover {
          &::after {
            transform: scale(1, 1);
          }
        }
      }
    }


    .relative {
      position: relative;
      // margin-bottom: 10px;

      .dropdown {
        min-width: 150px;
        margin-top: 20px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        position: absolute;
        z-index: 1;
        color: black;
        opacity: 0;
        height: 0;
        pointer-events: none;

        .list {
          padding: 8px;
          cursor: pointer;

          &:hover {
            background-color: #f0f0f0;
          }
        }
      }
    }

  }
}


.cart-content {
  background-color: white;
  height: 100dvh;
  width: 550px;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 100;
  pointer-events: auto;

  .cart-upper {
    color: #121926;
    border-bottom: solid 1px gray;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10dvh;

    p {
      font-size: 2rem;
      font-weight: 600;
      word-spacing: -0.4px;
    }
  }

  .item-containter {
    height: 80dvh;
    overflow: auto;

    .empty-cart {
      font-size: 1.7rem;
      font-weight: 500;
      padding: 20px 20px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px;

      .img-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;

        img {
          background: white;
          width: 100px;
          height: 100px;
          object-fit: cover;
          cursor: pointer;
        }
      }

      .detailed-info {
        flex-grow: 1;

        .cart-title {
          font-size: 1.8rem;
          margin-bottom: 10px;
        }

        .price {
          font-size: 1.6rem;
          color: #364152;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .quantity-delete {
          display: flex;
          justify-content: space-between;

          .quantity {
            font-size: 1.6rem;
            display: flex;
            align-items: center;
            gap: 10px;

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

            p {
              width: 30px;
              text-align: center;
            }
          }

          img {
            background-color: #f0f0f0;
            padding: 4px;
            height: 30px;
            width: 30px;
            cursor: pointer;
          }
        }
      }
    }
  }

  .cart-lower {
    border-top: solid 1px grey;
    padding: 0 20px;
    position: relative;
    bottom: 0;
    height: 10dvh;
    display: flex;
    align-items: center;
    gap: 15px;

    .checkout {
      background-color: #29303B;
      color: #FFFFDF;
      flex-grow: 4;
      border-radius: 4px;
      height: 60px;
      font-size: 1.4rem;
      font-weight: 500px;
      word-spacing: -0.1px;

      &:hover {
        background-color: #323a47;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }

    .shopping-cart {
      height: 60px;
      flex-grow: 1;
      background-color: white;
      border: solid 1px black;
      border-radius: 4px;
      font-size: 1.4rem;
      font-weight: 500px;
      word-spacing: -0.1px;

      &:hover {
        background-color: rgb(240, 237, 237);
      }

      &:disabled {
        cursor: not-allowed;
        border: solid 1px gray;
      }
    }
  }
}
</style>