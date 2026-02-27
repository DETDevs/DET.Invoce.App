import React, { useState, useEffect } from "react";
import { PiggyBank } from "lucide-react";

interface Props {
  isOpen: boolean;
  onSubmit: (amount: number) => void;
  onClose?: () => void;
  defaultAmount: number;
}

export const OpenCashBoxModal = ({
  isOpen,
  onSubmit,
  onClose,
  defaultAmount,
}: Props) => {
  const [amount, setAmount] = useState(String(defaultAmount));

  useEffect(() => {
    setAmount(String(defaultAmount));
  }, [defaultAmount]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount >= 0) {
      onSubmit(numericAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-[#E8BC6E]/10 rounded-full mb-4">
              <PiggyBank size={40} className="text-[#E8BC6E]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
              Apertura de Caja
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Ingresa el monto inicial para comenzar las operaciones del día.
            </p>
          </div>

          <div className="mt-8">
            <label
              htmlFor="initialAmount"
              className="block text-sm font-medium text-gray-600 mb-1.5"
            >
              Monto Inicial (C$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                C$
              </span>
              <input
                type="number"
                id="initialAmount"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/80 text-xl font-bold text-center"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={!amount || parseFloat(amount) < 0}
            className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#593D31] text-white text-base font-bold shadow-md hover:bg-[#4a3228] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Día
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full h-10 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Continuar sin caja
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
