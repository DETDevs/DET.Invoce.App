import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import {
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Package,
  ArrowUpRight,
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
  CartesianGrid,
} from "recharts";
import { TopSellerCarousel } from "@/features/dashboard/components/TopSellerCarousel";
import { LowStockProductsModal } from "@/features/dashboard/components/LowStockProductsModal";
import { productApi } from "@/api/products";
import reportApi from "@/api/report/ReportAPI";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";
import type { TProduct } from "@/api/products/types";
import type {
  TSalesByCategory,
  TTopProductByCategory,
} from "@/api/dashboard/types";

const COLORS = ["#E8BC6E", "#593D31", "#F3EFE0", "#D4A373", "#A0785A"];

export const DashboardPage = () => {
  const { session } = useCashBox();
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  const [lowStockProducts, setLowStockProducts] = useState<TProduct[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  const [totalMoney, setTotalMoney] = useState<number | null>(null);
  const [totalProductsSold, setTotalProductsSold] = useState<number | null>(
    null,
  );
  const [salesByCategory, setSalesByCategory] = useState<TSalesByCategory[]>(
    [],
  );
  const [topProducts, setTopProducts] = useState<TTopProductByCategory[]>([]);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);

  const [monthlySalesVolume, setMonthlySalesVolume] = useState<
    { name: string; value: number }[]
  >([]);

  const [salesTrendRange, setSalesTrendRange] = useState("Esta Semana");
  const [salesDataList, setSalesDataList] = useState<
    { name: string; value: number | null }[]
  >([]);

  useEffect(() => {
    const fetchSalesTrend = async () => {
      try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const start = new Date();

        if (salesTrendRange === "Esta Semana") {
          start.setDate(today.getDate() - 7);
        } else if (salesTrendRange === "Mes Pasado") {
          start.setMonth(today.getMonth() - 1);
        }

        start.setHours(0, 0, 0, 0);

        const data = await reportApi.getSalesTrend({
          dateFrom: start.toISOString(),
          dateTo: today.toISOString(),
        });

        if (Array.isArray(data)) {
          setSalesDataList(
            data.map((item) => ({
              name: new Date(item.date).toLocaleDateString("es-NI", {
                weekday: "short",
                day: "numeric",
              }),
              value: item.totalSales === 0 ? null : item.totalSales,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching sales trend:", error);
      }
    };

    
    const fetchMonthlyVolume = async () => {
      try {
        const MONTH_NAMES = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ];
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setMonth(end.getMonth() - 6);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const data = await reportApi.getSalesTrend({
          dateFrom: start.toISOString(),
          dateTo: end.toISOString(),
        });

        if (Array.isArray(data) && data.length > 0) {
          const monthMap = new Map<string, number>();
          data.forEach((item) => {
            const d = new Date(item.date);
            const key = MONTH_NAMES[d.getMonth()];
            monthMap.set(
              key,
              (monthMap.get(key) || 0) + (item.totalSales || 0),
            );
          });
          setMonthlySalesVolume(
            Array.from(monthMap.entries()).map(([name, value]) => ({
              name,
              value,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching monthly volume:", error);
      }
    };

    fetchSalesTrend();
    fetchMonthlyVolume();
  }, [salesTrendRange]);

  useEffect(() => {
    const crId = session?.cashRegisterId;

    const fetchDashboard = async () => {
      setLoadingKpis(true);
      try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const dateParams = {
          dateFrom: startOfDay.toISOString(),
          dateTo: today.toISOString(),
          cashRegisterId: crId,
        };

        const [salesRes, ordersRes, topRes] = await Promise.allSettled([
          reportApi.getTotalSales(dateParams),
          reportApi.getTotalOrders(dateParams),
          reportApi.getTopSellingProducts(dateParams),
        ]);

        if (salesRes.status === "fulfilled") {
          setTotalMoney(salesRes.value?.totalSales ?? 0);
        }

        if (ordersRes.status === "fulfilled") {
          setTotalProductsSold(ordersRes.value?.totalOrders ?? 0);
        }

        if (topRes.status === "fulfilled") {
          const data = topRes.value;
          if (Array.isArray(data)) {
            
            setSalesByCategory([]);
            setTopProducts(
              data.slice(0, 10).map((p) => ({
                categoryName: "",
                productName: p.name,
                totalSold: p.totalSold,
                imageUrl: undefined,
              })),
            );
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingKpis(false);
        setLoadingTopProducts(false);
      }
    };

    const fetchLowStock = async () => {
      setLoadingLowStock(true);
      try {
        const data = await productApi.getLowStock();
        setLowStockProducts(data);
      } catch (err) {
        console.error("Error fetching low stock products:", err);
      } finally {
        setLoadingLowStock(false);
      }
    };

    
    if (!session?.isOpen) {
      setTotalMoney(0);
      setTotalProductsSold(0);
      setSalesByCategory([]);
      setTopProducts([]);
      setLoadingKpis(false);
      setLoadingTopProducts(false);
      fetchLowStock();
      return;
    }

    fetchDashboard();
    fetchLowStock();
  }, [session?.isOpen, session?.cashRegisterId]);

  const lowStockForModal = lowStockProducts.map((p) => ({
    id: p.productId,
    name: p.name,
    stock: p.quantity,
    minStock: p.stockMinimum,
    image: p.imageUrl || "https://via.placeholder.com/150",
  }));

  const categoryChartData =
    salesByCategory.length > 0
      ? salesByCategory.map((c) => ({
          name: c.categoryName,
          value: c.totalMoney,
        }))
      : [{ name: "Sin datos", value: 1 }];

  const totalCategorySales = categoryChartData.reduce(
    (sum, c) => sum + c.value,
    0,
  );
  const topCategory =
    categoryChartData.length > 0
      ? categoryChartData.reduce(
          (max, c) => (c.value > max.value ? c : max),
          categoryChartData[0],
        )
      : null;
  const topCategoryPercent =
    topCategory && totalCategorySales > 0
      ? Math.round((topCategory.value / totalCategorySales) * 100)
      : 0;

  const formatMoney = (value: number) => {
    return `C$${value.toLocaleString("es-NI")}`;
  };

  return (
    <>
      <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2D2D]">Dashboard</h1>
            <p className="text-gray-500">Resumen de actividad de hoy</p>
          </div>
          <div className="text-sm bg-white px-4 py-2 rounded-lg shadow-sm text-[#593D31] font-medium border border-gray-100">
            {new Date().toLocaleDateString("es-NI", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">
                Ingresos de Hoy
              </p>
              <h2 className="text-3xl font-bold text-[#2D2D2D]">
                {loadingKpis ? "..." : formatMoney(totalMoney ?? 0)}
              </h2>
              <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                <span>Hoy</span>
              </div>
            </div>
            <div className="p-4 bg-[#F9F1D8] rounded-2xl text-[#E8BC6E]">
              <TrendingUp size={28} />
            </div>
          </Card>

          <Card className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">
                Productos Vendidos
              </p>
              <h2 className="text-3xl font-bold text-[#2D2D2D]">
                {loadingKpis ? "..." : (totalProductsSold ?? 0)}
              </h2>
              <div className="flex items-center mt-2 text-[#E8BC6E] text-sm font-medium">
                <ShoppingBag size={16} className="mr-1" />
                <span>Items totales hoy</span>
              </div>
            </div>
            <div className="p-4 bg-[#F9F1D8] rounded-2xl text-[#E8BC6E]">
              <Package size={28} />
            </div>
          </Card>

          <Card
            onClick={() => setIsLowStockModalOpen(true)}
            className="flex items-center justify-between p-6 md:col-span-2 xl:col-span-1 cursor-pointer hover:bg-red-50/50 transition-colors group"
          >
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">
                Alerta de Cantidad
              </p>
              <h2 className="text-3xl font-bold text-[#2D2D2D]">
                {loadingLowStock ? "..." : lowStockProducts.length} Prod.
              </h2>
              <div className="flex items-center mt-2 text-red-500 text-sm font-medium">
                <AlertTriangle size={16} className="mr-1" />
                <span>Bajo inventario</span>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl text-red-500">
              <AlertTriangle size={28} />
            </div>
          </Card>

          <TopSellerCarousel
            topProducts={topProducts}
            loading={loadingTopProducts}
          />

          <Card className="md:col-span-2 xl:col-span-2 min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#2D2D2D] p-5">
                Flujo de Ingresos
              </h3>
              <select
                value={salesTrendRange}
                onChange={(e) => setSalesTrendRange(e.target.value)}
                className="bg-[#F9F1D8] text-[#593D31] text-sm rounded-lg px-3 py-1 m-4 outline-none border-none cursor-pointer"
              >
                <option value="Esta Semana">Esta Semana</option>
                <option value="Mes Pasado">Mes Pasado</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={salesDataList}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorIngresos"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#E8BC6E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8BC6E" stopOpacity={0} />
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
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) => `C$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#593D31", fontWeight: "bold" }}
                  formatter={(value) => [`C$${value}`, "Ingresos"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E8BC6E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="w-full text-left text-lg font-medium text-[#2D2D2D] mb-4 p-2">
              Ventas por Categoría
            </h3>
            <div className="relative w-full flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryChartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-[#593D31]">
                  {topCategoryPercent}%
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {topCategory?.name ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex w-full justify-around mt-4">
              {categoryChartData.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs text-gray-500"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {cat.name}
                </div>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-2 min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#2D2D2D] p-2">
                Volumen de Ventas
              </h3>
            </div>
            {monthlySalesVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySalesVolume} barSize={32}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`C$${value}`, "Ventas"]}
                  />
                  <Bar dataKey="value" fill="#E8BC6E" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                Sin datos disponibles
              </div>
            )}
          </Card>
        </div>
      </div>

      <LowStockProductsModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        products={lowStockForModal}
      />
    </>
  );
};
