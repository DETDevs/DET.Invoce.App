import { useState, useMemo, useEffect, useCallback } from "react";
import type { Invoice, InvoiceItem, InvoiceStatus, InvoiceReturn } from "@/features/invoices/types";
import invoiceApi from "@/api/invoice/InvoiceAPI";

export type DateFilterPreset = "all" | "today" | "week" | "month" | "custom";

const getDateRange = (
    preset: DateFilterPreset,
    customFrom?: string,
    customTo?: string
): { from: Date | null; to: Date | null } => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case "today":
            return { from: startOfDay, to: now };
        case "week": {
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            return { from: startOfWeek, to: now };
        }
        case "month": {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return { from: startOfMonth, to: now };
        }
        case "custom": {
            const from = customFrom ? new Date(customFrom + "T00:00:00") : null;
            const to = customTo ? new Date(customTo + "T23:59:59") : null;
            return { from, to };
        }
        default:
            return { from: null, to: null };
    }
};

function mapBackendInvoice(raw: any): Invoice {
    const details: any[] = raw.details ?? [];
    const items: InvoiceItem[] = details.map((d: any) => ({
        productId: d.productId ?? 0,
        productName: d.productCode ?? d.productName ?? "Producto",
        quantity: d.quantity ?? 1,
        unitPrice: d.unitPrice ?? 0,
        subtotal: (d.quantity ?? 1) * (d.unitPrice ?? 0),
    }));

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const tax = subtotal * 0.15;
    const total = raw.total ?? subtotal + tax;

    return {
        id: String(raw.invoiceId ?? raw.invoiceNumber ?? ""),
        orderNumber: raw.invoiceNumber ?? raw.invoiceId ?? "",
        customerName: raw.customer ?? raw.createdBy ?? "",
        createdAt: raw.invoiceDate ?? raw.createdAt ?? new Date().toISOString(),
        createdBy: raw.createdBy ?? "",
        items,
        subtotal,
        tax,
        total,
        status: "completed" as InvoiceStatus,
        returns: [],
    };
}

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
    const [dateFilter, setDateFilter] = useState<DateFilterPreset>("all");
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoiceApi.getAll();
            const mapped = (Array.isArray(data) ? data : [])
                .map(mapBackendInvoice)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInvoices(mapped);
        } catch (err) {
            console.error("[useInvoices] Error al cargar facturas:", err);
            setError("No se pudieron cargar las facturas. Verifique la conexión.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const addReturn = (
        invoiceId: string,
        returnData: { reason: string; notes?: string }
    ) => {
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (!invoice) return;

        const totalReturned = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);

        const newReturn: InvoiceReturn = {
            id: `RET-${Date.now()}`,
            returnedAt: new Date().toISOString(),
            returnedBy: "Usuario Actual",
            reason: returnData.reason,
            notes: returnData.notes,
            items: invoice.items,
            totalReturned,
        };

        const updatedInvoice: Invoice = {
            ...invoice,
            status: "returned" as InvoiceStatus,
            returns: [...(invoice.returns || []), newReturn],
        };

        setInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? updatedInvoice : inv));
    };

    const filteredInvoices = useMemo(() => {
        const { from, to } = getDateRange(dateFilter, customDateFrom, customDateTo);

        return invoices.filter((invoice) => {
            const matchesSearch =
                invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(invoice.orderNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;

            let matchesDate = true;
            if (from || to) {
                const invoiceDate = new Date(invoice.createdAt);
                if (from && invoiceDate < from) matchesDate = false;
                if (to && invoiceDate > to) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, searchQuery, filterStatus, dateFilter, customDateFrom, customDateTo]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const summary = useMemo(() => {
        const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalReturned = filteredInvoices.reduce((sum, inv) => {
            return sum + (inv.returns?.reduce((r, ret) => r + ret.totalReturned, 0) ?? 0);
        }, 0);
        return {
            totalInvoices: filteredInvoices.length,
            totalSales,
            totalReturned,
            netBalance: totalSales - totalReturned,
        };
    }, [filteredInvoices]);

    const handleFilterChange = (type: "search" | "status", value: string | InvoiceStatus) => {
        setCurrentPage(1);
        if (type === "search") setSearchQuery(value as string);
        else setFilterStatus(value as InvoiceStatus | "all");
    };

    return {
        invoices: paginatedInvoices,
        allInvoices: invoices,
        isLoading,
        error,
        refetch: fetchInvoices,
        filteredCount: filteredInvoices.length,
        summary,
        searchQuery,
        setSearchQuery: (q: string) => handleFilterChange("search", q),
        filterStatus,
        setFilterStatus: (s: InvoiceStatus | "all") => handleFilterChange("status", s),
        dateFilter,
        setDateFilter: (preset: DateFilterPreset) => {
            setCurrentPage(1);
            setDateFilter(preset);
            if (preset !== "custom") { setCustomDateFrom(""); setCustomDateTo(""); }
        },
        customDateFrom,
        setCustomDateFrom: (val: string) => { setCurrentPage(1); setCustomDateFrom(val); },
        customDateTo,
        setCustomDateTo: (val: string) => { setCurrentPage(1); setCustomDateTo(val); },
        addReturn,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
    };
};
