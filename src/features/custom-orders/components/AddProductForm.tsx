import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { ProductOption } from "@/features/custom-orders/types";
import { useAddOrderItem } from "@/features/custom-orders/hooks/useAddOrderItem";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const filteredProducts = searchTerm
    ? AVAILABLE_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedProductId("");
    if (term) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectProduct = (product: ProductOption) => {
    setSelectedProductId(String(product.id));
    setSearchTerm(`${product.name}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        Agregar Producto
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="block text-xs text-gray-500 mb-1">Producto</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm) setIsDropdownOpen(true);
              }}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
            />
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  <ul>
                    {filteredProducts.map((p) => (
                      <li
                        key={p.id}
                        onMouseDown={() => handleSelectProduct(p)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {p.name} -{" "}
                        <span className="text-gray-500">
                          C$ {p.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No se encontraron productos.
                  </div>
                )}
              </div>
            )}
          </div>
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
            onClick={() => {
              handleAddItem(onAdd);
              setSearchTerm("");
            }}
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
