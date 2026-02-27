import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ReportSelector } from "@/features/reports/components/ReportSelector";
import { DateRangePicker } from "@/features/reports/components/DateRangePicker";
import { SalesReport } from "@/features/reports/components/SalesReport";
import { ProductsReport } from "@/features/reports/components/ProductsReport";
import { CashFlowReport } from "@/features/reports/components/CashFlowReport";
import { OrdersReport } from "@/features/reports/components/OrdersReport";
import { CashCloseReport } from "@/features/reports/components/CashCloseReport";
import { useReports } from "@/features/reports/hooks/useReports";
import { generateReportPdf } from "@/features/reports/utils/generateReportPdf";

export const ReportsPage = () => {
  const {
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
    isLoading,
  } = useReports();

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (isExporting || isLoading) return;
    setIsExporting(true);
    try {
      await generateReportPdf("report-content", activeReport);
    } finally {
      setIsExporting(false);
    }
  };

  const renderActiveReport = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={36} className="text-[#E8BC6E] animate-spin" />
          <p className="text-gray-500 text-sm">Cargando reporte...</p>
        </div>
      );
    }

    switch (activeReport) {
      case "sales":
        return <SalesReport data={salesReport} />;
      case "products":
        return <ProductsReport data={productsReport} />;
      case "cash":
        return <CashFlowReport data={cashFlowReport} />;
      case "orders":
        return <OrdersReport data={ordersReport} />;
      case "cashClose":
        return <CashCloseReport data={cashCloseReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#FDFBF7] min-h-screen w-full max-w-full overflow-x-hidden pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
            Centro de Reportes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis financiero y operativo
          </p>
        </div>

        <div className="flex gap-2 items-center shrink-0">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={(range: string) => setDateRange(range as any)}
            onCustomRange={(start, end) => setCustomRange({ start, end })}
          />

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting || isLoading}
            className="p-2 bg-[#593D31] text-white rounded-lg hover:bg-[#4a332a] flex items-center justify-center transition-colors disabled:opacity-60"
            title="Descargar PDF"
          >
            {isExporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <ReportSelector
          activeReport={activeReport}
          onSelect={setActiveReport}
        />
      </div>

      <div id="report-content" className="min-h-[400px]">
        {renderActiveReport()}
      </div>
    </div>
  );
};
