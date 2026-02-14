import { Printer, Download } from "lucide-react";
import toast from "react-hot-toast";
import { ReportSelector } from "@/features/reports/components/ReportSelector";
import { DateRangePicker } from "@/features/reports/components/DateRangePicker";
import { SalesReport } from "@/features/reports/components/SalesReport";
import { ProductsReport } from "@/features/reports/components/ProductsReport";
import { CashFlowReport } from "@/features/reports/components/CashFlowReport";
import { OrdersReport } from "@/features/reports/components/OrdersReport";
import { useReports } from "@/features/reports/hooks/useReports";

export const ReportsPage = () => {
  const {
    activeReport,
    setActiveReport,
    dateRange,
    setDateRange,
    salesReport,
    productsReport,
    cashFlowReport,
    ordersReport,
  } = useReports();

  const handleExport = (type: string) => {
    toast.success(`Exportando reporte de ${activeReport} en ${type}...`);
  };

  const renderActiveReport = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReport data={salesReport} />;
      case "products":
        return <ProductsReport data={productsReport} />;
      case "cash":
        return <CashFlowReport data={cashFlowReport} />;
      case "orders":
        return <OrdersReport data={ordersReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#FDFBF7] min-h-screen w-full max-w-full overflow-x-hidden pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
            Centro de Reportes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis financiero y operativo
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={(range: string) => setDateRange(range as any)}
          />

          <button
            onClick={() => handleExport("PDF")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            title="Imprimir PDF"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="p-2 bg-[#593D31] text-white rounded-lg hover:bg-[#4a332a] flex items-center justify-center"
            title="Exportar CSV"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <ReportSelector
          activeReport={activeReport}
          onSelect={setActiveReport}
        />
      </div>

      <div className="min-h-[400px]">{renderActiveReport()}</div>
    </div>
  );
};
