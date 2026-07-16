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
import Assistant from "@/views/Assistant.vue";
import Auth from "@/views/Auth.vue";
import AdminUsers from "@/views/AdminUsers.vue";
import AdminLayout from "@/components/AdminLayout.vue";
import Admin from "@/views/Admin.vue";
import AdminOrders from "@/views/AdminOrders.vue";

const routes = [
  { path: "/admin/login", component: AdminLogin },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: Admin },
      { path: "orders", component: AdminOrders },
      { path: "users", component: AdminUsers }
    ]
  },
  {
    path: "/",
    component: Layout,
    children: [
      { path: "", component: Home },
      { path: "/deals", component: Products, meta: { isDeals: true } },
      { path: "/assistant", component: Assistant },
      { path: "/:category", component: Products },
      { path: "/:category/:id", component: ProductDetail },
      { path: "/cart", component: Cart },
      { path: "/contact", component: Contact },
      { path: "/success", component: PaymentSuccess },
      { path: "/failure", component: PaymentFailure },
      { path: "/auth", component: Auth },
      { path: "/payment", component: Payment, meta: { requiresUserAuth: true } },
    ],
  },
];
export { routes };
