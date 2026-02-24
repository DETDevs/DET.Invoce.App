import {
  X,
  Printer,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Clock,
  StickyNote,
  Tag,
} from "lucide-react";
import type { CashMovement } from "@/features/cash-movements/types";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  movement: CashMovement | null;
  onPrint?: (movementId: string) => void;
}

export const MovementDetailsModal = ({
  isOpen,
  onClose,
  movement,
  onPrint,
}: Props) => {
  if (!isOpen || !movement) return null;

  const isCashIn = movement.type === "cash-in";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(movement.id);
      toast.success("Solicitud de impresión enviada");
    } else {
      toast.error("Función de impresión no disponible");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-6 ${
            isCashIn
              ? "bg-green-50 border-b-4 border-green-500"
              : "bg-red-50 border-b-4 border-red-500"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-xl ${
                  isCashIn
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isCashIn ? (
                  <ArrowDownToLine size={32} />
                ) : (
                  <ArrowUpFromLine size={32} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isCashIn ? "Cash In - Ingreso" : "Cash Out - Salida"}
                </h2>
                <p
                  className={`text-3xl font-bold mt-1 ${isCashIn ? "text-green-600" : "text-red-600"}`}
                >
                  {isCashIn ? "+" : "-"}C${" "}
                  {movement.amount.toLocaleString("es-NI", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
              Descripción
            </h3>
            <p className="text-lg text-gray-900">{movement.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag size={16} />
                <span className="text-sm font-medium">Categoría</span>
              </div>
              <p className="text-gray-900 font-bold">{movement.categoryName}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag size={16} />
                <span className="text-sm font-medium">ID</span>
              </div>
              <p className="text-gray-900 font-bold font-mono">{movement.id}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User size={16} />
                <span className="text-sm font-medium">Registrado por</span>
              </div>
              <p className="text-gray-900 font-bold">{movement.createdBy}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock size={16} />
                <span className="text-sm font-medium">Fecha y hora</span>
              </div>
              <p className="text-gray-900 font-bold">
                {formatDate(movement.createdAt)}
              </p>
            </div>
          </div>

          {movement.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <StickyNote size={18} />
                <span className="text-sm font-bold">Notas Adicionales</span>
              </div>
              <p className="text-gray-700">{movement.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#593D31] text-white rounded-xl font-bold hover:bg-[#4a332a] transition-colors shadow-md"
          >
            <Printer size={20} />
            Imprimir Ticket
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
