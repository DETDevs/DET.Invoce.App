import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { KPICard } from "./KPICard";
import type { CashFlowReportData } from "@/features/reports/types";

interface CashFlowReportProps {
  data: CashFlowReportData;
}

export const CashFlowReport = ({ data }: CashFlowReportProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Entradas Totales"
          value={formatCurrency(data.totalIn)}
          icon={ArrowUpRight}
          color="green"
          tooltip="Suma de todos los movimientos de entrada de efectivo: fondo de caja, aportes, devoluciones, etc."
        />
        <KPICard
          title="Salidas Totales"
          value={formatCurrency(data.totalOut)}
          icon={ArrowDownRight}
          color="red"
          tooltip="Suma de todos los movimientos de salida de efectivo: pagos a proveedores, gastos, retiros, etc."
        />
        <KPICard
          title="Balance Neto"
          value={formatCurrency(data.netCash)}
          icon={Wallet}
          color={data.netCash >= 0 ? "blue" : "red"}
          tooltip="Diferencia entre entradas y salidas. Indica el flujo neto de efectivo en el período."
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-6">
          Movimientos Diarios
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.cashFlowByDate}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(value || 0),
                  "Monto",
                ]}
              />
              <ReferenceLine y={0} stroke="#9CA3AF" />
              <Bar
                dataKey="in"
                name="Entradas"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                barSize={20}
                minPointSize={3}
              />
              <Bar
                dataKey="out"
                name="Salidas"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                barSize={20}
                minPointSize={3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-green-50/30">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
              <ArrowUpRight size={18} /> Entradas por Categoría
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {data.movementsByCategory
              .filter((m) => m.type === "in")
              .map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {item.category.replace("_", " ")}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            {data.movementsByCategory.filter((m) => m.type === "in").length ===
              0 && (
              <p className="text-center text-gray-400 py-4 text-sm">
                No hay entradas registradas
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-red-50/30">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <ArrowDownRight size={18} /> Salidas por Categoría
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {data.movementsByCategory
              .filter((m) => m.type === "out")
              .map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {item.category.replace("_", " ")}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            {data.movementsByCategory.filter((m) => m.type === "out").length ===
              0 && (
              <p className="text-center text-gray-400 py-4 text-sm">
                No hay salidas registradas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
