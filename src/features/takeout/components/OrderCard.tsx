import { Clock, Package, UtensilsCrossed, User } from "lucide-react";
import type { TOrder } from "@/api/order/types";
import { getCurrencySymbol } from "@/shared/utils/currency";

interface Props {
  tableId: number | null;
  orders: TOrder[];
  onClick: () => void;
}

export const OrderCard = ({ tableId, orders, onClick }: Props) => {
  const isParaLlevar = tableId === null;
  const firstOrder = orders[0];

  const createdTime = new Date(firstOrder.orderDate).toLocaleTimeString(
    "es-NI",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);
  const customerName =
    firstOrder.notes ||
    localStorage.getItem(`order-customer-name-${firstOrder.orderId}`) ||
    null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#E8BC6E] transition-all cursor-pointer p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
              isParaLlevar
                ? "bg-amber-500 text-white group-hover:bg-amber-400"
                : "bg-[#593D31] text-white group-hover:bg-[#E8BC6E]"
            }`}
          >
            {isParaLlevar ? <Package size={22} /> : tableId}
          </div>
          <div>
            <h3 className="font-bold text-[#2D2D2D] text-lg">
              {isParaLlevar ? "Para Llevar" : `Mesa ${tableId}`}
              {customerName && (
                <span className="text-[#593D31]"> — {customerName}</span>
              )}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <User size={12} />
              <span>{firstOrder.createdBy}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Abierta {createdTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {isParaLlevar ? <Package size={12} /> : <UtensilsCrossed size={12} />}
          <span>
            {getCurrencySymbol()} {totalAmount.toFixed(2)} · {orders.length}{" "}
            {isParaLlevar
              ? orders.length === 1
                ? "orden"
                : "órdenes"
              : orders.length === 1
                ? "cuenta"
                : "cuentas"}
          </span>
        </div>
      </div>
    </div>
  );
};
