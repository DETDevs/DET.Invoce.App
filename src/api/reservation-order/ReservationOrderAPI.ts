import api from '../api';
import type { TReservationOrder } from './types';

async function get(orderNumber?: string) {
    const params = orderNumber ? `?OrderNumber=${orderNumber}` : '';
    return api.get<any>(`/ReservationOrder/Get${params}`);
}

async function save(order: TReservationOrder) {
    return api.post<any>('/ReservationOrder/Save', order);
}

const reservationOrderApi = {
    get,
    save,
};

export default reservationOrderApi;
