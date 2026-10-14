// Zustand global store - barangviral.store
import { create } from "zustand";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface UIState {
  cart: CartItem[];
  cartOpen: boolean;
  notifications: string[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (productId: string) => void;
  setCartOpen: (open: boolean) => void;
  notify: (message: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  cart: [],
  cartOpen: false,
  notifications: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.productId === item.productId);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productId === item.productId ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }
      return { cart: [...state.cart, { ...item, qty: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    })),

  setCartOpen: (open) => set({ cartOpen: open }),

  notify: (message) =>
    set((state) => ({ notifications: [...state.notifications, message] })),

  clearNotifications: () => set({ notifications: [] }),
}));

// Pilih kategori untuk halaman utama
interface HomeState {
  category: string;
  setCategory: (cat: string) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  category: "Semua",
  setCategory: (category) => set({ category }),
}));
