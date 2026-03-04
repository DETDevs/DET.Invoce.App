import { useState, useMemo, useEffect, useCallback } from "react";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/features/invoices/types";
import invoiceApi from "@/api/invoice/InvoiceAPI";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";
import toast from "react-hot-toast";

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
        productName: d.productName || d.productCode || "Producto",
        quantity: d.quantity ?? 1,
        unitPrice: d.unitPrice ?? 0,
        subtotal: (d.quantity ?? 1) * (d.unitPrice ?? 0),
    }));

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const tax = 0;
    const total = raw.total ?? subtotal;

    let mappedStatus: InvoiceStatus = "completed";
    if (raw.status === "REFUND" || raw.status === "returned") {
        mappedStatus = "returned";
    }

    return {
        id: String(raw.invoiceId ?? raw.invoiceNumber ?? ""),
        orderNumber: raw.invoiceNumber ?? raw.invoiceId ?? "",
        customerName: raw.customer ?? "",
        createdAt: raw.invoiceDate ?? raw.createdAt ?? new Date().toISOString(),
        createdBy: raw.createdBy ?? "",
        paymentMethod: raw.paymentMethod ?? "",
        amountPaid: raw.amountPaid ?? 0,
        items,
        subtotal,
        tax,
        total,
        status: mappedStatus,
        returns: [],
    };
}

export const useInvoices = () => {
    const { user } = useAuthStore();
    const { session } = useCashBox();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
    const [dateFilter, setDateFilter] = useState<DateFilterPreset>("today");
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cashId = dateFilter === "today" ? session?.cashRegisterId : undefined;
            const data = await invoiceApi.getAll(cashId);
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
    }, [dateFilter, session?.cashRegisterId]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const addReturn = async (
        invoiceId: string,
        returnData: { reason: string; notes?: string }
    ) => {
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (!invoice) return;

        try {
            await invoiceApi.refund({
                invoiceId: Number(invoiceId),
                cancelledBy: user?.name ?? "Sistema",
            });
            await fetchInvoices();
        } catch (err) {
            console.error("[useInvoices] Error al hacer devolución:", err);
            toast.error("No se pudo procesar la devolución. Intente de nuevo.");
        }
    };

    const filteredInvoices = useMemo(() => {
        const { from, to } = getDateRange(dateFilter, customDateFrom, customDateTo);

        return invoices.filter((invoice) => {
            const matchesSearch =
                invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(invoice.orderNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());

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
