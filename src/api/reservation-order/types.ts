export type TReservationOrder = {
    reservationOrderId?: number;
    orderNumber?: string | null;
    customer?: string | null;
    identificationCustomer?: string | null;
    deliveryDate?: string | null;
    orderDate: string;
    status?: string | null;
    deposit: number;
    total: number;
    notes?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    details?: TReservationOrderDetail[] | null;
};

export type TReservationOrderDetail = {
    productCode?: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    notes?: string | null;
};
