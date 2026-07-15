import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({ history: createWebHistory(), routes })

const isAdminAuthenticated = () => {
  const token = localStorage.getItem('admin_token');
  return Boolean(token);
};

router.beforeEach((to, from, next) => {
  const auth = isAdminAuthenticated();
  if (to.meta.requiresAuth && !auth) {
    return next('/admin/login');
  }

  if (to.path === '/admin/login' && auth) {
    return next('/admin');
  }

  next();
});

export default router

