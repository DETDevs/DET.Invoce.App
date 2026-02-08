import React from "react";
import { Plus } from "lucide-react";
import type { ProductOption } from "../types";
import { useAddOrderItem } from "../hooks/useAddOrderItem";

const AVAILABLE_PRODUCTS: ProductOption[] = [
  { id: 1, name: "Pastel de Chocolate", price: 350 },
  { id: 2, name: "Tres Leches", price: 400 },
  { id: 3, name: "Cheesecake de Fresa", price: 450 },
  { id: 4, name: "Cupcakes (Docena)", price: 180 },
  { id: 5, name: "Galletas Decoradas", price: 25 },
  { id: 6, name: "Pie de Limón", price: 320 },
];

interface Props {
  onAdd: (
    product: ProductOption,
    quantity: number,
    description: string,
  ) => void;
}

export const AddProductForm = ({ onAdd }: Props) => {
  const {
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    description,
    setDescription,
    isValid,
    handleAddItem,
  } = useAddOrderItem(AVAILABLE_PRODUCTS);

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        Agregar Producto
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="block text-xs text-gray-500 mb-1">Producto</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
          >
            <option value="">Seleccionar...</option>
            {AVAILABLE_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - C$ {p.price}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs text-gray-500 mb-1">
            Descripción (Opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles extra..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => handleAddItem(onAdd)}
            disabled={!isValid}
            className="w-full flex items-center justify-center gap-1 bg-[#593D31] text-white py-2 rounded-lg hover:bg-[#4a3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
