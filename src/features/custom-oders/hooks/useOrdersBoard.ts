import { useState } from "react";
import { type DropResult } from "@hello-pangea/dnd";
import { type Order, type OrderStatus, type PaymentStatus } from "@/features/custom-oders/types";

const getDateString = (offset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
};

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-7520",
        customer: "Javiera Obando",
        items: ["1x Pastel de Chocolate (Grande)", "6x Cupcakes Vainilla"],
        total: 850,
        deposit: 500,
        paymentStatus: "Abonado",
        dueDate: getDateString(0),
        status: "pending",
    },
    {
        id: "ORD-7521",
        customer: "Carlos Martínez",
        items: ["1x Red Velvet", "1x Café Americano"],
        total: 450,
        deposit: 450,
        paymentStatus: "Pagado",
        dueDate: getDateString(0),
        status: "production",
    },
    {
        id: "ORD-7522",
        customer: "Empresa Tech S.A.",
        items: ["3x Bandejas de Bocadillos", "2x Pasteles Corporativos"],
        total: 3500,
        deposit: 0,
        paymentStatus: "Pendiente",
        dueDate: getDateString(1),
        status: "pending",
    },
    {
        id: "ORD-7519",
        customer: "Ana López",
        items: ["1x Cheesecake de Fresa"],
        total: 600,
        deposit: 600,
        paymentStatus: "Pagado",
        dueDate: getDateString(-1),
        status: "ready",
    },
    {
        id: "ORD-7523",
        customer: "Lionel Messi",
        items: ["1x Cheesecake de fresa"],
        total: 600,
        deposit: 300,
        paymentStatus: "Abonado",
        dueDate: getDateString(5),
        status: "pending",
    },
];

export const useOrdersBoard = () => {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

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
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order,
            ),
        );
    };

    const registerPayment = (orderId: string, amount: number) => {
        setOrders((prev) =>
            prev.map((order) => {
                if (order.id !== orderId) return order;

                const newDeposit = order.deposit + amount;
                let newPaymentStatus: PaymentStatus = order.paymentStatus;

                if (newDeposit >= order.total) {
                    newPaymentStatus = "Pagado";
                } else if (newDeposit > 0) {
                    newPaymentStatus = "Abonado";
                }

                return {
                    ...order,
                    deposit: newDeposit,
                    paymentStatus: newPaymentStatus,
                };
            }),
        );
    };

    return {
        orders,
        onDragEnd,
        moveOrder,
        registerPayment,
    };
};