import { useState, useEffect, useCallback } from 'react';
import orderApi from '@/api/order/OrderAPI';
import type { TOrder } from '@/api/order/types';

export const useOrders = () => {
    const [orders, setOrders] = useState<TOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await orderApi.getAll();
            if (Array.isArray(data)) {
                const seen = new Set<number>();
                const unique = data.filter((o) => {
                    if (seen.has(o.orderId)) return false;
                    seen.add(o.orderId);
                    return true;
                });
                setOrders(unique.filter((o) => o.status === 'InProgress'));
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const tableOrders = orders.filter((o) => o.tableId !== null);

    const tableGroups = tableOrders.reduce((acc, order) => {
        const key = order.tableId!;
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key)!.push(order);
        return acc;
    }, new Map<number, TOrder[]>());

    const takeoutOrders = orders.filter((o) => o.tableId === null);

    return {
        loading,
        refetch: fetchOrders,
        tableGroups,
        takeoutOrders,
        totalActive: orders.length,
    };
};
