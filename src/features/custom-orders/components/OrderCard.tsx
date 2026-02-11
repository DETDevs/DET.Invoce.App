import { Draggable } from "@hello-pangea/dnd";
import { Clock, User, CheckCircle2 } from "lucide-react";
import type { Order } from "@/shared/types";

interface Props {
  order: Order;
  index: number;
  onClick: (order: Order) => void;
}

const PaymentProgress = ({
  status,
  total,
  deposit,
}: {
  status: string;
  total: number;
  deposit: number;
}) => {
  const progress = Math.min((deposit / total) * 100, 100);

  // Colores para la barra
  const colorClass =
    status === "Pagado"
      ? "bg-green-500"
      : status === "Abonado"
        ? "bg-amber-500"
        : "bg-gray-200"; // Pendiente en gris suave

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-[10px] uppercase font-bold ${
            status === "Pagado"
              ? "text-green-700"
              : status === "Abonado"
                ? "text-amber-700"
                : "text-gray-400" // Pendiente en gris discreto
          }`}
        >
          {status === "Pendiente" ? "Sin Pago" : status}
        </span>
        <span className="text-[10px] font-medium text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Si el progreso es 0, la barra de fondo gris (bg-gray-100) ya sirve como indicador de total pendiente */}
    </div>
  );
};

const getDueDateInfo = (
  dueDate: string,
): { text: string; color: string; urgent: boolean } => {
  if (!dueDate) {
    return { text: "Sin fecha", color: "text-gray-400", urgent: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d atrasado`,
      color: "text-red-600 font-bold",
      urgent: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: "¡Hoy!",
      color: "text-red-600 font-bold",
      urgent: true,
    };
  }
  if (diffDays === 1) {
    return {
      text: "Mañana",
      color: "text-amber-600 font-medium",
      urgent: true,
    };
  }
  if (diffDays <= 3) {
    return {
      text: `En ${diffDays} días`,
      color: "text-amber-600",
      urgent: false,
    };
  }
  return {
    text: `En ${diffDays} días`,
    color: "text-green-600",
    urgent: false,
  };
};

export const OrderCard = ({ order, index, onClick }: Props) => {
  const dueDateInfo = getDueDateInfo(order.dueDate);

  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(order)}
          className={`bg-white p-3.5 rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-[#E8BC6E]/30 transition-all cursor-pointer group mb-3 relative overflow-hidden ${snapshot.isDragging ? "shadow-xl rotate-2 ring-2 ring-[#E8BC6E]" : ""}`}
          style={provided.draggableProps.style}
        >
          {/* Indicador lateral de urgencia si aplica */}
          {dueDateInfo.urgent && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400" />
          )}

          {/* Cabecera: Cliente + ID */}
          <div className="flex justify-between items-start mb-2.5 pl-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <User size={12} />
              </div>
              <h4 className="font-bold text-[#2D2D2D] text-sm truncate leading-snug">
                {order.customer}
              </h4>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded ml-2 shrink-0">
              #{order.id}
            </span>
          </div>

          {/* Resumen de Items (1 + N más) */}
          <div className="mb-3 pl-1.5">
            <p className="text-xs text-gray-600 font-medium truncate">
              {order.items[0]}
            </p>
            {order.items.length > 1 && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                + {order.items.length - 1} producto(s) más
              </p>
            )}
          </div>

          {/* Estado de Pago Visual */}
          <div className="mb-3 pl-1.5 pr-0.5">
            <PaymentProgress
              status={order.paymentStatus}
              total={order.total}
              deposit={order.deposit}
            />
          </div>

          {/* Footer: Fecha y Total */}
          <div className="flex items-end justify-between pt-2.5 border-t border-gray-50 pl-1.5">
            {order.status !== "delivered" ? (
              <div
                className={`flex items-center gap-1.5 text-xs ${dueDateInfo.color}`}
              >
                <Clock size={13} />
                <span>{dueDateInfo.text}</span>
              </div>
            ) : (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> Entregado
              </span>
            )}

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400">Total</span>
              <span className="font-bold text-[#2D2D2D] text-sm leading-none">
                C$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
