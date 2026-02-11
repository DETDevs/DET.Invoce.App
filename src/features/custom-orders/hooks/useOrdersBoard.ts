import { type DropResult } from "@hello-pangea/dnd";
import { type Order, type OrderStatus } from "@/features/custom-orders/types";
import { useOrdersStore } from "@/features/custom-orders/store/useOrdersStore";

export const useOrdersBoard = () => {
    const { orders, setOrders, updateOrderStatus, registerPayment } = useOrdersStore();

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newOrders = [...orders];
        const draggedOrderIndex = newOrders.findIndex((o) => o.id === draggableId);

        if (draggedOrderIndex > -1) {
            newOrders[draggedOrderIndex] = {
                ...newOrders[draggedOrderIndex],
                status: destination.droppableId as OrderStatus,
            };
            setOrders(newOrders);
        }
    };

    const moveOrder = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    return {
        orders,
        onDragEnd,
        moveOrder,
        registerPayment,
    };
};