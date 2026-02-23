import { useState } from "react";
import { X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import toast from "react-hot-toast";
import type {
  MovementType,
  MovementTypeOption,
} from "@/features/cash-movements/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (movement: {
    cashMovementTypeId: number;
    amount: number;
    description: string;
  }) => void;
  cashInTypes: MovementTypeOption[];
  cashOutTypes: MovementTypeOption[];
}

export const AddCashMovementModal = ({
  isOpen,
  onClose,
  onAdd,
  cashInTypes,
  cashOutTypes,
}: Props) => {
  const [type, setType] = useState<MovementType>("cash-in");
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const categories = type === "cash-in" ? cashInTypes : cashOutTypes;

  const currentTypeId =
    selectedTypeId ||
    (categories.length > 0 ? categories[0].cashMovementTypeId : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      toast.error("La descripción debe tener al menos 5 caracteres");
      return;
    }

    if (!currentTypeId) {
      toast.error("Selecciona un tipo de movimiento");
      return;
    }

    onAdd({
      cashMovementTypeId: currentTypeId,
      amount: amountNum,
      description: description.trim(),
    });

    toast.success("Movimiento registrado exitosamente");
    handleClose();
  };

  const handleClose = () => {
    setType("cash-in");
    setSelectedTypeId(0);
    setAmount("");
    setDescription("");
    setNotes("");
    onClose();
  };

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    setSelectedTypeId(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
          <h2 className="text-2xl font-bold text-[#2D2D2D]">
            Nuevo Movimiento de Caja
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("cash-in")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === "cash-in"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <ArrowDownToLine size={24} />
                  <span className="font-bold">Cash In</span>
                  <span className="text-xs">Ingreso</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("cash-out")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === "cash-out"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <ArrowUpFromLine size={24} />
                  <span className="font-bold">Cash Out</span>
                  <span className="text-xs">Salida</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={currentTypeId}
              onChange={(e) => setSelectedTypeId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-gray-900"
              required
            >
              {categories.map((cat) => (
                <option
                  key={cat.cashMovementTypeId}
                  value={cat.cashMovementTypeId}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                C$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-gray-900"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-gray-900"
              placeholder="Ej: Pago a proveedor de harina"
              required
              minLength={5}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-gray-900 resize-none"
              placeholder="Ej: Factura #4521, billetes de C$20 y C$50"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-[#E8BC6E] text-white font-bold hover:bg-[#dca34b] transition-colors shadow-md"
            >
              Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
