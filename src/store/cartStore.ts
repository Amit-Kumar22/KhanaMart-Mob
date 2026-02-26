import { create } from 'zustand';
import { Product } from '../features/dashboard/types';

interface CartItem {
  product: Product;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  clearCart: () => void;
  getQty: (productId: number) => number;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    const existing = get().items.find((i) => i.product.id === product.id);
    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        ),
      }));
    } else {
      set((s) => ({ items: [...s.items, { product, qty: 1 }] }));
    }
  },

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),

  increaseQty: (productId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === productId ? { ...i, qty: i.qty + 1 } : i,
      ),
    })),

  decreaseQty: (productId) =>
    set((s) => ({
      items: s.items
        .map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty - 1 } : i,
        )
        .filter((i) => i.qty > 0),
    })),

  clearCart: () => set({ items: [] }),

  getQty: (productId) =>
    get().items.find((i) => i.product.id === productId)?.qty ?? 0,

  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, i) =>
        sum + (i.product.discountPrice || i.product.price) * i.qty,
      0,
    ),
}));
