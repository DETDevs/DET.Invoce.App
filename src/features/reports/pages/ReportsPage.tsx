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
    <div className="p-4 md:p-8 bg-[#FDFBF7] min-h-screen w-full max-w-full overflow-x-hidden pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
            Reportes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Resumen financiero</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <div className="relative flex-grow xl:flex-grow-0 min-w-[200px]">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
            >
              <option>Hoy</option>
              <option>Esta Semana</option>
              <option>Este Mes</option>
            </select>
            <Calendar
              className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          <button
            onClick={() => handleExport("PDF")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center flex-1 xl:flex-none"
          >
            <Printer size={20} className="mr-2 md:mr-0" />
            <span className="md:hidden text-sm font-medium">Imprimir</span>
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="p-2 bg-[#593D31] text-white rounded-lg hover:bg-[#4a332a] flex items-center justify-center flex-1 xl:flex-none"
          >
            <Download size={20} className="mr-2 md:mr-0" />
            <span className="md:hidden text-sm font-medium">CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-[#E8BC6E] shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Ventas
            </p>
            <h3 className="text-2xl font-bold text-[#2D2D2D]">C$ 24,500</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              +15% vs ayer
            </span>
          </div>
          <div className="p-3 bg-[#F9F1D8] rounded-xl text-[#E8BC6E]">
            <DollarSign size={24} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Ticket Prom.
            </p>
            <h3 className="text-2xl font-bold text-[#2D2D2D]">C$ 350</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              -2% vs ayer
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
            <CreditCard size={24} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-sm md:col-span-2 xl:col-span-1">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Ganancia
            </p>
            <h3 className="text-2xl font-bold text-[#2D2D2D]">C$ 8,200</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              +8% margen
            </span>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <TrendingUp size={24} />
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 w-full min-w-0">
        <div className="xl:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
          <h3 className="text-lg font-bold text-[#2D2D2D] mb-4">Finanzas</h3>
          <div className="h-[250px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={SALES_DATA}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8BC6E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8BC6E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#999" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#999" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#E8BC6E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[350px]">
          <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">Categorías</h3>
          <div className="flex-1 w-full relative min-h-[220px]">
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
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {CATEGORY_DATA.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-500 font-medium truncate">
                  {item.name}{" "}
                  <span className="text-[#2D2D2D] ml-1">{item.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#2D2D2D]">Últimas Ventas</h3>
          <button className="text-sm text-[#E8BC6E] font-bold hover:underline">
            Ver todo
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm text-[#2D2D2D]">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-[#2D2D2D]">
                    {tx.customer}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        tx.status === "Completado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-[#2D2D2D]">
                    C$ {tx.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {RECENT_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">
                      {tx.id}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {tx.date.split(",")[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#2D2D2D]">{tx.customer}</h4>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                    tx.status === "Completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E8BC6E]"></div>
                  {tx.method}
                </span>
                <span className="text-lg font-bold text-[#2D2D2D]">
                  C$ {tx.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
