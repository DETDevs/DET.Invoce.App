import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import settingsApi from "@/api/settings/SettingsAPI";

interface CurrencyAmountInputProps {
  totalInCordobas: number;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  onConvertedValueChange?: (cordobaValue: number) => void;
  onEnter?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const CurrencyAmountInput = ({
  totalInCordobas,
  amountPaid,
  onAmountPaidChange,
  onConvertedValueChange,
  onEnter,
  placeholder,
  compact = false,
}: CurrencyAmountInputProps) => {
  const [currency, setCurrency] = useState<"NIO" | "USD">("NIO");
  const [exchangeRate, setExchangeRate] = useState(36.5);

  useEffect(() => {
    settingsApi
      .getCurrent("NIO")
      .then((res) => {
        if (res && res.rate) {
          setExchangeRate(res.rate);
        }
      })
      .catch(() => {});
  }, []);

  const paidNum = parseFloat(amountPaid) || 0;

  const paidInCordobas = currency === "USD" ? paidNum * exchangeRate : paidNum;

  const change = paidInCordobas - totalInCordobas;

  useEffect(() => {
    onConvertedValueChange?.(paidInCordobas);
  }, [paidInCordobas]);

  const currencySymbol = currency === "NIO" ? "C$" : "$";

  const handleAmountChange = (value: string) => {
    onAmountPaidChange(value);
  };

  return (
    <div className={`space-y-2 ${compact ? "" : "animate-fade-in"}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-500 uppercase">
          Monto Recibido
        </label>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => {
              setCurrency("NIO");
              onAmountPaidChange("");
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              currency === "NIO"
                ? "bg-white text-[#593D31] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            C$
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrency("USD");
              onAmountPaidChange("");
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-0.5 ${
              currency === "USD"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <DollarSign size={11} /> USD
          </button>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
          {currencySymbol}
        </span>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => handleAmountChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
          className={`w-full pl-8 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] font-bold ${
            compact ? "py-2 text-sm" : "py-2.5 text-sm"
          }`}
          placeholder={
            placeholder ||
            (currency === "USD"
              ? (totalInCordobas / exchangeRate).toFixed(2)
              : totalInCordobas.toFixed(2))
          }
          min="0"
          step="0.01"
        />
      </div>

      {currency === "USD" && amountPaid !== "" && (
        <div className="flex justify-between items-center px-2 py-1.5 bg-blue-50 rounded-lg text-xs">
          <span className="text-blue-600 font-medium">Equivale a</span>
          <span className="text-blue-800 font-bold">
            C$ {paidInCordobas.toFixed(2)}
          </span>
        </div>
      )}

      {amountPaid !== "" && (
        <div
          className={`flex justify-between items-center p-2.5 rounded-lg ${
            change >= 0
              ? "bg-green-100 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span className="font-bold text-sm">
            {change >= 0 ? "Cambio" : "Faltante"}
          </span>
          <span className="font-bold text-sm">
            C$ {Math.abs(change).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
