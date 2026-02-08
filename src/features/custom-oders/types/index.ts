export type OrderStatus = 'Pendiente' | 'Pagado';

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface CreateOrderFormData {
  customerName: string;
  customerId?: string;
  items: OrderItem[];
  deposit?: number;
  comments?: string;
  status: OrderStatus;
}

export type ProductOption = { id: number; name: string; price: number };
