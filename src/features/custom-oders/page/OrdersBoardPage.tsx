import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useOrdersBoard } from "../hooks/useOrdersBoard";
import { KanbanColumn } from "../components/KanbanColumn";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { type Order, type OrderStatus } from "../types";
import toast from "react-hot-toast";

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
    console.log("Generando factura para:", orderId);
    toast.success("Factura generada correctamente");
    moveOrder(orderId, "delivered");
    setIsModalOpen(false);
  };

  return (
    <div className="h-[100vh] w-full flex flex-col bg-[#FDFBF7] overflow-hidden">
      <div className="px-6 md:px-8 py-6 flex justify-between items-center bg-white border-b border-gray-100 flex-shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">
            Tablero de Producción
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Gestiona el flujo de los pedidos activos
          </p>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:block px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Filtros
          </button>
          <button
            onClick={() => navigate("/realizar-pedido")}
            className="px-4 py-2 bg-[#E8BC6E] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#dca34b] flex items-center gap-2 transition-colors active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo Pedido</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>


      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 min-w-max pb-2">
            <KanbanColumn
              id="pending"
              title="Por Hacer"
              color="bg-gray-100"
              orders={orders.filter((o) => o.status === "pending")}
              onCardClick={handleCardClick}
            />
            <KanbanColumn
              id="production"
              title="En Producción"
              color="bg-blue-50"
              orders={orders.filter((o) => o.status === "production")}
              onCardClick={handleCardClick}
            />
            <KanbanColumn
              id="ready"
              title="Listo / Empacado"
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

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onInvoice={handleInvoice}
        onMoveStatus={handleManualMove}
        onRegisterPayment={handlePayment}
      />
    </div>
  );
};
