import type { CashMovement } from "@/features/cash-movements/types";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Clock,
  StickyNote,
  Tag,
} from "lucide-react";

interface Props {
  movement: CashMovement;
  onClick?: (movement: CashMovement) => void;
}

export const MovementCard = ({ movement, onClick }: Props) => {
  const isCashIn = movement.type === "cash-in";

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
              <Tag size={14} />
              <span>{movement.categoryName}</span>
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
                    className="text-yellow-600 mt-0.5 shrink-0"
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
            {isCashIn ? "+" : "-"}C${" "}
            {movement.amount.toLocaleString("es-NI", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <span className="text-xs text-gray-500">#{movement.id}</span>
        </div>
      </div>
    </div>
  );
};
