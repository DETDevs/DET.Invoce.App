import { useCashBox } from "@/features/settings/pages/CashBoxContext";
import { type Settings } from "@/features/settings/types";
import { Lock } from "lucide-react";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const CashBoxSettings = ({ settings }: Props) => {
  const { session } = useCashBox();

  const currencySymbol = settings.mainCurrency === "NIO" ? "C$" : "$";
  const currentAmount = session?.initialAmount ?? 0;
  const isOpen = session?.isOpen ?? false;

  return (
    <div>
      <label
        htmlFor="initialCashBox"
        className="block text-sm font-medium text-gray-600 mb-1.5"
      >
        Monto en Caja Hoy
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {currencySymbol}
        </span>
        <input
          type="number"
          id="initialCashBox"
          name="initialCashBox"
          value={currentAmount}
          disabled
          className="w-full pl-8 pr-10 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-not-allowed"
        />
        <Lock
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div
          className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-gray-300"}`}
        />
        <p className="text-xs text-gray-400">
          {isOpen
            ? `Caja abierta — ${currencySymbol}${currentAmount.toLocaleString("es-NI")} de apertura`
            : "Caja cerrada"}
        </p>
      </div>
    </div>
  );
};
