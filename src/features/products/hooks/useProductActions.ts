import { useState, useEffect, useCallback } from "react";
import { productApi } from "@/api/products";
import inventoryApi from "@/api/inventory/InventoryAPI";
import categoryApi from "@/api/category/CategoryAPI";
import type { TProduct } from "@/api/products/types";
import type { TCategory } from "@/api/category/types";
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
        subCategory: "",
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

    const [categories, setCategories] = useState<TCategory[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [data, cats] = await Promise.all([
                productApi.getByCode(),
                categoryApi.getAll(),
            ]);
            setProducts(data.filter((p) => p.code !== "PERSONALIZADO"));
            setFilteredProducts(data.filter((p) => p.code !== "PERSONALIZADO"));
            setCategories(cats.filter((c) => c.isActive && c.categoryCode !== "CUSTOM"));
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

        if (filters.subCategory) {
            result = result.filter(
                (product) => product.subCategoryName === filters.subCategory,
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

    const getStockStatus = (stock: number, stockMinimum: number = 0) => {
        const minThreshold = stockMinimum > 0 ? stockMinimum : 5;
        if (stock <= minThreshold) {
            return {
                color: "text-red-600 bg-red-50 border-red-100",
                label: "Crítico",
            };
        } else if (stock <= minThreshold * 2) {
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

    const handleSaveProduct = async (updatedProduct: any, imageFile?: File | null) => {
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
                imageUrl: updatedProduct.imageUrl ?? "",
                trackInventory: updatedProduct.trackInventory ?? true,
                unitId: updatedProduct.unitId ?? 0,
                divideQuantityBy: updatedProduct.divideQuantityBy ?? 0,
                isActive: updatedProduct.isActive ?? true,
                quantity: 0, 
                stockMinimum: updatedProduct.stockMinimum ?? 0,
            }, imageFile);

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
        _reason: string,
    ) => {
        const product = products.find((p) => p.productId === productId);
        if (!product) return;

        const currentStock = product.quantity ?? 0;
        const delta = newStock - currentStock;

        if (delta === 0) return; 

        try {
            if (delta > 0) {
                
                await inventoryApi.save({
                    inventoryId: 0,
                    productCode: product.code,
                    quantityInStock: delta,
                    minimumStock: product.stockMinimum ?? 0,
                });
            } else {
                
                await inventoryApi.output({
                    productCode: product.code,
                    quantityInStock: Math.abs(delta),
                });
            }
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
                quantity: 0, 
                stockMinimum: selectedProduct.stockMinimum ?? 0,
            }, null);
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
        categories,
        subCategories: (() => {
            if (!filters.category) return [];
            const cat = categories.find((c) => c.categoryName === filters.category);
            if (!cat?.subCategories) return [];
            return cat.subCategories
                .filter((s) => s.isActive)
                .map((s) => s.name)
                .sort();
        })(),
        getStockStatus,
        handleEditClick,
        handleDeleteClick,
        handleStockClick,
        handleSaveProduct,
        handleSaveStock,
        handleConfirmDelete,
    };
};
