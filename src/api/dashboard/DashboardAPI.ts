import api from '../api';
import type {
    TDashboardMoney,
    TDashboardProductsSold,
    TSalesByCategory,
    TTopProductByCategory,
} from './types';

async function getTotalMoneyToday() {
    return api.get<TDashboardMoney>('/Dashboard/GetTotalMoneyToday');
}

async function getTotalProductsSoldToday() {
    return api.get<TDashboardProductsSold>('/Dashboard/GetTotalProductsSoldToday');
}

async function getSalesByCategoryToday() {
    return api.get<TSalesByCategory[]>('/Dashboard/GetSalesByCategoryToday');
}

async function getTopProductByCategoryToday() {
    return api.get<TTopProductByCategory[]>('/Dashboard/GetTopProductByCategoryToday');
}

const dashboardApi = {
    getTotalMoneyToday,
    getTotalProductsSoldToday,
    getSalesByCategoryToday,
    getTopProductByCategoryToday,
};

export default dashboardApi;
