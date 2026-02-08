import React, { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ProductCarousel } from "../components/ProductCarousel";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";
import { OrderSummary } from "../components/OrderSummary";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { X } from "lucide-react";
import { useOrderLogic } from "../hooks/useOrderLogic";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Choco-lava Cake",
    price: 20,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
  },
  {
    id: 4,
    name: "Red Velvet",
    price: 18,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c",
  },
  {
    id: 7,
    name: "Tiramisu",
    price: 22,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
  },
  {
    id: 8,
    name: "Cheesecake",
    price: 19,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50",
  },
  {
    id: 9,
    name: "Carrot Cake",
    price: 16,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729",
  },
  {
    id: 14,
    name: "Pie de Limón",
    price: 15,
    category: "Pasteles",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13",
  },
  {
    id: 10,
    name: "Cappuccino",
    price: 3.5,
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
  },
  {
    id: 12,
    name: "Espresso",
    price: 2.5,
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04",
  },
  {
    id: 13,
    name: "Mocha",
    price: 4.5,
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e",
  },
  {
    id: 2,
    name: "Garlic Bread",
    price: 5,
    category: "Otros",
    image: "https://images.unsplash.com/photo-1573140247632-f84660f67126",
  },
  {
    id: 5,
    name: "Croissant",
    price: 4,
    category: "Otros",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
  },
  {
    id: 6,
    name: "Muffin",
    price: 3,
    category: "Otros",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
  },
];

const CATEGORIES = ["Pasteles", "Cafes", "Otros"] as const;

export const NewOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    cart,
    total,
    orderNumber,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    handleCheckout,
    handleRequestCancel,
    isDialogOpen,
    dialogTitle,
    dialogMessage,
    confirmText,
    cancelText,
    handleConfirmDialog,
    handleCloseDialog,
  } = useOrderLogic();

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <div className="h-screen w-full bg-[#FDFBF7] grid grid-rows-[1fr] min-[1400px]:grid-cols-[1fr_420px] overflow-hidden">
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

        <div className="overflow-y-auto pt-2 pb-28 lg:pb-8 scrollbar-hide w-full">
          {searchTerm ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-[1400px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={`${product.id}-${product.name}`}
                  product={product}
                  onClick={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 w-full max-w-full">
              {CATEGORIES.map((cat) => {
                const catProducts = PRODUCTS.filter((p) => p.category === cat);
                if (catProducts.length === 0) return null;
                return (
                  <ProductCarousel
                    key={cat}
                    title={cat}
                    products={catProducts}
                    onAdd={addToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      <div className="hidden min-[1400px]:block h-full shadow-lg overflow-hidden">
        <OrderSummary
          cart={cart}
          subtotal={total}
          orderNumber={orderNumber}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onCheckout={handleCheckout}
          onCancel={handleRequestCancel}
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
              <span className="text-lg font-bold">C$ {total.toFixed(2)}</span>
            </div>
          </button>
        )}

        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
            <OrderSummary
              cart={cart}
              subtotal={total}
              orderNumber={orderNumber}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onCheckout={handleCheckout}
              onCancel={handleRequestCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
