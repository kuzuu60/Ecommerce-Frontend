import Layout from "../Layout.vue";
import ProductDetail from "../ProductDetail.vue";
import Products from "../Products.vue";
import Cart from "../Cart.vue";
import Payment from "../Payment.vue";
import Home from "../Home.vue";
import Contact from "../Contact.vue";

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
      {path: "/contact" , component:Contact}
    ],
  },
];
export { routes };
