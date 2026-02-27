import api from '../api';
import type { TSaveFromAccount, TCancelInvoice, TRefundInvoice } from './types';

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
        productName: string;
        quantity: number;
        unitPrice: number;
    }[];
}) {
    return api.post<any>('/Invoice/SaveFromReservationOrder', data);
}

async function cancel(data: TCancelInvoice) {
    return api.post<any>('/Invoice/Cancell', data);
}

async function refund(data: TRefundInvoice) {
    return api.post<any>('/Invoice/Refund', data);
}

async function get(id: number) {
    return api.get<any>(`/Invoice/Get?id=${id}`);
}

async function getAll(cashRegisterId?: number) {
    const params = cashRegisterId ? `?cashRegisterId=${cashRegisterId}` : '';
    return api.get<any>(`/Invoice/GetAll${params}`);
}

const invoiceApi = {
    saveFromAccount,
    saveFromReservationOrder,
    cancel,
    refund,
    get,
    getAll,
};

export default invoiceApi;
