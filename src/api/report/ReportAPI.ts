import api from '../api';
import type {
    TReportDateRange,
    TTotalSales,
    TTotalOrders,
    TTotalCashIncome,
    TTotalCashOut,
    TSalesTrendItem,
    TTopSellingProduct,
    TDailyCashFlowItem,
} from './types';

function buildDateQuery(params: TReportDateRange) {
    let qs = `?dateFrom=${encodeURIComponent(params.dateFrom)}&dateTo=${encodeURIComponent(params.dateTo)}`;
    if (params.cashRegisterId) {
        qs += `&cashRegisterId=${params.cashRegisterId}`;
    }
    return qs;
}

async function getTotalSales(params: TReportDateRange) {
    return api.get<TTotalSales>(`/Report/GetTotalSales${buildDateQuery(params)}`);
}

async function getTotalOrders(params: TReportDateRange) {
    return api.get<TTotalOrders>(`/Report/GetTotalOrders${buildDateQuery(params)}`);
}

async function getSalesTrend(params: TReportDateRange) {
    return api.get<TSalesTrendItem[]>(`/Report/GetSalesTrend${buildDateQuery(params)}`);
}

async function getTopSellingProducts(params: TReportDateRange) {
    return api.get<TTopSellingProduct[]>(`/Report/GetTopSellingProducts${buildDateQuery(params)}`);
}

async function getTotalCashIncome(params: TReportDateRange) {
    return api.get<TTotalCashIncome>(`/Report/GetTotalCashIncome${buildDateQuery(params)}`);
}

async function getTotalCashOut(params: TReportDateRange) {
    return api.get<TTotalCashOut>(`/Report/GetTotalCashOut${buildDateQuery(params)}`);
}

async function getDailyCashFlow(params: TReportDateRange) {
    return api.get<TDailyCashFlowItem[]>(`/Report/GetDailyCashFlow${buildDateQuery(params)}`);
}

const reportApi = {
    getTotalSales,
    getTotalOrders,
    getSalesTrend,
    getTopSellingProducts,
    getTotalCashIncome,
    getTotalCashOut,
    getDailyCashFlow,
};

export default reportApi;
