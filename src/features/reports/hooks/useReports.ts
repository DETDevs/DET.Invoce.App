import { useState, useEffect, useCallback } from "react";
import type { ReportType, DateRangeType, SalesReportData, ProductsReportData, CashFlowReportData, OrdersReportData, ReservationsReportData, CashCloseReportData } from "@/features/reports/types";
import reportApi from "@/api/report/ReportAPI";
import cashRegisterApi from "@/api/cash-register/CashRegisterAPI";
import orderApi from "@/api/order/OrderAPI";
import reservationOrderApi from "@/api/reservation-order/ReservationOrderAPI";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";

function getDateRange(range: DateRangeType, customRange: { start: Date; end: Date } | null) {
    const now = new Date();
    let startDate = new Date();

    now.setHours(23, 59, 59, 999);

    switch (range) {
        case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "month":
            startDate.setMonth(now.getMonth() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "custom":
            if (customRange) {
                startDate = customRange.start;
                now.setTime(customRange.end.getTime());
            }
            break;
    }

    return {
        dateFrom: startDate.toISOString(),
        dateTo: now.toISOString(),
    };
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getMonthKey(dateStr: string): string {
    const d = new Date(dateStr);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function groupByMonth<T extends Record<string, any>>(
    items: T[],
    dateKey: string,
    sumKeys: string[]
): T[] {
    const monthMap = new Map<string, T>();
    items.forEach(item => {
        const mk = getMonthKey(item[dateKey]);
        if (!monthMap.has(mk)) {
            const base = { ...item, [dateKey]: mk } as T;
            sumKeys.forEach(k => { (base as any)[k] = 0; });
            monthMap.set(mk, base);
        }
        const entry = monthMap.get(mk)!;
        sumKeys.forEach(k => {
            (entry as any)[k] = ((entry as any)[k] || 0) + ((item as any)[k] || 0);
        });
    });
    return Array.from(monthMap.values());
}

const emptySalesReport: SalesReportData = {
    totalSales: 0,
    totalCashIncome: 0,
    totalProductsSold: 0,
    topProductName: "-",
    salesByDate: [],
};

const emptyProductsReport: ProductsReportData = {
    topProducts: [],
    salesByCategory: [],
    lowStockProducts: [],
};

const emptyCashFlowReport: CashFlowReportData = {
    totalIn: 0,
    totalOut: 0,
    netCash: 0,
    movementsByType: [],
    movementsByCategory: [],
    cashFlowByDate: [],
};

const emptyOrdersReport: OrdersReportData = {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    ordersByDate: [],
    averageItemsPerOrder: 0,
};

const emptyReservationsReport: ReservationsReportData = {
    totalReservations: 0,
    pendingTotal: 0,
    activeTotal: 0,
    completedTotal: 0,
    cancelledTotal: 0,
    reservationsByDate: [],
    totalDepositAmount: 0,
};

export const useReports = () => {
    const [activeReport, setActiveReport] = useState<ReportType>("sales");
    const [dateRange, setDateRange] = useState<DateRangeType>("today");
    const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { session } = useCashBox();

    const [salesReport, setSalesReport] = useState<SalesReportData>(emptySalesReport);
    const [productsReport, setProductsReport] = useState<ProductsReportData>(emptyProductsReport);
    const [cashFlowReport, setCashFlowReport] = useState<CashFlowReportData>(emptyCashFlowReport);
    const [ordersReport, setOrdersReport] = useState<OrdersReportData>(emptyOrdersReport);
    const [reservationsReport, setReservationsReport] = useState<ReservationsReportData>(emptyReservationsReport);
    const [cashCloseReport, setCashCloseReport] = useState<CashCloseReportData>({
        initialAmount: 0, salesTotal: 0, cashInTotal: 0, cashOutTotal: 0,
        returnsTotal: 0, expectedTotal: 0, invoiceCount: 0, returnsCount: 0,
        paymentBreakdown: [], movementLines: [],
    });

    const fetchSalesReport = useCallback(async (dateFrom: string, dateTo: string, cashRegisterId?: number, isYearly = false) => {
        try {
            const [totalSalesRes, cashIncomeRes, topProductsRes, salesTrend] = await Promise.all([
                reportApi.getTotalSales({ dateFrom, dateTo, cashRegisterId }),
                reportApi.getTotalCashIncome({ dateFrom, dateTo, cashRegisterId }),
                reportApi.getTopSellingProducts({ dateFrom, dateTo, cashRegisterId }),
                reportApi.getSalesTrend({ dateFrom, dateTo, cashRegisterId }),
            ]);

            const sales = totalSalesRes?.totalSales || 0;
            const cashIncome = cashIncomeRes?.totalIncome || 0;
            const topProducts = Array.isArray(topProductsRes) ? topProductsRes : [];
            const productsSold = topProducts.reduce((sum, p) => sum + (p.totalSold || 0), 0);
            const topName = topProducts.length > 0 ? topProducts[0].name : "-";
            const trend = Array.isArray(salesTrend) ? salesTrend : [];

            let salesByDate = trend.map(item => ({
                date: isYearly ? item.date : new Date(item.date).toLocaleDateString("es-NI"),
                amount: item.totalSales,
                orders: 0,
            }));

            if (isYearly) {
                salesByDate = groupByMonth(salesByDate, "date", ["amount", "orders"]);
            }

            setSalesReport({
                totalSales: sales,
                totalCashIncome: cashIncome,
                totalProductsSold: productsSold,
                topProductName: topName,
                salesByDate,
            });
        } catch (error) {
            console.error("[useReports] Error fetching sales:", error);
        }
    }, []);

    const fetchProductsReport = useCallback(async (dateFrom: string, dateTo: string, cashRegisterId?: number) => {
        try {
            const topProducts = await reportApi.getTopSellingProducts({ dateFrom, dateTo, cashRegisterId });
            const products = Array.isArray(topProducts) ? topProducts : [];

            setProductsReport({
                topProducts: products.map((p, i) => ({
                    id: p.productId || i + 1,
                    name: p.name || `Producto ${i + 1}`,
                    quantity: p.totalSold || 0,
                    total: p.totalRevenue || 0,
                })),
                salesByCategory: [],
                lowStockProducts: [],
            });
        } catch (error) {
            console.error("[useReports] Error fetching products:", error);
        }
    }, []);

    const fetchCashFlowReport = useCallback(async (dateFrom: string, dateTo: string, _cashRegisterId?: number) => {
        try {
            const [movementsRes, movementTypesRes] = await Promise.all([
                cashRegisterApi.getMovement(),
                cashRegisterApi.getMovementType()
            ]);

            const types = Array.isArray(movementTypesRes) ? movementTypesRes : [];
            const movements = (Array.isArray(movementsRes) ? movementsRes : []).filter(m => {
                const md = new Date(m.createdDate);
                const from = new Date(dateFrom);
                const to = new Date(dateTo);
                return md >= from && md <= to;
            });

            let cashIn = 0;
            let cashOut = 0;

            const categoryMap = new Map<string, { type: "in" | "out", amount: number, category: string }>();
            const dailyMap = new Map<string, { in: number, out: number }>();

            movements.forEach(m => {
                const t = types.find(x => x.cashMovementTypeId === m.cashMovementTypeId);
                const type = m.flow === "IN" ? "in" : "out";
                const catName = t ? t.name : "General";
                const key = `${type}-${catName}`;

                if (type === "in") cashIn += m.amount;
                else cashOut += m.amount;

                if (!categoryMap.has(key)) {
                    categoryMap.set(key, { type, amount: 0, category: catName });
                }
                categoryMap.get(key)!.amount += m.amount;

                const dateStr = new Date(m.createdDate).toLocaleDateString("es-NI");
                if (!dailyMap.has(dateStr)) {
                    dailyMap.set(dateStr, { in: 0, out: 0 });
                }
                const day = dailyMap.get(dateStr)!;
                if (type === "in") day.in += m.amount;
                else day.out += m.amount;
            });

            setCashFlowReport({
                totalIn: cashIn,
                totalOut: cashOut,
                netCash: cashIn - cashOut,
                movementsByType: [
                    { type: "Entradas", amount: cashIn },
                    { type: "Salidas", amount: cashOut },
                ],
                movementsByCategory: Array.from(categoryMap.values()),
                cashFlowByDate: Array.from(dailyMap.entries()).map(([date, vals]) => ({
                    date,
                    in: vals.in === 0 ? null : vals.in,
                    out: vals.out === 0 ? null : vals.out,
                })),
            });
        } catch (error) {
            console.error("[useReports] Error fetching cash flow:", error);
        }
    }, []);

    const fetchOrdersReport = useCallback(async (dateFrom: string, dateTo: string, isYearly = false) => {
        try {
            const allOrders = await orderApi.getAll();
            const fromDateDate = new Date(dateFrom);
            const toDateDate = new Date(dateTo);

            const filteredOrders = allOrders.filter(order => {
                const orderDateDate = new Date(order.orderDate);
                return orderDateDate.getTime() >= fromDateDate.getTime() && orderDateDate.getTime() <= toDateDate.getTime();
            });

            let completedCount = 0;
            let cancelledCount = 0;
            let totalItems = 0;
            let ordersWithItems = 0;

            const daysMap = new Map<string, { orders: number, amount: number }>();

            filteredOrders.forEach(order => {
                const lowerStatus = (order.status || "").toLowerCase();
                if (lowerStatus === "closed" || lowerStatus === "completada") {
                    completedCount++;
                } else if (lowerStatus === "cancelled" || lowerStatus === "canceled") {
                    cancelledCount++;
                }

                if (order.details && order.details.length > 0) {
                    ordersWithItems++;
                    order.details.forEach(d => {
                        totalItems += d.quantity;
                    });
                }

                const orderDateObj = new Date(order.orderDate);
                const orderDateStr = orderDateObj.toLocaleDateString('en-CA');
                if (!daysMap.has(orderDateStr)) {
                    daysMap.set(orderDateStr, { orders: 0, amount: 0 });
                }
                const dayStats = daysMap.get(orderDateStr)!;
                dayStats.orders++;
                dayStats.amount += order.total;
            });

            let ordersByDate = Array.from(daysMap.entries())
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([dateStr, stats]) => {
                    return {
                        date: isYearly ? dateStr : (() => { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; })(),
                        orders: stats.orders,
                        amount: stats.amount,
                    };
                });

            if (isYearly) {
                ordersByDate = groupByMonth(ordersByDate, "date", ["orders", "amount"]);
            }

            setOrdersReport({
                totalOrders: filteredOrders.length,
                completedOrders: completedCount,
                cancelledOrders: cancelledCount,
                ordersByDate,
                averageItemsPerOrder: ordersWithItems > 0 ? Number((totalItems / ordersWithItems).toFixed(1)) : 0,
            });
        } catch (error) {
            console.error("[useReports] Error fetching orders:", error);
        }
    }, []);

    const fetchReservationsReport = useCallback(async (dateFrom: string, dateTo: string, _cashRegisterId?: number, isYearly = false) => {
        try {
            const allReservations = await reservationOrderApi.getAll();
            const fromDateDate = new Date(dateFrom);
            const toDateDate = new Date(dateTo);

            const filtered = allReservations.filter(res => {
                const resDate = new Date(res.createdAt);
                return resDate.getTime() >= fromDateDate.getTime() && resDate.getTime() <= toDateDate.getTime();
            });

            let pending = 0;
            let active = 0;
            let completed = 0;
            let cancelled = 0;
            let totalDeposit = 0;

            const daysMap = new Map<string, { reservations: number, amount: number }>();

            filtered.forEach(res => {
                const status = (res.status || "").toLowerCase();
                if (status.includes("pending") || status.includes("pendiente")) pending++;
                else if (status.includes("ready") || status.includes("listo") || status.includes("proceso") || status.includes("inprogress")) active++;
                else if (status.includes("delivered") || status.includes("pagado") || status.includes("entregado") || status.includes("completed") || status.includes("completado")) completed++;
                else if (status.includes("cancelled") || status.includes("cancelado")) cancelled++;

                totalDeposit += res.deposit || 0;

                const resDateObj = new Date(res.createdAt);
                const resDateStr = resDateObj.toLocaleDateString('en-CA');
                if (!daysMap.has(resDateStr)) {
                    daysMap.set(resDateStr, { reservations: 0, amount: 0 });
                }
                const dayStats = daysMap.get(resDateStr)!;
                dayStats.reservations++;
                dayStats.amount += res.total;
            });

            let reservationsByDate = Array.from(daysMap.entries())
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([dateStr, stats]) => {
                    return {
                        date: isYearly ? dateStr : (() => { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; })(),
                        reservations: stats.reservations,
                        amount: stats.amount,
                    };
                });

            if (isYearly) {
                reservationsByDate = groupByMonth(reservationsByDate, "date", ["reservations", "amount"]);
            }

            setReservationsReport({
                totalReservations: filtered.length,
                pendingTotal: pending,
                activeTotal: active,
                completedTotal: completed,
                cancelledTotal: cancelled,
                totalDepositAmount: totalDeposit,
                reservationsByDate
            });
        } catch (error) {
            console.error("[useReports] Error fetching reservations:", error);
        }
    }, []);

    const fetchCashCloseReport = useCallback(async (dateFrom: string, dateTo: string, cashRegisterId?: number) => {
        try {
            const [totalSalesRes, totalInRes, totalOutRes, movementsRes, movementTypesRes] = await Promise.all([
                reportApi.getTotalSales({ dateFrom, dateTo, cashRegisterId }),
                reportApi.getTotalCashIncome({ dateFrom, dateTo, cashRegisterId }),
                reportApi.getTotalCashOut({ dateFrom, dateTo, cashRegisterId }),
                cashRegisterApi.getMovement(),
                cashRegisterApi.getMovementType()
            ]);

            const salesTotal = totalSalesRes?.totalSales || 0;
            const cashInTotal = totalInRes?.manualIncome || 0;
            const cashOutTotal = totalOutRes?.totalCashOut || 0;
            const initialAmount = session?.initialAmount ?? 0;

            const types = Array.isArray(movementTypesRes) ? movementTypesRes : [];
            const movements = (Array.isArray(movementsRes) ? movementsRes : []).filter(m => {
                const md = new Date(m.createdDate);
                const from = new Date(dateFrom);
                const to = new Date(dateTo);
                return md >= from && md <= to;
            });

            const movementLines = movements.map(m => {
                const t = types.find(x => x.cashMovementTypeId === m.cashMovementTypeId);
                let lineType: "venta" | "ingreso" | "egreso" | "devolucion" = m.flow === "IN" ? "ingreso" : "egreso";

                if (t?.code === "SALE" || m.description?.toLowerCase().includes("venta")) lineType = "venta";
                if (t?.code === "REFUND" || m.description?.toLowerCase().includes("devolución")) lineType = "devolucion";

                return {
                    time: new Date(m.createdDate).toISOString(),
                    type: lineType,
                    description: m.description || t?.name || "Registro",
                    amount: m.amount
                };
            });

            const returnsTotal = movementLines.filter(m => m.type === "devolucion").reduce((acc, m) => acc + m.amount, 0);
            const returnsCount = movementLines.filter(m => m.type === "devolucion").length;
            const expectedTotal = initialAmount + salesTotal + cashInTotal - cashOutTotal;

            setCashCloseReport({
                initialAmount,
                salesTotal,
                cashInTotal,
                cashOutTotal,
                returnsTotal,
                expectedTotal,
                invoiceCount: 0,
                returnsCount,
                paymentBreakdown: [],
                movementLines
            });
        } catch (error) {
            console.error("[useReports] Error fetching cash close:", error);
        }
    }, [session?.initialAmount]);

    useEffect(() => {
        const { dateFrom, dateTo } = getDateRange(dateRange, customRange);
        const cashRegisterId = dateRange === "today" ? session?.cashRegisterId : undefined;

        setIsLoading(true);

        const fetch = async () => {
            const isYearly = dateRange === "year";

            switch (activeReport) {
                case "sales":
                    await fetchSalesReport(dateFrom, dateTo, cashRegisterId, isYearly);
                    break;
                case "products":
                    await fetchProductsReport(dateFrom, dateTo, cashRegisterId);
                    break;
                case "cash":
                    await fetchCashFlowReport(dateFrom, dateTo, cashRegisterId);
                    break;
                case "orders":
                    await fetchOrdersReport(dateFrom, dateTo, isYearly);
                    break;
                case "reservations":
                    await fetchReservationsReport(dateFrom, dateTo, cashRegisterId, isYearly);
                    break;
                case "cashClose":
                    await fetchCashCloseReport(dateFrom, dateTo, cashRegisterId);
                    break;
            }
            setIsLoading(false);
        };

        fetch();
    }, [activeReport, dateRange, customRange, session?.cashRegisterId, fetchSalesReport, fetchProductsReport, fetchCashFlowReport, fetchOrdersReport, fetchReservationsReport, fetchCashCloseReport]);

    return {
        activeReport,
        setActiveReport,
        dateRange,
        setDateRange,
        setCustomRange,
        salesReport,
        productsReport,
        cashFlowReport,
        ordersReport,
        reservationsReport,
        cashCloseReport,
        isLoading,
        hasData: true,
    };
};
