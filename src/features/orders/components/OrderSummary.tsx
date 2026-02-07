import React from "react";
import { ShoppingBag } from "lucide-react";
import { CartItemRow } from "./CartItemRow";
import type { CartItem } from "../types";

type OrderSummaryProps = {
  cart: CartItem[];
  total: number;
  orderNumber: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  onCheckout: () => void;
};

export const OrderSummary = ({
  cart,
  total,
  orderNumber,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
}: OrderSummaryProps) => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white h-full grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="px-6 pb-4 pt-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#2D2D2D]">
            Orden #{orderNumber}
          </h2>
          <span className="bg-[#F9F1D8] text-[#593D31] text-xs font-bold px-2 py-1 rounded-lg">
            {totalItems} Items
          </span>
        </div>
      </div>

      <div className="overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <ShoppingBag size={48} className="mb-4 opacity-50" />
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm">Agrega productos para empezar una orden.</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={`${item.id}-${item.name}`}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveFromCart}
            />
          ))
        )}
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-[#2D2D2D]">Total</span>
          <span className="text-2xl font-bold text-[#2D2D2D]">
            C$ {total.toFixed(2)}
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Facturar
        </button>
      </div>
    </div>
  );
};
