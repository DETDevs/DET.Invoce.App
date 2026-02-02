import React, { useState, useEffect } from "react";
import { Plus, Filter, Edit, Trash2, Search } from "lucide-react";
import { FilterPanel } from "../components/FilterPanel";
import { EditProductModal } from "../components/EditProductModal";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Choco-lava Cake",
    price: 20,
    stock: 25,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
  },
  {
    id: 2,
    name: "Garlic Bread",
    price: 5,
    stock: 25,
    category: "Panes",
    image: "https://images.unsplash.com/photo-1573140247632-f84660f67126",
  },
  {
    id: 3,
    name: "Choco-lava Pastry",
    price: 15,
    stock: 12,
    category: "Pastry",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d",
  },
  {
    id: 4,
    name: "Red Velvet Slice",
    price: 18,
    stock: 8,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c",
  },
  {
    id: 5,
    name: "Croissant",
    price: 4,
    stock: 30,
    category: "Panes",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
  },
  {
    id: 6,
    name: "Blueberry Muffin",
    price: 3,
    stock: 15,
    category: "Pastry",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
  },
  {
    id: 7,
    name: "Tiramisu",
    price: 22,
    stock: 5,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
  },
];

export const ProductsPage = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(INITIAL_PRODUCTS);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.category) {
      result = result.filter(
        (product) => product.category === filters.category,
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

  const handleSaveProduct = (updatedProduct: any) => {
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
  };

  const handleConfirmDelete = () => {
    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-8 bg-[#FDFBF7] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2D2D2D]">Productos</h1>
        <button
          onClick={() => navigate("/nuevo-producto")}
          className="flex items-center gap-2 bg-[#E8BC6E] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#dca34b] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#E8BC6E] focus:border-[#E8BC6E] sm:text-sm transition duration-150 ease-in-out"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors ${
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#2D2D2D]">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        C${product.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F3EFE0] text-[#593D31]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-[#E8BC6E] hover:bg-[#F9F1D8] rounded-lg transition-colors border border-transparent hover:border-[#E8BC6E]/30"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
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

        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredProducts.length,
              )}{" "}
              a {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
              de {filteredProducts.length} productos
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro que deseas eliminar "${selectedProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        variant="danger"
      />
    </div>
  );
};
