import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('user_token') || null,
    user: localStorage.getItem('user_user')
      ? JSON.parse(localStorage.getItem('user_user'))
      : null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setUser(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('user_token', token);
      localStorage.setItem('user_user', JSON.stringify(user));
    },
    clearUser() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_user');
    },
  },
});
