import { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  RefreshCw,
  Package,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useOrders } from "@/features/takeout/hooks/useOrders";
import { OrderCard } from "@/features/takeout/components/OrderCard";
import { TakeoutDetailModal } from "@/features/takeout/components/TakeoutDetailModal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import orderApi from "@/api/order/OrderAPI";
import type { TOrder } from "@/api/order/types";
import type { TakeoutOrder } from "@/shared/types";

type DashboardTab = "mesas" | "llevar";

export const TakeoutDashboardPage = () => {
  const {
    tableGroups: allTableGroups,
    takeoutOrders: allTakeoutOrders,
    totalActive,
    loading,
    refetch,
  } = useOrders();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>("mesas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cuentasForModal, setCuentasForModal] = useState<TakeoutOrder[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isMesero = user?.role === "mesero";

  const tableGroups = useMemo(() => {
    if (!isMesero) return allTableGroups;
    const filtered = new Map<number, TOrder[]>();
    allTableGroups.forEach((orders, tableId) => {
      const myOrders = orders.filter((o) => o.createdBy === user?.name);
      if (myOrders.length > 0) filtered.set(tableId, myOrders);
    });
    return filtered;
  }, [allTableGroups, isMesero, user?.name]);

  const takeoutOrders = useMemo(() => {
    if (!isMesero) return allTakeoutOrders;
    return allTakeoutOrders.filter((o) => o.createdBy === user?.name);
  }, [allTakeoutOrders, isMesero, user?.name]);

  const mesaCount = tableGroups.size;
  const takeoutCount = takeoutOrders.length;

  const buildCuentas = async (
    orders: TOrder[],
    tableId: number | null,
  ): Promise<TakeoutOrder[]> => {
    const seen = new Set<number>();
    const uniqueOrders = orders.filter((o) => {
      if (seen.has(o.orderId)) return false;
      seen.add(o.orderId);
      return true;
    });

    const cuentas: TakeoutOrder[] = [];

    for (const order of uniqueOrders) {
      try {
        const accountsData = await orderApi.getOrderAccountWithDetails(
          order.orderId,
        );
        const accountsList = Array.isArray(accountsData)
          ? accountsData
          : [accountsData];
        const openAccounts = accountsList.filter(
          (a: any) => a.status === "Open",
        );
        const accountsToUse =
          openAccounts.length > 0 ? openAccounts : accountsList;

        for (const account of accountsToUse) {
          const items = (account.orderAccountDetails || []).map((d: any) => ({
            productId: d.orderDetailId ?? 0,
            productCode: d.productCode ?? "",
            name: d.productName || d.productCode || "Producto",
            price: d.unitPrice ?? 0,
            quantity: d.quantity ?? 1,
            addedAt: order.orderDate,
          }));

          cuentas.push({
            id: `${order.orderId}-${account.orderAccountId}`,
            tableNumber: tableId ?? 0,
            cuentaNumber: account.accountNumber ?? 1,
            items,
            createdAt: order.orderDate,
            updatedAt: order.orderDate,
            status: "active",
            createdBy: order.createdBy,
            backendOrderId: order.orderId,
            orderNumber: order.orderNumber,
            customerName: order.notes || undefined,
          });
        }
      } catch {
        cuentas.push({
          id: String(order.orderId),
          tableNumber: tableId ?? 0,
          cuentaNumber: 1,
          items: [],
          createdAt: order.orderDate,
          updatedAt: order.orderDate,
          status: "active",
          createdBy: order.createdBy,
          backendOrderId: order.orderId,
          orderNumber: order.orderNumber,
        });
      }
    }

    return cuentas;
  };

  const handleTableClick = async (tableId: number, orders: TOrder[]) => {
    setLoadingDetail(true);
    try {
      const cuentas = await buildCuentas(orders, tableId);
      if (cuentas.length === 0) {
        toast.error("No se pudieron cargar los detalles de la mesa.");
        return;
      }
      setCuentasForModal(cuentas);
      setSelectedTable(tableId);
      setIsModalOpen(true);
    } catch {
      toast.error("Error al cargar la orden. Intenta de nuevo.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleTakeoutClick = async (order: TOrder) => {
    setLoadingDetail(true);
    try {
      const cuentas = await buildCuentas([order], null);
      if (cuentas.length === 0) {
        toast.error("No se pudieron cargar los detalles de la orden.");
        return;
      }
      setCuentasForModal(cuentas);
      setSelectedTable(0);
      setIsModalOpen(true);
    } catch {
      toast.error("Error al cargar la orden. Intenta de nuevo.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setCuentasForModal([]);
    refetch();
  };

  return (
    <div className="h-full bg-[#FDFBF7] overflow-y-auto">
      <div className="px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
              Takeout
            </h1>
            <p className="text-sm text-gray-500">
              {mesaCount} {mesaCount === 1 ? "mesa" : "mesas"} · {takeoutCount}{" "}
              para llevar · {totalActive}{" "}
              {totalActive === 1 ? "cuenta total" : "cuentas totales"}
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 max-w-xs">
          <button
            onClick={() => setActiveTab("mesas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "mesas"
                ? "bg-white text-[#593D31] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UtensilsCrossed size={14} />
            Mesas
            {mesaCount > 0 && (
              <span className="bg-[#593D31] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {mesaCount}
              </span>
            )}
          </button>
          {!isMesero && (
            <button
              onClick={() => setActiveTab("llevar")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "llevar"
                  ? "bg-white text-[#593D31] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={14} />
              Para Llevar
              {takeoutCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {takeoutCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <main className="p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm">Cargando órdenes...</p>
          </div>
        ) : (
          <>
            {activeTab === "mesas" && (
              <>
                {mesaCount === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                      <UtensilsCrossed size={40} className="opacity-40" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-500 mb-2">
                      Sin mesas activas
                    </h2>
                    <p className="text-sm max-w-sm">
                      Cuando los meseros tomen órdenes en mesa desde "Nueva
                      Orden", aparecerán aquí para cobrar y facturar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from(tableGroups.entries()).map(
                      ([tableId, orders]) => (
                        <OrderCard
                          key={tableId}
                          tableId={tableId}
                          orders={orders}
                          onClick={() => handleTableClick(tableId, orders)}
                        />
                      ),
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "llevar" && (
              <>
                {takeoutCount === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                      <ShoppingBag size={40} className="opacity-40" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-500 mb-2">
                      Sin órdenes para llevar
                    </h2>
                    <p className="text-sm max-w-sm">
                      Las órdenes marcadas como "Para Llevar" aparecerán aquí
                      listas para cobrar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {takeoutOrders.map((order) => (
                      <OrderCard
                        key={order.orderId}
                        tableId={null}
                        orders={[order]}
                        onClick={() => handleTakeoutClick(order)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 size={32} className="animate-spin text-[#593D31]" />
            <p className="text-sm font-bold text-gray-700">
              Cargando detalles...
            </p>
          </div>
        </div>
      )}

      <TakeoutDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        tableNumber={selectedTable}
        cuentas={cuentasForModal}
      />

      <Toaster position="top-center" />
    </div>
  );
};
