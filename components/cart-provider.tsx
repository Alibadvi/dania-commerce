"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { slug: string; name: string; price: number; image: string; size: number; quantity: number };
type AddItem = Omit<CartItem, "quantity"> & { quantity?: number };
type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: AddItem) => void;
  removeItem: (slug: string, size: number) => void;
  updateQuantity: (slug: string, size: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try { setItems(JSON.parse(localStorage.getItem("dania-cart") ?? "[]")); } catch { setItems([]); }
      setReady(true);
    });
  }, []);

  useEffect(() => { if (ready) localStorage.setItem("dania-cart", JSON.stringify(items)); }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (next) => setItems((current) => {
      const found = current.find((item) => item.slug === next.slug && item.size === next.size);
      if (found) return current.map((item) => item === found ? { ...item, quantity: item.quantity + (next.quantity ?? 1) } : item);
      return [...current, { ...next, quantity: next.quantity ?? 1 }];
    }),
    removeItem: (slug, size) => setItems((current) => current.filter((item) => !(item.slug === slug && item.size === size))),
    updateQuantity: (slug, size, quantity) => setItems((current) => current.map((item) => item.slug === slug && item.size === size ? { ...item, quantity: Math.max(1, quantity) } : item)),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
