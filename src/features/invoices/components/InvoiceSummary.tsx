import { TrendingUp, TrendingDown, Receipt, DollarSign } from "lucide-react";

interface InvoiceSummaryProps {
  summary: {
    totalInvoices: number;
    totalSales: number;
    totalReturned: number;
    netBalance: number;
  };
}

export const InvoiceSummary = ({ summary }: InvoiceSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Facturas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {summary.totalInvoices}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Receipt size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Vendido</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(summary.totalSales)}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Total Devoluciones
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(summary.totalReturned)}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <TrendingDown size={24} className="text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Balance Neto</p>
            <p className="text-2xl font-bold text-[#593D31] mt-1">
              {formatCurrency(summary.netBalance)}
            </p>
          </div>
          <div className="p-3 bg-[#E8BC6E]/20 rounded-lg">
            <DollarSign size={24} className="text-[#593D31]" />
          </div>
        </div>
      </div>
    </div>
  );
};
