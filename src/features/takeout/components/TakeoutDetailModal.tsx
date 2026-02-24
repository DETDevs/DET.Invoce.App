import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Wallet,
  CreditCard,
  FileText,
  Clock,
  User,
  UtensilsCrossed,
  Package,
  Plus,
  Minus,
  Scissors,
  Check,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { TakeoutOrder } from "@/shared/types";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { handleInvoiceFlow } from "@/services/invoiceService";
import orderApi from "@/api/order/OrderAPI";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number | null;
  cuentas: TakeoutOrder[];
}

export const TakeoutDetailModal = ({
  isOpen,
  onClose,
  tableNumber,
  cuentas,
}: Props) => {
  const [selectedCuentaId, setSelectedCuentaId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(
    "efectivo",
  );
  const [amountPaid, setAmountPaid] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { completeOrder, splitOrder } = useTakeoutStore();
  const { user } = useAuthStore();
  const canInvoice = user?.role === "cajero" || user?.role === "admin";

  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitQuantities, setSplitQuantities] = useState<Map<number, number>>(
    new Map(),
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && cuentas.length > 0) {
      setSelectedCuentaId(cuentas[0].id);
    }
    if (!isOpen) {
      setSelectedCuentaId(null);
      setIsSplitMode(false);
      setSplitQuantities(new Map());
      setShowCancelConfirm(false);
      setIsCancelling(false);
    }
    setAmountPaid("");
    setPaymentMethod("efectivo");
    setIsProcessing(false);
  }, [isOpen, tableNumber]);

  useEffect(() => {
    if (cuentas.length === 0) return;
    const stillExists = cuentas.some((c) => c.id === selectedCuentaId);
    if (!stillExists) {
      setSelectedCuentaId(cuentas[0].id);
    }
  }, [cuentas, selectedCuentaId]);

  useEffect(() => {
    setAmountPaid("");
    setPaymentMethod("efectivo");
    setIsProcessing(false);
    setIsSplitMode(false);
    setSplitQuantities(new Map());
  }, [selectedCuentaId]);

  if (!isOpen || tableNumber === null || cuentas.length === 0) return null;

  const isParaLlevar = tableNumber === 0;
  const selectedCuenta =
    cuentas.find((c) => c.id === selectedCuentaId) || cuentas[0];

  const subtotal = selectedCuenta.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const paidValue = parseFloat(amountPaid) || 0;
  const change = paidValue - total;
  const isPaymentSufficient =
    paymentMethod === "tarjeta" ||
    (paymentMethod === "efectivo" && paidValue >= total);

  const handleInvoice = async () => {
    if (!isPaymentSufficient) {
      toast.error("El monto recibido es insuficiente");
      return;
    }

    if (!selectedCuenta.backendOrderId) {
      toast.error(
        "Ocurrió un problema al cargar esta orden. Intente cerrar y abrir la mesa de nuevo, o contacte a soporte.",
        { duration: 5000 },
      );
      return;
    }

    setIsProcessing(true);

    try {
      const accountsData = await orderApi.getOrderAccountWithDetails(
        selectedCuenta.backendOrderId,
      );
      const accountsList = Array.isArray(accountsData)
        ? accountsData
        : [accountsData];

      const openAccounts = accountsList.filter((a: any) => a.status === "Open");
      const account =
        openAccounts.find(
          (a: any) => a.accountNumber === selectedCuenta.cuentaNumber,
        ) || openAccounts[0];

      if (!account?.orderAccountId) {
        toast.error(
          "No hay cuentas abiertas para facturar. La orden puede ya estar cerrada.",
          { duration: 5000 },
        );
        return;
      }

      const orderAccountId: number = account.orderAccountId;
      console.log(
        "[Order] OrderAccountId obtenido:",
        orderAccountId,
        "| AccountNumber:",
        account.accountNumber,
      );

      const pm = paymentMethod === "tarjeta" ? "CARD" : "CASH";
      await handleInvoiceFlow({ orderAccountId, paymentmethod: pm });

      completeOrder(selectedCuenta.id);

      if (paymentMethod === "efectivo" && change > 0) {
        toast.success(`Factura generada. Cambio: C$ ${change.toFixed(2)}`, {
          icon: "\uD83E\uDDFE",
          duration: 5000,
        });
      } else {
        toast.success("Factura generada correctamente", {
          icon: "\uD83E\uDDFE",
        });
      }

      onClose();
    } catch (error) {
      console.error("[TakeoutDetailModal] Error al facturar:", error);
      toast.error(
        "No se pudo generar la factura. Verifique la conexión e intente de nuevo. Si el problema persiste, llame a soporte.",
        { duration: 6000 },
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSplitItem = (idx: number) => {
    setSplitQuantities((prev) => {
      const next = new Map(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.set(idx, selectedCuenta.items[idx].quantity);
      }
      return next;
    });
  };

  const setSplitQty = (idx: number, qty: number) => {
    setSplitQuantities((prev) => {
      const next = new Map(prev);
      const maxQty = selectedCuenta.items[idx].quantity;
      if (qty <= 0) {
        next.delete(idx);
      } else {
        next.set(idx, Math.min(qty, maxQty));
      }
      return next;
    });
  };

  const handleCancelCuenta = async () => {
    if (!selectedCuenta.backendOrderId) {
      toast.error("No se pudo obtener la información de la cuenta.", {
        duration: 5000,
      });
      return;
    }
    const originalCuenta = cuentas[0];
    setIsProcessing(true);
    try {
      const accountsData = await orderApi.getOrderAccountWithDetails(
        selectedCuenta.backendOrderId,
      );
      const accountsList = Array.isArray(accountsData)
        ? accountsData
        : [accountsData];
      const fromAccount =
        accountsList.find(
          (a: any) => a.accountNumber === selectedCuenta.cuentaNumber,
        ) ||
        accountsList.find(
          (a: any) => a.accountNumber !== originalCuenta.cuentaNumber,
        );
      const toAccount =
        accountsList.find(
          (a: any) => a.accountNumber === originalCuenta.cuentaNumber,
        ) || accountsList[0];
      if (!fromAccount?.orderAccountId || !toAccount?.orderAccountId) {
        toast.error("No se pudo identificar las cuentas. Intente de nuevo.", {
          duration: 5000,
        });
        return;
      }
      await orderApi.accountMerge(
        fromAccount.orderAccountId,
        toAccount.orderAccountId,
        user?.name || "Cajero",
      );
      toast.success(
        "Cuenta cancelada. Los productos regresaron a la cuenta original.",
        { icon: "↩️" },
      );
      onClose();
    } catch (error) {
      console.error("[TakeoutDetailModal] Error al cancelar cuenta:", error);
      toast.error(
        "No se pudo cancelar la cuenta. Verifique la conexión e intente de nuevo.",
        { duration: 5000 },
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSplit = async () => {
    if (splitQuantities.size === 0) return;
    const originalCuenta = cuentas[0];
    const totalItemsInOrder = originalCuenta.items.length;
    const allMovedCompletely =
      splitQuantities.size === totalItemsInOrder &&
      Array.from(splitQuantities.entries()).every(
        ([idx, qty]) => qty >= originalCuenta.items[idx].quantity,
      );
    if (allMovedCompletely) {
      toast.error("No puedes mover todos los productos. Deja al menos uno.");
      return;
    }

    if (!originalCuenta.backendOrderId) {
      toast.error(
        "Ocurrió un problema al cargar esta orden. Intente cerrar y abrir la mesa de nuevo, o contacte a soporte.",
        { duration: 5000 },
      );
      return;
    }

    try {
      const accounts = await orderApi.getOrderAccountWithDetails(
        originalCuenta.backendOrderId,
      );
      const accountsList = Array.isArray(accounts) ? accounts : [accounts];
      const account =
        accountsList.find(
          (a: any) =>
            a.accountNumber === 1 ||
            a.accountNumber === originalCuenta.cuentaNumber,
        ) || accountsList[0];

      if (!account?.orderAccountId) {
        toast.error(
          "No se pudo obtener la información de la cuenta. Intente de nuevo o contacte a soporte.",
          { duration: 5000 },
        );
        return;
      }

      const backendDetails: {
        orderDetailId: number;
        productCode: string;
        quantity: number;
      }[] = account.orderAccountDetails || [];

      const splitPayload: { orderDetailId: number; quantity: number }[] = [];

      for (const [idx, qty] of splitQuantities.entries()) {
        const localItem = originalCuenta.items[idx];
        const backendDetail = backendDetails.find(
          (d: any) => d.productCode === localItem.productCode,
        );
        if (backendDetail) {
          splitPayload.push({
            orderDetailId: backendDetail.orderDetailId,
            quantity: qty,
          });
        }
      }

      if (splitPayload.length === 0) {
        toast.error(
          "No se pudo dividir la cuenta correctamente. Intente de nuevo o contacte a soporte.",
          { duration: 5000 },
        );
        return;
      }

      await orderApi.accountSplit({
        fromAccountId: account.orderAccountId,
        creteBy: user?.name || "Cajero",
        orderAccountSplitTypes: splitPayload,
      });

      const splitItems = Array.from(splitQuantities.entries()).map(
        ([index, quantity]) => ({ index, quantity }),
      );
      splitOrder(originalCuenta.id, splitItems);
      const totalMoved = splitItems.reduce((acc, s) => acc + s.quantity, 0);
      toast.success(
        `Cuenta dividida: ${totalMoved} unidad${totalMoved > 1 ? "es" : ""} movida${totalMoved > 1 ? "s" : ""} a nueva cuenta`,
        { icon: "✂️" },
      );
      onClose();
    } catch (error) {
      console.error("[TakeoutDetailModal] Error al dividir cuenta:", error);
      toast.error(
        "No se pudo dividir la cuenta. Verifique la conexión e intente de nuevo.",
        { duration: 5000 },
      );
    }

    setIsSplitMode(false);
    setSplitQuantities(new Map());
  };

  const splitSubtotal = Array.from(splitQuantities.entries()).reduce(
    (acc, [idx, qty]) => {
      const item = selectedCuenta.items[idx];
      return item ? acc + item.price * qty : acc;
    },
    0,
  );

  const splitItemCount = splitQuantities.size;

  const createdTime = new Date(selectedCuenta.createdAt).toLocaleTimeString(
    "es-NI",
    { hour: "2-digit", minute: "2-digit" },
  );

  const handleCancelOrder = async () => {
    const mainCuenta = cuentas[0];
    if (!mainCuenta.backendOrderId) {
      toast.error("No se pudo obtener la información de la orden.", {
        duration: 5000,
      });
      return;
    }

    setIsCancelling(true);
    try {
      await orderApi.cancel(mainCuenta.backendOrderId, user?.name || "Sistema");

      cuentas.forEach((cuenta) => {
        completeOrder(cuenta.id);
      });

      toast.success("Orden cancelada correctamente", { icon: "🚫" });
      onClose();
    } catch (error) {
      console.error("[TakeoutDetailModal] Error al cancelar orden:", error);
      toast.error(
        "No se pudo cancelar la orden. Verifique la conexión e intente de nuevo.",
        { duration: 5000 },
      );
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-[95%] md:w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-start p-5 border-b border-gray-100 bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  isParaLlevar
                    ? "bg-amber-500 text-white"
                    : "bg-[#593D31] text-white"
                }`}
              >
                {isParaLlevar ? <Package size={20} /> : tableNumber}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
                {isParaLlevar ? "Para Llevar" : `Mesa ${tableNumber}`}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <User size={12} />
                {selectedCuenta.createdBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {createdTime}
              </span>
              <span className="flex items-center gap-1">
                {isParaLlevar ? (
                  <Package size={12} />
                ) : (
                  <UtensilsCrossed size={12} />
                )}
                {cuentas.length}{" "}
                {isParaLlevar
                  ? cuentas.length === 1
                    ? "orden"
                    : "órdenes"
                  : cuentas.length === 1
                    ? "cuenta"
                    : "cuentas"}
              </span>
              {selectedCuenta.orderNumber && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono font-bold">
                  {selectedCuenta.orderNumber}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Cancelar orden"
            >
              <XCircle size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {cuentas.length > 1 && (
          <div className="flex-shrink-0 flex gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto scrollbar-hide bg-white">
            {cuentas.map((cuenta) => (
              <button
                key={cuenta.id}
                onClick={() => setSelectedCuentaId(cuenta.id)}
                className={`h-9 px-4 flex items-center justify-center rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCuentaId === cuenta.id
                    ? "bg-[#593D31] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isParaLlevar
                  ? `Orden #${cuenta.cuentaNumber}`
                  : `Cuenta ${cuenta.cuentaNumber}`}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 p-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            {isSplitMode ? (
              "Selecciona los productos para la nueva cuenta"
            ) : (
              <>
                Productos —{" "}
                {isParaLlevar
                  ? `Orden #${selectedCuenta.cuentaNumber}`
                  : `Cuenta ${selectedCuenta.cuentaNumber}`}
              </>
            )}
          </h3>
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 font-medium">
                <tr>
                  {isSplitMode && <th className="px-3 py-2 w-10"></th>}
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2 text-center">Cant.</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedCuenta.items.map((item, idx) => {
                  const isSelected = splitQuantities.has(idx);
                  const splitQty = splitQuantities.get(idx) ?? 0;
                  return (
                    <tr
                      key={idx}
                      className={`${
                        isSplitMode
                          ? `transition-colors ${
                              isSelected ? "bg-violet-50" : "hover:bg-gray-50"
                            }`
                          : ""
                      }`}
                    >
                      {isSplitMode && (
                        <td className="px-3 py-2.5">
                          <div
                            onClick={() => toggleSplitItem(idx)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-violet-500 border-violet-500 text-white"
                                : "border-gray-300 bg-white hover:border-violet-300"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-[#2D2D2D] font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-600">
                        {isSplitMode && isSelected && item.quantity > 1 ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSplitQty(idx, splitQty - 1);
                              }}
                              className="w-6 h-6 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 flex items-center justify-center transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-bold text-violet-700">
                              {splitQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSplitQty(idx, splitQty + 1);
                              }}
                              className="w-6 h-6 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 flex items-center justify-center transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                            <span className="text-xs text-gray-400 ml-1">
                              /{item.quantity}
                            </span>
                          </div>
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        C$ {item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {isSplitMode && isSelected ? (
                          <span className="text-violet-700 font-bold">
                            C$ {(item.price * splitQty).toFixed(2)}
                          </span>
                        ) : (
                          <>C$ {(item.price * item.quantity).toFixed(2)}</>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isSplitMode && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  onClose();
                  navigate("/ordenes", {
                    state: {
                      addToTable: tableNumber,
                      addToCuentaId: selectedCuenta.id,
                      cuentaNumber: selectedCuenta.cuentaNumber,
                    },
                  });
                }}
                className="flex-1 py-2.5 bg-white border-2 border-dashed border-[#E8BC6E] text-[#593D31] font-bold rounded-xl hover:bg-[#FDF8EE] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} />
                Agregar Productos
              </button>
              {selectedCuenta.cuentaNumber === 1 ? (
                selectedCuenta.items.length > 1 && (
                  <button
                    onClick={() => setIsSplitMode(true)}
                    className="flex-1 py-2.5 bg-white border-2 border-dashed border-violet-300 text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                  >
                    <Scissors size={16} />
                    Dividir Cuenta
                  </button>
                )
              ) : (
                <button
                  onClick={handleCancelCuenta}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-white border-2 border-dashed border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <X size={16} />
                  Cancelar Cuenta
                </button>
              )}
            </div>
          )}
        </div>

        {isSplitMode ? (
          <div className="flex-shrink-0 border-t border-gray-200 bg-violet-50">
            <div className="px-5 py-4 space-y-3">
              {splitItemCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-violet-700 font-medium">
                    {splitItemCount} producto
                    {splitItemCount > 1 ? "s" : ""} seleccionado
                    {splitItemCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-violet-800 font-bold">
                    C$ {splitSubtotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsSplitMode(false);
                    setSplitQuantities(new Map());
                  }}
                  className="flex-1 h-11 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSplit}
                  disabled={splitQuantities.size === 0}
                  className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Scissors size={16} />
                  Crear Nueva Cuenta
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
            <div className="px-5 py-3 flex items-center justify-between gap-6 border-b border-gray-100">
              <div className="flex gap-6 text-sm text-gray-500">
                <span>
                  Sub:
                  <strong className="text-gray-700">
                    C$ {subtotal.toFixed(2)}
                  </strong>
                </span>
                <span>
                  IVA 15%:
                  <strong className="text-gray-700">C$ {tax.toFixed(2)}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#2D2D2D]">
                  C$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {canInvoice ? (
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Pago
                  </label>
                  <div className="flex gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("efectivo")}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 font-bold text-sm transition-all ${
                        paymentMethod === "efectivo"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Wallet size={14} /> Efectivo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("tarjeta");
                        setAmountPaid(total.toFixed(2));
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 font-bold text-sm transition-all ${
                        paymentMethod === "tarjeta"
                          ? "bg-sky-50 border-sky-400 text-sky-800"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard size={14} /> Tarjeta
                    </button>
                  </div>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Recibido
                    </label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        C$
                      </span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvoice()}
                        className="w-full pl-8 pr-4 h-9 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm font-bold"
                        placeholder={total.toFixed(2)}
                        min="0"
                      />
                    </div>
                    {amountPaid !== "" && (
                      <div
                        className={`h-9 px-3 flex items-center rounded-lg font-bold text-sm whitespace-nowrap ${change >= 0 ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"}`}
                      >
                        {change >= 0 ? "Cambio" : "Falta"}: C${" "}
                        {Math.abs(change).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleInvoice}
                  disabled={!isPaymentSufficient || isProcessing}
                  className="w-full h-11 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  {isProcessing ? "Procesando..." : "Facturar"}
                </button>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Package size={20} className="text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Solo un <strong>Cajero</strong> puede facturar esta orden.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 mx-6 max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-1">
                ¿Cancelar esta orden?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción no se puede deshacer. Se cancelará la orden completa
                incluyendo todas las cuentas.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  className="flex-1 h-11 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  No, mantener
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Cancelando...
                    </>
                  ) : (
                    "Sí, cancelar orden"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
