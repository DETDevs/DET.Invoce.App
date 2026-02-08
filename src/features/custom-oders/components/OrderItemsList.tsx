import React from "react";
import { Trash2 } from "lucide-react";
import type { OrderItem } from "../types";

interface Props {
  items: OrderItem[];
  onRemove: (index: number) => void;
}

export const OrderItemsList = ({ items, onRemove }: Props) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
        No hay productos agregados al pedido.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Cant.</th>
            <th className="px-4 py-3">Precio Unit.</th>
            <th className="px-4 py-3">Subtotal</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-medium text-[#2D2D2D]">{item.name}</div>
                {item.description && (
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">{item.quantity}</td>
              <td className="px-4 py-3">C$ {item.price.toFixed(2)}</td>
              <td className="px-4 py-3 font-medium text-[#E8BC6E]">
                C$ {(item.price * item.quantity).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
