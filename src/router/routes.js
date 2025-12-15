import Layout from "@/components/Layout.vue";
import ProductDetail from "@/views/ProductDetail.vue";
import Products from "@/views/Products.vue";
import Cart from "@/views/Cart.vue";
import Payment from "@/views/Payment.vue";
import Home from "@/views/Home.vue";
import Contact from "@/views/Contact.vue";

const routes = [
  {
    path: "/",
    component: Layout,
    children: [
      { path: "", component: Home },
      { path: "/:category", component: Products },
      { path: "/:category/:id", component: ProductDetail },
      { path: "/cart", component: Cart },
      { path: "/payment", component: Payment },
      { path: "/contact", component: Contact }
    ],
  },
];
export { routes };
