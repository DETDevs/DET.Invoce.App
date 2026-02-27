import React from "react";
import { X } from "lucide-react";

interface UserFilterState {
  role: string;
  status: string;
}

interface UserFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UserFilterState;
  setFilters: (filters: UserFilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export const UserFilterPanel = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}: UserFilterPanelProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-12 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#593D31]">Filtrar Usuarios</h3>
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
              Rol
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8BC6E]"
            >
              <option value="">Todos</option>
              <option value="Admin">Administrador</option>
              <option value="Cajero">Cajero</option>
              <option value="Mesero">Mesero</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8BC6E]"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
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
