import { useState } from "react";
import {
  Check,
  Lock,
  FileText,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from "lucide-react";
import type { CashCloseReportData } from "@/features/reports/types";

interface CashCloseConfirmModalProps {
  isOpen: boolean;
  data: CashCloseReportData;
  onConfirm: () => void;
  onCancel: () => void;
}

const fmt = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const CashCloseConfirmModal = ({
  isOpen,
  data,
  onConfirm,
  onCancel,
}: CashCloseConfirmModalProps) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleClose = () => {
    onCancel();
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!confirmed) return;
    onConfirm();
    setConfirmed(false);
  };

  if (!isOpen) return null;

  const findPayment = (keywords: string[]) =>
    data.paymentBreakdown.find((p) =>
      keywords.some((k) => p.method.toUpperCase().includes(k)),
    );

  const cashEntry = findPayment(["CASH", "EFECTIVO"]);
  const cashSales = cashEntry?.amount ?? 0;
  const cashSalesCount = cashEntry?.count ?? 0;

  const cardEntry = findPayment(["CARD", "TARJETA"]);
  const cardSales = cardEntry?.amount ?? 0;
  const cardSalesCount = cardEntry?.count ?? 0;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="text-center px-6 pt-6 pb-4">
          <div className="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
            <Lock size={24} className="text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-[#2D2D2D]">Cerrar Caja</h3>
          <p className="text-sm text-gray-500 mt-1">
            Revisá el resumen del turno antes de cerrar.
          </p>
        </div>

        {/* Breakdown */}
        <div className="px-6 pb-4 space-y-4">
          {/* Sales summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Resumen del Turno
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <FileText size={14} className="text-gray-400" />
                  Facturas generadas
                </span>
                <span className="font-bold text-[#2D2D2D]">
                  {data.invoiceCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <Wallet size={14} className="text-emerald-500" />
                  Ventas en efectivo
                </span>
                <span className="font-bold text-[#2D2D2D]">
                  {fmt(cashSales)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({cashSalesCount})
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={14} className="text-sky-500" />
                  Ventas con tarjeta
                </span>
                <span className="font-bold text-[#2D2D2D]">
                  {fmt(cardSales)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({cardSalesCount})
                  </span>
                </span>
              </div>
              {data.cashInTotal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <ArrowUpRight size={14} className="text-emerald-500" />
                    Otros ingresos
                  </span>
                  <span className="font-bold text-[#2D2D2D]">
                    {fmt(data.cashInTotal)}
                  </span>
                </div>
              )}
              {data.cashOutTotal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <ArrowDownRight size={14} className="text-red-500" />
                    Egresos
                  </span>
                  <span className="font-bold text-red-600">
                    -{fmt(data.cashOutTotal)}
                  </span>
                </div>
              )}
              {data.returnsTotal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <RotateCcw size={14} className="text-amber-500" />
                    Devoluciones
                  </span>
                  <span className="font-bold text-red-600">
                    -{fmt(data.returnsTotal)}
                    <span className="text-xs text-gray-400 ml-1">
                      ({data.returnsCount})
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total in register */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
              💰 Total Esperado en Caja
            </h4>
            <div className="space-y-1 text-sm text-emerald-800">
              <div className="flex justify-between">
                <span>Fondo inicial</span>
                <span className="font-medium">{fmt(data.initialAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) Ventas</span>
                <span className="font-medium">{fmt(data.salesTotal)}</span>
              </div>
              {data.cashInTotal > 0 && (
                <div className="flex justify-between">
                  <span>(+) Otros ingresos</span>
                  <span className="font-medium">{fmt(data.cashInTotal)}</span>
                </div>
              )}
              {(data.cashOutTotal > 0 || data.returnsTotal > 0) && (
                <div className="flex justify-between">
                  <span>(-) Salidas</span>
                  <span className="font-medium">
                    {fmt(data.cashOutTotal + data.returnsTotal)}
                  </span>
                </div>
              )}
              <div className="border-t border-emerald-300 pt-1.5 mt-1.5 flex justify-between">
                <span className="font-bold">Total Esperado</span>
                <span className="text-lg font-bold">
                  {fmt(data.expectedTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div
              className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                confirmed
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-gray-300 bg-white group-hover:border-emerald-300"
              }`}
              onClick={() => setConfirmed(!confirmed)}
            >
              {confirmed && <Check size={12} />}
            </div>
            <span
              className="text-sm text-gray-700 leading-snug select-none"
              onClick={() => setConfirmed(!confirmed)}
            >
              Conté mi efectivo y cuadra con el monto esperado
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Sí, Cerrar Caja
          </button>
        </div>
      </div>
    </div>
  );
};
