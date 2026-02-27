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
  CreditCard,
  Banknote,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { KPICard } from "./KPICard";
import type { CashCloseReportData } from "@/features/reports/types";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";

interface CashCloseReportProps {
  data: CashCloseReportData;
}

const fmtCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `C$${(n / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 100_000) {
    return `C$${(n / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    maximumFractionDigits: 2,
  }).format(n);
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
  }).format(n);

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  const hours = (d.getHours() % 12 || 12).toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${day}/${month} ${hours}:${minutes} ${ampm}`;
};

const TYPE_CONFIG = {
  venta: {
    label: "Venta",
    color: "text-green-700",
    bg: "bg-green-50",
    sign: "+",
  },
  ingreso: {
    label: "Ingreso",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    sign: "+",
  },
  egreso: {
    label: "Egreso",
    color: "text-red-700",
    bg: "bg-red-50",
    sign: "-",
  },
  devolucion: {
    label: "Devolución",
    color: "text-amber-700",
    bg: "bg-amber-50",
    sign: "-",
  },
};

const ITEMS_PER_PAGE = 5;

export const CashCloseReport = ({ data }: CashCloseReportProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const { session, closeCashBox } = useCashBox();
  const navigate = useNavigate();

  const totalPages = Math.max(
    1,
    Math.ceil(data.movementLines.length / ITEMS_PER_PAGE),
  );
  const paginatedLines = data.movementLines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  const closingNum = parseFloat(closingAmount) || 0;
  const difference = closingNum - data.expectedTotal;
  const hasFaltante = closingAmount !== "" && difference < 0;

  const handleCloseBox = async () => {
    if (hasFaltante) return;
    await closeCashBox(closingNum);
    setIsConfirmOpen(false);
    setClosingAmount("");
    navigate("/");
    toast.success("🎉 Caja cerrada con éxito");
  };

  const handlePrint = () => {
    const el = document.getElementById("cash-close-print-area");
    if (!el) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              @page { margin: 0; size: auto; }
              body { 
                font-family: system-ui, sans-serif; 
                margin: 0; 
                padding: 10mm; 
                font-size: 11px;
                color: #2D2D2D;
              }
            </style>
          </head>
          <body>
            ${el.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => iframe.remove(), 1000);
      };
    }
  };

  return (
    <div className="space-y-6">
      <div
        id="cash-close-print-area"
        className="hidden"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #593D31",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#593D31",
                margin: 0,
              }}
            >
              CIERRE DE CAJA
            </h1>
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>
              Reporte de operaciones del período
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#2D2D2D",
                margin: 0,
              }}
            >
              {businessName}
            </p>
            <p style={{ fontSize: "11px", color: "#666", margin: "2px 0 0 0" }}>
              {dateStr}
            </p>
            <p style={{ fontSize: "11px", color: "#666", margin: "2px 0 0 0" }}>
              Generado a las {timeStr}
            </p>
          </div>
        </div>

        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#593D31",
            letterSpacing: "0.5px",
            margin: "0 0 8px 0",
          }}
        >
          Resumen Financiero
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <tbody>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
                Fondo Inicial
              </td>
              <td
                style={{
                  padding: "6px 0",
                  textAlign: "right",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {fmtCompact(data.initialAmount)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
                Ventas ({data.invoiceCount} facturas)
              </td>
              <td
                style={{
                  padding: "6px 0",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#16a34a",
                  fontSize: "12px",
                }}
              >
                + {fmtCompact(data.salesTotal)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
                Otros Ingresos
              </td>
              <td
                style={{
                  padding: "6px 0",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#16a34a",
                  fontSize: "12px",
                }}
              >
                + {fmtCompact(data.cashInTotal)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
                Egresos
              </td>
              <td
                style={{
                  padding: "6px 0",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#dc2626",
                  fontSize: "12px",
                }}
              >
                - {fmtCompact(data.cashOutTotal)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
                Devoluciones ({data.returnsCount})
              </td>
              <td
                style={{
                  padding: "6px 0",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#d97706",
                  fontSize: "12px",
                }}
              >
                - {fmtCompact(data.returnsTotal)}
              </td>
            </tr>
            <tr style={{ borderTop: "2px solid #593D31" }}>
              <td
                style={{
                  padding: "10px 0",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#593D31",
                }}
              >
                TOTAL ESPERADO EN CAJA
              </td>
              <td
                style={{
                  padding: "10px 0",
                  textAlign: "right",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#593D31",
                }}
              >
                {fmtCompact(data.expectedTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {data.paymentBreakdown.length > 0 && (
          <>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#593D31",
                letterSpacing: "0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Métodos de Pago
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Método
                  </th>
                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Operaciones
                  </th>
                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "right",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.paymentBreakdown.map((p) => (
                  <tr
                    key={p.method}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td
                      style={{
                        padding: "5px 0",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {p.method}
                    </td>
                    <td
                      style={{
                        padding: "5px 0",
                        fontSize: "12px",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      {p.count}
                    </td>
                    <td
                      style={{
                        padding: "5px 0",
                        fontSize: "12px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {fmtCompact(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {data.movementLines.length > 0 && (
          <>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#593D31",
                letterSpacing: "0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Detalle de Movimientos ({data.movementLines.length})
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      width: "80px",
                    }}
                  >
                    Fecha/Hora
                  </th>

                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Descripción
                  </th>
                  <th
                    style={{
                      padding: "4px 0",
                      textAlign: "right",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      width: "120px",
                    }}
                  >
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.movementLines.map((line, idx) => {
                  const isPositive =
                    line.type === "venta" || line.type === "ingreso";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td
                        style={{
                          padding: "4px 0",
                          fontSize: "11px",
                          color: "#666",
                          fontFamily: "monospace",
                        }}
                      >
                        {fmtDateTime(line.time)}
                      </td>

                      <td
                        style={{
                          padding: "4px 0",
                          fontSize: "11px",
                          color: "#444",
                        }}
                      >
                        {line.description}
                      </td>
                      <td
                        style={{
                          padding: "4px 0",
                          fontSize: "11px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: isPositive ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {isPositive ? "+" : "-"}
                        {fmtCompact(line.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        <div
          style={{
            borderTop: "1px solid #d1d5db",
            paddingTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "#9ca3af",
          }}
        >
          <span>{businessName} — Cierre de Caja</span>
          <span>
            {dateStr}, {timeStr}
          </span>
        </div>
      </div>

      <div className="print:!hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

        {data.paymentBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-blue-50/30">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <CreditCard size={18} /> Desglose por Método de Pago
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.paymentBreakdown.map((p) => (
                  <div
                    key={p.method}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      {p.method === "Efectivo" ? (
                        <Banknote size={20} className="text-blue-600" />
                      ) : p.method === "Tarjeta" ? (
                        <CreditCard size={20} className="text-blue-600" />
                      ) : (
                        <ArrowRightLeft size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {p.method}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.count} {p.count === 1 ? "operación" : "operaciones"}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 shrink-0">
                      {fmt(p.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {data.movementLines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#2D2D2D] flex items-center gap-2">
                  <Wallet size={18} /> Movimientos del Período
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {data.movementLines.length} movimientos registrados
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold text-gray-500 px-2 min-w-[70px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-semibold">
                      Fecha y Hora
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Descripción
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLines.map((line, idx) => {
                    const cfg = TYPE_CONFIG[line.type];
                    return (
                      <tr
                        key={(currentPage - 1) * ITEMS_PER_PAGE + idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                          {fmtDateTime(line.time)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[300px] truncate">
                          {line.description}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-bold text-right whitespace-nowrap ${cfg.color}`}
                        >
                          {cfg.sign}
                          {fmt(line.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#593D31]/5 border-t-2 border-[#593D31]/20">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-sm font-bold text-[#593D31]"
                    >
                      Total Esperado en Caja
                    </td>
                    <td className="px-4 py-3 text-lg font-bold text-right text-[#593D31]">
                      {fmt(data.expectedTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    data.movementLines.length,
                  )}{" "}
                  de {data.movementLines.length}
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          page === currentPage
                            ? "bg-[#593D31] text-white"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {data.movementLines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              No hay movimientos en el período seleccionado
            </p>
          </div>
        )}

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

        {isConfirmOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsConfirmOpen(false);
                setClosingAmount("");
              }}
            />
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl shrink-0">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw size={32} />
              </div>

              <h2 className="text-2xl font-bold text-center text-[#2D2D2D] mb-2">
                ¿Cerrar Caja?
              </h2>
              <p className="text-center text-gray-500 mb-6 text-sm">
                Ingresá el monto real que hay en caja para verificar el cierre.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-500">
                    Total Esperado
                  </span>
                  <span className="text-lg font-bold text-[#2D2D2D]">
                    C$ {data.expectedTotal.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Monto Real en Caja
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                      C$
                    </span>
                    <input
                      type="number"
                      value={closingAmount}
                      onChange={(e) => setClosingAmount(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !hasFaltante &&
                        closingAmount !== "" &&
                        handleCloseBox()
                      }
                      className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent text-lg font-bold text-[#2D2D2D]"
                      placeholder={data.expectedTotal.toFixed(2)}
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                  </div>
                </div>

                {closingAmount !== "" && (
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      difference >= 0
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        difference >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {difference >= 0 ? "✅ Sobrante" : "⚠️ Faltante"}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        difference >= 0 ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      C$ {Math.abs(difference).toFixed(2)}
                    </span>
                  </div>
                )}

                {hasFaltante && (
                  <p className="text-xs text-red-600 font-medium text-center">
                    No se puede cerrar la caja con faltante. Verificá el dinero
                    en caja.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsConfirmOpen(false);
                    setClosingAmount("");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseBox}
                  disabled={closingAmount === "" || hasFaltante}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sí, Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
