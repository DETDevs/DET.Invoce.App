export interface TReportDateRange {
    dateFrom: string;
    dateTo: string;
}

export interface TTotalSales {
    totalSales: number;
}

export interface TTotalOrders {
    totalOrders: number;
}

export interface TTotalCashIncome {
    salesIncome: number;
    manualIncome: number;
    totalIncome: number;
}

export interface TTotalCashOut {
    totalCashOut: number;
}

export interface TSalesTrendItem {
    date: string;
    totalSales: number;
}

export interface TTopSellingProduct {
    productId: number;
    name: string;
    totalSold: number;
    totalRevenue: number;
}

export interface TDailyCashFlowItem {
    date: string;
    totalIn: number;
    totalOut: number;
    netFlow: number;
}
