import React from "react";
import { Card } from "@/shared/ui/Card";
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  Package, 
  ArrowUpRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const salesData = [
  { name: "Lun", value: 4000 },
  { name: "Mar", value: 3000 },
  { name: "Mie", value: 2000 },
  { name: "Jue", value: 2780 },
  { name: "Vie", value: 1890 },
  { name: "Sab", value: 6390 },
  { name: "Dom", value: 3490 },
];

const productsSoldMonthly = [
  { name: "Ene", value: 120 },
  { name: "Feb", value: 150 },
  { name: "Mar", value: 180 },
  { name: "Abr", value: 200 },
  { name: "May", value: 160 },
  { name: "Jun", value: 140 },
  { name: "Jul", value: 210 },
];

const categoryData = [
  { name: "Pasteles", value: 45 },
  { name: "Postres", value: 30 },
  { name: "Bebidas", value: 25 },
];

const COLORS = ["#E8BC6E", "#593D31", "#F3EFE0"];

export const DashboardPage = () => {
  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Dashboard</h1>
          <p className="text-gray-500">Resumen de actividad de hoy</p>
        </div>
        <div className="text-sm bg-white px-4 py-2 rounded-lg shadow-sm text-[#593D31] font-medium border border-gray-100">
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Ingresos de Hoy</p>
            <h2 className="text-3xl font-bold text-[#2D2D2D]">C$1,250</h2>
            <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              <span>+12% ayer</span>
            </div>
          </div>
          <div className="p-4 bg-[#F9F1D8] rounded-2xl text-[#E8BC6E]">
            <TrendingUp size={28} />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Productos Vendidos</p>
            <h2 className="text-3xl font-bold text-[#2D2D2D]">85</h2>
            <div className="flex items-center mt-2 text-[#E8BC6E] text-sm font-medium">
              <ShoppingBag size={16} className="mr-1" />
              <span>Items totales</span>
            </div>
          </div>
          <div className="p-4 bg-[#F9F1D8] rounded-2xl text-[#E8BC6E]">
            <Package size={28} />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-6 md:col-span-2 xl:col-span-1">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Alerta de Stock</p>
            <h2 className="text-3xl font-bold text-[#2D2D2D]">3 Prod.</h2>
            <div className="flex items-center mt-2 text-red-500 text-sm font-medium">
              <AlertTriangle size={16} className="mr-1" />
              <span>Bajo inventario</span>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl text-red-500">
            <AlertTriangle size={28} />
          </div>
        </Card>

        <Card className="flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={100} className="text-[#E8BC6E]" />
          </div>
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-6 z-10">
            Más Vendido
          </h3>
          <div className="flex items-center space-x-5 z-10">
            <div className="w-20 h-20 bg-[#F3EFE0] rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-3xl">🍰</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#593D31] block">Red Velvet</span>
              <span className="text-sm text-gray-500">45 unidades vendidas</span>
            </div>
          </div>
          <div className="mt-6 z-10">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#E8BC6E] h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">75% del stock vendido</p>
          </div>
        </Card>

        <Card className="md:col-span-2 xl:col-span-2 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-[#2D2D2D]">Flujo de Ingresos</h3>
            <select className="bg-[#F9F1D8] text-[#593D31] text-sm rounded-lg px-3 py-1 outline-none border-none cursor-pointer">
              <option>Esta Semana</option>
              <option>Mes Pasado</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8BC6E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E8BC6E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                tickFormatter={(value) => `C$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#593D31', fontWeight: 'bold' }}
                formatter={(value) => [`C$${value}`, 'Ingresos']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#E8BC6E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIngresos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="w-full text-left text-lg font-medium text-[#2D2D2D] mb-4">
            Ventas por Categoría
          </h3>
          <div className="relative w-full flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#593D31]">45%</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Pasteles</span>
            </div>
          </div>
          <div className="flex w-full justify-around mt-4">
             {categoryData.map((cat, index) => (
               <div key={index} className="flex items-center text-xs text-gray-500">
                 <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                 {cat.name}
               </div>
             ))}
          </div>
        </Card>

        <Card className="md:col-span-2 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-[#2D2D2D]">Volumen de Ventas</h3>
            <button className="text-[#E8BC6E] text-sm font-medium hover:text-[#dca34b]">Ver reporte completo</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productsSoldMonthly} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} unidades`, 'Ventas']}
              />
              <Bar 
                dataKey="value" 
                fill="#E8BC6E" 
                radius={[6, 6, 6, 6]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
};