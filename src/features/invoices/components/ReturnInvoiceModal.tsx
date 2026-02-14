import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import type { Invoice } from "@/features/invoices/types";

interface ReturnInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onConfirm: (data: { reason: string; notes?: string }) => void;
}

export const ReturnInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onConfirm,
}: ReturnInvoiceModalProps) => {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ reason?: string }>({});

  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(amount);
  };

  const handleSubmit = () => {
    const newErrors: { reason?: string } = {};

    if (!reason.trim()) {
      newErrors.reason = "El motivo es requerido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm({
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });

    setReason("");
    setNotes("");
    setErrors({});
  };

  const handleClose = () => {
    setReason("");
    setNotes("");
    setErrors({});
    onClose();
  };

  const totalToReturn = invoice.items.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Procesar Devolución
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Factura: {invoice.id}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
            <AlertCircle
              size={20}
              className="text-orange-600 shrink-0 mt-0.5"
            />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">Devolución completa</p>
              <p>
                Se procesará la devolución de <strong>todos los items</strong>{" "}
                de esta factura. Esta acción quedará registrada en el historial
                y se imprimirá la factura de devolución.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Items a Devolver
            </h3>

            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 border border-[#E8BC6E] bg-[#E8BC6E]/5 rounded-lg"
                >
                  <div className="w-5 h-5 bg-[#E8BC6E] rounded flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity} ×{" "}
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Motivo de la devolución <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors({ ...errors, reason: undefined });
                }
              }}
              placeholder="Ej: Cliente insatisfecho, producto defectuoso..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] ${
                errors.reason ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.reason && (
              <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre la devolución..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] resize-none"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Total a devolver:
              </span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(totalToReturn)}
              </span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Procesar Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
