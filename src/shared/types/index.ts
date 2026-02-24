export type PaymentStatus = 'Pendiente' | 'Abonado' | 'Pagado';
export type OrderStatus = 'pending' | 'production' | 'ready' | 'delivered';

export interface OrderItem {
    productId: number;
    productCode: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
}

export type ProductOption = { id: number; code: string; name: string; price: number };

export interface Order {
    id: string;
    reservationOrderId?: number;
    customer: string;
    identificationCustomer?: string;
    items: string[];
    rawItems?: OrderItem[];
    total: number;
    deposit: number;
    paymentStatus: PaymentStatus;
    dueDate: string;
    status: OrderStatus;
}

export type TakeoutStatus = 'active' | 'completed' | 'cancelled';

export interface TakeoutItem {
    productId: number;
    productCode: string;
    name: string;
    price: number;
    quantity: number;
    addedAt: string;
}

export interface TakeoutOrder {
    id: string;
    tableNumber: number;
    cuentaNumber: number;
    items: TakeoutItem[];
    createdAt: string;
    updatedAt: string;
    status: TakeoutStatus;
    createdBy: string;
    backendOrderId?: number;
    orderNumber?: string;
}
