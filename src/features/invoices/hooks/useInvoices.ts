import { useState, useMemo, useEffect } from "react";
import type { Invoice, InvoiceStatus, InvoiceReturn } from "@/features/invoices/types";
import { loadInvoices, saveInvoices } from "@/features/invoices/utils/invoiceStorage";

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
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
        return invoices.filter((invoice) => {
            const matchesSearch =
                invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                filterStatus === "all" || invoice.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, filterStatus]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredInvoices.slice(startIndex, endIndex);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const summary = useMemo(() => {
        const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalReturned = invoices.reduce((sum, inv) => {
            const returnedAmount = inv.returns?.reduce(
                (retSum, ret) => retSum + ret.totalReturned,
                0
            ) || 0;
            return sum + returnedAmount;
        }, 0);

        return {
            totalInvoices: invoices.length,
            totalSales,
            totalReturned,
            netBalance: totalSales - totalReturned,
        };
    }, [invoices]);

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
        addReturn,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
    };
};
