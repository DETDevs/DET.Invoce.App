import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types';

interface OrdersState {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    registerPayment: (orderId: string, amount: number) => void;
    setOrders: (orders: Order[]) => void;
}

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-7520",
        customer: "Javiera Obando",
        items: ["1x Pastel de Chocolate (Grande)", "6x Cupcakes Vainilla"],
        total: 850,
        deposit: 500,
        paymentStatus: "Abonado",
        dueDate: new Date().toISOString().split("T")[0],
        status: "pending",
    },
    {
        id: "ORD-7521",
        customer: "Carlos Martínez",
        items: ["1x Red Velvet", "1x Café Americano"],
        total: 450,
        deposit: 450,
        paymentStatus: "Pagado",
        dueDate: new Date().toISOString().split("T")[0],
        status: "production",
    },
    {
        id: "ORD-7522",
        customer: "Empresa Tech S.A.",
        items: ["3x Bandejas de Bocadillos", "2x Pasteles Corporativos"],
        total: 3500,
        deposit: 0,
        paymentStatus: "Pendiente",
        dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        status: "pending",
    },
];

export const useOrdersStore = create<OrdersState>()(
    persist(
        (set) => ({
            orders: MOCK_ORDERS,
            setOrders: (orders) => set({ orders }),
            addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
            updateOrderStatus: (orderId, status) =>
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === orderId ? { ...order, status } : order
                    ),
                })),
            registerPayment: (orderId, amount) =>
                set((state) => ({
                    orders: state.orders.map((order) => {
                        if (order.id !== orderId) return order;

                        const newDeposit = Number(order.deposit) + Number(amount);
                        let newPaymentStatus: PaymentStatus = order.paymentStatus;

                        if (newDeposit >= Number(order.total)) {
                            newPaymentStatus = 'Pagado';
                        } else if (newDeposit > 0) {
                            newPaymentStatus = 'Abonado';
                        }

                        return {
                            ...order,
                            deposit: newDeposit,
                            paymentStatus: newPaymentStatus,
                        };
                    }),
                })),
        }),
        {
            name: 'orders-storage',
        }
    )
);
