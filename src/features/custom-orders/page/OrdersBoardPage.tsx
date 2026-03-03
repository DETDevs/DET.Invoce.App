import { useState, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import invoiceApi from "@/api/invoice/InvoiceAPI";
import reservationOrderApi from "@/api/reservation-order/ReservationOrderAPI";
import thermalTicketAPI from "@/api/thermal-ticket/ThermalTicketAPI";
import { printThermalTicket } from "@/services/printService";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useOrdersBoard } from "@/features/custom-orders/hooks/useOrdersBoard";
import { KanbanColumn } from "@/features/custom-orders/components/KanbanColumn";
import { OrderDetailsModal } from "@/features/custom-orders/components/OrderDetailsModal";
import { type Order, type OrderStatus } from "@/shared/types";
import { useOrdersStore } from "@/features/custom-orders/store/useOrdersStore";

export const OrdersBoardPage = () => {
  const { orders, onDragEnd, moveOrder, registerPayment, removeOrder } =
    useOrdersBoard();
  const { fetchOrders } = useOrdersStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoicing, setIsInvoicing] = useState(false);

  const { user } = useAuthStore();
  const readOnly = !["admin", "cajero"].includes(user?.role || "");

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleManualMove = (orderId: string, newStatus: OrderStatus) => {
    if (readOnly) return;
    moveOrder(orderId, newStatus);
    setIsModalOpen(false);
    toast.success("Estado del pedido actualizado");
  };

  const handlePayment = (orderId: string, amount: number) => {
    if (readOnly) return;
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

  const handleInvoice = async (
    orderId: string,
    paymentMethod: string = "CASH",
  ) => {
    if (readOnly) return;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (!order.reservationOrderId) {
      toast.error(
        "Este pedido no tiene registro en el servidor. Elimínalo y créalo de nuevo.",
        { duration: 6000 },
      );
      return;
    }

    setIsInvoicing(true);
    try {
      const remaining = order.total - order.deposit;
      const response = await invoiceApi.saveFromReservationOrder({
        reservationOrderId: order.reservationOrderId ?? 0,
        paymentmethod: paymentMethod,
        amountPaid: remaining > 0 ? remaining : order.total,
      });

      const invoiceNumber =
        typeof response === "string"
          ? response
          : response?.invoiceNumber || response?.data;

      // Print thermal ticket — search by invoiceNumber which IS returned by Invoice_GetAll
      try {
        const allInvoices = await invoiceApi.getAll();
        const match = allInvoices.find(
          (inv: any) => inv.invoiceNumber === invoiceNumber,
        );
        if (match?.invoiceId) {
          const ticketText = await thermalTicketAPI.getThermalTicket(
            match.invoiceId,
          );
          await printThermalTicket(ticketText);
          try {
            await thermalTicketAPI.openCashDrawer();
          } catch {
            /* ignore */
          }
        }
      } catch (printErr) {
        console.warn("[handleInvoice] No se pudo imprimir:", printErr);
      }

      // Store invoiceNumber for reprinting
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              invoiceNumber,
              status: "delivered" as OrderStatus,
              paymentStatus: "Pagado" as const,
              deposit: prev.total,
            }
          : null,
      );

      moveOrder(orderId, "delivered");
      setIsModalOpen(false);
      toast.success("¡Factura generada y pedido entregado!");
    } catch (err) {
      console.error("[handleInvoice] Error al facturar:", err);
      toast.error(
        "No se pudo generar la factura. Verifique la conexión e intente de nuevo.",
        { duration: 5000 },
      );
    } finally {
      setIsInvoicing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (readOnly) return;
    const order = orders.find((o) => o.id === orderId);

    if (order?.reservationOrderId) {
      try {
        await reservationOrderApi.cancell(
          order.reservationOrderId,
          user?.name ?? "Sistema",
        );
      } catch (err) {
        console.error("[handleCancelOrder] Error al cancelar:", err);
        toast.error("No se pudo cancelar el pedido en el servidor.");
        return;
      }
    }

    removeOrder(orderId);
    setIsModalOpen(false);
    toast.success(`Pedido #${orderId} cancelado`);
  };

  const handleReprint = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const invoiceNum = order?.invoiceNumber || selectedOrder?.invoiceNumber;

    if (!invoiceNum) {
      toast.error(
        "No se encontró el número de factura. Intente facturar de nuevo.",
      );
      return;
    }
    try {
      const allInvoices = await invoiceApi.getAll();
      const match = allInvoices.find(
        (inv: any) => inv.invoiceNumber === invoiceNum,
      );
      if (!match?.invoiceId) {
        toast.error("No se encontró la factura para reimprimir.");
        return;
      }
      const ticketText = await thermalTicketAPI.getThermalTicket(
        match.invoiceId,
      );
      await printThermalTicket(ticketText);
      toast.success("Ticket enviado a la impresora.");
    } catch (err) {
      console.error("[handleReprint] Error:", err);
      toast.error("No se pudo reimprimir la factura.");
    }
  };

  const handleDragStart = () => {
    document.body.style.overflowX = "hidden";
  };

  const handleDragEnd = (result: DropResult) => {
    if (readOnly) return;
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
      <div className="px-4 md:px-8 py-3 md:py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
            Gestion de Pedidos
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
            <div className="flex h-full min-w-full w-max gap-4 md:gap-6 items-stretch">
              <KanbanColumn
                id="pending"
                title="Por Hacer"
                color="bg-gray-100"
                orders={orders.filter((o) => o.status === "pending")}
                onCardClick={handleCardClick}
                readOnly={readOnly}
              />

              <KanbanColumn
                id="production"
                title="En Proceso"
                color="bg-blue-50"
                orders={orders.filter((o) => o.status === "production")}
                onCardClick={handleCardClick}
                readOnly={readOnly}
              />

              <KanbanColumn
                id="ready"
                title="Listo"
                color="bg-amber-50"
                orders={orders.filter((o) => o.status === "ready")}
                onCardClick={handleCardClick}
                readOnly={readOnly}
              />

              <KanbanColumn
                id="delivered"
                title="Entregado"
                color="bg-green-50"
                orders={orders.filter((o) => o.status === "delivered")}
                onCardClick={handleCardClick}
                readOnly={readOnly}
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
        onCancelOrder={handleCancelOrder}
        onReprint={handleReprint}
        readOnly={readOnly}
        isInvoicing={isInvoicing}
      />

      <Toaster position="top-center" />
    </div>
  );
};
