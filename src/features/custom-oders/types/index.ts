export type PaymentStatus = 'Pendiente' | 'Abonado' | 'Pagado';
export type OrderStatus = 'pending' | 'production' | 'ready' | 'delivered';

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
  status: PaymentStatus;
}

export type ProductOption = { id: number; name: string; price: number };

export interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  deposit: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  dueTime: string;
  status: OrderStatus;
}