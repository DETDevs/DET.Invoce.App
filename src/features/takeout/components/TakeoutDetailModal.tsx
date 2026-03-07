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
  AlertTriangle,
  Loader2,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";
import type { TakeoutOrder } from "@/shared/types";
import { CurrencyAmountInput } from "@/features/shared/components/CurrencyAmountInput";
import { useTakeoutDetail } from "@/features/takeout/hooks/useTakeoutDetail";
import { getCurrencySymbol } from "@/shared/utils/currency";
import { printThermalTicket } from "@/services/printService";

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
  const {
    selectedCuentaId,
    setSelectedCuentaId,
    selectedCuenta,
    paymentMethod,
    setPaymentMethod,
    amountPaid,
    setAmountPaid,
    setPaidInCordobas,
    isProcessing,
    isParaLlevar,
    canInvoice,
    total,
    isPaymentSufficient,
    isSplitMode,
    setIsSplitMode,
    splitQuantities,
    setSplitQuantities,
    splitCustomerName,
    setSplitCustomerName,
    splitSubtotal,
    splitItemCount,
    showCancelConfirm,
    setShowCancelConfirm,
    isCancelling,
    createdTime,
    handleInvoice,
    toggleSplitItem,
    setSplitQty,
    handleCancelCuenta,
    handleConfirmSplit,
    handleCancelOrder,
    handleAddProducts,
    isEditMode,
    enterEditMode,
    exitEditMode,
    editQuantities,
    removedItems,
    setEditQty,
    toggleRemoveItem,
    editHasChanges,
    remainingAfterEdit,
    handleConfirmEdit,
  } = useTakeoutDetail({ isOpen, onClose, tableNumber, cuentas });

  if (
    !isOpen ||
    tableNumber === null ||
    cuentas.length === 0 ||
    !selectedCuenta
  )
    return null;

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
                {selectedCuenta.customerName && (
                  <span className="text-[#593D31]">
                    {" "}
                    — {selectedCuenta.customerName}
                  </span>
                )}
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
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            title="Cerrar"
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
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
            {!isSplitMode && (
              <button
                onClick={() => (isEditMode ? exitEditMode() : enterEditMode())}
                className={`p-1.5 rounded-lg transition-all ${
                  isEditMode
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
                title={isEditMode ? "Salir del modo edición" : "Editar orden"}
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 font-medium">
                <tr>
                  {isSplitMode && <th className="px-3 py-2 w-10"></th>}
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2 text-center">Cant.</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  {isEditMode && !isSplitMode && (
                    <th className="px-2 py-2 w-10"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedCuenta.items.map((item, idx) => {
                  const isSelected = splitQuantities.has(idx);
                  const splitQty = splitQuantities.get(idx) ?? 0;
                  const isRemoved = removedItems.has(idx);
                  const editQty = editQuantities.get(idx) ?? item.quantity;
                  const displayQty =
                    isEditMode && !isRemoved ? editQty : item.quantity;
                  return (
                    <tr
                      key={idx}
                      className={`${
                        isSplitMode
                          ? `transition-colors ${
                              isSelected ? "bg-violet-50" : "hover:bg-gray-50"
                            }`
                          : isRemoved
                            ? "bg-red-50 opacity-50"
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
                      <td
                        className={`px-4 py-2.5 text-[#2D2D2D] font-medium ${isRemoved ? "line-through" : ""}`}
                      >
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
                        ) : isEditMode && !isSplitMode && !isRemoved ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditQty(idx, displayQty - 1);
                              }}
                              disabled={displayQty <= 1}
                              className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              className={`w-8 text-center font-bold ${editQuantities.has(idx) ? "text-amber-700" : "text-gray-600"}`}
                            >
                              {displayQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditQty(idx, displayQty + 1);
                              }}
                              className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className={isRemoved ? "line-through" : ""}>
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-gray-600 ${isRemoved ? "line-through" : ""}`}
                      >
                        {getCurrencySymbol()} {item.price.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-medium ${isRemoved ? "line-through" : ""}`}
                      >
                        {isSplitMode && isSelected ? (
                          <span className="text-violet-700 font-bold">
                            {getCurrencySymbol()}{" "}
                            {(item.price * splitQty).toFixed(2)}
                          </span>
                        ) : (
                          <>
                            {getCurrencySymbol()}{" "}
                            {(item.price * displayQty).toFixed(2)}
                          </>
                        )}
                      </td>
                      {isEditMode && !isSplitMode && (
                        <td className="px-2 py-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRemoveItem(idx);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${isRemoved ? "bg-red-100 text-red-600" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
                            title={
                              isRemoved
                                ? "Restaurar producto"
                                : "Eliminar producto"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit mode confirm/cancel buttons */}
          {isEditMode && !isSplitMode && editHasChanges && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={exitEditMode}
                className="flex-1 py-2.5 bg-white border-2 border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleConfirmEdit}
                disabled={isProcessing || remainingAfterEdit <= 0}
                className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check size={16} />
                {isProcessing ? "Guardando..." : "Confirmar Cambios"}
              </button>
            </div>
          )}

          {!isSplitMode && !isEditMode && (
            <>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddProducts}
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
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => {
                    const cs = getCurrencySymbol();
                    const businessName =
                      JSON.parse(localStorage.getItem("app_settings") || "{}")
                        .businessName || "Dulces Momentos";
                    const now = new Date();
                    const dateStr = now.toLocaleDateString("es-NI");
                    const timeStr = now.toLocaleTimeString("es-NI", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                    const separator =
                      "------------------------------------------";
                    const label = isParaLlevar
                      ? `Orden #${selectedCuenta.cuentaNumber}`
                      : `Mesa ${tableNumber} — Cuenta ${selectedCuenta.cuentaNumber}`;

                    let ticket = "";
                    ticket += `        ${businessName}\n`;
                    ticket += `${separator}\n`;
                    ticket += `  PRE-CUENTA  Fecha: ${dateStr} ${timeStr}\n`;
                    ticket += `  ${label}\n`;
                    ticket += `  Atendido por: ${selectedCuenta.createdBy}\n`;
                    ticket += `${separator}\n`;
                    ticket += `DESCRIPCION        CANT    P.U.\n`;
                    ticket += `${separator}\n`;

                    for (const item of selectedCuenta.items) {
                      const subtotal = (item.price * item.quantity).toFixed(2);
                      ticket += `${item.name}\n`;
                      ticket += `                ${item.quantity}    ${item.price.toFixed(2)} ${subtotal}\n`;
                    }

                    ticket += `${separator}\n`;
                    ticket += `\nTOTAL:              ${cs} ${total.toFixed(2)}\n`;
                    ticket += `${separator}\n`;
                    ticket += `\n      Gracias por preferirnos\n`;

                    printThermalTicket(ticket);
                  }}
                  className="py-2 text-sm text-[#593D31] hover:text-[#E8BC6E] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  Imprimir Cuenta
                </button>
                {selectedCuenta.cuentaNumber === 1 && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="py-2 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle size={14} />
                    Cancelar Orden
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {isSplitMode ? (
          <div className="flex-shrink-0 border-t border-gray-200 bg-violet-50">
            <div className="px-5 py-4 space-y-3">
              {/* Customer name for new split account */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-violet-700 uppercase">
                  Nombre del cliente (nueva cuenta)
                </label>
                <input
                  type="text"
                  value={splitCustomerName}
                  onChange={(e) => setSplitCustomerName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full px-3 py-2 bg-white border border-violet-200 rounded-xl text-sm font-medium text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors"
                />
              </div>
              {splitItemCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-violet-700 font-medium">
                    {splitItemCount} producto
                    {splitItemCount > 1 ? "s" : ""} seleccionado
                    {splitItemCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-violet-800 font-bold">
                    {getCurrencySymbol()} {splitSubtotal.toFixed(2)}
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
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-xl font-bold text-[#2D2D2D]">
                {getCurrencySymbol()} {total.toFixed(2)}
              </span>
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
                  <CurrencyAmountInput
                    totalInCordobas={total}
                    amountPaid={amountPaid}
                    onAmountPaidChange={setAmountPaid}
                    onConvertedValueChange={setPaidInCordobas}
                    onEnter={handleInvoice}
                    compact
                  />
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
