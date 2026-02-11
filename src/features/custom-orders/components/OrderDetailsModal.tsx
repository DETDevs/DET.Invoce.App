import { useState } from "react";
import {
  Coins,
  X,
  Printer,
  FileText,
  User,
  Calendar,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

import type { Order, OrderStatus } from "@/shared/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onInvoice: (orderId: string) => void;
  onMoveStatus: (orderId: string, newStatus: OrderStatus) => void;
  onRegisterPayment: (orderId: string, amount: number) => void;
}

export const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onInvoice,
  onMoveStatus,
  onRegisterPayment,
}: Props) => {
  // Estado local para el monto a pagar (si lo hubiera)
  const [paymentAmount, setPaymentAmount] = useState("");

  if (!isOpen || !order) return null;

  const remaining = order.total - order.deposit;
  const isPaid = remaining <= 0;

  const handleClose = () => {
    setPaymentAmount("");
    onClose();
  };

  const handleConfirmPayment = () => {
    const amount = Number(paymentAmount);
    if (amount > 0 && amount <= remaining + 0.1) {
      // Margen pequeño por decimales
      onRegisterPayment(order.id, amount);
      setPaymentAmount("");
      // No cerramos el modal, solo actualizamos el estado visualmente (que lo hará el padre)
    }
  };

  const renderFooterActions = () => {
    // 1. Si el pedido está marcado como ENTREGADO, solo mostrar opción de reimprimir si se desea, o nada.
    if (order.status === "delivered") {
      return (
        <button className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors ml-auto cursor-default text-sm md:text-base w-full md:w-auto">
          <CheckCircle2 size={18} />
          Pedido Completado
        </button>
      );
    }

    // 2. Si hay SALDO PENDIENTE (y no está cancelado/entregado), mostrar controles de pago DIRECTAMENTE.
    //    Independientemente de si está en 'pending', 'production' o 'ready', si debe plata, se le puede cobrar.
    //    Aunque por flujo, usualmente se cobra al final, el usuario pidió agilidad.
    //    Pero mantengamos la lógica de estados para los botones de movimiento.

    const paymentControls = !isPaid && (
      <div className="flex gap-2 items-center w-full md:w-auto mt-3 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
        <div className="relative w-full md:w-32">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
            C$
          </span>
          <input
            type="number"
            className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent text-sm font-bold text-[#2D2D2D]"
            placeholder={remaining.toFixed(2)}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirmPayment()}
          />
        </div>
        <button
          onClick={handleConfirmPayment}
          disabled={!paymentAmount || Number(paymentAmount) <= 0}
          className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Coins size={16} />
          <span className="hidden sm:inline">Cobrar</span>
        </button>
      </div>
    );

    switch (order.status) {
      case "pending":
        return (
          <button
            onClick={() => onMoveStatus(order.id, "production")}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-[#593D31] text-white font-bold hover:bg-[#4a332a] transition-colors shadow-md ml-auto text-sm md:text-base w-full md:w-auto justify-center"
          >
            Iniciar Proceso <ArrowRight size={18} />
          </button>
        );

      case "production":
        return (
          <button
            onClick={() => onMoveStatus(order.id, "ready")}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md ml-auto text-sm md:text-base w-full md:w-auto justify-center"
          >
            <PackageCheck size={18} /> Marcar como Listo
          </button>
        );

      case "ready":
        return (
          <div className="flex flex-col md:flex-row gap-3 w-full items-center justify-end">
            {/* Controles de Pago (si debe) */}
            {paymentControls}

            {/* Boton Facturar (Desactivado si debe) */}
            <button
              onClick={() => onInvoice(order.id)}
              disabled={!isPaid}
              className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-[#E8BC6E] text-white font-bold hover:bg-[#dca34b] transition-colors shadow-md text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
              title={!isPaid ? "Debe saldar la cuenta antes de facturar" : ""}
            >
              <FileText size={18} />
              Facturar y Entregar
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white w-[95%] md:w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-4 md:p-6 border-b border-gray-100 bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1">
              <h2 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
                Orden #{order.id}
              </h2>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase border ${
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} /> {order.customer}
              </span>
              {order.status !== "delivered" ? (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  {order.dueDate
                    ? new Date(
                        order.dueDate.replace(/-/g, "/"),
                      ).toLocaleDateString("es-NI", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Sin fecha"}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 size={14} /> Entregado
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="mb-6 md:mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Productos
            </h3>

            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-2">Descripción</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-[#2D2D2D]">{item}</td>
                      <td className="px-4 py-3 text-right font-medium">--</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Notas
              </h3>
              <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                Sin notas adicionales para este pedido.
              </p>
            </div>

            <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl md:bg-transparent md:p-0">
              <div className="flex justify-between text-gray-600">
                <span>Total Pedido:</span>
                <span className="font-bold text-[#2D2D2D] text-lg">
                  C$ {order.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Abonado:</span>
                <span>- C$ {order.deposit.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">
                  Pendiente a Pagar:
                </span>
                <span
                  className={`font-bold text-xl ${isPaid ? "text-green-600" : "text-red-500"}`}
                >
                  C$ {remaining.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center gap-3 md:gap-4 min-h-[80px] md:min-h-[88px]">
          {order.status === "delivered" && (
            <button className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
              <Printer size={18} />
              <span className="md:hidden">Reimprimir</span>
              <span className="hidden md:inline">Reimprimir Factura</span>
            </button>
          )}

          {renderFooterActions()}
        </div>
      </div>
    </div>
  );
};
