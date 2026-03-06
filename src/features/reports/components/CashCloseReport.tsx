import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Wallet,
  Copy,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { KPICard } from "./KPICard";
import { PrintableReceipt } from "./PrintableReceipt";
import { PaymentBreakdownCard } from "./PaymentBreakdownCard";
import { MovementsTable } from "./MovementsTable";
import { CashCloseConfirmModal } from "./CashCloseConfirmModal";
import type { CashCloseReportData } from "@/features/reports/types";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";

interface CashCloseReportProps {
  data: CashCloseReportData;
}

const fmtCompact = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmt = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const CashCloseReport = ({ data }: CashCloseReportProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { session, closeCashBox } = useCashBox();
  const navigate = useNavigate();

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-NI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("es-NI", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const businessName =
    JSON.parse(localStorage.getItem("app_settings") || "{}").businessName ||
    "Dulces Momentos";

  const handleCopy = () => {
    const lines = [
      `═══ CIERRE DE CAJA ═══`,
      `${businessName}`,
      `Fecha: ${dateStr} — ${timeStr}`,
      ``,
      `Fondo Inicial:      ${fmt(data.initialAmount)}`,
      `Ventas del Día:     ${fmt(data.salesTotal)} (${data.invoiceCount} facturas)`,
      `Otros Ingresos:     ${fmt(data.cashInTotal)}`,
      `Egresos:            ${fmt(data.cashOutTotal)}`,
      `Devoluciones:       ${fmt(data.returnsTotal)} (${data.returnsCount})`,
      `─────────────────────────`,
      `TOTAL ESPERADO:     ${fmt(data.expectedTotal)}`,
    ];

    if (data.paymentBreakdown.length > 0) {
      lines.push(``, `── Métodos de Pago ──`);
      data.paymentBreakdown.forEach((p) => {
        lines.push(`  ${p.method}: ${fmt(p.amount)} (${p.count} ops)`);
      });
    }

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Resumen copiado al portapapeles");
  };

  const handleCloseBox = async () => {
    await closeCashBox(data.expectedTotal);
    setIsConfirmOpen(false);
    navigate("/");
    toast.success("🎉 Caja cerrada con éxito");
  };

  const handlePrint = () => {
    const el = document.getElementById("cash-close-print-area");
    if (!el) return;

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Cierre de Caja - ${businessName}</title>
    <style>
      @page { margin: 0; size: auto; }
      body { 
        font-family: system-ui, sans-serif; 
        margin: 0; 
        padding: 0;
        font-size: 11px;
        color: #2D2D2D;
      }
      .print-content { padding: 10mm; }
      @media print {
        body { margin: 0; }
      }
    </style>
  </head>
  <body>
    <div class="print-content">
      ${el.innerHTML}
    </div>
  </body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      toast.error("No se pudo preparar la impresión.");
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow!.print();

      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 350);
  };

  return (
    <div className="space-y-6">
      <PrintableReceipt
        data={data}
        businessName={businessName}
        dateStr={dateStr}
        timeStr={timeStr}
      />

      <div className="print:hidden!">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <KPICard
            title="Fondo Inicial"
            value={fmtCompact(data.initialAmount)}
            icon={Landmark}
            color="brown"
            tooltip="Monto con el que se abrió la caja al inicio del día."
          />
          <KPICard
            title="Ventas"
            value={fmtCompact(data.salesTotal)}
            subValue={`${data.invoiceCount} facturas`}
            icon={TrendingUp}
            color="green"
            tooltip="Suma total de facturas completadas en el período."
          />
          <KPICard
            title="Otros Ingresos"
            value={fmtCompact(data.cashInTotal)}
            icon={ArrowUpRight}
            color="green"
            tooltip="Movimientos manuales de entrada de efectivo."
          />
          <KPICard
            title="Egresos"
            value={fmtCompact(data.cashOutTotal)}
            icon={ArrowDownRight}
            color="red"
            tooltip="Movimientos de salida: retiros, pagos, gastos."
          />
          <KPICard
            title="Total Esperado"
            value={fmtCompact(data.expectedTotal)}
            icon={Wallet}
            color={data.expectedTotal >= 0 ? "blue" : "red"}
            tooltip="Fondo + Ventas + Ingresos - Egresos - Devoluciones = lo que debería haber en caja."
          />
        </div>

        <PaymentBreakdownCard breakdown={data.paymentBreakdown} />

        <MovementsTable
          lines={data.movementLines}
          expectedTotal={data.expectedTotal}
        />

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors active:scale-95"
          >
            <Download size={18} /> Exportar PDF
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors active:scale-95"
          >
            <Copy size={18} /> Copiar Resumen
          </button>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={!session?.isOpen}
            title={!session?.isOpen ? "La caja ya está cerrada" : "Cerrar Caja"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <RotateCcw size={18} /> Cerrar Caja
          </button>
        </div>

        <CashCloseConfirmModal
          isOpen={isConfirmOpen}
          data={data}
          onConfirm={handleCloseBox}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};
