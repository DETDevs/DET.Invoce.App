import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Card } from "@/shared/ui/Card";

type LowStockProduct = {
  id: number;
  name: string;
  stock: number;
  minStock: number;
  image: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: LowStockProduct[];
}

export const LowStockProductsModal = ({ isOpen, onClose, products }: Props) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] flex flex-col animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Productos con Bajo Inventario
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 bg-gray-50/80 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <p className="font-bold text-[#2D2D2D]">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    Mínimo requerido: {product.minStock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-500">
                    {product.stock}
                  </p>
                  <p className="text-xs text-gray-500">en stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
