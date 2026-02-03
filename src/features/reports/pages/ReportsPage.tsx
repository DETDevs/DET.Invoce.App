import React, { useState } from "react";
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card } from "@/shared/ui/Card";
import toast from "react-hot-toast";

const SALES_DATA = [
  { name: "Lun", ventas: 4000, costos: 2400 },
  { name: "Mar", ventas: 3000, costos: 1398 },
  { name: "Mie", ventas: 2000, costos: 9800 },
  { name: "Jue", ventas: 2780, costos: 3908 },
  { name: "Vie", ventas: 1890, costos: 4800 },
  { name: "Sab", ventas: 6390, costos: 3800 },
  { name: "Dom", ventas: 3490, costos: 4300 },
];

const CATEGORY_DATA = [
  { name: "Pasteles", value: 45 },
  { name: "Panes", value: 25 },
  { name: "Bebidas", value: 20 },
  { name: "Postres", value: 10 },
];

const RECENT_TRANSACTIONS = [
  {
    id: "#ORD-001",
    date: "01 Feb, 10:30 AM",
    customer: "Cliente Casual",
    total: 450,
    method: "Efectivo",
    status: "Completado",
  },
  {
    id: "#ORD-002",
    date: "01 Feb, 11:15 AM",
    customer: "María Cruz",
    total: 1200,
    method: "Tarjeta",
    status: "Completado",
  },
  {
    id: "#ORD-003",
    date: "01 Feb, 01:45 PM",
    customer: "Juan Pérez",
    total: 85,
    method: "Efectivo",
    status: "Reembolsado",
  },
  {
    id: "#ORD-004",
    date: "01 Feb, 03:20 PM",
    customer: "Cliente Casual",
    total: 320,
    method: "Transferencia",
    status: "Completado",
  },
  {
    id: "#ORD-005",
    date: "01 Feb, 05:00 PM",
    customer: "Ana López",
    total: 2100,
    method: "Tarjeta",
    status: "Completado",
  },
];

const COLORS = ["#E8BC6E", "#593D31", "#D4A373", "#FAEDCD"];

export const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("Esta Semana");

  const handleExport = (type: string) => {
    toast.success(`Exportando reporte en ${type}...`);
  };

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Reportes</h1>
          <p className="text-gray-500 mt-1">Resumen financiero y operativo</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
            >
              <option>Hoy</option>
              <option>Esta Semana</option>
              <option>Este Mes</option>
              <option>Este Año</option>
            </select>
          </div>

          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => handleExport("Excel")}
            className="flex items-center gap-2 px-4 py-2 bg-[#593D31] text-white rounded-xl text-sm font-medium hover:bg-[#4a332a] transition-colors"
          >
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Ventas Totales
            </p>
            <h3 className="text-3xl font-bold text-[#2D2D2D]">C$ 24,500</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">
              +15% vs semana pasada
            </span>
          </div>
          <div className="p-4 bg-[#F9F1D8] rounded-full text-[#E8BC6E]">
            <DollarSign size={28} />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Ticket Promedio
            </p>
            <h3 className="text-3xl font-bold text-[#2D2D2D]">C$ 350</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full mt-2 inline-block">
              -2% vs semana pasada
            </span>
          </div>
          <div className="p-4 bg-[#F9F1D8] rounded-full text-[#E8BC6E]">
            <CreditCard size={28} />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Ganancia Neta
            </p>
            <h3 className="text-3xl font-bold text-[#2D2D2D]">C$ 8,200</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">
              +8% Margen saludable
            </span>
          </div>
          <div className="p-4 bg-[#F9F1D8] rounded-full text-[#E8BC6E]">
            <TrendingUp size={28} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#2D2D2D] mb-6">
            Tendencia de Ingresos vs Costos
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8BC6E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8BC6E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#593D31" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#593D31" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#E8BC6E"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  strokeWidth={3}
                  name="Ventas"
                />
                <Area
                  type="monotone"
                  dataKey="costos"
                  stroke="#593D31"
                  fillOpacity={1}
                  fill="url(#colorCostos)"
                  strokeWidth={3}
                  name="Costos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
            Ventas por Categoría
          </h3>
          <div className="h-64 w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#593D31]">100%</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {CATEGORY_DATA.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-[#2D2D2D]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#2D2D2D]">
            Transacciones Recientes
          </h3>
          <button className="text-sm text-[#E8BC6E] font-bold hover:underline">
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID Orden</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_TRANSACTIONS.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#FDFBF7] transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-[#2D2D2D]">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-[#2D2D2D]">
                    {tx.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tx.method}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        tx.status === "Completado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#2D2D2D]">
                    C$ {tx.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
