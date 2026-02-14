import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Search, Filter, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import type { DateFilterPreset } from "@/features/invoices/hooks/useInvoices";
import { InvoiceSummary } from "@/features/invoices/components/InvoiceSummary";
import { InvoiceCard } from "@/features/invoices/components/InvoiceCard";
import { Pagination } from "@/features/invoices/components/Pagination";
import { InvoiceDetailsModal } from "@/features/invoices/components/InvoiceDetailsModal";
import { ReturnInvoiceModal } from "@/features/invoices/components/ReturnInvoiceModal";
import type { Invoice, InvoiceStatus } from "@/features/invoices/types";

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToReturn, setInvoiceToReturn] = useState<Invoice | null>(null);

  const {
    invoices,
    filteredCount,
    summary,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    dateFilter,
    setDateFilter,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    addReturn,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
  } = useInvoices();

  const handlePrintInvoice = (invoiceId: string) => {
    console.log("Imprimir factura:", invoiceId);
    toast.success("Solicitud de impresión enviada");
  };

  const handlePrintReturnInvoice = (
    invoice: Invoice,
    returnData: { reason: string; notes?: string },
  ) => {
    console.log("=== FACTURA DE DEVOLUCIÓN ===");
    console.log("Factura original:", invoice.id);
    console.log("Orden:", invoice.orderNumber);
    console.log("Motivo:", returnData.reason);
    if (returnData.notes) console.log("Notas:", returnData.notes);
    console.log("Items devueltos:");
    invoice.items.forEach((item) => {
      console.log(
        `  - ${item.productName} x${item.quantity} = C$${item.subtotal.toFixed(2)}`,
      );
    });
    console.log("Total devuelto: C$" + invoice.total.toFixed(2));
    console.log("============================");
    toast.success("Factura de devolución impresa");
  };

  const handleOpenReturn = (invoice: Invoice) => {
    setSelectedInvoice(null);
    setInvoiceToReturn(invoice);
  };

  const handleConfirmReturn = (data: { reason: string; notes?: string }) => {
    if (!invoiceToReturn) return;

    addReturn(invoiceToReturn.id, data);
    handlePrintReturnInvoice(invoiceToReturn, data);
    toast.success("Devolución procesada correctamente");
    setInvoiceToReturn(null);
  };

  const handleReprocessInvoice = (invoice: Invoice) => {
    setSelectedInvoice(null);
    navigate("/ordenes", {
      state: {
        reprocessFrom: invoice.id,
        items: invoice.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    });
    toast.success("Redirigiendo a crear nueva orden...");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2D2D] flex items-center gap-3">
              <div className="p-3 bg-[#E8BC6E] rounded-xl">
                <Receipt size={28} className="text-white" />
              </div>
              Facturas
            </h1>
            <p className="text-gray-600 mt-2">
              Consulta y gestiona todas las facturas del sistema
            </p>
          </div>
        </div>
      </div>

      <InvoiceSummary summary={summary} />

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por factura o cliente..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as InvoiceStatus | "all")
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-gray-900"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="returned">Devueltas</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterPreset)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm text-gray-900"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>

        {dateFilter === "custom" && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Calendar size={16} className="text-gray-500 shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
              />
              <span className="text-gray-400 text-sm font-medium">a</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Receipt size={40} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No hay facturas
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus !== "all"
                    ? "No se encontraron facturas con los filtros aplicados"
                    : "Las facturas aparecerán aquí cuando realices ventas"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onClick={setSelectedInvoice}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {filteredCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCount}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <InvoiceDetailsModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onPrint={handlePrintInvoice}
        onReturn={handleOpenReturn}
        onReprocess={handleReprocessInvoice}
      />

      <ReturnInvoiceModal
        isOpen={!!invoiceToReturn}
        onClose={() => setInvoiceToReturn(null)}
        invoice={invoiceToReturn}
        onConfirm={handleConfirmReturn}
      />
    </div>
  );
};
