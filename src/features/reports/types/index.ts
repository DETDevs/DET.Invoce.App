export type ReportType = "sales" | "products" | "cash" | "orders" | "reservations" | "cashClose";
export type DateRangeType = "today" | "week" | "month" | "year" | "custom";

export interface SalesReportData {
    totalSales: number;
    totalCashIncome: number;
    totalProductsSold: number;
    topProductName: string;
    salesByDate: { date: string; amount: number; orders: number }[];
}

export interface ProductsReportData {
    topProducts: {
        id: number;
        name: string;
        quantity: number;
        total: number;
    }[];
    salesByCategory: {
        category: string;
        amount: number;
        percentage: number;
    }[];
    lowStockProducts: {
        name: string;
        stock: number;
    }[];
}

export interface CashFlowReportData {
    totalIn: number;
    totalOut: number;
    netCash: number;
    movementsByType: { type: string; amount: number }[];
    movementsByCategory: { category: string; amount: number; type: "in" | "out" }[];
    cashFlowByDate: { date: string; in: number | null; out: number | null }[];
}

export interface OrdersReportData {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ordersByDate: { date: string; orders: number; amount: number }[];
    averageItemsPerOrder: number;
}

export interface CashCloseReportData {
    initialAmount: number;
    salesTotal: number;
    cashInTotal: number;
    cashOutTotal: number;
    returnsTotal: number;
    expectedTotal: number;
    invoiceCount: number;
    returnsCount: number;
    paymentBreakdown: { method: string; amount: number; count: number }[];
    movementLines: {
        time: string;
        type: "venta" | "ingreso" | "egreso" | "devolucion";
        description: string;
        amount: number;
    }[];
}

export interface ReservationsReportData {
    totalReservations: number;
    pendingTotal: number;
    activeTotal: number;
    completedTotal: number;
    cancelledTotal: number;
    reservationsByDate: { date: string; reservations: number; amount: number }[];
    totalDepositAmount: number;
}

