import api from '../api';
import type { TSaveFromAccount, TCancelInvoice } from './types';

async function saveFromAccount(data: TSaveFromAccount) {
    return api.post<any>('/Invoice/SaveFromAccount', data);
}

async function saveFromReservationOrder(data: {
    invoiceId: number;
    invoiceNumber: string | null;
    orderNumber: string | null;
    orderAccountId: number;
    reservationOrderId: number;
    invoiceDate: string;
    status: string;
    customerId: number;
    createdBy: string;
    paymentMethod: string;
    amountPaid: number;
    details: {
        invoiceId: number;
        productCode: string;
        quantity: number;
        unitPrice: number;
    }[];
}) {
    return api.post<any>('/Invoice/SaveFromReservationOrder', data);
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
    saveFromReservationOrder,
    cancel,
    get,
    getAll,
};

export default invoiceApi;
