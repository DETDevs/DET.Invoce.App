import { Calendar, User } from "lucide-react";
import type { Invoice } from "@/features/invoices/types";

interface InvoiceCardProps {
  invoice: Invoice;
  onClick: (invoice: Invoice) => void;
}

export const InvoiceCard = ({ invoice, onClick }: InvoiceCardProps) => {
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Managua",
    }).format(date);
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const badges: Record<
      Invoice["status"],
      { label: string; className: string }
    > = {
      completed: {
        label: "Completada",
        className: "bg-green-100 text-green-700",
      },
      returned: {
        label: "Devolucion",
        className: "bg-red-100 text-red-700",
      },
      partially_returned: {
        label: "Parcial",
        className: "bg-amber-100 text-amber-700",
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

  return (
    <div
      onClick={() => onClick(invoice)}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#E8BC6E]"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{invoice.id}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Orden #{invoice.orderNumber}
          </p>
        </div>
        {getStatusBadge(invoice.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{formatDate(invoice.createdAt)}</span>
        </div>
        {invoice.customerName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span>{invoice.customerName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-sm text-gray-600">
          {invoice.items.length} {invoice.items.length === 1 ? "item" : "items"}
        </span>
        <span className="text-xl font-bold text-[#593D31]">
          {formatCurrency(invoice.total)}
        </span>
      </div>
    </div>
  );
};
