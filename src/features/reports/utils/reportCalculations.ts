import type { Invoice } from "@/features/invoices/types";
import type { CashMovement } from "@/features/cash-movements/types";
import type {
    SalesReportData,
    ProductsReportData,
    CashFlowReportData,
    OrdersReportData
} from "@/features/reports/types";

// --- SALES CALCULATIONS ---

export const calculateSalesReport = (invoices: Invoice[], movements: CashMovement[] = []): SalesReportData => {
    const completedInvoices = invoices.filter(
        (inv) => inv.status === "completed" || inv.status === "partially_returned"
    );

    const totalSales = completedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = completedInvoices.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calcular efectivo teórico usando movimientos de caja
    // 1. Obtener Fondo Inicial (movimientos con categoría 'fondo_caja' o similar, tipo 'cash-in')
    // Nota: Dependiendo de cómo se categoricen, ajustamos. Asumamos que hay una categoría estándar o se identifican por ser los primeros del día.
    // Por simplicidad sumamos todo lo que sea 'cash-in' como entradas y 'cash-out' como salidas.

    const cashIn = movements
        .filter(m => m.type === 'cash-in' && m.category === 'fondo_caja')
        .reduce((sum, m) => sum + m.amount, 0);

    const otherIn = movements
        .filter(m => m.type === 'cash-in' && m.category !== 'fondo_caja')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalOut = movements
        .filter(m => m.type === 'cash-out')
        .reduce((sum, m) => sum + m.amount, 0);

    // Efectivo Teórico = (Ventas Efecorivo + Fondo Inicial + Otras Entradas) - Salidas
    // Asumimos que todas las ventas son en efectivo por ahora.
    const theoreticalCash = totalSales + cashIn + otherIn - totalOut;
    const initialCash = cashIn;

    // Agrupar por fecha
    const salesByDateMap = new Map<string, { amount: number; orders: number }>();

    completedInvoices.forEach((inv) => {
        const date = new Date(inv.createdAt).toLocaleDateString("es-NI"); // Formato local simple
        const current = salesByDateMap.get(date) || { amount: 0, orders: 0 };
        salesByDateMap.set(date, {
            amount: current.amount + inv.total,
            orders: current.orders + 1,
        });
    });

    const salesByDate = Array.from(salesByDateMap.entries()).map(([date, data]) => ({
        date,
        amount: data.amount,
        orders: data.orders,
    }));

    // Agrupar por método de pago (si existiera en la factura, por ahora mockeamos "Efectivo")
    // En una implementación real, Invoice debería tener paymentMethod
    const salesByPaymentMethod = [
        { method: "Efectivo", amount: totalSales },
    ];

    return {
        totalSales,
        totalOrders,
        averageTicket,
        theoreticalCash,
        initialCash,
        salesByDate,
        salesByPaymentMethod,
    };
};

// --- PRODUCTS CALCULATIONS ---

export const calculateProductsReport = (invoices: Invoice[]): ProductsReportData => {
    const completedInvoices = invoices.filter(inv => inv.status === 'completed' || inv.status === 'partially_returned');

    const productSales = new Map<number, { name: string; quantity: number; total: number }>();

    completedInvoices.forEach(inv => {
        inv.items.forEach(item => {
            // Productos
            const currentProd = productSales.get(item.productId) || { name: item.productName, quantity: 0, total: 0 };
            productSales.set(item.productId, {
                name: item.productName,
                quantity: currentProd.quantity + item.quantity,
                total: currentProd.total + item.subtotal
            });

            // Categorías (Nota: InvoiceItem no tiene categoría por defecto, habría que buscarla o agregarla al item)
            // Como workaround, asumiremos que no podemos calcular categorías si no están en el item
            // O podemos intentar inferir o dejar vacio por ahora
            // TODO: Agregar category a InvoiceItem para reportes más precisos
        });
    });

    const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5); // Top 5

    return {
        topProducts,
        salesByCategory: [], // Pendiente: requeriría enriquecer InvoiceItem
        lowStockProducts: []
    };
};

// --- CASH FLOW CALCULATIONS ---

export const calculateCashFlowReport = (movements: CashMovement[]): CashFlowReportData => {
    const totalIn = movements
        .filter(m => m.type === 'cash-in')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalOut = movements
        .filter(m => m.type === 'cash-out')
        .reduce((sum, m) => sum + m.amount, 0);

    const movementsByCategory = movements.reduce((acc, m) => {
        const existing = acc.find(item => item.category === m.category && item.type === (m.type === 'cash-in' ? 'in' : 'out'));
        if (existing) {
            existing.amount += m.amount;
        } else {
            acc.push({ category: m.category, amount: m.amount, type: m.type === 'cash-in' ? 'in' : 'out' });
        }
        return acc;
    }, [] as { category: string; amount: number; type: "in" | "out" }[]);

    // Agrupar por fecha
    const cashFlowMap = new Map<string, { in: number; out: number }>();
    movements.forEach(m => {
        const date = new Date(m.createdAt).toLocaleDateString("es-NI");
        const current = cashFlowMap.get(date) || { in: 0, out: 0 };
        if (m.type === 'cash-in') current.in += m.amount;
        else current.out += m.amount;
        cashFlowMap.set(date, current);
    });

    const cashFlowByDate = Array.from(cashFlowMap.entries()).map(([date, data]) => ({
        date,
        in: data.in,
        out: data.out
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
        totalIn,
        totalOut,
        netCash: totalIn - totalOut,
        movementsByType: [
            { type: 'Entradas', amount: totalIn },
            { type: 'Salidas', amount: totalOut }
        ],
        movementsByCategory,
        cashFlowByDate
    };
};

// --- ORDERS CALCULATIONS ---

export const calculateOrdersReport = (invoices: Invoice[]): OrdersReportData => {
    const totalOrders = invoices.length;
    const completedOrders = invoices.filter(i => i.status === 'completed').length;
    const returnedOrders = invoices.filter(i => i.status === 'returned').length;

    let totalItems = 0;
    const peakHoursMap = new Map<number, { orders: number; amount: number }>();

    invoices.forEach(inv => {
        totalItems += inv.items.reduce((sum, item) => sum + item.quantity, 0);

        const hour = new Date(inv.createdAt).getHours();
        const current = peakHoursMap.get(hour) || { orders: 0, amount: 0 };
        peakHoursMap.set(hour, {
            orders: current.orders + 1,
            amount: current.amount + inv.total
        });
    });

    const peakHours = Array.from(peakHoursMap.entries())
        .map(([hour, data]) => ({ hour, ...data }))
        .sort((a, b) => a.hour - b.hour);

    return {
        totalOrders,
        completedOrders,
        returnedOrders,
        peakHours,
        averageItemsPerOrder: totalOrders > 0 ? totalItems / totalOrders : 0
    };
};
