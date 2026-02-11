import type { OrderItem, PaymentStatus } from "@/shared/types";

export interface CreateOrderFormData {
  customerName: string;
  customerId?: string;
  items: OrderItem[];
  deposit?: number;
  comments?: string;
  status: PaymentStatus;
  dueDate: string;
}
