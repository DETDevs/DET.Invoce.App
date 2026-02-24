import type { CashSummaryData } from "@/features/cash-movements/types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  summary: CashSummaryData;
}

const fmt = (n: number) =>
  n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const CashSummary = ({ summary }: Props) => {
  const isPositiveBalance = summary.balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Cash In</span>
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-green-600">
          C$ {fmt(summary.totalCashIn)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Ingresos de efectivo</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Cash Out</span>
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-600">
          C$ {fmt(summary.totalCashOut)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Salidas de efectivo</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Balance</span>
          <div
            className={`p-2 rounded-lg ${isPositiveBalance ? "bg-blue-100" : "bg-red-100"}`}
          >
            <Wallet
              size={20}
              className={isPositiveBalance ? "text-blue-600" : "text-red-600"}
            />
          </div>
        </div>
        <p
          className={`text-2xl font-bold ${isPositiveBalance ? "text-blue-600" : "text-red-600"}`}
        >
          C$ {fmt(summary.balance)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Diferencia neta</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Movimientos</span>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Wallet size={20} className="text-gray-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {summary.movementsCount}
        </p>
        <p className="text-xs text-gray-500 mt-1">Total registrados</p>
      </div>
    </div>
  );
};
