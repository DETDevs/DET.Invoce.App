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
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${order.dueDate === "Hoy" ? "bg-red-50 text-red-600" : "bg-gray-100"}`}
              >
                <Clock size={12} />
                {order.dueDate}, {order.dueTime}
              </div>
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
