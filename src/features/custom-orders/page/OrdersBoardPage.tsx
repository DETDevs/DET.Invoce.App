import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { useOrdersBoard } from "@/features/custom-orders/hooks/useOrdersBoard";
import { KanbanColumn } from "@/features/custom-orders/components/KanbanColumn";
import { OrderDetailsModal } from "@/features/custom-orders/components/OrderDetailsModal";
import { type Order, type OrderStatus } from "@/features/custom-orders/types";

export const OrdersBoardPage = () => {
  const { orders, onDragEnd, moveOrder, registerPayment } = useOrdersBoard();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleManualMove = (orderId: string, newStatus: OrderStatus) => {
    moveOrder(orderId, newStatus);
    setIsModalOpen(false);
    toast.success("Estado del pedido actualizado");
  };

  const handlePayment = (orderId: string, amount: number) => {
    registerPayment(orderId, amount);
    toast.success(`Pago de C$ ${amount} registrado`);

    setSelectedOrder((prev) => {
      if (!prev) return null;
      const newDeposit = prev.deposit + amount;
      return {
        ...prev,
        deposit: newDeposit,
        paymentStatus: newDeposit >= prev.total ? "Pagado" : "Abonado",
      };
    });
  };

  const handleInvoice = (orderId: string) => {
    toast.success("Factura generada correctamente");
    moveOrder(orderId, "delivered");
    setIsModalOpen(false);
  };

  const handleDragStart = () => {
    document.body.style.overflowX = "hidden";
  };

  const handleDragEnd = (result: DropResult) => {
    try {
      const { source, destination, draggableId } = result;

      if (!destination || source.droppableId === destination.droppableId) {
        return;
      }

      const sourceId = source.droppableId as OrderStatus;
      const destId = destination.droppableId as OrderStatus;

      if (sourceId === "delivered") {
        toast.error(
          `El pedido #${draggableId} ya fue entregado y no puede cambiar de estado.`,
        );
        return;
      }

      if (destId === "delivered") {
        if (sourceId === "ready") {
          const orderToMove = orders.find((o) => o.id === draggableId);
          if (orderToMove) {
            handleCardClick(orderToMove);
          }
        } else {
          toast.error("Un pedido solo puede ser entregado desde 'Listo'.");
        }
        return;
      }

      const validTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
        pending: ["production"],
        production: ["pending", "ready"],
        ready: ["production"],
      };

      if (!validTransitions[sourceId]?.includes(destId)) {
        toast.error("Movimiento no válido entre estados.");
        return;
      }

      onDragEnd(result);

      const statusNames: Record<string, string> = {
        pending: "Por Hacer",
        production: "En Proceso",
        ready: "Listo",
      };

      toast.success(
        `Pedido #${draggableId} movido a "${statusNames[destId]}".`,
      );
    } finally {
      document.body.style.overflowX = "";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen w-full flex flex-col bg-[#FDFBF7] overflow-hidden">
      <div className="px-4 md:px-8 py-3 md:py-4 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
          Gestion de Pedidos
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:inline-flex px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Filtros
          </button>

          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-700 active:scale-95"
            aria-label="Filtros"
          >
            <SlidersHorizontal size={18} />
          </button>

          <button
            onClick={() => navigate("/realizar-pedido")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#E8BC6E] text-white text-sm font-bold shadow-md hover:bg-[#dca34b] transition-colors active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo Pedido</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="kanban-scroll-container h-full overflow-x-auto overflow-y-hidden px-4 md:px-8 py-4 md:py-6 snap-x snap-mandatory scroll-smooth overscroll-x-contain"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
        >
          <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex min-w-full w-max gap-4 md:gap-6 items-stretch">
              <KanbanColumn
                id="pending"
                title="Por Hacer"
                color="bg-gray-100"
                orders={orders.filter((o) => o.status === "pending")}
                onCardClick={handleCardClick}
              />

              <KanbanColumn
                id="production"
                title="En Proceso"
                color="bg-blue-50"
                orders={orders.filter((o) => o.status === "production")}
                onCardClick={handleCardClick}
              />

              <KanbanColumn
                id="ready"
                title="Listo"
                color="bg-amber-50"
                orders={orders.filter((o) => o.status === "ready")}
                onCardClick={handleCardClick}
              />

              <KanbanColumn
                id="delivered"
                title="Entregado"
                color="bg-green-50"
                orders={orders.filter((o) => o.status === "delivered")}
                onCardClick={handleCardClick}
              />
            </div>
          </DragDropContext>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onInvoice={handleInvoice}
        onMoveStatus={handleManualMove}
        onRegisterPayment={handlePayment}
      />

      <Toaster position="top-center" />
    </div>
  );
};
