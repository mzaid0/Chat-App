import { create } from "zustand";

const useSocketStore = create((set) => ({
  socket: null,
  setSocket: (socketInstance) => set({ socket: socketInstance }),
  clearSocket: () => set({ socket: null }),
}));

export default useSocketStore;
