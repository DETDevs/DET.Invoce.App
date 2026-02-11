// Tipos base para los reportes
export type ReportType = "sales" | "products" | "cash" | "orders";
export type DateRangeType = "today" | "week" | "month" | "year" | "custom";

// Interfaces de datos procesados
export interface SalesReportData {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    theoreticalCash: number; // Efectivo Teórico (Ventas + Entradas - Salidas)
    initialCash: number; // Fondo de Caja Inicial
    salesByDate: { date: string; amount: number; orders: number }[];
    salesByPaymentMethod: { method: string; amount: number }[];
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
        // Si tuviéramos manejo de stock real
        name: string;
        stock: number;
    }[];
}

export interface CashFlowReportData {
    totalIn: number;
    totalOut: number;
    netCash: number;
    movementsByType: { type: string; amount: number }[]; // Cash In vs Cash Out
    movementsByCategory: { category: string; amount: number; type: "in" | "out" }[];
    cashFlowByDate: { date: string; in: number; out: number }[];
}

export interface OrdersReportData {
    totalOrders: number;
    completedOrders: number;
    returnedOrders: number;
    peakHours: { hour: number; orders: number; amount: number }[]; // Hourly distribution
    averageItemsPerOrder: number;
}
