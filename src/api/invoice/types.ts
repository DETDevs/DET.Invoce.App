export type TSaveFromAccount = {
    orderAccountId: number;
    paymentmethod: string;
};

export type TCancelInvoice = {
    invoiceId: number;
    cancelledBy: string;
};
