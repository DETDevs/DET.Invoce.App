export type TProduct = {
    productId: number;
    code: string;
    categoryCode: string;
    categoryName?: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    subCategoryId?: number;
    subCategoryName?: string;
    trackInventory: boolean;
    unitId: number | string;
    unitName?: string;
    divideQuantityBy?: number;
    isActive: boolean;
    quantity: number;
    stockMinimum: number;
    stockStatus?: string;
};

export type TSaveProduct = {
    productId: number;
    code: string;
    categoryCode: string;
    subCategoryId?: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    trackInventory: boolean;
    unitId: number | string;
    divideQuantityBy?: number;
    isActive: boolean;
    quantity: number;
    stockMinimum: number;
};
