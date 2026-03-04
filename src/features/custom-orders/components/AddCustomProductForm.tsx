import React, { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (name: string, quantity: number, price: number) => void;
}

export const AddCustomProductForm = ({ onAdd }: Props) => {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const isValid =
    description.trim().length > 0 && Number(quantity) > 0 && Number(price) > 0;

  const handleAdd = () => {
    if (!isValid) return;
    onAdd(description.trim(), Number(quantity), Number(price));
    setDescription("");
    setQuantity("1");
    setPrice("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        Agregar Producto Personalizado
      </h3>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">
          Descripción del producto
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Pastel 3 pisos, fondant rosado..."
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-[7rem_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-center"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Precio Unitario
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              C$
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!isValid}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold whitespace-nowrap"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>
    </div>
  );
};
