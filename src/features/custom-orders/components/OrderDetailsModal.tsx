import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Coins,
  X,
  Printer,
  FileText,
  Loader2,
  User,
  Calendar,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Package,
  Ban,
  Banknote,
  CreditCard,
} from "lucide-react";

import type { Order, OrderStatus } from "@/shared/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { CurrencyAmountInput } from "@/features/shared/components/CurrencyAmountInput";
import reservationOrderApi from "@/api/reservation-order/ReservationOrderAPI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onInvoice: (orderId: string, paymentMethod: string) => void;
  onMoveStatus: (orderId: string, newStatus: OrderStatus) => void;
  onRegisterPayment: (orderId: string, amount: number) => void;
  onCancelOrder?: (orderId: string) => void;
  onReprint?: (orderId: string) => void;
  readOnly?: boolean;
  isInvoicing?: boolean;
}

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: {
    label: "Pendiente",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  production: {
    label: "En Proceso",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ready: {
    label: "Listo",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  delivered: {
    label: "Entregado",
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

export const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onInvoice,
  onMoveStatus,
  onRegisterPayment,
  onCancelOrder,
  onReprint,
  readOnly = false,
  isInvoicing = false,
}: Props) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [convertedCordobaValue, setConvertedCordobaValue] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [fetchedItems, setFetchedItems] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { user } = useAuthStore();
  const canInvoice = user?.role === "cajero" || user?.role === "admin";

  useEffect(() => {
    if (!isOpen || !order) {
      setFetchedItems([]);
      return;
    }
    if (order.items.length > 0) {
      setFetchedItems(order.items);
      return;
    }
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await reservationOrderApi.get(order.id);
        const details = Array.isArray(res?.details) ? res.details : [];
        const items = details.map(
          (d: any) =>
            `${d.quantity}x ${d.productName || d.notes || d.productCode || "Producto"}`,
        );
        setFetchedItems(
          items.length > 0 ? items : ["Sin productos registrados"],
        );
      } catch {
        setFetchedItems(["Error al cargar productos"]);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const displayItems = fetchedItems.length > 0 ? fetchedItems : order.items;
  const remaining = order.total - order.deposit;
  const isPaid = remaining <= 0;
  const statusInfo = STATUS_LABELS[order.status];

  const handleClose = () => {
    setPaymentAmount("");
    setConvertedCordobaValue(0);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleConfirmPayment = () => {
    const amount = convertedCordobaValue;
    if (amount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    const toRegister = Math.min(amount, remaining);
    onRegisterPayment(order.id, toRegister);
    setPaymentAmount("");
    setConvertedCordobaValue(0);
  };

  const inputValue = Number(paymentAmount) || 0;
  const change = inputValue > remaining ? inputValue - remaining : 0;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-NI", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* ═══════════════════ HEADER ═══════════════════ */}
        <div className="relative p-5 pb-4 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="pr-8">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Pedido
            </p>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">
              #{order.id}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  order.paymentStatus === "Pagado"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : order.paymentStatus === "Abonado"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={13} className="text-gray-400" />
              {order.customer}
            </span>
            {order.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                {formatDate(order.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* ═══════════════════ BODY (scrollable) ═══════════════════ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Products */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Productos
            </h3>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {loadingDetails ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  <Loader2 className="inline animate-spin mr-2" size={14} />
                  Cargando productos...
                </div>
              ) : displayItems.length > 0 ? (
                <ul className="divide-y divide-gray-50">
                  {displayItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2.5 text-sm text-[#2D2D2D] flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-4 text-center text-gray-400 italic text-sm">
                  Sin productos registrados
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.status !== "delivered" && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Notas
              </h3>
              <p className="text-sm text-gray-500 italic bg-amber-50/60 p-3 rounded-lg border border-amber-100/80">
                Sin notas adicionales para este pedido.
              </p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Pedido</span>
              <span className="font-bold text-[#2D2D2D] text-base">
                C$ {order.total.toFixed(2)}
              </span>
            </div>

            {order.deposit > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  {order.status === "delivered" ? "Pagado" : "Abonado"}
                </span>
                <span className="font-medium">
                  - C$ {order.deposit.toFixed(2)}
                </span>
              </div>
            )}

            {!isPaid && (
              <>
                <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                  <span className="font-bold text-gray-800 text-sm">
                    Pendiente
                  </span>
                  <span className="font-bold text-lg text-red-500">
                    C$ {remaining.toFixed(2)}
                  </span>
                </div>
                {change > 0 && paymentMethod === "CASH" && (
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-blue-600 text-sm">
                      Cambio
                    </span>
                    <span className="font-bold text-blue-600">
                      C$ {change.toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}

            {isPaid && order.status !== "delivered" && (
              <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">
                  Pendiente
                </span>
                <span className="font-bold text-green-600 text-lg">
                  C$ 0.00
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <div className="border-t border-gray-100 bg-gray-50/80">
          {/* Cancel bar (only pending) */}
          {!readOnly && onCancelOrder && order.status === "pending" && (
            <div className="px-5 pt-3">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <Ban size={13} />
                  Cancelar Orden
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-xs text-red-700 font-medium">
                    ¿Seguro?
                  </span>
                  <button
                    onClick={() => {
                      onCancelOrder(order.id);
                      handleClose();
                    }}
                    className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Sí, cancelar
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment input row (only ready + not paid + cash) */}
          {!readOnly &&
            order.status === "ready" &&
            canInvoice &&
            !isPaid &&
            paymentMethod === "CASH" && (
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <CurrencyAmountInput
                      totalInCordobas={remaining}
                      amountPaid={paymentAmount}
                      onAmountPaidChange={setPaymentAmount}
                      onConvertedValueChange={setConvertedCordobaValue}
                      onEnter={handleConfirmPayment}
                      compact
                    />
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Coins size={15} />
                    Cobrar
                  </button>
                </div>
              </div>
            )}

          {/* Action buttons */}
          <div className="px-5 py-4 flex items-center gap-3">
            {readOnly ? null : order.status === "pending" ? (
              <button
                onClick={() => onMoveStatus(order.id, "production")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593D31] text-white font-bold hover:bg-[#4a332a] transition-colors shadow-md ml-auto text-sm"
              >
                Iniciar Proceso <ArrowRight size={16} />
              </button>
            ) : order.status === "production" ? (
              <button
                onClick={() => onMoveStatus(order.id, "ready")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md ml-auto text-sm"
              >
                <PackageCheck size={16} /> Marcar como Listo
              </button>
            ) : order.status === "ready" ? (
              canInvoice ? (
                <>
                  {/* Payment method toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        paymentMethod === "CASH"
                          ? "bg-white text-[#593D31] shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Banknote size={14} />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CARD")}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        paymentMethod === "CARD"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <CreditCard size={14} />
                      Tarjeta
                    </button>
                  </div>

                  <button
                    onClick={() => onInvoice(order.id, paymentMethod)}
                    disabled={
                      (paymentMethod === "CASH" && !isPaid) || isInvoicing
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8BC6E] text-white font-bold hover:bg-[#dca34b] transition-colors shadow-md text-sm disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                    title={
                      paymentMethod === "CASH" && !isPaid
                        ? "Debe saldar la cuenta antes de facturar"
                        : ""
                    }
                  >
                    {isInvoicing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Facturando...
                      </>
                    ) : (
                      <>
                        <FileText size={16} /> Facturar y Entregar
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 w-full">
                  <Package size={18} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Solo un <strong>Cajero</strong> puede facturar este pedido.
                  </p>
                </div>
              )
            ) : order.status === "delivered" ? (
              <>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold cursor-default text-sm">
                  <CheckCircle2 size={16} />
                  Entregado
                </button>
                <button
                  onClick={() => onReprint?.(order.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition-colors ml-auto text-sm"
                >
                  <Printer size={16} />
                  Reimprimir Factura
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
