import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('sv5tot_user') || 'null'),
  token: localStorage.getItem('sv5tot_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('sv5tot_token', token);
      localStorage.setItem('sv5tot_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Đăng nhập thất bại' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('sv5tot_token');
    localStorage.removeItem('sv5tot_user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
