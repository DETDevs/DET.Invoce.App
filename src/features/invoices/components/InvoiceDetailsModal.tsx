import {
  X,
  Printer,
  RotateCcw,
  Calendar,
  User,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { Invoice } from "@/features/invoices/types";

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPrint: (invoiceId: string) => void;
  onReturn: (invoice: Invoice) => void;
  onReprocess: (invoice: Invoice) => void;
}

export const InvoiceDetailsModal = ({
  isOpen,
  onClose,
  invoice,
  onPrint,
  onReturn,
  onReprocess,
}: InvoiceDetailsModalProps) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-NI", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const badges = {
      completed: {
        label: "Completada",
        className: "bg-green-100 text-green-700",
      },
      returned: {
        label: "Devuelta",
        className: "bg-red-100 text-red-700",
      },
    };

    const badge = badges[status];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const isReturned = invoice.status === "returned";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{invoice.id}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Orden #{invoice.orderNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(invoice.status)}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Fecha</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User size={20} className="text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Creado por</p>
                <p className="text-sm font-semibold text-gray-900">
                  {invoice.createdBy}
                </p>
              </div>
            </div>

            {invoice.customerName && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User size={20} className="text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {invoice.customerName}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Productos</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                      Producto
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">
                      Cantidad
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                      Precio Unit.
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuesto:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-[#593D31]">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>

          {invoice.returns && invoice.returns.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Historial de Devoluciones
              </h3>
              <div className="space-y-3">
                {invoice.returns.map((returnItem) => (
                  <div
                    key={returnItem.id}
                    className="border border-red-200 bg-red-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {returnItem.id}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock size={14} />
                          <span>{formatDate(returnItem.returnedAt)}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        -{formatCurrency(returnItem.totalReturned)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Motivo:</span>{" "}
                      {returnItem.reason}
                    </p>
                    {returnItem.notes && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Notas:</span>{" "}
                        {returnItem.notes}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Items devueltos:</span>{" "}
                      {returnItem.items
                        .map((item) => item.productName)
                        .join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            {isReturned ? (
              <button
                onClick={() => onReprocess(invoice)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                Re Procesar Factura
              </button>
            ) : (
              <>
                <button
                  onClick={() => onPrint(invoice.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#593D31] text-white rounded-xl font-bold hover:bg-[#4a332a] transition-colors"
                >
                  <Printer size={20} />
                  Reimprimir Factura
                </button>
                <button
                  onClick={() => onReturn(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                >
                  <RotateCcw size={20} />
                  Hacer Devolución
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
