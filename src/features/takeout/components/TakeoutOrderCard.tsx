import { Clock, Package, UtensilsCrossed, User } from "lucide-react";
import type { TakeoutOrder } from "@/shared/types";

interface Props {
  tableNumber: number;
  cuentas: TakeoutOrder[];
  onClick: () => void;
}

export const TakeoutOrderCard = ({ tableNumber, cuentas, onClick }: Props) => {
  const isParaLlevar = tableNumber === 0;
  const totalItems = cuentas.reduce(
    (acc, c) => acc + c.items.reduce((a, i) => a + i.quantity, 0),
    0,
  );
  const oldestOrder = cuentas.reduce(
    (oldest, c) => (c.createdAt < oldest.createdAt ? c : oldest),
    cuentas[0],
  );
  const createdTime = new Date(oldestOrder.createdAt).toLocaleTimeString(
    "es-NI",
    { hour: "2-digit", minute: "2-digit" },
  );

  const minutesAgo = Math.floor(
    (Date.now() - new Date(oldestOrder.createdAt).getTime()) / 60000,
  );

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
            {isParaLlevar ? <Package size={22} /> : tableNumber}
          </div>
          <div>
            <h3 className="font-bold text-[#2D2D2D] text-lg">
              {isParaLlevar
                ? `Para Llevar #${cuentas[0].cuentaNumber}`
                : `Mesa ${tableNumber}`}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <User size={12} />
              <span>{oldestOrder.createdBy}</span>
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            minutesAgo < 10
              ? "bg-green-100 text-green-700"
              : minutesAgo < 30
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {minutesAgo < 1 ? "Recién" : `${minutesAgo} min`}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {cuentas.map((cuenta) => (
          <div
            key={cuenta.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
          >
            <span className="font-medium text-gray-700">
              {isParaLlevar
                ? `Orden #${cuenta.cuentaNumber}`
                : `Cuenta ${cuenta.cuentaNumber}`}
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {cuenta.items.reduce((a, i) => a + i.quantity, 0)} items
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Abierta {createdTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {isParaLlevar ? <Package size={12} /> : <UtensilsCrossed size={12} />}
          <span>
            {totalItems} productos · {cuentas.length}{" "}
            {isParaLlevar
              ? cuentas.length === 1
                ? "orden"
                : "órdenes"
              : cuentas.length === 1
                ? "cuenta"
                : "cuentas"}
          </span>
        </div>
      </div>
    </div>
  );
};
