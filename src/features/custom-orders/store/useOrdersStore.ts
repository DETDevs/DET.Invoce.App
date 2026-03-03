import { create } from 'zustand';
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types';
import reservationOrderApi from '@/api/reservation-order/ReservationOrderAPI';

const STATUS_TO_ID: Record<OrderStatus, number> = {
    pending: 1,
    production: 2,
    ready: 3,
    delivered: 4,
};

const ID_TO_STATUS: Record<number, OrderStatus> = {
    1: 'pending',
    2: 'production',
    3: 'ready',
    4: 'delivered',
};

const STATUS_NAME_MAP: Record<string, OrderStatus> = {
    'pending': 'pending',
    'pendiente': 'pending',
    'production': 'production',
    'inprogress': 'production',
    'in progress': 'production',
    'proceso': 'production',
    'en proceso': 'production',
    'ready': 'ready',
    'listo': 'ready',
    'delivered': 'delivered',
    'entregado': 'delivered',
    'completed': 'ready',
    'completado': 'ready',
};

function resolveStatus(raw: any): OrderStatus {
    if (typeof raw === 'number') return ID_TO_STATUS[raw] ?? 'pending';
    if (typeof raw === 'string') {
        const lower = raw.toLowerCase().trim();
        return STATUS_NAME_MAP[lower] ?? 'pending';
    }
    return 'pending';
}


interface OrdersState {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    registerPayment: (orderId: string, amount: number) => void;
    removeOrder: (orderId: string) => void;
    setOrders: (orders: Order[]) => void;
}

export const useOrdersStore = create<OrdersState>()(
    (set, get) => ({
        orders: [],
        isLoading: false,

        setOrders: (orders) => set({ orders }),

        fetchOrders: async () => {
            set({ isLoading: true });
            try {
                const data = await reservationOrderApi.getAll();
                const rawRows = Array.isArray(data) ? data : [];

                // Group rows by reservationOrderId (SP joins with details)
                const orderMap = new Map<number, any>();
                rawRows.forEach((raw: any) => {
                    const id = raw.reservationOrderId;
                    if (!id) return;
                    if (!orderMap.has(id)) {
                        orderMap.set(id, { ...raw, _details: [] });
                    }
                    const entry = orderMap.get(id)!;
                    if (raw.productCode || raw.quantity) {
                        entry._details.push({
                            productCode: raw.productCode || '',
                            quantity: raw.quantity ?? 0,
                            unitPrice: raw.unitPrice ?? 0,
                            notes: raw.notes || null,
                        });
                    }
                });

                const backendOrders: Order[] = Array.from(orderMap.values())
                    .filter((raw: any) => {
                        const s = (raw.status || '').toString().toLowerCase();
                        return s !== 'cancelled' && s !== 'cancelado' && s !== 'canceled';
                    })
                    .map((raw: any) => {
                        const status = resolveStatus(raw.status);
                        const total = raw.total ?? 0;
                        const deposit = status === 'delivered' ? total : (raw.deposit ?? 0);

                        let paymentStatus: PaymentStatus = 'Pendiente';
                        if (status === 'delivered') {
                            paymentStatus = 'Pagado';
                        } else if (deposit >= total && total > 0) {
                            paymentStatus = 'Pagado';
                        } else if (deposit > 0) {
                            paymentStatus = 'Abonado';
                        }

                        const details = Array.isArray(raw.details) && raw.details.length > 0
                            ? raw.details
                            : raw._details;
                        const items = details.map((d: any) =>
                            `${d.quantity}x ${d.notes || d.productCode || 'Producto'}`
                        );
                        const rawItems = details.map((d: any) => ({
                            productId: 0,
                            productCode: d.productCode || '',
                            name: d.notes || d.productCode || 'Producto',
                            price: d.unitPrice ?? 0,
                            quantity: d.quantity ?? 0,
                        }));

                        return {
                            id: raw.orderNumber || `ORD-${raw.reservationOrderId}`,
                            reservationOrderId: raw.reservationOrderId,
                            invoiceNumber: raw.invoiceNumber || undefined,
                            customer: raw.customer || 'Sin nombre',
                            identificationCustomer: raw.identificationCustomer || undefined,
                            items,
                            rawItems,
                            total,
                            deposit,
                            paymentStatus,
                            dueDate: raw.deliveryDate || raw.orderDate || '',
                            status,
                        };
                    });

                const existingLocal = get().orders.filter(
                    o => !backendOrders.some(bo => bo.id === o.id)
                );
                set({ orders: [...backendOrders, ...existingLocal] });
            } catch (err) {
                console.error('[useOrdersStore] Error al cargar pedidos:', err);
            } finally {
                set({ isLoading: false });
            }
        },

        addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

        removeOrder: (orderId) =>
            set((state) => ({ orders: state.orders.filter((o) => o.id !== orderId) })),

        updateOrderStatus: async (orderId, status) => {
            const order = get().orders.find((o) => o.id === orderId);
            const prevStatus = order?.status;
            set((state) => ({
                orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o),
            }));
            if (order?.reservationOrderId) {
                try {
                    await reservationOrderApi.updateStatus(order.reservationOrderId, STATUS_TO_ID[status]);
                } catch (err) {
                    console.error('[useOrdersStore] Error al actualizar estado:', err);
                    if (prevStatus) {
                        set((state) => ({
                            orders: state.orders.map((o) =>
                                o.id === orderId ? { ...o, status: prevStatus } : o
                            ),
                        }));
                    }
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
    })
);

