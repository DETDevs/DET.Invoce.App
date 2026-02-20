import api from '../api';
import type { TSaveFromAccount, TCancelInvoice } from './types';

async function saveFromAccount(data: TSaveFromAccount) {
    return api.post<any>('/Invoice/SaveFromAccount', data);
}

async function cancel(data: TCancelInvoice) {
    return api.post<any>('/Invoice/Cancell', data);
}

async function get(id: number) {
    return api.get<any>(`/Invoice/Get?id=${id}`);
}

async function getAll() {
    return api.get<any>('/Invoice/GetAll');
}

const invoiceApi = {
    saveFromAccount,
    cancel,
    get,
    getAll,
};

export default invoiceApi;
