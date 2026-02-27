import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Filter,
  Edit,
  Trash2,
  Search,
  Boxes,
  Loader2,
} from "lucide-react";
import { FilterPanel } from "@/features/products/components/FilterPanel";
import { EditProductModal } from "@/features/products/components/EditProductModal";
import { StockAdjustmentModal } from "@/features/products/components/StockAdjustmentModal";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/api/products";
import inventoryApi from "@/api/inventory/InventoryAPI";
import type { TProduct } from "@/api/products/types";
import toast from "react-hot-toast";

export const ProductsPage = () => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getByCode();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStockStatus = (stock: number) => {
    if (stock <= 5) {
      return {
        color: "text-red-600 bg-red-50 border-red-100",
        label: "Crítico",
      };
    } else if (stock <= 15) {
      return {
        color: "text-amber-600 bg-amber-50 border-amber-100",
        label: "Bajo",
      };
    } else {
      return {
        color: "text-green-600 bg-green-50 border-green-100",
        label: "Normal",
      };
    }
  };

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.category) {
      result = result.filter(
        (product) => product.categoryName === filters.category,
      );
    }

    if (filters.minPrice) {
      result = result.filter(
        (product) => product.price >= Number(filters.minPrice),
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (product) => product.price <= Number(filters.maxPrice),
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, filters, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleStockClick = (product: any) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProduct = async (updatedProduct: any) => {
    setIsSaving(true);
    try {
      await productApi.save({
        productId: updatedProduct.productId,
        code: updatedProduct.code,
        categoryCode:
          updatedProduct.categoryCode ?? updatedProduct.category ?? "",
        subCategoryId: updatedProduct.subCategoryId ?? undefined,
        name: updatedProduct.name,
        description: updatedProduct.description ?? "",
        price: updatedProduct.price,
        trackInventory: updatedProduct.trackInventory ?? true,
        unitId: updatedProduct.unitId ?? 0,
        divideQuantityBy: updatedProduct.divideQuantityBy ?? 0,
        isActive: updatedProduct.isActive ?? true,
        quantity: updatedProduct.quantity ?? updatedProduct.stock ?? 0,
        stockMinimum: updatedProduct.stockMinimum ?? 0,
      });
      toast.success("Producto actualizado correctamente");
      await fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("No se pudo guardar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStock = async (
    productId: number,
    newStock: number,
    reason: string,
  ) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    try {
      await inventoryApi.save({
        inventoryId: 0,
        productCode: product.code,
        quantityInStock: newStock,
        minimumStock: product.stockMinimum ?? 0,
      });
      toast.success("Inventario actualizado correctamente");
      await fetchProducts();
    } catch (err) {
      console.error("Error saving stock:", err);
      toast.error("No se pudo actualizar el inventario");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    toast.error("Endpoint de inactivar producto pendiente en el backend");
    setIsDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#E8BC6E] border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="text-center max-w-md px-4">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No pudimos cargar los productos
          </h2>
          <p className="text-gray-600 mb-6">
            Parece que hubo un problema al conectar con el sistema. Por favor,
            verifica tu conexión a internet o contacta al soporte técnico.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-colors active:scale-95"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-6 xl:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
          Productos
        </h1>
        <button
          onClick={() => navigate("/nuevo-producto")}
          className="flex items-center gap-2 bg-[#E8BC6E] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#dca34b] transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Agregar Producto</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E8BC6E]/50 focus:border-[#E8BC6E] sm:text-sm transition duration-150"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors w-full md:w-auto ${
              isFilterOpen || filters.category || filters.minPrice
                ? "border-[#E8BC6E] text-[#593D31] bg-[#F9F1D8]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            Filtrar
          </button>
          <FilterPanel
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            onApply={() => setIsFilterOpen(false)}
            onReset={() =>
              setFilters({ category: "", minPrice: "", maxPrice: "" })
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-[#FDFBF7] group"
                  >
                    <td className="px-4 lg:px-6 py-3">
                      <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg overflow-hidden border border-gray-100">
                        <img
                          src={
                            product.imageUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm font-bold text-[#2D2D2D] truncate max-w-[150px] lg:max-w-none">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        C${product.price}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      {(() => {
                        const status = getStockStatus(product.quantity);
                        return (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-bold text-[#2D2D2D]">
                              {product.quantity} u.
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F3EFE0] text-[#593D31]">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStockClick(product)}
                          className="p-1.5 lg:p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Inventario"
                        >
                          <Boxes size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 lg:p-2 text-[#E8BC6E] hover:bg-[#F9F1D8] rounded-lg transition-colors border border-transparent hover:border-[#E8BC6E]/30"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-1.5 lg:p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => {
              const status = getStockStatus(product.quantity);
              return (
                <div
                  key={product.productId}
                  className="p-4 border-b border-red-20 border-gray-100 last:border-none flex items-center gap-4 hover:bg-gray-50"
                >
                  <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={
                        product.imageUrl || "https://via.placeholder.com/150"
                      }
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#2D2D2D] truncate">
                      {product.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-[#F3EFE0] text-[#593D31] px-2 py-0.5 rounded-full font-medium">
                        {product.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-bold text-[#E8BC6E]">
                        C${product.price}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${status.color}`}
                      >
                        {product.quantity} u.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStockClick(product)}
                      className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Boxes size={18} />
                    </button>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2 text-[#E8BC6E] bg-[#F9F1D8]/50 hover:bg-[#F9F1D8] rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400">
              No se encontraron productos
            </div>
          )}
        </div>

        {filteredProducts.length > 0 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-500">
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredProducts.length,
              )}{" "}
              - {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
              de {filteredProducts.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveStock}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro que deseas eliminar "${selectedProduct?.name}"?`}
        confirmText="Sí, eliminar"
        variant="danger"
      />
    </div>
  );
};
