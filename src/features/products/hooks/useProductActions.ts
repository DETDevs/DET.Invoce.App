import { useState, useEffect, useCallback } from "react";
import { productApi } from "@/api/products";
import inventoryApi from "@/api/inventory/InventoryAPI";
import type { TProduct } from "@/api/products/types";
import toast from "react-hot-toast";

export const useProductActions = () => {
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
        showInactive: false,
    });

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    useEffect(() => {
        let result = products;

        if (!filters.showInactive) {
            result = result.filter((product) => product.isActive);
        }

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
        setIsSaving(true);
        try {
            await productApi.save({
                productId: selectedProduct.productId,
                code: selectedProduct.code,
                categoryCode: selectedProduct.categoryCode ?? "",
                subCategoryId: selectedProduct.subCategoryId ?? undefined,
                name: selectedProduct.name,
                description: selectedProduct.description ?? "",
                price: selectedProduct.price,
                trackInventory: selectedProduct.trackInventory ?? true,
                unitId: selectedProduct.unitId ?? 0,
                divideQuantityBy: selectedProduct.divideQuantityBy ?? 0,
                isActive: false,
                quantity: selectedProduct.quantity ?? 0,
                stockMinimum: selectedProduct.stockMinimum ?? 0,
            });
            toast.success(`"${selectedProduct.name}" inactivado correctamente`);
            setIsDeleteModalOpen(false);
            await fetchProducts();
        } catch (err) {
            console.error("Error inactivating product:", err);
            toast.error("No se pudo inactivar el producto");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        products: paginatedProducts,
        filteredProducts,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        isFilterOpen,
        setIsFilterOpen,
        filters,
        setFilters,
        selectedProduct,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isStockModalOpen,
        setIsStockModalOpen,
        isSaving,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        getStockStatus,
        handleEditClick,
        handleDeleteClick,
        handleStockClick,
        handleSaveProduct,
        handleSaveStock,
        handleConfirmDelete,
    };
};
