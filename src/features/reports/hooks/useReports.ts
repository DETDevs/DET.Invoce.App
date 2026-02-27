import { useState, useEffect, useCallback } from "react";
import type { ReportType, DateRangeType, SalesReportData, ProductsReportData, CashFlowReportData, OrdersReportData, CashCloseReportData } from "@/features/reports/types";
import reportApi from "@/api/report/ReportAPI";
import dashboardApi from "@/api/dashboard/DashboardAPI";
import cashRegisterApi from "@/api/cash-register/CashRegisterAPI";
import orderApi from "@/api/order/OrderAPI";
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
    peakHours: [],
    averageItemsPerOrder: 0,
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
    const [cashCloseReport, setCashCloseReport] = useState<CashCloseReportData>({
        initialAmount: 0, salesTotal: 0, cashInTotal: 0, cashOutTotal: 0,
        returnsTotal: 0, expectedTotal: 0, invoiceCount: 0, returnsCount: 0,
        paymentBreakdown: [], movementLines: [],
    });

    const fetchSalesReport = useCallback(async (dateFrom: string, dateTo: string) => {
        try {
            const [totalSalesRes, cashIncomeRes, productsSoldRes, topProductsRes, salesTrend] = await Promise.all([
                reportApi.getTotalSales({ dateFrom, dateTo }),
                reportApi.getTotalCashIncome({ dateFrom, dateTo }),
                dashboardApi.getTotalProductsSoldToday(),
                reportApi.getTopSellingProducts({ dateFrom, dateTo }),
                reportApi.getSalesTrend({ dateFrom, dateTo }),
            ]);

            const sales = totalSalesRes?.totalSales || 0;
            const cashIncome = cashIncomeRes?.totalIncome || 0;
            const productsSold = productsSoldRes?.totalProductsSoldToday_ || 0;
            const topProducts = Array.isArray(topProductsRes) ? topProductsRes : [];
            const topName = topProducts.length > 0 ? topProducts[0].name : "-";
            const trend = Array.isArray(salesTrend) ? salesTrend : [];

            setSalesReport({
                totalSales: sales,
                totalCashIncome: cashIncome,
                totalProductsSold: productsSold,
                topProductName: topName,
                salesByDate: trend.map(item => ({
                    date: new Date(item.date).toLocaleDateString("es-NI"),
                    amount: item.totalSales,
                    orders: 0,
                })),
            });
        } catch (error) {
            console.error("[useReports] Error fetching sales:", error);
        }
    }, []);

    const fetchProductsReport = useCallback(async (dateFrom: string, dateTo: string) => {
        try {
            const topProducts = await reportApi.getTopSellingProducts({ dateFrom, dateTo });
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

    const fetchCashFlowReport = useCallback(async (dateFrom: string, dateTo: string) => {
        try {
            const [totalInRes, totalOutRes, dailyFlow, movementsRes, movementTypesRes] = await Promise.all([
                reportApi.getTotalCashIncome({ dateFrom, dateTo }),
                reportApi.getTotalCashOut({ dateFrom, dateTo }),
                reportApi.getDailyCashFlow({ dateFrom, dateTo }),
                cashRegisterApi.getMovement(),
                cashRegisterApi.getMovementType()
            ]);

            const cashIn = totalInRes?.totalIncome || 0;
            const cashOut = totalOutRes?.totalCashOut || 0;
            const flow = Array.isArray(dailyFlow) ? dailyFlow : [];

            const types = Array.isArray(movementTypesRes) ? movementTypesRes : [];
            const movements = (Array.isArray(movementsRes) ? movementsRes : []).filter(m => {
                const md = new Date(m.createdDate);
                const from = new Date(dateFrom);
                const to = new Date(dateTo);
                return md >= from && md <= to;
            });

            const categoryMap = new Map<string, { type: "in" | "out", amount: number, category: string }>();
            movements.forEach(m => {
                const t = types.find(x => x.cashMovementTypeId === m.cashMovementTypeId);
                const type = m.flow === "IN" ? "in" : "out";
                const catName = t ? t.name : "General";
                const key = `${type}-${catName}`;
                if (!categoryMap.has(key)) {
                    categoryMap.set(key, { type, amount: 0, category: catName });
                }
                categoryMap.get(key)!.amount += m.amount;
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
                cashFlowByDate: flow.map(item => ({
                    date: new Date(item.date).toLocaleDateString("es-NI"),
                    in: item.totalIn === 0 ? null : item.totalIn,
                    out: item.totalOut === 0 ? null : item.totalOut,
                })),
            });
        } catch (error) {
            console.error("[useReports] Error fetching cash flow:", error);
        }
    }, []);

    const fetchOrdersReport = useCallback(async (dateFrom: string, dateTo: string) => {
        try {
            const allOrders = await orderApi.getAll();
            const fromDateDate = new Date(dateFrom);
            const toDateDate = new Date(dateTo);

            const filteredOrders = allOrders.filter(order => {
                const orderDateDate = new Date(order.orderDate);
                return orderDateDate >= fromDateDate && orderDateDate <= toDateDate;
            });

            let completedCount = 0;
            let cancelledCount = 0;
            let totalItems = 0;
            let ordersWithItems = 0;

            const hoursMap = new Map<number, { orders: number, amount: number }>();

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

                const orderHour = new Date(order.orderDate).getHours();
                if (!hoursMap.has(orderHour)) {
                    hoursMap.set(orderHour, { orders: 0, amount: 0 });
                }
                const hourStats = hoursMap.get(orderHour)!;
                hourStats.orders++;
                hourStats.amount += order.total;
            });

            const peakHours = Array.from(hoursMap.entries()).map(([hour, stats]) => ({
                hour,
                orders: stats.orders,
                amount: stats.amount,
            })).sort((a, b) => a.hour - b.hour);

            setOrdersReport({
                totalOrders: filteredOrders.length,
                completedOrders: completedCount,
                cancelledOrders: cancelledCount,
                peakHours,
                averageItemsPerOrder: ordersWithItems > 0 ? Number((totalItems / ordersWithItems).toFixed(1)) : 0,
            });
        } catch (error) {
            console.error("[useReports] Error fetching orders:", error);
        }
    }, []);

    const fetchCashCloseReport = useCallback(async (dateFrom: string, dateTo: string) => {
        try {
            const [totalSalesRes, totalInRes, totalOutRes, movementsRes, movementTypesRes] = await Promise.all([
                reportApi.getTotalSales({ dateFrom, dateTo }),
                reportApi.getTotalCashIncome({ dateFrom, dateTo }),
                reportApi.getTotalCashOut({ dateFrom, dateTo }),
                cashRegisterApi.getMovement(),
                cashRegisterApi.getMovementType()
            ]);

            const salesTotal = totalSalesRes?.totalSales || 0;
            const cashInTotal = totalInRes?.totalIncome || 0;
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

        setIsLoading(true);

        const fetch = async () => {
            switch (activeReport) {
                case "sales":
                    await fetchSalesReport(dateFrom, dateTo);
                    break;
                case "products":
                    await fetchProductsReport(dateFrom, dateTo);
                    break;
                case "cash":
                    await fetchCashFlowReport(dateFrom, dateTo);
                    break;
                case "orders":
                    await fetchOrdersReport(dateFrom, dateTo);
                    break;
                case "cashClose":
                    await fetchCashCloseReport(dateFrom, dateTo);
                    break;
            }
            setIsLoading(false);
        };

        fetch();
    }, [activeReport, dateRange, customRange, fetchSalesReport, fetchProductsReport, fetchCashFlowReport, fetchOrdersReport, fetchCashCloseReport]);

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
        cashCloseReport,
        isLoading,
        hasData: true,
    };
};
