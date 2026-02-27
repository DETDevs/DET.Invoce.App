import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, CheckCircle, Clock, Wallet } from "lucide-react";
import { KPICard } from "./KPICard";
import type { ReservationsReportData } from "@/features/reports/types";

interface ReservationsReportProps {
  data: ReservationsReportData;
}

export const ReservationsReport = ({ data }: ReservationsReportProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Pedidos"
          value={data.totalReservations}
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="Pendientes/Activos"
          value={data.pendingTotal + data.activeTotal}
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Completados"
          value={data.completedTotal}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Depósitos Recibidos"
          value={`C$ ${data.totalDepositAmount.toLocaleString()}`}
          icon={Wallet}
          color="green"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-6">
          Pedidos Especiales por Día
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.reservationsByDate}
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
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelFormatter={(date) => `Fecha: ${date}`}
                formatter={(value, name) => [
                  value,
                  name === "reservations" ? "Pedidos" : "Total",
                ]}
              />
              <Line
                type="monotone"
                dataKey="reservations"
                stroke="#E8BC6E"
                strokeWidth={3}
                dot={{ fill: "#E8BC6E", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Muestra el volumen de pedidos personalizados y reservaciones recibidas
          por día.
        </p>
      </div>
    </div>
  );
};
