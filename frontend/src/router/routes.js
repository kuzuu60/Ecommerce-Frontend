import Layout from "@/components/Layout.vue";
import ProductDetail from "@/views/ProductDetail.vue";
import Products from "@/views/Products.vue";
import Cart from "@/views/Cart.vue";
import Payment from "@/views/Payment.vue";
import Home from "@/views/Home.vue";
import Contact from "@/views/Contact.vue";
import PaymentSuccess from "@/views/PaymentSuccess.vue";
import PaymentFailure from "@/views/PaymentFailure.vue";
import AdminLogin from "@/views/AdminLogin.vue";

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
      { path: "/contact", component: Contact },
      { path: "/success", component: PaymentSuccess },
      { path: "/failure", component: PaymentFailure },
      { path: "/admin/login", component: AdminLogin },
      { path: "/admin", component: () => import("@/views/Admin.vue"), meta: { requiresAuth: true } },
      { path: "/admin/orders", component: () => import("@/views/AdminOrders.vue"), meta: { requiresAuth: true } }
    ],
  },
];
export { routes };
