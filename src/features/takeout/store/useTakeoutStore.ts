import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TakeoutOrder, TakeoutItem, TakeoutStatus } from '@/shared/types';

interface TakeoutState {
    orders: TakeoutOrder[];
    addOrder: (tableNumber: number, cuentaNumber: number, items: TakeoutItem[], createdBy: string) => void;
    addItemsToOrder: (orderId: string, items: TakeoutItem[]) => void;
    splitOrder: (orderId: string, itemIndices: number[]) => void;
    completeOrder: (orderId: string) => void;
    cancelOrder: (orderId: string) => void;
    getActiveOrdersByTable: (tableNumber: number) => TakeoutOrder[];
    getNextCuentaNumber: (tableNumber: number) => number;
    getAllActiveOrders: () => TakeoutOrder[];
    getActiveTables: () => number[];
}

export const useTakeoutStore = create<TakeoutState>()(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (tableNumber, cuentaNumber, items, createdBy) => {
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

            splitOrder: (orderId, itemIndices) => {
                const sourceOrder = get().orders.find((o) => o.id === orderId);
                if (!sourceOrder) return;

                const itemsToMove = itemIndices.map((i) => sourceOrder.items[i]).filter(Boolean);
                if (itemsToMove.length === 0) return;

                const remainingItems = sourceOrder.items.filter((_, i) => !itemIndices.includes(i));
                const newCuentaNumber = get().getNextCuentaNumber(sourceOrder.tableNumber);
                const now = new Date().toISOString();

                const newOrder: TakeoutOrder = {
                    id: `TO-${sourceOrder.tableNumber}-${newCuentaNumber}`,
                    tableNumber: sourceOrder.tableNumber,
                    cuentaNumber: newCuentaNumber,
                    items: itemsToMove,
                    createdAt: now,
                    updatedAt: now,
                    status: 'active',
                    createdBy: sourceOrder.createdBy,
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
        }),
        {
            name: 'takeout-storage',
        }
    )
);
