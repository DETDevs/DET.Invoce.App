import { useState } from "react";

interface CashCloseConfirmModalProps {
  isOpen: boolean;
  expectedTotal: number;
  onConfirm: (closingAmount: number) => void;
  onCancel: () => void;
}

export const CashCloseConfirmModal = ({
  isOpen,
  expectedTotal,
  onConfirm,
  onCancel,
}: CashCloseConfirmModalProps) => {
  const [closingAmount, setClosingAmount] = useState("");

  const closingNum = parseFloat(closingAmount) || 0;
  const difference = closingNum - expectedTotal;
  const hasFaltante = closingAmount !== "" && difference < 0;

  const handleClose = () => {
    onCancel();
    setClosingAmount("");
  };

  const handleConfirm = () => {
    if (hasFaltante || closingAmount === "") return;
    onConfirm(closingNum);
    setClosingAmount("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h3 className="text-xl font-bold text-[#2D2D2D]">Cerrar Caja</h3>
          <p className="text-sm text-gray-500 mt-2">
            Ingresá el monto total que hay en caja para cerrar.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              Monto Esperado
            </label>
            <p className="text-2xl font-bold text-[#593D31]">
              C$ {expectedTotal.toFixed(2)}
            </p>
          </div>

          <div>
            <label
              htmlFor="closingAmount"
              className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5"
            >
              Monto Real en Caja
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                C$
              </span>
              <input
                type="number"
                id="closingAmount"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !hasFaltante &&
                  closingAmount !== "" &&
                  handleConfirm()
                }
                className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent text-lg font-bold text-[#2D2D2D]"
                placeholder={expectedTotal.toFixed(2)}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
          </div>
        </div>

        {closingAmount !== "" && (
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              difference >= 0
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                difference >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {difference >= 0 ? "✅ Sobrante" : "⚠️ Faltante"}
            </span>
            <span
              className={`text-lg font-bold ${
                difference >= 0 ? "text-green-800" : "text-red-800"
              }`}
            >
              C$ {Math.abs(difference).toFixed(2)}
            </span>
          </div>
        )}

        {hasFaltante && (
          <p className="text-xs text-red-600 font-medium text-center">
            No se puede cerrar la caja con faltante. Verificá el dinero en caja.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={closingAmount === "" || hasFaltante}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sí, Cerrar Caja
          </button>
        </div>
      </div>
    </div>
  );
};
