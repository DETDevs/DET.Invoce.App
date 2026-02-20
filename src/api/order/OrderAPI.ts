import api from '../api';
import type { TOrderSave, TOrderCreate, TAccountSplit } from './types';

async function save(data: TOrderSave) {
    return api.post<any>('/Order/Save', data);
}

async function create(data: TOrderCreate) {
    return api.post<any>('/Order/Create', data);
}

async function accountSplit(data: TAccountSplit) {
    return api.post<any>('/Order/AccountSplit', data);
}

async function getOrderAccountWithDetails(orderId: number) {
    return api.get<any>(`/Order/OrderAccountWithDetails?orderId=${orderId}`);
}

async function accountMerge(fromAccountId: number, toAccountId: number, createdBy: string) {
    return api.post<any>(
        `/Order/AccountMerge?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&createdBy=${createdBy}`,
        {}
    );
}

const orderApi = {
    save,
    create,
    accountSplit,
    getOrderAccountWithDetails,
    accountMerge,
};

export default orderApi;
