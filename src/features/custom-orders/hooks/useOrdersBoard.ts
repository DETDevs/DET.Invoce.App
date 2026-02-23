import { type DropResult } from "@hello-pangea/dnd";
import type { OrderStatus } from "@/shared/types";
import { useOrdersStore } from "@/features/custom-orders/store/useOrdersStore";

export const useOrdersBoard = () => {
    const { orders, updateOrderStatus, registerPayment, removeOrder } = useOrdersStore();

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        updateOrderStatus(draggableId, destination.droppableId as OrderStatus);
    };

    const moveOrder = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    return {
        orders,
        onDragEnd,
        moveOrder,
        registerPayment,
        removeOrder,
    };
};

