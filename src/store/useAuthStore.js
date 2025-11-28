import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: '',
      currentUser: null,
      setAuth: ({ token = '', user = null }) => set({ token, currentUser: user }),
      clearAuth: () => set({ token: '', currentUser: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
