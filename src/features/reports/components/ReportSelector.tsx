import {
  TrendingUp,
  Package,
  DollarSign,
  ClipboardList,
  Landmark,
  Calendar,
} from "lucide-react";
import type { ReportType } from "@/features/reports/types";

interface ReportSelectorProps {
  activeReport: ReportType;
  onSelect: (report: ReportType) => void;
}

export const ReportSelector = ({
  activeReport,
  onSelect,
}: ReportSelectorProps) => {
  const reports = [
    { id: "sales", label: "Ventas", icon: TrendingUp },
    { id: "products", label: "Productos", icon: Package },
    { id: "cash", label: "Movimientos", icon: DollarSign },
    { id: "orders", label: "Órdenes", icon: ClipboardList },
    { id: "reservations", label: "Pedidos", icon: Calendar },
    { id: "cashClose", label: "Cierre de Caja", icon: Landmark },
  ];

  return (
    <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
      {reports.map((report) => (
        <button
          key={report.id}
          onClick={() => onSelect(report.id as ReportType)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeReport === report.id
              ? "bg-white text-[#593D31] shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          }`}
        >
          <report.icon size={18} className="mr-2" />
          {report.label}
        </button>
      ))}
    </div>
  );
};
