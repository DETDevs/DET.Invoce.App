import { create } from 'zustand';
import type { TakeoutOrder, TakeoutItem, TakeoutStatus } from '@/shared/types';

interface TakeoutState {
    orders: TakeoutOrder[];
    addOrder: (tableNumber: number, cuentaNumber: number, items: TakeoutItem[], createdBy: string, backendOrderId?: number) => void;
    addItemsToOrder: (orderId: string, items: TakeoutItem[]) => void;
    splitOrder: (orderId: string, splitItems: { index: number; quantity: number }[]) => void;
    completeOrder: (orderId: string) => void;
    completeOrdersByBackendId: (backendOrderId: number) => void;
    cancelOrder: (orderId: string) => void;
    getActiveOrdersByTable: (tableNumber: number) => TakeoutOrder[];
    getNextCuentaNumber: (tableNumber: number) => number;
    getAllActiveOrders: () => TakeoutOrder[];
    getActiveTables: () => number[];
}

export const useTakeoutStore = create<TakeoutState>()(
    (set, get) => ({
        orders: [],

        addOrder: (tableNumber, cuentaNumber, items, createdBy, backendOrderId) => {
            const now = new Date().toISOString();
            const newOrder: TakeoutOrder = {
                id: `TO-${tableNumber}-${cuentaNumber}`,
                tableNumber,
                cuentaNumber,
                items,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                createdBy,
                backendOrderId,
            };
            set((state) => ({
                orders: [...state.orders, newOrder],
            }));
        },

        addItemsToOrder: (orderId, newItems) => {
            set((state) => ({
                orders: state.orders.map((order) => {
                    if (order.id !== orderId) return order;
                    return {
                        ...order,
                        items: [...order.items, ...newItems],
                        updatedAt: new Date().toISOString(),
                    };
                }),
            }));
        },

        splitOrder: (orderId, splitItems) => {
            const sourceOrder = get().orders.find((o) => o.id === orderId);
            if (!sourceOrder) return;
            if (splitItems.length === 0) return;

            const splitMap = new Map(splitItems.map((s) => [s.index, s.quantity]));

            const movedItems: TakeoutItem[] = [];
            const remainingItems: TakeoutItem[] = [];

            sourceOrder.items.forEach((item, idx) => {
                const qtyToMove = splitMap.get(idx);
                if (qtyToMove === undefined) {
                    remainingItems.push(item);
                } else if (qtyToMove >= item.quantity) {
                    movedItems.push({ ...item });
                } else {
                    remainingItems.push({ ...item, quantity: item.quantity - qtyToMove });
                    movedItems.push({ ...item, quantity: qtyToMove });
                }
            });

            if (movedItems.length === 0) return;

            const newCuentaNumber = get().getNextCuentaNumber(sourceOrder.tableNumber);
            const now = new Date().toISOString();

            const newOrder: TakeoutOrder = {
                id: `TO-${sourceOrder.tableNumber}-${newCuentaNumber}`,
                tableNumber: sourceOrder.tableNumber,
                cuentaNumber: newCuentaNumber,
                items: movedItems,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                createdBy: sourceOrder.createdBy,
                backendOrderId: sourceOrder.backendOrderId,
            };

            set((state) => ({
                orders: [
                    ...state.orders.map((order) => {
                        if (order.id !== orderId) return order;
                        if (remainingItems.length === 0) {
                            return { ...order, status: 'cancelled' as TakeoutStatus, updatedAt: now };
                        }
                        return { ...order, items: remainingItems, updatedAt: now };
                    }),
                    newOrder,
                ],
            }));
        },

        completeOrder: (orderId) => {
            set((state) => ({
                orders: state.orders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: 'completed' as TakeoutStatus, updatedAt: new Date().toISOString() }
                        : order
                ),
            }));
        },

        completeOrdersByBackendId: (backendOrderId) => {
            set((state) => ({
                orders: state.orders.map((order) =>
                    order.backendOrderId === backendOrderId && order.status === 'active'
                        ? { ...order, status: 'completed' as TakeoutStatus, updatedAt: new Date().toISOString() }
                        : order
                ),
            }));
        },

        cancelOrder: (orderId) => {
            set((state) => ({
                orders: state.orders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: 'cancelled' as TakeoutStatus, updatedAt: new Date().toISOString() }
                        : order
                ),
            }));
        },

        getActiveOrdersByTable: (tableNumber) => {
            return get().orders.filter(
                (o) => o.tableNumber === tableNumber && o.status === 'active'
            );
        },

        getNextCuentaNumber: (tableNumber) => {
            const tableOrders = get().orders.filter(
                (o) => o.tableNumber === tableNumber && o.status === 'active'
            );
            if (tableOrders.length === 0) return 1;
            const maxCuenta = Math.max(...tableOrders.map((o) => o.cuentaNumber));
            return maxCuenta + 1;
        },

        getAllActiveOrders: () => {
            return get().orders.filter((o) => o.status === 'active');
        },

        getActiveTables: () => {
            const activeOrders = get().orders.filter((o) => o.status === 'active');
            const tables = [...new Set(activeOrders.map((o) => o.tableNumber))];
            return tables.sort((a, b) => a - b);
        },
    })
);
