import { X } from "lucide-react";

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  showInactive: boolean;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}: FilterPanelProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-12 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#593D31]">Filtrar por</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8BC6E]"
            >
              <option value="">Todas</option>
              <option value="Cake">Pasteles</option>
              <option value="Panes">Panes</option>
              <option value="Pastry">Repostería</option>
              <option value="Bebidas">Bebidas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
              Rango de Precio
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                className="w-1/2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8BC6E]"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                className="w-1/2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8BC6E]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Mostrar inactivos
            </label>
            <button
              type="button"
              onClick={() =>
                setFilters({ ...filters, showInactive: !filters.showInactive })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${
                filters.showInactive ? "bg-[#E8BC6E]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filters.showInactive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-4">
            <button
              onClick={onReset}
              className="flex-1 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={onApply}
              className="flex-1 py-2 text-sm bg-[#E8BC6E] text-white font-bold rounded-lg hover:bg-[#dca34b] transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
