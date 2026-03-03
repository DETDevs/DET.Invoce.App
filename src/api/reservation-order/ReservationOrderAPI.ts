import api from '../api';
import type { TReservationOrder } from './types';

async function get(orderNumber?: string) {
    const params = orderNumber ? `?OrderNumber=${orderNumber}` : '';
    return api.get<any>(`/ReservationOrder/Get${params}`);
}

async function save(order: TReservationOrder) {
    return api.post<any>('/ReservationOrder/Save', order);
}

async function updateStatus(orderId: number, statusId: number) {
    return api.post<any>(`/ReservationOrder/UpdateStatus?orderId=${orderId}&statusId=${statusId}`, {});
}

async function getAll(cashRegisterId?: number) {
    const params = cashRegisterId ? `?cashRegisterId=${cashRegisterId}` : '';
    return api.get<any[]>(`/ReservationOrder/GetAll${params}`);
}

async function cancell(reservationOrderId: number, createdBy: string, reason?: string) {
    return api.post<any>('/ReservationOrder/Cancell', { reservationOrderId, createdBy, reason });
}

const reservationOrderApi = {
    get,
    save,
    updateStatus,
    getAll,
    cancell,
};

export default reservationOrderApi;
