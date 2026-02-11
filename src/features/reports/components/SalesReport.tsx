import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, TrendingUp, CreditCard } from "lucide-react";
import { KPICard } from "./KPICard";
import type { SalesReportData } from "@/features/reports/types";

interface SalesReportProps {
  data: SalesReportData;
}

export const SalesReport = ({ data }: SalesReportProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas Totales"
          value={formatCurrency(data.totalSales)}
          icon={DollarSign}
          color="brown"
        />
        <KPICard
          title="Órdenes"
          value={data.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <KPICard
          title="Ticket Promedio"
          value={formatCurrency(data.averageTicket)}
          icon={CreditCard}
          color="purple"
        />
        <KPICard
          title="Efectivo en Caja (Est.)"
          value={formatCurrency(data.theoreticalCash)}
          subValue={`Fondo: ${formatCurrency(data.initialCash)}`}
          icon={TrendingUp} // Podríamos cambiar el ícono a Wallet si estuviera importado, por ahora dejamos TrendingUp o usamos DollarSign
          color="green"
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-6">
          Tendencia de Ventas
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.salesByDate}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8BC6E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E8BC6E" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `C$${value}`}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(value || 0),
                  "Ventas",
                ]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#E8BC6E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
