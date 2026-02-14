import { useState, useEffect } from "react";
import {
  X,
  Wallet,
  CreditCard,
  FileText,
  Clock,
  User,
  UtensilsCrossed,
  Package,
} from "lucide-react";
import type { TakeoutOrder } from "@/shared/types";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
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

  const { completeOrder } = useTakeoutStore();

  useEffect(() => {
    if (isOpen && cuentas.length > 0) {
      setSelectedCuentaId(cuentas[0].id);
    }
    if (!isOpen) {
      setSelectedCuentaId(null);
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

  const handleInvoice = () => {
    if (!isPaymentSufficient) {
      toast.error("El monto recibido es insuficiente");
      return;
    }
    setIsProcessing(true);

    const invoice = {
      id: `FAC-${selectedCuenta.id}`,
      orderNumber: selectedCuenta.id,
      items: selectedCuenta.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      tax,
      total,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
      createdBy: "Caja",
      tableNumber,
      cuentaNumber: selectedCuenta.cuentaNumber,
      paymentMethod,
      type: isParaLlevar ? "para-llevar" : "en-mesa",
    };

    try {
      const stored = localStorage.getItem("invoices");
      const invoices = stored ? JSON.parse(stored) : [];
      invoices.unshift(invoice);
      localStorage.setItem("invoices", JSON.stringify(invoices));
    } catch (error) {
      console.error("Error al guardar factura:", error);
    }

    completeOrder(selectedCuenta.id);

    if (paymentMethod === "efectivo" && change > 0) {
      toast.success(`Factura generada. Cambio: C$ ${change.toFixed(2)}`, {
        icon: "🧾",
        duration: 5000,
      });
    } else {
      toast.success("Factura generada correctamente", { icon: "🧾" });
    }

    const remainingCuentas = cuentas.filter((c) => c.id !== selectedCuenta.id);

    if (remainingCuentas.length === 0) {
      onClose();
    } else {
      setSelectedCuentaId(remainingCuentas[0].id);
    }
    setIsProcessing(false);
  };

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
            Productos —{" "}
            {isParaLlevar
              ? `Orden #${selectedCuenta.cuentaNumber}`
              : `Cuenta ${selectedCuenta.cuentaNumber}`}
          </h3>
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2 text-center">Cant.</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedCuenta.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2.5 text-[#2D2D2D] font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      C$ {item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      C$ {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
};
