import { useState, useEffect, useCallback, useRef } from 'react';
import { logError } from '@/shared/utils/logError';
import orderApi from '@/api/order/OrderAPI';
import type { TOrder } from '@/api/order/types';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export const useOrders = () => {
    const [orders, setOrders] = useState<TOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await orderApi.getAll();
            if (Array.isArray(data) && isMounted.current) {
                const seen = new Set<number>();
                const unique = data.filter((o) => {
                    if (seen.has(o.orderId)) return false;
                    seen.add(o.orderId);
                    return true;
                });
                setOrders(unique.filter((o) => o.status === 'InProgress' || o.status === 'Pending'));
            }
        } catch (err) {
            logError('[Takeout] Error fetching orders', err, { action: 'fetchOrders' });
        } finally {
            if (isMounted.current && !silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchOrders();

        // ── Polling: refresh orders every 30s ──
        const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL_MS);

        // ── Refetch when tab regains focus ──
        const onFocus = () => fetchOrders(true);
        window.addEventListener('focus', onFocus);

        // ── Refetch when device comes back online ──
        const onOnline = () => fetchOrders(true);
        window.addEventListener('online', onOnline);

        return () => {
            isMounted.current = false;
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('online', onOnline);
        };
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

