import { useState, useMemo } from "react";
import type { Product, CartItem } from "@/features/orders/types/index";

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing
        ? prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );
  const clearCart = () => setCart([]);

  const initializeCart = (items: CartItem[]) => setCart(items);

  return { cart, addToCart, updateQuantity, removeFromCart, total, clearCart, initializeCart };
};
