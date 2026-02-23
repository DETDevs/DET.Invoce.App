export type UserRole = 'admin' | 'cajero' | 'mesero';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    role: UserRole;
}

export interface LoginRequest {
    password: string;
}

export interface LoginResponse {
    user: AuthUser;
    token?: string;
}

export interface UserManagement {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    image: string;
}

export interface UserFilterState {
    role: string;
    status: string;
}

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

export interface ProductOption {
    id: number;
    name: string;
    price: number;
}

export interface Category {
    name: string;
    subcategories: string[];
}

export interface ProductFormData {
    name: string;
    price: string;
    stock: string;
    minStock: string;
    category: string;
}

export interface ProductFilterState {
    category: string;
    minPrice: string;
    maxPrice: string;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    category: string;
    subcategory: string;
    image: string;
    quantity: number;
}

export type PaymentStatus = 'Pendiente' | 'Abonado' | 'Pagado';
export type OrderStatus = 'pending' | 'production' | 'ready' | 'delivered';

export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    description?: string;
}

export interface Order {
    id: string;
    customer: string;
    items: string[];
    total: number;
    deposit: number;
    paymentStatus: PaymentStatus;
    dueDate: string;
    status: OrderStatus;
}

export interface CreateOrderFormData {
    customerName: string;
    customerId?: string;
    items: OrderItem[];
    deposit?: number;
    comments?: string;
    status: PaymentStatus;
    dueDate: string;
}

export type TakeoutStatus = 'active' | 'completed' | 'cancelled';

export interface TakeoutItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    addedAt: string;
}

export interface TakeoutOrder {
    id: string;
    tableNumber: number;
    cuentaNumber: number;
    items: TakeoutItem[];
    createdAt: string;
    updatedAt: string;
    status: TakeoutStatus;
    createdBy: string;
}

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

export type InvoiceStatus = 'completed' | 'returned' | 'partially_returned';

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

export type MovementType = 'cash-in' | 'cash-out';

export interface CashMovement {
    id: string;
    type: MovementType;
    cashMovementTypeId: number;
    categoryName: string;
    amount: number;
    description: string;
    createdBy: string;
    createdAt: string;
    notes?: string;
}

export interface CashSummaryData {
    totalCashIn: number;
    totalCashOut: number;
    balance: number;
    movementsCount: number;
}

export type ReportType = 'sales' | 'products' | 'cash' | 'orders';
export type DateRangeType = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface SalesReportData {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    theoreticalCash: number;
    initialCash: number;
    salesByDate: { date: string; amount: number; orders: number }[];
    salesByPaymentMethod: { method: string; amount: number }[];
}

export interface ProductsReportData {
    topProducts: {
        id: number;
        name: string;
        quantity: number;
        total: number;
    }[];
    salesByCategory: {
        category: string;
        amount: number;
        percentage: number;
    }[];
    lowStockProducts: {
        name: string;
        stock: number;
    }[];
}

export interface CashFlowReportData {
    totalIn: number;
    totalOut: number;
    netCash: number;
    movementsByType: { type: string; amount: number }[];
    movementsByCategory: { category: string; amount: number; type: 'in' | 'out' }[];
    cashFlowByDate: { date: string; in: number; out: number }[];
}

export interface OrdersReportData {
    totalOrders: number;
    completedOrders: number;
    returnedOrders: number;
    peakHours: { hour: number; orders: number; amount: number }[];
    averageItemsPerOrder: number;
}

export interface Settings {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    taxId: string;
    initialCashBox: number;
    mainCurrency: 'NIO' | 'USD';
    dollarExchangeRate: number;
    tableCount: number;
}

export interface CashBoxSession {
    initialAmount: number;
    openedAt: string;
    isOpen: boolean;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    message?: string;
    success: boolean;
}
