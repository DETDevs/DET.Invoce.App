export interface InvoiceItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface InvoiceReturn {
    id: string;
    returnedAt: string;
    returnedBy: string;
    reason: string;
    notes?: string;
    items: InvoiceItem[];
    totalReturned: number;
}

export type InvoiceStatus = "completed" | "returned";

export interface Invoice {
    id: string;
    orderNumber: string | number;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    customerName?: string;
    createdAt: string;
    createdBy: string;
    returns?: InvoiceReturn[];
}
