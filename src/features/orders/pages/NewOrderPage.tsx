import React, { useMemo, useState } from "react";
import { Search, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { ProductCarousel, type Product } from "../components/ProductCarousel";
import toast from "react-hot-toast";

const PRODUCTS: Product[] = [
  { id: 1, name: "Choco-lava Cake", price: 20, category: "Pasteles", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
  { id: 4, name: "Red Velvet", price: 18, category: "Pasteles", image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c" },
  { id: 7, name: "Tiramisu", price: 22, category: "Pasteles", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9" },
  { id: 8, name: "Cheesecake", price: 19, category: "Pasteles", image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50" },
  { id: 9, name: "Carrot Cake", price: 16, category: "Pasteles", image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729" },
  { id: 14, name: "Pie de Limón", price: 15, category: "Pasteles", image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13" },
  { id: 10, name: "Cappuccino", price: 3.5, category: "Cafes", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d" },
  { id: 12, name: "Espresso", price: 2.5, category: "Cafes", image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04" },
  { id: 13, name: "Mocha", price: 4.5, category: "Cafes", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e" },
  { id: 2, name: "Garlic Bread", price: 5, category: "Otros", image: "https://images.unsplash.com/photo-1573140247632-f84660f67126" },
  { id: 5, name: "Croissant", price: 4, category: "Otros", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a" },
  { id: 6, name: "Muffin", price: 3, category: "Otros", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa" },
];

const CATEGORIES = ["Pasteles", "Cafes", "Otros"] as const;

type CartItem = Product & { quantity: number };

export const NewOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing
        ? prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
    );
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));
  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const filteredProducts = useMemo(
    () => PRODUCTS.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm],
  );

  return (
    <div className="grid h-screen w-full bg-[#FDFBF7] grid-cols-[75%_25%] overflow-hidden">
      
      <main className="flex flex-col h-full overflow-hidden relative border-r border-gray-200">
        <div className="p-8 pb-4 flex-shrink-0 z-10 bg-[#FDFBF7]">
          <h1 className="text-3xl font-bold text-[#2D2D2D] mb-6">Nueva Orden</h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-2 pb-20 scrollbar-hide">
          {searchTerm ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={`${product.id}-${product.name}`}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:border-[#E8BC6E] transition-all"
                >
                  <img src={product.image} className="h-32 w-full object-cover rounded-xl mb-3" />
                  <h4 className="font-bold text-[#2D2D2D] text-sm">{product.name}</h4>
                  <span className="text-[#E8BC6E] font-bold text-sm">C$ {product.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8 w-full min-w-0">
              {CATEGORIES.map((cat) => {
                const catProducts = PRODUCTS.filter((p) => p.category === cat);
                if (catProducts.length === 0) return null;
                return <ProductCarousel key={cat} title={cat} products={catProducts} onAdd={addToCart} />;
              })}
            </div>
          )}
        </div>
      </main>

     <aside className="bg-white shadow-xl h-full grid grid-rows-[auto_1fr_auto] overflow-hidden z-20 relative">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2D2D2D]">Detalle Orden</h2>
          <span className="bg-[#F9F1D8] text-[#593D31] text-xs font-bold px-2 py-1 rounded-lg">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <ShoppingBag size={48} className="mb-2 opacity-50" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.name}`} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-xl group">
                <img src={item.image} className="h-14 w-14 rounded-lg object-cover border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#2D2D2D] text-sm truncate">{item.name}</h4>
                  <p className="text-[#E8BC6E] font-bold text-xs">C$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-[#2D2D2D]">Total</span>
            <span className="text-2xl font-bold text-[#2D2D2D]">C$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => {
              if (cart.length > 0) {
                toast.success("Facturado correctamente");
                setCart([]);
              }
            }}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Facturar
          </button>
        </div>
      </aside>
    </div>
  );
};