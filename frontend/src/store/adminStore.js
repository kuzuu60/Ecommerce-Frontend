import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('admin_token') || null,
    user: localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')) : null,
  }),
  actions: {
    setAdmin(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
    },
    clearAdmin() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  }
});
