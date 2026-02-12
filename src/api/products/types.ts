// Types para los endpoints de productos
export interface Product {
    productId: number;
    code: string;
    categoryCode: string;
    categoryName: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    subCategoryId?: number;
    subCategoryName?: string;
    trackInventory: boolean;
    unitId: number;
    unitName?: string;
    divideQuantityBy?: number;
    isActive: boolean;
    quantity: number;
    stockMinimum: number;
    stockStatus: 'CRITICAL' | 'MEDIUM' | 'NORMAL';
}

export interface ProductsResponse {
    data: Product[];
    message?: string;
    success: boolean;
}

export interface ProductResponse {
    data: Product;
    message?: string;
    success: boolean;
}
