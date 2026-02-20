export type TOrderDetail = {
    productCode: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    notes?: string;
};

export type TOrderSave = {
    orderId: number;
    createdBy: string;
    orderType: boolean;
    tableId?: number;
    details: TOrderDetail[];
};

export type TOrderCreate = {
    createdBy: string;
};

export type TSplitItem = {
    orderDetailId: number;
    quantity: number;
};

export type TAccountSplit = {
    fromAccountId: number;
    creteBy: string;
    orderAccountSplitTypes: TSplitItem[];
};
