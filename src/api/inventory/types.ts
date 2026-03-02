export type TInventorySave = {
    inventoryId: number;
    productCode: string;
    quantityInStock?: number;
    minimumStock: number;
};

export type TInventoryOutput = {
    productCode: string;
    quantityInStock: number;
};

export type TValidateAvailability = {
    code: string;
    quantity: number;
};
