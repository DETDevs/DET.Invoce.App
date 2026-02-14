import type { CashMovement } from "@/features/cash-movements/types";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Package,
  Receipt,
  DollarSign,
  User,
  Clock,
  StickyNote,
} from "lucide-react";

interface Props {
  movement: CashMovement;
  onClick?: (movement: CashMovement) => void;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, typeof Wallet> = {
    fondo_caja: Wallet,
    aporte: DollarSign,
    devolucion: Receipt,
    proveedor: Package,
    gasto: Receipt,
    retiro: DollarSign,
    otro: StickyNote,
  };
  return iconMap[category] || StickyNote;
};

const getCategoryLabel = (category: string): string => {
  const labelMap: Record<string, string> = {
    fondo_caja: "Fondo de Caja",
    aporte: "Aporte del Dueño",
    devolucion: "Devolución",
    proveedor: "Pago a Proveedor",
    gasto: "Gasto Operativo",
    retiro: "Retiro del Dueño",
    otro: "Otro",
  };
  return labelMap[category] || category;
};

export const MovementCard = ({ movement, onClick }: Props) => {
  const isCashIn = movement.type === "cash-in";
  const CategoryIcon = getCategoryIcon(movement.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={() => onClick?.(movement)}
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all ${
        onClick ? "cursor-pointer hover:border-[#E8BC6E]" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`p-3 rounded-xl ${
              isCashIn
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isCashIn ? (
              <ArrowDownToLine size={24} />
            ) : (
              <ArrowUpFromLine size={24} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {movement.description}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <CategoryIcon size={14} />
              <span>{getCategoryLabel(movement.category)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User size={12} />
                {movement.createdBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDate(movement.createdAt)}
              </span>
            </div>

            {movement.notes && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <StickyNote
                    size={14}
                    className="text-yellow-600 mt-0.5 flex-shrink-0"
                  />
                  <span>{movement.notes}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-right ml-4">
          <p
            className={`text-2xl font-bold ${
              isCashIn ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCashIn ? "+" : "-"}C$ {movement.amount.toFixed(2)}
          </p>
          <span className="text-xs text-gray-500">#{movement.id}</span>
        </div>
      </div>
    </div>
  );
};
