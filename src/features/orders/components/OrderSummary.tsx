import React, { useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { CartItemRow } from "./CartItemRow";
import type { CartItem } from "../types";

type OrderSummaryProps = {
  cart: CartItem[];
  subtotal: number;
  orderNumber: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  onCheckout: () => void;
  onCancel: () => void;
};

export const OrderSummary = ({
  cart,
  subtotal,
  orderNumber,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  onCancel,
}: OrderSummaryProps) => {
  const [amountPaid, setAmountPaid] = useState("");

  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const paidValue = parseFloat(amountPaid) || 0;
  const change = paidValue - total;
  const isPaymentSufficient = paidValue >= total;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white h-full grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
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

      <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span>C$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>IVA (15%)</span>
            <span>C$ {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-xl font-bold text-[#2D2D2D]">Total</span>
            <span className="text-2xl font-bold text-[#2D2D2D]">
              C$ {total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">
            Monto Recibido
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              C$
            </span>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        {amountPaid !== "" && (
          <div
            className={`flex justify-between items-center p-3 rounded-lg ${change >= 0 ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"}`}
          >
            <span className="font-bold text-sm">Cambio</span>
            <span className="font-bold">C$ {change.toFixed(2)}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={onCheckout}
            disabled={cart.length === 0 || !isPaymentSufficient}
            className="w-full py-3.5 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Facturar
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 bg-white border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Cancelar Orden
          </button>
        </div>
      </div>
    </div>
  );
};
