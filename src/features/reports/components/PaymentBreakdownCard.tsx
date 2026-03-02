import { CreditCard, Banknote, ArrowRightLeft } from "lucide-react";
import { getCurrencySymbol } from "@/shared/utils/currency";

const fmtCompact = (n: number) =>
  `${getCurrencySymbol()} ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface PaymentItem {
  method: string;
  amount: number;
  count: number;
}

interface PaymentBreakdownCardProps {
  breakdown: PaymentItem[];
}

export const PaymentBreakdownCard = ({
  breakdown,
}: PaymentBreakdownCardProps) => {
  if (breakdown.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-blue-50/30">
        <h3 className="font-bold text-blue-800 flex items-center gap-2">
          <CreditCard size={18} /> Desglose por Método de Pago
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {breakdown.map((p) => (
            <div
              key={p.method}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                {p.method === "Efectivo" ? (
                  <Banknote size={20} className="text-blue-600" />
                ) : p.method === "Tarjeta" ? (
                  <CreditCard size={20} className="text-blue-600" />
                ) : (
                  <ArrowRightLeft size={20} className="text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{p.method}</p>
                <p className="text-xs text-gray-500">
                  {p.count} {p.count === 1 ? "operación" : "operaciones"}
                </p>
              </div>
              <p className="text-base font-bold text-[#2D2D2D] shrink-0">
                {fmtCompact(p.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
