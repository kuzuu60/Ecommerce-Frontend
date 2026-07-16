import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({ history: createWebHistory(), routes })

const isAdminAuthenticated = () => {
  const token = localStorage.getItem('admin_token');
  return Boolean(token);
};

const isUserAuthenticated = () => {
  const token = localStorage.getItem('user_token');
  return Boolean(token);
};

router.beforeEach((to) => {
  const auth = isAdminAuthenticated();
  if (to.meta.requiresAuth && !auth) {
    return { path: '/admin/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresUserAuth && !isUserAuthenticated()) {
    return { path: '/auth', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router

