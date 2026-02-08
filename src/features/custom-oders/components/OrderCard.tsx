import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Clock } from "lucide-react";
import { type Order } from "../types";

interface Props {
  order: Order;
  index: number;
  onClick: (order: Order) => void;
}

const PaymentBadge = ({
  status,
  total,
  deposit,
}: {
  status: string;
  total: number;
  deposit: number;
}) => {
  const styles: Record<string, string> = {
    Pendiente: "bg-red-100 text-red-700 border-red-200",
    Abonado: "bg-amber-100 text-amber-700 border-amber-200",
    Pagado: "bg-green-100 text-green-700 border-green-200",
  };

  const remaining = total - deposit;

  return (
    <div className="flex flex-col items-end">
      <span
        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${styles[status]}`}
      >
        {status}
      </span>
      {status !== "Pagado" && (
        <span className="text-xs text-gray-500 font-medium mt-0.5">
          Restan: C$ {remaining.toFixed(2)}
        </span>
      )}
    </div>
  );
};

const getDueDateInfo = (dueDate: string): { text: string; color: string } => {
  if (!dueDate) {
    return { text: "Sin fecha", color: "bg-gray-100 text-gray-500" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD as local time to avoid timezone issues
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Atrasado por ${Math.abs(diffDays)} día(s)`,
      color: "bg-red-100 text-red-700 border border-red-200",
    };
  }
  if (diffDays === 0) {
    return {
      text: "Entrega Hoy",
      color: "bg-red-200 text-red-800 font-bold border border-red-300",
    };
  }
  if (diffDays <= 3) {
    return { text: `Faltan ${diffDays} día(s)`, color: "bg-amber-100 text-amber-700 border border-amber-200" };
  }
  return {
    text: `Faltan ${diffDays} días`,
    color: "bg-green-100 text-green-700 border border-green-200",
  };
};

export const OrderCard = ({ order, index, onClick }: Props) => {
  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(order)}
          className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group mb-3 ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-gray-400">
                #{order.id}
              </span>
              <h4 className="font-bold text-[#2D2D2D] text-sm">
                {order.customer}
              </h4>
            </div>
            <PaymentBadge
              status={order.paymentStatus}
              total={order.total}
              deposit={order.deposit}
            />
          </div>

          <div className="mb-3">
            <ul className="text-xs text-gray-600 space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="line-clamp-1">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              {(({ text, color }) => (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${color}`}>
                  <Clock size={14} />
                  <span>{text}</span>
                </div>
              ))(getDueDateInfo(order.dueDate))}
            </div>
            <div className="font-bold text-[#2D2D2D] text-sm">
              C$ {order.total.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
