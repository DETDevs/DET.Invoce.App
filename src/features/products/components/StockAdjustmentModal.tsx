import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  ArrowRight,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  stock: number;
  image: string;
  category: string;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productId: number, newStock: number, reason: string) => void;
}

const REASONS_IN = [
  { value: "purchase", label: "Compra / Reabastecimiento" },
  { value: "return", label: "Devolución de Cliente" },
  { value: "adjustment_in", label: "Ajuste de Entrada" },
];

const REASONS_OUT = [
  { value: "sale", label: "Venta Directa" },
  { value: "damage", label: "Merma / Daño" },
  { value: "internal", label: "Consumo Interno" },
  { value: "adjustment_out", label: "Ajuste de Salida" },
];

export const StockAdjustmentModal = ({
  isOpen,
  onClose,
  product,
  onSave,
}: StockAdjustmentModalProps) => {
  const [adjustment, setAdjustment] = useState<string | number>("");
  const [type, setType] = useState<"in" | "out">("in");
  const [reason, setReason] = useState("purchase");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAdjustment("");
      setType("in");
      setReason("purchase");
      setNote("");
    }
  }, [isOpen]);

  useEffect(() => {
    setReason(type === "in" ? "purchase" : "damage");
  }, [type]);

  const handleQuickAdd = (amount: number) => {
    setAdjustment((prev) => {
      const val = typeof prev === "string" ? 0 : prev;
      return val + amount;
    });
  };

  const incrementAdjustment = () => {
    setAdjustment((prev) => {
      const val = typeof prev === "string" ? 0 : prev;
      return val + 1;
    });
  };

  const decrementAdjustment = () => {
    setAdjustment((prev) => {
      const val = typeof prev === "string" ? 0 : prev;
      return Math.max(0, val - 1);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setAdjustment("");
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0) {
      setAdjustment(num);
    }
  };

  const numAdjustment = typeof adjustment === "string" ? 0 : adjustment;
  const finalStock = product
    ? type === "in"
      ? product.stock + numAdjustment
      : product.stock - numAdjustment
    : 0;

  const handleSubmit = () => {
    if (product) {
      onSave(product.id, finalStock, reason);
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#FDFBF7]">
          <h2 className="text-xl font-bold text-[#2D2D2D] flex items-center gap-2">
            <Package className="text-[#E8BC6E]" size={24} />
            Registrar Movimiento
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
            />
            <div>
              <h3 className="font-bold text-[#2D2D2D]">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Stock Actual:{" "}
                <span className="font-bold text-[#2D2D2D]">
                  {product.stock}
                </span>
              </p>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setType("in")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === "in"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp size={16} /> Entrada (+)
            </button>
            <button
              onClick={() => setType("out")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === "out"
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingDown size={16} /> Salida (-)
            </button>
          </div>

          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={decrementAdjustment}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors active:scale-95"
              >
                <Minus size={20} />
              </button>

              <div className="relative w-[120px]">
                <input
                  type="number"
                  value={adjustment}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={`w-full text-center text-5xl font-bold bg-transparent border-b-2 outline-none py-2 placeholder-gray-200 ${
                    type === "in"
                      ? "text-green-600 border-green-200 focus:border-green-500"
                      : "text-red-500 border-red-200 focus:border-red-500"
                  }`}
                  autoFocus
                />
              </div>

              <button
                onClick={incrementAdjustment}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors active:scale-95 shadow-sm ${
                  type === "in"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <Plus size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide">
              Cantidad a {type === "in" ? "Agregar" : "Retirar"}
            </p>

            <div className="flex gap-2 mt-4">
              {[5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickAdd(amt)}
                  className="px-3 py-1 text-xs font-bold bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#FDFBF7] p-4 rounded-xl border border-[#E8BC6E]/20 mb-6">
            <div className="text-center">
              <span className="block text-xs text-gray-500 uppercase font-bold">
                Antes
              </span>
              <span className="text-lg font-bold text-gray-400">
                {product.stock}
              </span>
            </div>
            <ArrowRight className="text-[#E8BC6E]" />
            <div className="text-center">
              <span className="block text-xs text-gray-500 uppercase font-bold">
                Después
              </span>
              <span
                className={`text-2xl font-bold ${type === "in" ? "text-green-600" : "text-red-500"}`}
              >
                {finalStock < 0 ? 0 : finalStock}
              </span>
            </div>
          </div>

          {/* Formulario Detalles */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Motivo
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
              >
                {(type === "in" ? REASONS_IN : REASONS_OUT).map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nota (Opcional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Factura #123..."
                rows={2}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={numAdjustment <= 0 || finalStock < 0}
            className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${
              type === "in"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            <Save size={18} />
            {type === "in" ? "Registrar Entrada" : "Registrar Salida"}
          </button>
        </div>
      </div>
    </div>
  );
};
