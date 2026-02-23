import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types';
import reservationOrderApi from '@/api/reservation-order/ReservationOrderAPI';

const STATUS_TO_ID: Record<OrderStatus, number> = {
    pending: 1,
    production: 2,
    ready: 3,
    delivered: 4,
};


interface OrdersState {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    registerPayment: (orderId: string, amount: number) => void;
    removeOrder: (orderId: string) => void;
    setOrders: (orders: Order[]) => void;
}

export const useOrdersStore = create<OrdersState>()(
    persist(
        (set, get) => ({
            orders: [],

            setOrders: (orders) => set({ orders }),

            addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

            removeOrder: (orderId) =>
                set((state) => ({ orders: state.orders.filter((o) => o.id !== orderId) })),

            updateOrderStatus: async (orderId, status) => {
                const order = get().orders.find((o) => o.id === orderId);
                set((state) => ({
                    orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o),
                }));
                if (order?.reservationOrderId) {
                    try {
                        await reservationOrderApi.updateStatus(order.reservationOrderId, STATUS_TO_ID[status]);
                    } catch (err) {
                        console.error('[useOrdersStore] Error al actualizar estado:', err);
                    }
                }
            },

            registerPayment: (orderId, amount) =>
                set((state) => ({
                    orders: state.orders.map((order) => {
                        if (order.id !== orderId) return order;
                        const newDeposit = Number(order.deposit) + Number(amount);
                        let newPaymentStatus: PaymentStatus = order.paymentStatus;
                        if (newDeposit >= Number(order.total)) newPaymentStatus = 'Pagado';
                        else if (newDeposit > 0) newPaymentStatus = 'Abonado';
                        return { ...order, deposit: newDeposit, paymentStatus: newPaymentStatus };
                    }),
                })),
        }),
        { name: 'orders-storage' }
    )
);
