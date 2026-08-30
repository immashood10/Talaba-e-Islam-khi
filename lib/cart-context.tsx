'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: { productId: string; name: string; price: number; image: string; stock: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'talba-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      // ignore malformed storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addToCart: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.productId === product.productId);
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + 1, product.stock);
            return current.map((item) => (item.productId === product.productId ? { ...item, quantity: nextQuantity } : item));
          }
          if (product.stock < 1) return current;
          return [...current, { ...product, quantity: 1 }];
        });
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item,
          ),
        );
      },
      removeFromCart: (productId) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
