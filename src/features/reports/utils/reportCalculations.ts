import type { Invoice } from "@/features/invoices/types";
import type { CashMovement } from "@/features/cash-movements/types";
import type {
    SalesReportData,
    ProductsReportData,
    CashFlowReportData,
    OrdersReportData,
    CashCloseReportData,
} from "@/features/reports/types";

export const calculateSalesReport = (invoices: Invoice[], movements: CashMovement[] = []): SalesReportData => {
    const completedInvoices = invoices.filter(
        (inv) => inv.status === "completed" || inv.status === "partially_returned"
    );

    const totalSales = completedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = completedInvoices.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    const totalCashIn = movements
        .filter(m => m.type === 'cash-in')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalOut = movements
        .filter(m => m.type === 'cash-out')
        .reduce((sum, m) => sum + m.amount, 0);

    const theoreticalCash = totalSales + totalCashIn - totalOut;
    const initialCash = totalCashIn;

    const salesByDateMap = new Map<string, { amount: number; orders: number }>();

    completedInvoices.forEach((inv) => {
        const date = new Date(inv.createdAt).toLocaleDateString("es-NI");
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

export const calculateProductsReport = (invoices: Invoice[]): ProductsReportData => {
    const completedInvoices = invoices.filter(inv => inv.status === 'completed' || inv.status === 'partially_returned');

    const productSales = new Map<number, { name: string; quantity: number; total: number }>();

    completedInvoices.forEach(inv => {
        inv.items.forEach(item => {
            const currentProd = productSales.get(item.productId) || { name: item.productName, quantity: 0, total: 0 };
            productSales.set(item.productId, {
                name: item.productName,
                quantity: currentProd.quantity + item.quantity,
                total: currentProd.total + item.subtotal
            });

        });
    });

    const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return {
        topProducts,
        salesByCategory: [],
        lowStockProducts: []
    };
};

export const calculateCashFlowReport = (movements: CashMovement[]): CashFlowReportData => {
    const totalIn = movements
        .filter(m => m.type === 'cash-in')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalOut = movements
        .filter(m => m.type === 'cash-out')
        .reduce((sum, m) => sum + m.amount, 0);

    const movementsByCategory = movements.reduce((acc, m) => {
        const existing = acc.find(item => item.category === m.categoryName && item.type === (m.type === 'cash-in' ? 'in' : 'out'));
        if (existing) {
            existing.amount += m.amount;
        } else {
            acc.push({ category: m.categoryName, amount: m.amount, type: m.type === 'cash-in' ? 'in' : 'out' });
        }
        return acc;
    }, [] as { category: string; amount: number; type: "in" | "out" }[]);

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

export const calculateCashCloseReport = (
    invoices: Invoice[],
    movements: CashMovement[],
    initialAmount: number
): CashCloseReportData => {
    const completedInvoices = invoices.filter(
        (inv) => inv.status === "completed" || inv.status === "partially_returned"
    );
    const returnedInvoices = invoices.filter((inv) => inv.status === "returned");

    const salesTotal = completedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const returnsTotal = returnedInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const cashInTotal = movements
        .filter((m) => m.type === "cash-in")
        .reduce((sum, m) => sum + m.amount, 0);

    const cashOutTotal = movements
        .filter((m) => m.type === "cash-out")
        .reduce((sum, m) => sum + m.amount, 0);

    const expectedTotal = initialAmount + salesTotal + cashInTotal - cashOutTotal - returnsTotal;

    const paymentMap = new Map<string, { amount: number; count: number }>();
    completedInvoices.forEach((inv) => {
        const method = inv.paymentMethod || "Efectivo";
        const current = paymentMap.get(method) || { amount: 0, count: 0 };
        paymentMap.set(method, {
            amount: current.amount + inv.total,
            count: current.count + 1,
        });
    });
    const paymentBreakdown = Array.from(paymentMap.entries())
        .map(([method, data]) => ({ method, ...data }))
        .sort((a, b) => b.amount - a.amount);

    const movementLines: CashCloseReportData["movementLines"] = [];

    completedInvoices.forEach((inv) => {
        movementLines.push({
            time: inv.createdAt,
            type: "venta",
            description: `Factura #${inv.orderNumber}`,
            amount: inv.total,
        });
    });

    returnedInvoices.forEach((inv) => {
        movementLines.push({
            time: inv.createdAt,
            type: "devolucion",
            description: `Devolución Factura #${inv.orderNumber}`,
            amount: inv.total,
        });
    });

    movements.forEach((m) => {
        movementLines.push({
            time: m.createdAt,
            type: m.type === "cash-in" ? "ingreso" : "egreso",
            description: `${m.categoryName}: ${m.description || "Sin descripción"}`,
            amount: m.amount,
        });
    });

    movementLines.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return {
        initialAmount,
        salesTotal,
        cashInTotal,
        cashOutTotal,
        returnsTotal,
        expectedTotal,
        invoiceCount: completedInvoices.length,
        returnsCount: returnedInvoices.length,
        paymentBreakdown,
        movementLines,
    };
};
