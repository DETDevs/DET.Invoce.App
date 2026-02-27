import { useState } from "react";
import { Plus, Search, Filter, ArrowLeftRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCashMovements } from "@/features/cash-movements/hooks/useCashMovements";
import { CashSummary } from "@/features/cash-movements/components/CashSummary";
import { MovementCard } from "@/features/cash-movements/components/MovementCard";
import { AddCashMovementModal } from "@/features/cash-movements/components/AddCashMovementModal";
import { MovementDetailsModal } from "@/features/cash-movements/components/MovementDetailsModal";
import { Pagination } from "@/features/cash-movements/components/Pagination";
import type {
  MovementType,
  CashMovement,
} from "@/features/cash-movements/types";

export const CashMovementsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(
    null,
  );

  const {
    movements,
    loading,
    filteredCount,
    summary,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterCategoryId,
    setFilterCategoryId,
    addMovement,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    cashInTypes,
    cashOutTypes,
    allDisplayTypes,
    dateRange,
    setDateRange,
  } = useCashMovements();

  const handlePrintTicket = (_movementId: string) => {
    toast.success("Solicitud de impresión enviada al servidor");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2D2D] flex items-center gap-3">
              <div className="p-3 bg-[#E8BC6E] rounded-xl">
                <ArrowLeftRight size={28} className="text-white" />
              </div>
              Movimientos de Caja
            </h1>
            <p className="text-gray-600 mt-2">
              Registra y consulta ingresos y salidas de efectivo
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#593D31] text-white rounded-xl font-bold hover:bg-[#4a332a] transition-colors shadow-md"
          >
            <Plus size={20} />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      <CashSummary summary={summary} />

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descripción..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as MovementType | "all")
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-gray-900"
          >
            <option value="all">Todos los tipos</option>
            <option value="cash-in">Cash In (Ingresos)</option>
            <option value="cash-out">Cash Out (Salidas)</option>
          </select>

          <select
            value={filterCategoryId}
            onChange={(e) => {
              const val = e.target.value;
              setFilterCategoryId(val === "all" ? "all" : Number(val));
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-gray-900"
          >
            <option value="all">Todas las categorías</option>
            {allDisplayTypes.filter((t) => t.flow === "IN").length > 0 && (
              <optgroup label="Cash In">
                {allDisplayTypes
                  .filter((t) => t.flow === "IN")
                  .map((t) => (
                    <option
                      key={t.cashMovementTypeId}
                      value={t.cashMovementTypeId}
                    >
                      {t.name}
                    </option>
                  ))}
              </optgroup>
            )}
            {allDisplayTypes.filter((t) => t.flow === "OUT").length > 0 && (
              <optgroup label="Cash Out">
                {allDisplayTypes
                  .filter((t) => t.flow === "OUT")
                  .map((t) => (
                    <option
                      key={t.cashMovementTypeId}
                      value={t.cashMovementTypeId}
                    >
                      {t.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>

          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-[#2D2D2D] appearance-none"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="year">Este Año</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#E8BC6E] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500">Cargando movimientos...</p>
            </div>
          </div>
        ) : movements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <ArrowLeftRight size={40} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No hay movimientos
                </h3>
                <p className="text-gray-600">
                  {searchQuery ||
                  filterType !== "all" ||
                  filterCategoryId !== "all"
                    ? "No se encontraron movimientos con los filtros aplicados"
                    : "Comienza registrando tu primer movimiento de caja"}
                </p>
              </div>
              {!searchQuery &&
                filterType === "all" &&
                filterCategoryId === "all" && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 px-6 py-3 bg-[#E8BC6E] text-white rounded-xl font-bold hover:bg-[#dca34b] transition-colors"
                  >
                    Registrar Movimiento
                  </button>
                )}
            </div>
          </div>
        ) : (
          <>
            {movements.map((movement) => (
              <MovementCard
                key={movement.id}
                movement={movement}
                onClick={setSelectedMovement}
              />
            ))}
          </>
        )}
      </div>

      {filteredCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCount}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <AddCashMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addMovement}
        cashInTypes={cashInTypes}
        cashOutTypes={cashOutTypes}
      />

      <MovementDetailsModal
        isOpen={!!selectedMovement}
        onClose={() => setSelectedMovement(null)}
        movement={selectedMovement}
        onPrint={handlePrintTicket}
      />
    </div>
  );
};
