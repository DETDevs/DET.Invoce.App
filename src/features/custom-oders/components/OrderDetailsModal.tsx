import React, { useState } from "react";
import {
  X,
  Printer,
  CreditCard,
  FileText,
  User,
  Clock,
  Calendar,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { type Order, type OrderStatus } from "../types";

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
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  if (!isOpen || !order) return null;

  const remaining = order.total - order.deposit;
  const isPaid = remaining <= 0;

  const handleClose = () => {
    setIsPaymentMode(false);
    setPaymentAmount("");
    onClose();
  };

  const handleConfirmPayment = () => {
    const amount = Number(paymentAmount);
    if (amount > 0 && amount <= remaining) {
      onRegisterPayment(order.id, amount);
      setIsPaymentMode(false);
      setPaymentAmount("");
    }
  };

  const renderFooterActions = () => {
    if (isPaymentMode) {
      return (
        <div className="flex gap-3 ml-auto w-full justify-end items-center animate-fade-in">
          <span className="text-sm font-bold text-gray-500 mr-2">
            Monto a cobrar:
          </span>
          <div className="relative w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              C$
            </span>
            <input
              type="number"
              autoFocus
              className="w-full pl-8 pr-3 py-2 border border-[#E8BC6E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/50 text-sm font-bold text-[#2D2D2D]"
              placeholder={remaining.toString()}
              max={remaining}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsPaymentMode(false)}
            className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-bold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={
              !paymentAmount ||
              Number(paymentAmount) <= 0 ||
              Number(paymentAmount) > remaining
            }
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      );
    }

    switch (order.status) {
      case "pending":
        return (
          <button
            onClick={() => onMoveStatus(order.id, "production")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593D31] text-white font-bold hover:bg-[#4a332a] transition-colors shadow-md ml-auto"
          >
            Iniciar Producción <ArrowRight size={18} />
          </button>
        );

      case "production":
        return (
          <button
            onClick={() => onMoveStatus(order.id, "ready")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md ml-auto"
          >
            <PackageCheck size={18} /> Marcar como Listo
          </button>
        );

      case "ready":
        return (
          <div className="flex gap-3 ml-auto">
            {!isPaid && (
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors border border-gray-300"
                onClick={() => setIsPaymentMode(true)}
              >
                <Wallet size={18} />
                Cobrar Saldo
              </button>
            )}
            <button
              onClick={() => onInvoice(order.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8BC6E] text-white font-bold hover:bg-[#dca34b] transition-colors shadow-md"
            >
              <FileText size={18} />
              Facturar y Entregar
            </button>
          </div>
        );

      case "delivered":
        return (
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors ml-auto cursor-default">
            <CheckCircle2 size={18} />
            Pedido Completado
          </button>
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
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-[#2D2D2D]">
                Orden #{order.id}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${
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
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} /> {order.customer}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {order.dueDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {order.dueTime}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
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

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Notas
              </h3>
              <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                Sin notas adicionales para este pedido.
              </p>
            </div>
            <div className="space-y-3">
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

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-4 min-h-[88px]">
          {!isPaymentMode && (
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
              <Printer size={18} />
              {order.status === "delivered" ? "Reimprimir" : "Comanda"}
            </button>
          )}

          {renderFooterActions()}
        </div>
      </div>
    </div>
  );
};
