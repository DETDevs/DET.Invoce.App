import { useState } from "react";
import { UtensilsCrossed, RefreshCw, Package, ShoppingBag } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
import { TakeoutOrderCard } from "@/features/takeout/components/TakeoutOrderCard";
import { TakeoutDetailModal } from "@/features/takeout/components/TakeoutDetailModal";

const PARA_LLEVAR_TABLE = 0;
type DashboardTab = "mesas" | "llevar";

export const TakeoutDashboardPage = () => {
  const { getAllActiveOrders, getActiveTables, getActiveOrdersByTable } =
    useTakeoutStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>("mesas");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedParaLlevarId, setSelectedParaLlevarId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const activeTables = getActiveTables();
  const activeOrders = getAllActiveOrders();

  const mesaTables = activeTables.filter((t) => t !== PARA_LLEVAR_TABLE);
  const paraLlevarOrders = getActiveOrdersByTable(PARA_LLEVAR_TABLE);

  const handleMesaClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setSelectedParaLlevarId(null);
    setIsModalOpen(true);
  };

  const handleParaLlevarClick = (orderId: string) => {
    setSelectedTable(PARA_LLEVAR_TABLE);
    setSelectedParaLlevarId(orderId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setSelectedParaLlevarId(null);
    forceUpdate((n) => n + 1);
  };

  const selectedCuentas =
    selectedTable !== null
      ? selectedParaLlevarId
        ? getActiveOrdersByTable(PARA_LLEVAR_TABLE).filter(
            (o) => o.id === selectedParaLlevarId,
          )
        : getActiveOrdersByTable(selectedTable)
      : [];

  return (
    <div className="h-full bg-[#FDFBF7] overflow-y-auto">
      <div className="px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
              Takeout
            </h1>
            <p className="text-sm text-gray-500">
              {mesaTables.length} {mesaTables.length === 1 ? "mesa" : "mesas"} ·{" "}
              {paraLlevarOrders.length} para llevar · {activeOrders.length}{" "}
              {activeOrders.length === 1 ? "cuenta total" : "cuentas totales"}
            </p>
          </div>
          <button
            onClick={() => forceUpdate((n) => n + 1)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
          >
            <RefreshCw size={16} />
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
            {mesaTables.length > 0 && (
              <span className="bg-[#593D31] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {mesaTables.length}
              </span>
            )}
          </button>
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
            {paraLlevarOrders.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {paraLlevarOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="p-4 md:p-8">
        {activeTab === "mesas" && (
          <>
            {mesaTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <UtensilsCrossed size={40} className="opacity-40" />
                </div>
                <h2 className="text-xl font-bold text-gray-500 mb-2">
                  Sin mesas activas
                </h2>
                <p className="text-sm max-w-sm">
                  Cuando los meseros tomen órdenes en mesa desde "Nueva Orden",
                  aparecerán aquí para cobrar y facturar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {mesaTables.map((tableNumber) => {
                  const cuentas = getActiveOrdersByTable(tableNumber);
                  return (
                    <TakeoutOrderCard
                      key={tableNumber}
                      tableNumber={tableNumber}
                      cuentas={cuentas}
                      onClick={() => handleMesaClick(tableNumber)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "llevar" && (
          <>
            {paraLlevarOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag size={40} className="opacity-40" />
                </div>
                <h2 className="text-xl font-bold text-gray-500 mb-2">
                  Sin órdenes para llevar
                </h2>
                <p className="text-sm max-w-sm">
                  Las órdenes marcadas como "Para Llevar" aparecerán aquí listas
                  para cobrar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {paraLlevarOrders.map((order) => (
                  <TakeoutOrderCard
                    key={order.id}
                    tableNumber={PARA_LLEVAR_TABLE}
                    cuentas={[order]}
                    onClick={() => handleParaLlevarClick(order.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <TakeoutDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        tableNumber={selectedTable}
        cuentas={selectedCuentas}
      />

      <Toaster position="top-center" />
    </div>
  );
};
