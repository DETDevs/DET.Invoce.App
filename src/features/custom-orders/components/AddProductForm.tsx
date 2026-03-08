import React, { useState, useEffect } from "react";
import { logError } from "@/shared/utils/logError";
import { Plus, Search } from "lucide-react";
import type { ProductOption } from "@/shared/types";
import { useAddOrderItem } from "@/features/custom-orders/hooks/useAddOrderItem";
import { productApi } from "@/api/products";
import type { TProduct } from "@/api/products/types";

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
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(false);
        const data = await productApi.getByCode();
        setProducts(data.filter((p) => p.isActive));
      } catch (err) {
        logError("[CustomOrders] Error loading products", err, {
          action: "loadProducts",
        });
        setError(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const AVAILABLE_PRODUCTS: ProductOption[] = products.map((p) => ({
    id: p.productId,
    code: p.code,
    name: p.name,
    price: p.price,
  }));

  const {
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <span className="text-red-600 text-sm">
            No pudimos cargar los productos. Por favor, verifica tu conexión o
            contacta al administrador.
          </span>
        </div>
      )}

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
              placeholder={
                loading
                  ? "Cargando productos..."
                  : error
                    ? "No disponible"
                    : "Buscar producto..."
              }
              disabled={loading || error}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm disabled:opacity-50 disabled:cursor-wait"
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
                    {searchTerm
                      ? `No encontramos productos con "${searchTerm}"`
                      : "Escribe para buscar productos"}
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
