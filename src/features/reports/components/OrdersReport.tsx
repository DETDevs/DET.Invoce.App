import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { KPICard } from "./KPICard";
import type { OrdersReportData } from "@/features/reports/types";

interface OrdersReportProps {
  data: OrdersReportData;
}

export const OrdersReport = ({ data }: OrdersReportProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Órdenes"
          value={data.totalOrders}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Completadas"
          value={data.completedOrders}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Canceladas"
          value={data.cancelledOrders}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-6">
          Actividad por Hora (Horas Pico)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.peakHours}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(hour) => `${hour}:00`}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelFormatter={(hour) => `Hora: ${hour}:00 - ${hour + 1}:00`}
                formatter={(value, name) => [
                  value,
                  name === "orders" ? "Órdenes" : "Total",
                ]}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#593D31"
                strokeWidth={3}
                dot={{ fill: "#593D31", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Muestra el número de órdenes por hora del día para identificar horas
          pico.
        </p>
      </div>
    </div>
  );
};
