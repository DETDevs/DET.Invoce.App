import { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import type { CashCloseReportData } from "@/features/reports/types";

const ITEMS_PER_PAGE = 5;

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

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("es-NI", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

import { getCurrencySymbol } from "@/shared/utils/currency";

const fmt = (n: number) =>
  `${getCurrencySymbol()} ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type MovementLine = CashCloseReportData["movementLines"][number];

interface MovementsTableProps {
  lines: MovementLine[];
  expectedTotal: number;
}

export const MovementsTable = ({
  lines,
  expectedTotal,
}: MovementsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(lines.length / ITEMS_PER_PAGE));
  const paginatedLines = lines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (lines.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400 font-medium">
          No hay movimientos en el período seleccionado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#2D2D2D] flex items-center gap-2">
            <Wallet size={18} /> Movimientos del Período
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {lines.length} movimientos registrados
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              <th className="text-left px-4 py-3 font-semibold">Descripción</th>
              <th className="text-right px-4 py-3 font-semibold">Monto</th>
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
                {fmt(expectedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, lines.length)} de{" "}
            {lines.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
