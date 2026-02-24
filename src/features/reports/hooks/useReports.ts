import { useState, useMemo } from "react";
import type { ReportType, DateRangeType } from "@/features/reports/types";
import { loadInvoices } from "@/features/invoices/utils/invoiceStorage";
import { useCashMovements } from "@/features/cash-movements/hooks/useCashMovements";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";
import {
    calculateSalesReport,
    calculateProductsReport,
    calculateCashFlowReport,
    calculateOrdersReport,
    calculateCashCloseReport,
} from "@/features/reports/utils/reportCalculations";

export const useReports = () => {
    const [activeReport, setActiveReport] = useState<ReportType>("sales");
    const [dateRange, setDateRange] = useState<DateRangeType>("week");
    const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);

    const allInvoices = useMemo(() => loadInvoices(), []);
    const { allMovements } = useCashMovements();
    const { session } = useCashBox();

    const filterByDate = <T extends { createdAt: string }>(items: T[]) => {
        const now = new Date();
        let startDate = new Date();

        now.setHours(23, 59, 59, 999);

        switch (dateRange) {
            case "today":
                startDate.setHours(0, 0, 0, 0);
                break;
            case "week":
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "month":
                startDate.setMonth(now.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "year":
                startDate.setFullYear(now.getFullYear() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "custom":
                if (customRange) {
                    startDate = customRange.start;
                    now.setTime(customRange.end.getTime());
                }
                break;
        }

        return items.filter(item => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= now;
        });
    };

    const filteredInvoices = useMemo(() => filterByDate(allInvoices), [allInvoices, dateRange, customRange]);
    const filteredMovements = useMemo(() => filterByDate(allMovements), [allMovements, dateRange, customRange]);

    const salesReport = useMemo(() => calculateSalesReport(filteredInvoices, filteredMovements), [filteredInvoices, filteredMovements]);
    const productsReport = useMemo(() => calculateProductsReport(filteredInvoices), [filteredInvoices]);
    const cashFlowReport = useMemo(() => calculateCashFlowReport(filteredMovements), [filteredMovements]);
    const ordersReport = useMemo(() => calculateOrdersReport(filteredInvoices), [filteredInvoices]);
    const cashCloseReport = useMemo(
        () => calculateCashCloseReport(filteredInvoices, filteredMovements, session?.initialAmount ?? 0),
        [filteredInvoices, filteredMovements, session]
    );

    return {
        activeReport,
        setActiveReport,
        dateRange,
        setDateRange,
        setCustomRange,
        salesReport,
        productsReport,
        cashFlowReport,
        ordersReport,
        cashCloseReport,
        hasData: allInvoices.length > 0 || allMovements.length > 0
    };
};
