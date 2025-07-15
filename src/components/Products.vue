<template>
  <div>
    <div class="products" v-if="isValid">
      <ul>
        <li v-for="product in selectedProductList" :key="product.id">
          <div class="item products--items" @click="goToProduct(product.id, selectedTab)">
            <div class="image-div products--items__image">
              <img :src="product.thumbnail" :alt="product.title" class="product-img" />
            </div>
            <div class="discription products--items__discription">
              <h3>{{ product.title }}</h3>
              <p>Price: ${{ product.price }}</p>
              <p><span class="stars">{{ getStars(product.rating) }}</span></p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="product-not-found">
      <img src="/assets/page-not-found.png" alt="pagenotfound" width="500px" height="500px">
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject, watchEffect, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

// Vue Router
const router = useRouter();
const route = useRoute();

// Reactive Variables
const selectedTab = ref(route.params.category);
const selectedProductList = ref([]);
const products = inject('products');

const availableCategories = [
  "beauty", "skin-care", "fragrances",
  "laptops", "smartphones", "tablets", "mobile-accessories",
  "mens-shirts", "mens-shoes", "mens-watches",
  "womens-dresses", "tops", "womens-shoes", "womens-watches", "womens-jewellery", "womens-bags",
  "home-decoration", "furniture", "kitchen-accessories",
  "sports-accessories", "sunglasses"
];

// Computed Property
const isValid = computed(() => availableCategories.includes(selectedTab.value));

// Methods
const getNewProductList = () => {
  selectedProductList.value = products.value.filter(
    (product) => product.category === selectedTab.value
  );
};

const goToProduct = (id, selectedTab) => {
  router.push(`/${selectedTab}/${id}`);
};

const getStars = (rating) => {
  const fullStars = "★".repeat(Math.floor(rating)); // Full stars
  const emptyStars = "☆".repeat(5 - Math.floor(rating)); // Empty stars
  return fullStars + emptyStars;
};


// Watchers
watchEffect(() => {
  selectedTab.value = route.params.category;
  getNewProductList();
});

watch(products, (newProducts) => {
  if (newProducts) {
    getNewProductList();
  }
});
</script>

<style scoped lang="scss">
.products {
  cursor: pointer;
  &--items {
     h3{
      text-align: justify;
      font-weight: 600;
      margin-bottom: 7px;
      font-size: 1.3rem;
    }

    &__image {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 260px;
      width: 260px;
    }

    &__discription {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
  }

}

.products ul {
  padding: 0 20px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.item {
  border: 1px solid #ccc;
  box-shadow: rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px;
  margin-top: 20px;
  border-radius: 7px;
  height: 350px;
  // width: 350px; */
}



.item p {
  color: red;
  font-size: 1.3rem;
}

.product-img {
  // height: 260px;
  // width: 260px;
  transition: all 0.3s ease-in-out;
}

.product-img:hover {
  transform: scale(1.1);
}

.image-div {
  display: flex;
  justify-content: center;
}

.discription {
  margin-top: 10px;
  padding: 0 20px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 90px);
}

.stars {
  color: gold;
  font-size: 2rem;
}
</style>
