import { useState, useMemo } from "react";
import type { Product, CartItem } from "@/features/orders/types/index";
import inventoryApi from "@/api/inventory/InventoryAPI";
import toast from "react-hot-toast";

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    const newQty = existing ? existing.quantity + 1 : 1;

    if (product.code) {
      const result = await inventoryApi.validateAvailability({
        code: product.code,
        quantity: newQty,
      });

      if (!result.isAvailable) {
        toast.error(
          `Stock insuficiente de "${product.name}". Disponible: ${Math.floor(result.available)}`,
          { duration: 3000 }
        );
        return;
      }
    }

    setCart((prev) => {
      const ex = prev.find((item) => item.id === product.id);
      return ex
        ? prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = async (id: number, delta: number) => {
    if (delta > 0) {
      const item = cart.find((i) => i.id === id);
      if (item?.code) {
        const newQty = item.quantity + delta;
        const result = await inventoryApi.validateAvailability({
          code: item.code,
          quantity: newQty,
        });

        if (!result.isAvailable) {
          toast.error(
            `Stock insuficiente de "${item.name}". Disponible: ${Math.floor(result.available)}`,
            { duration: 3000 }
          );
          return;
        }
      }
    }

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

