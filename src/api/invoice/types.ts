export type TSaveFromAccount = {
    orderAccountId: number;
    paymentmethod: string;
};

export type TCancelInvoice = {
    invoiceId: number;
    cancelledBy: string;
};

export type TRefundInvoice = {
    invoiceId: number;
    cancelledBy: string;
};
