import { useState, useMemo, useEffect } from "react";
import type { Invoice, InvoiceStatus, InvoiceReturn } from "@/features/invoices/types";
import { loadInvoices, saveInvoices } from "@/features/invoices/utils/invoiceStorage";

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

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
    const [dateFilter, setDateFilter] = useState<DateFilterPreset>("all");
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const loaded = loadInvoices();
        setInvoices(loaded);
    }, []);

    const addReturn = (
        invoiceId: string,
        returnData: {
            reason: string;
            notes?: string;
        }
    ) => {
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (!invoice) return;

        const totalReturned = invoice.items.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

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

        const updatedInvoices = invoices.map((inv) =>
            inv.id === invoiceId ? updatedInvoice : inv
        );

        setInvoices(updatedInvoices);
        saveInvoices(updatedInvoices);
    };

    const filteredInvoices = useMemo(() => {
        const { from, to } = getDateRange(dateFilter, customDateFrom, customDateTo);

        return invoices.filter((invoice) => {
            const matchesSearch =
                invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                filterStatus === "all" || invoice.status === filterStatus;

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
        const endIndex = startIndex + itemsPerPage;
        return filteredInvoices.slice(startIndex, endIndex);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const summary = useMemo(() => {
        const source = filteredInvoices;
        const totalSales = source.reduce((sum, inv) => sum + inv.total, 0);
        const totalReturned = source.reduce((sum, inv) => {
            const returnedAmount = inv.returns?.reduce(
                (retSum, ret) => retSum + ret.totalReturned,
                0
            ) || 0;
            return sum + returnedAmount;
        }, 0);

        return {
            totalInvoices: source.length,
            totalSales,
            totalReturned,
            netBalance: totalSales - totalReturned,
        };
    }, [filteredInvoices]);

    const handleFilterChange = (
        type: "search" | "status",
        value: string | InvoiceStatus
    ) => {
        setCurrentPage(1);
        if (type === "search") setSearchQuery(value as string);
        else if (type === "status") setFilterStatus(value as InvoiceStatus | "all");
    };

    return {
        invoices: paginatedInvoices,
        allInvoices: invoices,
        filteredCount: filteredInvoices.length,
        summary,
        searchQuery,
        setSearchQuery: (query: string) => handleFilterChange("search", query),
        filterStatus,
        setFilterStatus: (status: InvoiceStatus | "all") =>
            handleFilterChange("status", status),
        dateFilter,
        setDateFilter: (preset: DateFilterPreset) => {
            setCurrentPage(1);
            setDateFilter(preset);
            if (preset !== "custom") {
                setCustomDateFrom("");
                setCustomDateTo("");
            }
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
