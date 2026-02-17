import React, { useMemo, useState, useEffect, useTransition } from "react";
import { useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/features/orders/components/ProductCard";
import { TakeoutCartPanel } from "@/features/orders/components/TakeoutCartPanel";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useOrderLogic } from "@/features/orders/hooks/useOrderLogic";
import { Toaster } from "react-hot-toast";
import { PRODUCTS, CATEGORIES_DATA } from "@/features/orders/types/product";

const SETTINGS_STORAGE_KEY = "app-settings";

const getTableCount = (): number => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.tableCount || 6;
    }
  } catch {}
  return 6;
};

const getOptimizedImageUrl = (url: string) => {
  if (url.includes("images.unsplash.com")) {
    return `${url}?auto=format&fit=crop&w=400&q=80`;
  }
  return url;
};

const MemoizedProductCard = React.memo(ProductCard);

export const NewOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const tableCount = getTableCount();
  const location = useLocation();
  const isAddingToExisting = !!(location.state as any)?.addToTable;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES_DATA[0].name,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    CATEGORIES_DATA[0].subcategories[0],
  );

  const {
    cart,
    orderNumber,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    initializeCart,
    handleCheckout,
    handleRequestCancel,
    isDialogOpen,
    dialogTitle,
    dialogMessage,
    confirmText,
    cancelText,
    handleConfirmDialog,
    handleCloseDialog,
  } = useOrderLogic(isAddingToExisting);

  useEffect(() => {
    const state = location.state as {
      reprocessFrom?: string;
      items?: {
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
      }[];
      addToTable?: number;
      addToCuentaId?: string;
      cuentaNumber?: number;
    } | null;

    if (state?.reprocessFrom && state.items) {
      const cartItems = state.items.map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (product) {
          return { ...product, quantity: item.quantity };
        }
        return {
          id: item.productId,
          name: item.productName,
          price: item.unitPrice,
          category: "Panadería y Repostería" as const,
          subcategory: "General",
          image: "",
          quantity: item.quantity,
        };
      });

      if (cartItems.length > 0) {
        initializeCart(cartItems);
        setIsCartOpen(true);
      }

      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleCategorySelect = (categoryName: string) => {
    if (selectedCategory === categoryName) return;

    startTransition(() => {
      setSelectedCategory(categoryName);
      const category = CATEGORIES_DATA.find((c) => c.name === categoryName);
      if (category && category.subcategories.length > 0) {
        setSelectedSubcategory(category.subcategories[0]);
      } else {
        setSelectedSubcategory(null);
      }
    });
  };

  const handleSubcategorySelect = (subcat: string) => {
    if (selectedSubcategory === subcat) return;
    startTransition(() => {
      setSelectedSubcategory(subcat);
    });
  };

  const currentSubcategories = useMemo(() => {
    return (
      CATEGORIES_DATA.find((c) => c.name === selectedCategory)?.subcategories ||
      []
    );
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearchTerm(searchTerm);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter(
      (p) =>
        p.category === selectedCategory &&
        p.subcategory === selectedSubcategory,
    );

    if (debouncedSearchTerm) {
      const lowerTerm = debouncedSearchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerTerm));
    }

    return result;
  }, [selectedCategory, selectedSubcategory, debouncedSearchTerm]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <div className="h-screen w-full bg-[#FDFBF7] grid grid-rows-[1fr] min-[1400px]:grid-cols-[1fr_420px] overflow-hidden">
      <Toaster position="top-center" />
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDialog}
        title={dialogTitle}
        message={dialogMessage}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="danger"
      />

      <main className="grid grid-rows-[auto_1fr] h-full w-full max-w-[100vw] overflow-hidden min-[1400px]:border-r min-[1400px]:border-gray-200">
        <div>
          <div className="p-4 sm:p-6 lg:p-8 pb-4 z-10 bg-[#FDFBF7]">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-4 lg:mb-6">
              Nueva Orden
            </h1>
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] shadow-sm"
              />
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div
              className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-hide overscroll-x-contain scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
            >
              {CATEGORIES_DATA.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? "bg-[#593D31] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div
              className="flex gap-2 pt-3 overflow-x-auto scrollbar-hide overscroll-x-contain scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
            >
              {currentSubcategories.map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => handleSubcategorySelect(subcat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedSubcategory === subcat
                      ? "bg-[#E8BC6E] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto pt-6 pb-28 lg:pb-8 scrollbar-hide w-full">
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-[1400px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8 transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <MemoizedProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image: getOptimizedImageUrl(product.image),
                  }}
                  onClick={addToCart}
                  hidePrice
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-500">
                <p>No se encontraron productos.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="hidden min-[1400px]:block h-full shadow-lg overflow-hidden">
        <TakeoutCartPanel
          cart={cart}
          orderNumber={orderNumber}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onOrderSent={handleCheckout}
          onCancel={handleRequestCancel}
          tableCount={tableCount}
          preselectedTable={(location.state as any)?.addToTable}
          preselectedCuentaId={(location.state as any)?.addToCuentaId}
          preselectedCuentaNumber={(location.state as any)?.cuentaNumber}
        />
      </div>

      <div className="min-[1400px]:hidden">
        {cart.length > 0 && !isCartOpen && !isDialogOpen && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-4 right-4 z-30 bg-[#593D31] text-white rounded-full shadow-lg p-4 flex items-center gap-3 animate-fade-in-up"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
              <span className="text-lg font-bold">Ver Orden</span>
            </div>
          </button>
        )}

        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
            isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsCartOpen(false)}
        />

        <div
          className={`
            fixed z-50 bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden
            bottom-0 left-0 right-0 
            h-[92vh] w-full 
            rounded-t-3xl 
            ${isCartOpen ? "translate-y-0" : "translate-y-full"}
            md:bottom-auto md:top-1/2 md:left-1/2 
            md:h-[85vh] md:w-[480px] 
            md:rounded-2xl 
            ${
              isCartOpen
                ? "md:-translate-x-1/2 md:-translate-y-1/2 md:opacity-100 md:scale-100"
                : "md:-translate-x-1/2 md:-translate-y-[40%] md:opacity-0 md:scale-95 md:pointer-events-none"
            }
          `}
        >
          <div
            className="w-full flex items-center justify-center pt-5 pb-3 relative bg-white border-b border-gray-50 flex-shrink-0 touch-none"
            onClick={() => setIsCartOpen(false)}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer opacity-80 md:hidden" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCartOpen(false);
              }}
              className="absolute right-5 top-4 p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-white">
            <TakeoutCartPanel
              cart={cart}
              orderNumber={orderNumber}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onOrderSent={handleCheckout}
              onCancel={handleRequestCancel}
              tableCount={tableCount}
              preselectedTable={(location.state as any)?.addToTable}
              preselectedCuentaId={(location.state as any)?.addToCuentaId}
              preselectedCuentaNumber={(location.state as any)?.cuentaNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
