import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      onlineUsers: {},
      setUser: (user, token) => set({ user, token }),
      clearUser: () => set({ user: null, token: null }),
      setOnlineUsers: (users) => set({ onlineUsers: users }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
