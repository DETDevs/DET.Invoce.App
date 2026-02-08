import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal } from "lucide-react";
import { OrderCard } from "./OrderCard";
import { type Order } from "../types";

interface Props {
  id: string;
  title: string;
  orders: Order[];
  color: string;
  onCardClick: (order: Order) => void;
}

export const KanbanColumn = ({
  id,
  title,
  orders,
  color,
  onCardClick,
}: Props) => {
  return (
    <div className="flex flex-col h-full min-w-[300px] w-[300px] bg-gray-50/50 rounded-2xl border border-gray-200/60">
      <div
        className={`p-4 border-b border-gray-100 flex justify-between items-center rounded-t-2xl ${color}`}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[#2D2D2D]">{title}</h3>
          <span className="bg-white/50 text-[#2D2D2D] px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
            {orders.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-[#593D31]">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 overflow-y-auto scrollbar-hide transition-colors ${snapshot.isDraggingOver ? "bg-gray-100/50" : ""}`}
          >
            {orders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
