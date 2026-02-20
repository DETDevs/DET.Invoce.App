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
} from "lucide-react";
import type { TakeoutOrder } from "@/shared/types";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
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

  useEffect(() => {
    if (isOpen && cuentas.length > 0) {
      setSelectedCuentaId(cuentas[0].id);
    }
    if (!isOpen) {
      setSelectedCuentaId(null);
      setIsSplitMode(false);
      setSplitQuantities(new Map());
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
    setIsProcessing(true);

    try {
      console.log("[🧾 Facturación Simulada]", {
        orderId: selectedCuenta.id,
        createdBy: user?.name || "Caja",
        paymentMethod,
        total,
        items: selectedCuenta.items.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });
      await new Promise((r) => setTimeout(r, 500));

      completeOrder(selectedCuenta.id);

      if (paymentMethod === "efectivo" && change > 0) {
        toast.success(`Factura generada. Cambio: C$ ${change.toFixed(2)}`, {
          icon: "🧾",
          duration: 5000,
        });
      } else {
        toast.success("Factura generada correctamente", { icon: "🧾" });
      }

      const remainingCuentas = cuentas.filter(
        (c) => c.id !== selectedCuenta.id,
      );

      if (remainingCuentas.length === 0) {
        onClose();
      } else {
        setSelectedCuentaId(remainingCuentas[0].id);
      }
    } catch (error) {
      console.error("[TakeoutDetailModal] Error al facturar:", error);
      toast.error("Error al generar la factura. Intenta de nuevo.");
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

  const handleConfirmSplit = () => {
    if (splitQuantities.size === 0) return;
    const totalItemsInOrder = selectedCuenta.items.length;
    const allMovedCompletely =
      splitQuantities.size === totalItemsInOrder &&
      Array.from(splitQuantities.entries()).every(
        ([idx, qty]) => qty >= selectedCuenta.items[idx].quantity,
      );
    if (allMovedCompletely) {
      toast.error("No puedes mover todos los productos. Deja al menos uno.");
      return;
    }
    const splitItems = Array.from(splitQuantities.entries()).map(
      ([index, quantity]) => ({ index, quantity }),
    );
    splitOrder(selectedCuenta.id, splitItems);
    const totalMoved = splitItems.reduce((acc, s) => acc + s.quantity, 0);
    toast.success(
      `Cuenta dividida: ${totalMoved} unidad${totalMoved > 1 ? "es" : ""} movida${totalMoved > 1 ? "s" : ""} a nueva cuenta`,
      { icon: "✂️" },
    );
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-[95%] md:w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
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
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
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
              {selectedCuenta.items.length > 1 && (
                <button
                  onClick={() => setIsSplitMode(true)}
                  className="flex-1 py-2.5 bg-white border-2 border-dashed border-violet-300 text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <Scissors size={16} />
                  Dividir Cuenta
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
    </div>
  );
};
